# MaintenanceSystemApp — Code Review Findings & Multi-Tenant Migration Plan

**Prepared:** 2026-09-14
**Status:** Draft — awaiting approval, no code written yet
**Project:** MaintenanceSystemApp (MERN) — Express 5 / Mongoose backend in `backend/`, React 19 + Vite + MUI frontend in `frontend/`

---

## Part 1 — Code Review Findings

Full-project review (not a diff review) of all 21 backend files and all 53 frontend files. 53 findings total.

| Area | Files reviewed | Critical | High | Medium | Low | Total |
|---|---|---|---|---|---|---|
| Backend | 21 | 3 | 5 | 8 | 8 | 24 |
| Frontend | 53 | 4 | 11 | 8 | 6 | 29 |

### Validation results (at time of review)

| Check | Backend | Frontend |
|---|---|---|
| Lint | *(no script defined)* | ❌ 38 errors, 4 warnings |
| Tests | *(no script defined)* | ❌ 0/0 tests run — config broken |
| Build | *(no script defined)* | ✅ Pass (bundle-size warning) |

---

### Backend Findings

#### CRITICAL

**1. Privilege escalation on public registration endpoint** — `backend/controllers/authController.js:9-15`
```js
const { name, email, password, role } = req.body;
...
const user = await User.create({ name, email, role, password: hashed });
```
`POST /api/auth/register` is public and unauthenticated, and trusts the client-supplied `role` field verbatim. `UserSchema.role` enum includes `'admin'` (`backend/models/User.js:7`), so anyone can `POST { "role": "admin" }` and get full admin rights, including every `/api/admin/*` route.
**Fix:** Ignore `role` from the request body on registration; always default to `'operator'`. Only allow role changes via the existing admin-only `PATCH /api/admin/users/:id/role`.

**2. Admin-gated Tool CRUD duplicated on a non-admin route — role check bypass** — `backend/routes/toolRoutes.js:15-17` vs `backend/routes/adminRoutes.js:29-32`
```js
// toolRoutes.js — only verifyToken, no ensureAdmin
router.post('/', verifyToken, createTool);
router.put('/:id', verifyToken, updateTool);
router.delete('/:id', verifyToken, deleteTool);
```
The same `createTool/updateTool/deleteTool` controllers are exposed both behind `ensureAdmin` in `adminRoutes.js` and without it in `toolRoutes.js`. Any authenticated user of any role can create, edit, or delete tools directly via `/api/tools/*`, making the admin restriction meaningless.
**Fix:** Remove create/update/delete from `toolRoutes.js` (leave only `GET`), or add `ensureAdmin` to those three routes.

**3. Stale JWT authorization — role changes and account deletion don't invalidate active tokens** — `backend/middleware/authMiddleware.js:23-36` (active code) vs commented-out code at lines 40-49
```js
exports.verifyToken = async (req, res, next) => {
    ...
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;   // trusts the JWT payload's role, never re-checked against DB
    next();
};
```
The removed legacy version actually re-fetched the user (`const user = await User.findById(userId); if (!user) throw ...`). The current version only trusts the `role` claim baked into the JWT at login (`expiresIn: '1d'`). If an admin demotes or deletes a user, that user's existing token keeps working for up to 24 hours — no revocation mechanism exists.
**Fix:** Re-fetch (or at least re-check role/existence of) the user on each request, or maintain a token-version field on `User` checked against `iat`.

#### HIGH

**4. Unsanitized `req.body` values passed straight into Mongoose query filters (NoSQL operator injection surface)** — `backend/controllers/authController.js:11, 27, 56`
```js
const { email, password } = req.body;
const user = await User.findOne({ email });
```
A client can send `{"email": {"$regex": "^a"}, "password": "x"}` and have Mongo evaluate `email` as a query operator instead of an equality match. No `mongoose.set('sanitizeFilter', true)` and no `express-mongo-sanitize` anywhere.
**Fix:** Validate `email`/`password` are strings before use, or enable `mongoose.set('sanitizeFilter', true)` globally.

**5. No role restriction on closing/deleting faults** — `backend/routes/faultRoutes.js:18-19`
```js
router.patch('/:id/close', verifyToken, closeFault);
router.delete('/:id', verifyToken, deleteFault);
```
Only `verifyToken` is applied — an `operator` role can close or permanently delete *any* fault, not just their own, potentially hiding evidence of tool problems.
**Fix:** Add a role check (mechanic/admin only, or "creator or admin") before allowing close/delete.

**6. No rate limiting on authentication endpoints** — `backend/routes/authRoutes.js:14-15`, `backend/controllers/authController.js:23-37`
`/api/auth/login` and `/api/auth/register` have no throttling, allowing unlimited brute-force/credential-stuffing and mass fake-account creation.
**Fix:** Add `express-rate-limit` on these two routes.

**7. Global error middleware silently swallows all non-JSON-parse errors** — `backend/app.js:35-40`
```js
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }
  next();   // drops the error, no response is ever sent for it here
});
```
Uncaught rejections in async route handlers (bad ObjectIds, ValidationErrors, duplicate-key errors) are auto-forwarded here via Express 5's implicit `next(err)`. Anything that isn't the JSON-parse SyntaxError falls into the `next()` branch with the error dropped — the client gets a misleading 404 instead of a proper 500, with zero server-side logging.
**Fix:** Add a catch-all: log `err` and `return res.status(500).json({ message: 'Server error' })` instead of calling bare `next()`.

**8. Uploaded fault photos are accepted, stored, and served — but never linked to the Fault, and served publicly with no validation** — `backend/routes/faultRoutes.js:6,17`, `backend/controllers/faultController.js:19-44`, `backend/app.js:24`
```js
const upload = multer({ dest: 'uploads/' });          // no fileFilter, no limits
...
// const photos = req.files ? req.files.map(f => f.path) : [];   // dead, commented out
const fault = await Fault.create({ ...req.body, operator: req.user.userId });
```
```js
app.use('/uploads', express.static('uploads'));        // no auth on this route
```
`req.files` is completely discarded — files pile up on disk, orphaned (disk-exhaustion risk). No `fileFilter`/`limits`, so any file type/size can be uploaded, and once present the file is servable to anyone (no auth) via `/uploads/<name>`.
**Fix:** Wire `req.files` into `fault.photos`, add `fileFilter` (allow-list image mime types) and `limits: { fileSize }`, and put `/uploads` behind `verifyToken` or serve via an authorization-checking controller.

#### MEDIUM

**9. Mass assignment on Tool/Part create & update — no field whitelisting** — `backend/controllers/toolController.js:26,31-35`; `backend/controllers/partController.js:10,15`
```js
const tool = await Tool.create(req.body);
const tool = await Tool.findByIdAndUpdate(req.params.id, req.body, { new: true });
```
A caller can overwrite the `faults` array on a Tool directly, or set `Part.tool` to any ObjectId with no existence check.
**Fix:** Destructure only expected fields before create/update; validate referenced IDs exist.

**10. `findByIdAndUpdate` calls omit `{ runValidators: true }`** — `backend/controllers/userController.js:19-23`, `backend/controllers/partController.js:15`, `backend/controllers/toolController.js:31-35`, `backend/controllers/authController.js:60-64`
```js
const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
```
Mongoose does not run schema validators on `findByIdAndUpdate` by default. `updateUserRole` can set `role` to any arbitrary string outside the enum; `updateProfile` can set `email`/`name` to empty, bypassing `required: true`.
**Fix:** Pass `{ new: true, runValidators: true }` everywhere `findByIdAndUpdate`/`findOneAndUpdate` is used.

**11. No atomicity between Fault creation and Tool backref update** — `backend/controllers/faultController.js:28-38`
If the Tool backref update fails (or `req.body.tool` references a nonexistent tool, which `findByIdAndUpdate` silently no-ops on), the Fault persists with a broken tool reference. No transaction used.
**Fix:** Validate the Tool exists before creating the Fault, or wrap both writes in a Mongo transaction.

**12. No input validation layer anywhere** — `backend/controllers/authController.js` and all controllers using `req.params.id`
No email format check, no password strength/minimum length, no `mongoose.isValidObjectId(req.params.id)` guard before `findById` calls — an invalid ID format throws a `CastError`, which (per Finding #7) gets swallowed into a confusing 404.
**Fix:** Add a validation layer (Joi/express-validator/zod); add an `isValidObjectId` guard for route params returning 400 on failure.

**13. Wide-open CORS** — `backend/app.js:21`
```js
app.use(cors());
```
No `origin` allow-list — any website can call this API cross-origin.
**Fix:** `cors({ origin: process.env.FRONTEND_URL, credentials: true })`.

**14. Deletes don't cascade or check existence** — `backend/controllers/toolController.js:40-43`, `backend/controllers/userController.js:28-30`
```js
exports.deleteTool = async (req, res) => {
    await Tool.findByIdAndDelete(req.params.id);
    res.status(204).end();     // no check whether a tool was actually found/deleted
};
```
Deleting a Tool or User leaves `Fault.tool`/`Part.tool`/`Maintenance.tool`/`Fault.operator` pointing at nonexistent documents.
**Fix:** Check the delete actually removed a document (404 if not); cascade-delete or null-out dependent references, or forbid deletion when references exist.

**15. `closeFault` has no try/catch and no existence check** — `backend/controllers/faultController.js:47-57`
Returns `null` with 200 if the id doesn't exist.
**Fix:** Wrap in try/catch with `next(err)`; `if (!fault) return res.status(404)...`.

**16. Inconsistent error handling across controllers** — `maintenanceController.js`, `partController.js`, most of `toolController.js`, all of `userController.js`
These rely entirely on Express 5's implicit forwarding into the broken handler from Finding #7, so real errors turn into opaque 404s with zero server-side logging.
**Fix:** Standardize on try/catch + `next(err)` (or `express-async-handler`) across all controllers, paired with the Finding #7 fix.

#### LOW

**17.** `backend/.gitignore` has no `.env` entry — `backend/.env` is tracked in git history since the first commit (currently placeholder values only). Add `.env` to `.gitignore`, `git rm --cached backend/.env`, rotate `JWT_SECRET`/`MONGO_URI` once real values are used.

**18.** Debug log of full request body — `backend/controllers/faultController.js:21` (`console.log('Creating fault with body:', req.body)`) logs arbitrary user-submitted data to stdout.

**19.** Missing indexes on frequently-queried foreign keys — `Fault.js:6-7`, `Maintenance.js:5-6`, `Part.js:7` (`tool`, `operator`, `mechanic`).

**20.** No pagination on list endpoints — unbounded `.find()` across `faultController.js`, `toolController.js`, `maintenanceController.js`, `partController.js`, `userController.js`.

**21.** Internal error messages leaked to clients — pattern `res.status(500).json({ message: 'Server error', error: err.message })` repeated across controllers; `err.message` can surface raw Mongo/Mongoose text.

**22.** `jwt.verify` doesn't pin `algorithms` — `backend/middleware/authMiddleware.js:30`. Pass `{ algorithms: ['HS256'] }` explicitly.

**23.** Dead/commented-out legacy code — `backend/middleware/authMiddleware.js:1-17, 37-49` (two full commented-out implementations; one is the more-secure DB-recheck version removed, see Critical #3).

**24.** No security headers middleware — `backend/app.js` has no `helmet()`.

**Note:** `seeders/seeder.js` seeds a real-looking email (`yaron155@gmail.com`) as the admin account with a weak shared password (`123456`) for all three seeded users — fine for local/dev seeding, flag if run against a shared/staging environment.

---

### Frontend Findings

#### CRITICAL

**1. JWT stored in `localStorage` — XSS token theft** — `frontend/src/contexts/AuthContext.jsx:17,27,43,61`
```js
localStorage.setItem('token', data.token);
```
Any XSS anywhere in the app (or a compromised dependency) can read `localStorage` and exfiltrate the token; combined with the token being placed in a global mutable axios default header, a stolen token grants full API access with no revocation short of expiry.
**Fix:** Move the token to an httpOnly, `Secure`, `SameSite=strict` cookie set by the backend on login; use `withCredentials: true` and drop manual `Authorization` header wiring.

**2. Entire test suite is non-functional — 0 tests actually run** — `frontend/jest.config.js`, `frontend/package.json`
```js
// jest.config.js
export default 'jsdom';
export const transform = { '^.+\\.jsx?$': 'babel-jest' };
export const moduleFileExtensions = ['js', 'jsx'];
```
The entire config becomes the string `'jsdom'` — the named exports are ignored under ESM interop. No `babel.config.js`/`.babelrc` exists anywhere and `@babel/preset-react`/`@babel/preset-env` are not installed. All 3 existing Login test suites fail at the Babel-parse stage; the project has zero working test coverage despite a recent "add unit tests" commit.
**Fix:** Add `babel.config.cjs` with `@babel/preset-env` + `@babel/preset-react` (install them) and fix the config to `export default { testEnvironment: 'jsdom', transform: {...}, moduleFileExtensions: [...] }` — or switch to Vitest since the project already uses Vite.

**3. No Error Boundary anywhere + unguarded `fault.tool.name` access can white-screen the app** — `frontend/src/pages/Dashboard.jsx:96`, `frontend/src/components/Fault/FaultModal/FaultModal.jsx:45`
```js
{fault.tool.name}: {fault.code} {fault.description}   // Dashboard.jsx:96
```
`FaultContext.jsx` itself acknowledges faults can have no tool reference, so `fault.tool` can be `null`/`undefined` in real data. Neither call site uses optional chaining, and there is no `ErrorBoundary` anywhere in `src`.
**Fix:** `fault.tool?.name ?? 'Unknown tool'` at both sites; add a top-level `ErrorBoundary` wrapping `<AppRoutes />` in `main.jsx`.

**4. Shared boolean state opens every fault modal at once** — `frontend/src/pages/Dashboard.jsx:84-108`
```jsx
{recentFaults.map(fault => (
    <ListItem onClick={() => { ...; handleOpenFaultModal(); }}>
        <FaultModal fault={fault} handleClose={handleCloseFaultModal} open={openFaultModal} />
    </ListItem>
))}
```
`openFaultModal` is a single top-level boolean shared across every `FaultModal` instance rendered in the loop. Clicking any single fault opens **all** rendered instances at once. The unused `navigate` (line 20) suggests navigation to a detail view was the intended behavior.
**Fix:** Track `selectedFaultId` in state; render one `<FaultModal>` outside the loop with `open={selectedFaultId === fault._id}`.

#### HIGH

**5. File upload is broken: two form fields share `name="photos"`, and `handleChange` doesn't read `e.target.files`** — `frontend/src/components/Fault/FaultForms/FaultForms.jsx:84-110,153-156`
The hidden file input and a "Photos (comma-separated URLs)" text field both write to the same `values.photos` key; for `type="file"`, `e.target.value` is a fake path string, not real `File` objects, and `handleChange` never special-cases `type === 'file'` (unlike `useForm.js`, which does this correctly).
**Fix:** Give the file input its own `name`, store `files` (not `value`) for `type="file"`, keep it separate from the URL field.

**6. Typo silently drops the local serial number on tool creation** — `frontend/src/components/Tool/ToolForms/ToolForms.jsx:47-53`
```js
const [values, setValues] = useState({
    name: '', serialNumber: '',
    loacalSerialNumber: '',   // typo — form reads "localSerialNumber" everywhere else
    model: '', description: '',
});
```
Causes a controlled/uncontrolled input warning and silently omits the real field from the create-tool payload.
**Fix:** Correct the key to `localSerialNumber`.

**7. Password validation error is invisible to the user** — `frontend/src/components/LoginComponent/LoginForm.jsx:125-137`
`Input.Password` only renders its error via a `helperText` prop, which is never passed — the field turns red with no message explaining why (the real error text is commented out at lines 133-137).
**Fix:** Pass `helperText={errors.password}`; remove the dead commented block.

**8. `useForm` submit logic is a stale-effect anti-pattern with missing deps** — `frontend/src/hooks/useForm.js:17-26`
```js
useEffect(() => {
    if (isSubmitting) {
      if (Object.keys(errors).length === 0 && typeof onSubmit === 'function') onSubmit(values);
      setIsSubmitting(false);
    }
}, [errors]);
```
ESLint confirms missing deps `isSubmitting`, `onSubmit`, `values`. Works today only because `validate()` always returns a new object reference.
**Fix:** Call `onSubmit(values)` directly inside `handleSubmit` after computing validation errors — no effect needed.

**9. Create-user form silently resets while admin is typing** — `frontend/src/components/User/UserForms/UserForms.jsx:46-48,149-158`
A new `initial` object literal is created every render of `CreateUserForm`, which re-renders whenever its parent `UserPanel` re-renders (e.g. an admin changes another user's role). The effect `useEffect(() => setValues(initialValues), [initialValues, setValues])` then wipes any text already typed.
**Fix:** Hoist `initial` to a module-level constant or `useMemo(() => ({...}), [])`.

**10. `ProtectedRoute` remounts `ToolProvider`/`FaultProvider` per route, defeating caching** — `frontend/src/components/ProtectedRoute/index.jsx:25-31`
Every route wrapped in `ProtectedRoute` creates its own provider instance; navigating between any two protected pages discards cached tools/faults and refetches, even on pages that don't need that data.
**Fix:** Move the providers to wrap `<Routes>` once instead of inside the per-route guard.

**11. `RequireAdmin` redirects to a route that doesn't exist** — `frontend/src/components/RequireAdmin/index.jsx:17-20`
Redirects non-admins to `/dashboard`, which `routes.jsx` never defines — they land on the catch-all `NotFound` page instead.
**Fix:** `<Navigate to="/" replace />`.

**12. Fault table rows are mouse-only — keyboard/screen-reader users cannot open details** — `frontend/src/components/Fault/FaultList/FaultList.jsx:51`
A `<TableRow onClick=...>` with no `tabIndex`, `role="button"`, or `onKeyDown` (contrast with `FaultCard`, which correctly uses `CardActionArea`).
**Fix:** Wrap the clickable content in a real button, or add `tabIndex={0}` + `role="button"` + Enter/Space handling.

**13. "Return to home" link is not keyboard-reachable** — `frontend/src/pages/NotFound.jsx:25-32`
Renders a real `<a>` with no `href` and only an `onClick` — excluded from tab order and not exposed as a link to assistive tech.
**Fix:** Use react-router's `Link` (`component={RouterLink} to="/"`).

**14. Derived state computed via effect instead of during render** — `frontend/src/pages/ToolPage.jsx:39-41`
```js
useEffect(() => { setTool(tools?.find(t => t._id === id)); }, [id, tools, faults, toolError, faultError]);
```
Extra state variable and render pass for something computable synchronously; also depends on unrelated `faults`/`toolError`/`faultError`.
**Fix:** `const tool = tools?.find(t => t._id === id);` directly in the render body.

**15. Accessibility linting gap** — `frontend/eslint.config.js`
`eslint-plugin-jsx-a11y` is absent from both `devDependencies` and the ESLint config — several real a11y bugs in this review would have been caught automatically.
**Fix:** `npm i -D eslint-plugin-jsx-a11y`, add `jsx-a11y.configs.recommended`.

#### MEDIUM

**16.** Unmemoized sort/filter on every render — `frontend/src/contexts/FaultContext.jsx:103-117`, `frontend/src/contexts/ToolContext.jsx:146-150`. Wrap in `useMemo`.

**17.** Account forms have no `onSubmit`, so Enter reloads the page — `frontend/src/pages/AccountPage.jsx:64-83,85-115`. Real `<form>` elements with actions wired only via button `onClick`. Add `onSubmit={(e) => { e.preventDefault(); ... }}`.

**18.** Password strength validation is entirely disabled — `frontend/src/utils/validate.js:45-67`. All strength rules commented out; function only checks non-emptiness despite the docblock. Re-enable or explicitly document server-side-only enforcement.

**19.** No global 401/expired-token handling — `frontend/src/services/apiClient.js`. No response interceptor; an expired token leaves the user stuck with generic errors instead of being redirected to login.

**20.** Duplicated tool data fetched independently in the fault form — `frontend/src/components/Fault/FaultForms/FaultForms.jsx:23-42`. Bypasses `ToolContext`, issues its own `toolsService.getAll()` plus an auto-select effect with missing deps.

**21.** Home-brand text is mouse-only navigation — `frontend/src/components/Navbar/DesktopNav.jsx:17-34`. A `div`-like `Typography` with only `onClick`, not keyboard reachable (contrast with `MobileNav.jsx`, which uses a real anchor).

**22.** `Dashboard.jsx` `Grid` items missing MUI v7 `size` prop — `frontend/src/pages/Dashboard.jsx:53,62,71`. Three stat-card `Grid`s pass no `size` prop and will likely stack full-width unintentionally.

**23.** Dead code / unused exports — `frontend/src/hooks/useFetch.js` (empty file, unused), `UpdateFaultForm` in `FaultForms.jsx:194` (exported, never imported).

#### LOW

**24.** Large blocks of commented-out dead code — `AuthContext.jsx:86-163`, `LoginForm.jsx:154-267`, `UserForms.jsx:173-304`.

**25.** Unused imports/vars (ESLint `no-unused-vars`) — `FaultCard.jsx:1`, `FaultList.jsx:2`, `ToolPage.jsx:2`, `ToolsPage.jsx:2`, `UserPanel.jsx:21`, `Dashboard.jsx:20`, `main.jsx:5`.

**26.** Misleading `closeFault` signature — `frontend/src/contexts/FaultContext.jsx:67`. Accepts an `updates` param that's never used.

**27.** `console.warn` fires on normal, non-error states — `frontend/src/contexts/FaultContext.jsx:96,100,107`. Warns on a tool simply having zero faults, a normal state.

**28.** Fast Refresh broken in 4 context files — `AuthContext.jsx:76`, `FaultContext.jsx:91`, `NotificationContext.jsx:38`, `ToolContext.jsx:140`. Exporting both a component and a hook from the same file (`react-refresh/only-export-components`).

**29.** Stale eslint-disable directive — `frontend/src/utils/validate.js:31`.

**Debug `console.log`s left in:** `frontend/src/utils/index.js:52`, `utils/validate.js:46`, `hooks/useForm.js:51,101`, `pages/Dashboard.jsx:89`, `pages/ToolPage.jsx:65,79`.

---

## Part 2 — Multi-Tenant Migration Plan

### Requirements

1. Fix every finding above.
2. Turn the app into a **multi-tenant SaaS**: each company has isolated data (users, tools, faults, parts, maintenance records) using a **shared database with a `companyId` column**.
3. Companies onboard via **self-service signup** — signing up creates a brand-new Company plus that person as its first admin.
4. Ship as a **production-hosted web app** (proper env config, locked-down CORS, HTTPS-ready cookie auth) that is also **installable as a PWA** (manifest + service worker + offline shell).

### Key decisions

| Decision | Choice | Why |
|---|---|---|
| Tenancy model | Shared DB, `companyId` column on every tenant collection | Cheapest to run, instant onboarding, matches the scale of this product; isolation is enforced in application code (see Risks) |
| Onboarding | Self-service signup | No manual provisioning per customer; also fixes the register privilege-escalation bug since role is no longer client-supplied |
| Web-app scope | Hosted SaaS **and** installable PWA | Already browser-based; needs production hosting hygiene plus a manifest/service worker for installability |
| Email uniqueness | Stays globally unique across the whole system | Simpler login (no "which company?" step); trade-off is one person can't belong to two companies without two accounts — acceptable for now |

### Tenancy pattern

Scoping is **explicit** in every controller (mirrors the codebase's existing direct-Mongoose-in-controllers style), not an implicit global filter:

```js
// every read/write is filtered by the caller's own company
const tools = await Tool.find({ companyId: req.user.companyId });

const tool = await Tool.findOneAndUpdate(
  { _id: req.params.id, companyId: req.user.companyId },
  update,
  { new: true, runValidators: true }
);
```

Signup replaces the old public `register` endpoint:

```
POST /api/auth/register
{ "companyName": "Acme Fabrication", "name": "Dana Lee",
  "email": "dana@acme.com", "password": "..." }

→ creates Company("Acme Fabrication")
→ creates User(role: "admin", companyId: Company._id)
  role is never read from the request body
```

### Phases

#### Phase 1 — Frontend test infrastructure
*Unblocks verifying every later phase.*
- [ ] Add `babel.config.cjs` with `@babel/preset-env` + `@babel/preset-react`; fix `jest.config.js`'s malformed default export.
- [ ] Confirm the 3 existing Login test suites run and pass.

**Files:** `frontend/jest.config.js`, new `babel.config.cjs` · **Depends on:** nothing

#### Phase 2 — Backend hardening + multi-tenancy
*One pass per file — fix and tenant-scope together, since they touch the same code.*
- [ ] New `Company` model: `name`, `slug`, `isActive`, timestamps.
- [ ] Add required, indexed `companyId` to `User`, `Tool`, `Fault`, `Part`, `Maintenance`.
- [ ] Replace public `register` with company signup (Company + first admin User in one transaction, role never read from the body) — closes Critical #1.
- [ ] `verifyToken` re-fetches the user from the DB every request, pins `algorithms: ['HS256']` — closes Critical #3.
- [ ] Scope every Tool/Fault/Part/Maintenance query, and admin's user management, by `req.user.companyId`.
- [ ] Remove the duplicate non-admin-gated tool write routes — closes Critical #2.
- [ ] Add role checks to fault close/delete; rate-limit login and signup.
- [ ] Validate `email`/`password` types before Mongo queries (NoSQL injection guard).
- [ ] Fix the swallowed-error handler in `app.js` — real 500 response + logging.
- [ ] Multer `fileFilter` + size `limits`; attach uploaded photos to the Fault; put `/uploads` behind auth.
- [ ] `runValidators: true` on every update; whitelist fields on create/update; check existence before delete/close; validate ObjectId params.
- [ ] Restrict CORS to a configured origin with `credentials: true`; add `helmet()`.
- [ ] Update the seeder for demo companies with properly scoped data; remove dead code and debug logs; add `.env` to `.gitignore` and rotate secrets.

**Files:** `backend/models/*`, `backend/controllers/*`, `backend/routes/*`, `backend/middleware/authMiddleware.js`, `backend/app.js` · **Depends on:** nothing

#### Phase 3 — Frontend correctness, security & accessibility
*Independent of tenancy — can run in parallel with Phase 2.*
- [ ] Fix the shared-modal bug in `Dashboard.jsx` (one `selectedFaultId`, one modal instance).
- [ ] Add optional chaining on `fault.tool`; add a top-level `ErrorBoundary`.
- [ ] Fix the broken photo-upload field and the `loacalSerialNumber` typo in Tool Forms.
- [ ] Wire `helperText` for the password field; fix `useForm`'s stale-effect submit pattern; stop `UserForms` resetting mid-typing.
- [ ] Move `ToolProvider`/`FaultProvider` above the per-route guard; fix `RequireAdmin`'s dead redirect target.
- [ ] Keyboard support on fault table rows; real link on "Return to home" and the navbar brand; install `eslint-plugin-jsx-a11y`.
- [ ] Compute `tool` during render instead of via effect in `ToolPage`; memoize sort/filter in the Fault/Tool contexts.
- [ ] Add `onSubmit`/`preventDefault` to Account forms.
- [ ] Re-enable real password-strength validation; add a global 401 interceptor.
- [ ] Have Fault Forms read tools from context instead of a duplicate fetch; fix the missing MUI Grid `size` props.
- [ ] Delete dead code (`useFetch.js`, unused `UpdateFaultForm`, large commented blocks); clean up unused imports.

**Files:** `frontend/src/pages/*`, `frontend/src/components/**`, `frontend/src/contexts/*`, `frontend/src/hooks/*` · **Depends on:** Phase 1

#### Phase 4 — Auth flow rework
*Moves the session token out of reach of XSS, adds the signup UI.*
- [ ] Backend sets the JWT as an httpOnly, Secure, `SameSite=strict` cookie on login/signup instead of returning it in JSON; payload includes `companyId`.
- [ ] Frontend: `apiClient.js` switches to `withCredentials: true`, drops manual `Authorization` header and `localStorage` token handling.
- [ ] Replace the plain register form with a "Create your company" signup form.

**Files:** `backend/controllers/authController.js`, `frontend/src/services/apiClient.js`, `frontend/src/contexts/AuthContext.jsx` · **Depends on:** Phase 2

#### Phase 5 — Production-hosted readiness
- [ ] `.env.example` for both apps; `NODE_ENV`-gated behavior so raw error messages never reach clients in production.
- [ ] Add a `GET /api/health` endpoint for uptime checks.
- [ ] Verify CORS + cookie flags end-to-end across the real frontend/backend origins once a host is chosen.
- [ ] Add indexes on `tool`/`operator`/`mechanic` refs; basic pagination on list endpoints.

**Files:** `backend/app.js`, new `.env.example` (×2) · **Depends on:** Phase 4

#### Phase 6 — Progressive Web App
- [ ] Add `vite-plugin-pwa` (Vite-native).
- [ ] Web app manifest (name, icon set, theme colors, `display: standalone`).
- [ ] Service worker with `registerType: 'autoUpdate'` and a basic offline fallback page.

**Files:** `frontend/vite.config.js`, new manifest + icons · **Depends on:** Phase 5

#### Phase 7 — Tests that prove tenant isolation
*The highest-risk area in the whole plan gets its own proof.*
- [ ] Stand up backend tests: Jest + Supertest + `mongodb-memory-server` (new infrastructure — none exists today).
- [ ] Write tests proving Company A's token can never read or write Company B's tools, faults, parts, maintenance records, or users.
- [ ] Extend the frontend tests to cover the Phase 3/4 fixes (Dashboard modal, error boundary, auth flow).

**Files:** new `backend/__tests__/`, `frontend/__tests__/` additions · **Depends on:** Phases 2 & 4

### New dependencies

| Package | Where | Why |
|---|---|---|
| `express-rate-limit` | backend | Throttle login/signup |
| `helmet` | backend | Baseline security headers |
| `@babel/preset-env` | frontend (dev) | Lets Jest parse the app's JS |
| `@babel/preset-react` | frontend (dev) | Lets Jest parse JSX |
| `vite-plugin-pwa` | frontend | Manifest + service worker generation |
| `supertest` | backend (dev) | HTTP-level API tests |
| `mongodb-memory-server` | backend (dev) | Isolated Mongo instance for tests |

Also needed before Phase 5 can be finalized: a chosen hosting target and domain(s). Nothing in this plan hardcodes a provider — CORS and cookie config stay environment-driven.

### Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| A missed `companyId` filter leaks one company's data into another | Medium, high impact | Explicit scoping everywhere + Phase 7's isolation tests + a final grep-audit for any Mongoose call missing `companyId` |
| Cookie-based auth breaks across the real frontend/backend origins once deployed | Medium | `credentials: true` CORS locked to an explicit origin, tested end-to-end before Phase 6 ships |
| Global email uniqueness blocks one person joining a second company later | Low now | Documented limitation; revisit only if it becomes a real request |
| PWA service worker serves a stale app shell after a deploy | Low | `autoUpdate` registration type, verified after each deploy |

### Complexity

**High / Large** — 7 phases, ~45 files touched across backend and frontend, one new data model, a reworked auth flow, and new test infrastructure on both sides.

### Status

No code has been written against this plan yet. Needs explicit go-ahead — or specific changes — before Phase 1 starts.
