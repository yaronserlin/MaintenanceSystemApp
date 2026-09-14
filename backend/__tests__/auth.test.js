const request = require('supertest');
const { connectTestDB, closeTestDB, registerCompanyAdmin, uniqueEmail } = require('./helpers/setup');

const app = require('../app');

jest.setTimeout(90000);

beforeAll(async () => {
    await connectTestDB();
}, 90000);

afterAll(async () => {
    await closeTestDB();
});

describe('Auth Controller', () => {
    describe('POST /api/auth/register', () => {
        it('rejects a company name shorter than 2 characters', async () => {
            const res = await request(app).post('/api/auth/register').send({
                companyName: 'A',
                name: 'Valid Name',
                email: uniqueEmail(),
                password: 'password123',
            });
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/company name/i);
        });

        it('rejects a name shorter than 2 characters', async () => {
            const res = await request(app).post('/api/auth/register').send({
                companyName: 'Valid Co',
                name: 'A',
                email: uniqueEmail(),
                password: 'password123',
            });
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/name must be/i);
        });

        it('rejects an invalid email format', async () => {
            const res = await request(app).post('/api/auth/register').send({
                companyName: 'Valid Co',
                name: 'Valid Name',
                email: 'not-an-email',
                password: 'password123',
            });
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/valid email/i);
        });

        it('rejects a password shorter than 6 characters', async () => {
            const res = await request(app).post('/api/auth/register').send({
                companyName: 'Valid Co',
                name: 'Valid Name',
                email: uniqueEmail(),
                password: '123',
            });
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/password must be/i);
        });

        it('rejects duplicate slugs by generating a unique suffix', async () => {
            const first = await request(app).post('/api/auth/register').send({
                companyName: 'Slug Collision Co',
                name: 'First Admin',
                email: uniqueEmail(),
                password: 'password123',
            });
            expect(first.status).toBe(201);

            const second = await request(app).post('/api/auth/register').send({
                companyName: 'Slug Collision Co',
                name: 'Second Admin',
                email: uniqueEmail(),
                password: 'password123',
            });
            expect(second.status).toBe(201);
            expect(second.body.user.company.slug).not.toBe(first.body.user.company.slug);
        });

        it('forces the creator role to admin regardless of request body', async () => {
            const res = await request(app).post('/api/auth/register').send({
                companyName: 'Force Admin Co',
                name: 'Sneaky User',
                email: uniqueEmail(),
                password: 'password123',
                role: 'admin-override-attempt',
            });
            expect(res.status).toBe(201);
            expect(res.body.user.role).toBe('admin');
        });
    });

    describe('POST /api/auth/login', () => {
        it('rejects missing email or password', async () => {
            const res = await request(app).post('/api/auth/login').send({ email: 'x@x.com' });
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/email and password/i);
        });

        it('rejects login for a non-existent email', async () => {
            const res = await request(app).post('/api/auth/login').send({
                email: 'nonexistent@example.com',
                password: 'password123',
            });
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/invalid credentials/i);
        });

        it('rejects login with an incorrect password', async () => {
            const email = uniqueEmail();
            await registerCompanyAdmin(app, { email, password: 'correctPassword1' });

            const res = await request(app).post('/api/auth/login').send({
                email,
                password: 'wrongPassword',
            });
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/invalid credentials/i);
        });

        it('logs in successfully with correct credentials', async () => {
            const email = uniqueEmail();
            await registerCompanyAdmin(app, { email, password: 'correctPassword1' });

            const res = await request(app).post('/api/auth/login').send({
                email,
                password: 'correctPassword1',
            });
            expect(res.status).toBe(200);
            expect(res.body.token).toBeDefined();
            expect(res.body.user.email).toBe(email);
        });
    });

    describe('POST /api/auth/logout', () => {
        it('clears the auth cookie and returns success', async () => {
            const res = await request(app).post('/api/auth/logout');
            expect(res.status).toBe(200);
            expect(res.body.message).toMatch(/logged out/i);
        });
    });

    describe('GET /api/auth/me', () => {
        it('rejects unauthenticated requests', async () => {
            const res = await request(app).get('/api/auth/me');
            expect(res.status).toBe(401);
        });

        it('returns the authenticated profile', async () => {
            const { token, email } = await registerCompanyAdmin(app);
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.email).toBe(email);
        });
    });

    describe('PUT /api/auth/me', () => {
        it('rejects an invalid name', async () => {
            const { token } = await registerCompanyAdmin(app);
            const res = await request(app)
                .put('/api/auth/me')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'A', email: uniqueEmail() });
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/name must be/i);
        });

        it('rejects an invalid email', async () => {
            const { token } = await registerCompanyAdmin(app);
            const res = await request(app)
                .put('/api/auth/me')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Valid Name', email: 'bad-email' });
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/valid email/i);
        });

        it('requires the current password to change email address', async () => {
            const { token } = await registerCompanyAdmin(app);
            const res = await request(app)
                .put('/api/auth/me')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Valid Name', email: uniqueEmail() });
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/current password is required/i);
        });

        it('rejects an incorrect current password when changing email', async () => {
            const { token } = await registerCompanyAdmin(app, { password: 'password123' });
            const res = await request(app)
                .put('/api/auth/me')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Valid Name', email: uniqueEmail(), currentPassword: 'wrongPassword' });
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/current password is incorrect/i);
        });

        it('rejects an email already used by another user', async () => {
            const first = await registerCompanyAdmin(app);
            const second = await registerCompanyAdmin(app, { password: 'password123' });

            const res = await request(app)
                .put('/api/auth/me')
                .set('Authorization', `Bearer ${second.token}`)
                .send({ name: 'Valid Name', email: first.email, currentPassword: 'password123' });
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/already in use/i);
        });

        it('updates the name without requiring a password when email is unchanged', async () => {
            const { token, email } = await registerCompanyAdmin(app);
            const res = await request(app)
                .put('/api/auth/me')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Updated Name', email });
            expect(res.status).toBe(200);
            expect(res.body.name).toBe('Updated Name');
            expect(res.body.email).toBe(email);
        });

        it('updates the email successfully when the current password is correct', async () => {
            const { token } = await registerCompanyAdmin(app, { password: 'password123' });
            const newEmail = uniqueEmail();
            const res = await request(app)
                .put('/api/auth/me')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Updated Name', email: newEmail, currentPassword: 'password123' });
            expect(res.status).toBe(200);
            expect(res.body.name).toBe('Updated Name');
            expect(res.body.email).toBe(newEmail);
        });
    });

    describe('POST /api/auth/me/avatar', () => {
        it('rejects a request with no file attached', async () => {
            const { token } = await registerCompanyAdmin(app);
            const res = await request(app)
                .post('/api/auth/me/avatar')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/avatar image file is required/i);
        });

        it('uploads an avatar image successfully', async () => {
            const { token } = await registerCompanyAdmin(app);
            const res = await request(app)
                .post('/api/auth/me/avatar')
                .set('Authorization', `Bearer ${token}`)
                .attach('avatar', Buffer.from([0x89, 0x50, 0x4e, 0x47]), {
                    filename: 'avatar.png',
                    contentType: 'image/png',
                });
            expect(res.status).toBe(200);
            expect(res.body.avatar).toMatch(/^\/uploads\/photo-/);
        });

        it('rejects a disallowed file type', async () => {
            const { token } = await registerCompanyAdmin(app);
            const res = await request(app)
                .post('/api/auth/me/avatar')
                .set('Authorization', `Bearer ${token}`)
                .attach('avatar', Buffer.from('not an image'), {
                    filename: 'malware.exe',
                    contentType: 'application/x-msdownload',
                });
            expect(res.status).toBe(500);
            expect(res.body.message).toMatch(/only image files/i);
        });
    });

    describe('POST /api/auth/me/change-password', () => {
        it('rejects missing fields', async () => {
            const { token } = await registerCompanyAdmin(app);
            const res = await request(app)
                .post('/api/auth/me/change-password')
                .set('Authorization', `Bearer ${token}`)
                .send({ currentPassword: 'password123' });
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/current and new password/i);
        });

        it('rejects a new password shorter than 6 characters', async () => {
            const { token } = await registerCompanyAdmin(app);
            const res = await request(app)
                .post('/api/auth/me/change-password')
                .set('Authorization', `Bearer ${token}`)
                .send({ currentPassword: 'password123', newPassword: '123' });
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/new password must be/i);
        });

        it('rejects an incorrect current password', async () => {
            const { token } = await registerCompanyAdmin(app);
            const res = await request(app)
                .post('/api/auth/me/change-password')
                .set('Authorization', `Bearer ${token}`)
                .send({ currentPassword: 'wrongPassword', newPassword: 'newPassword1' });
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/incorrect/i);
        });

        it('changes the password successfully and allows login with the new one', async () => {
            const email = uniqueEmail();
            const { token } = await registerCompanyAdmin(app, { email, password: 'password123' });

            const changeRes = await request(app)
                .post('/api/auth/me/change-password')
                .set('Authorization', `Bearer ${token}`)
                .send({ currentPassword: 'password123', newPassword: 'newPassword1' });
            expect(changeRes.status).toBe(200);

            const loginRes = await request(app).post('/api/auth/login').send({
                email,
                password: 'newPassword1',
            });
            expect(loginRes.status).toBe(200);
        });
    });

    describe('POST /api/auth/refresh', () => {
        it('rejects a request with no refresh token provided', async () => {
            const res = await request(app).post('/api/auth/refresh').send({});
            expect(res.status).toBe(401);
            expect(res.body.message).toMatch(/refresh token is required/i);
        });

        it('rejects an invalid or tampered refresh token', async () => {
            const res = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: 'invalid.token.signature' });
            expect(res.status).toBe(401);
            expect(res.body.message).toMatch(/invalid or expired/i);
        });

        it('refreshes token successfully via request body and rotates refresh token', async () => {
            const { refreshToken: initialRefreshToken } = await registerCompanyAdmin(app);
            expect(initialRefreshToken).toBeDefined();

            const refreshRes = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: initialRefreshToken });

            expect(refreshRes.status).toBe(200);
            expect(refreshRes.body.accessToken).toBeDefined();
            expect(refreshRes.body.token).toBeDefined();
            expect(refreshRes.body.refreshToken).toBeDefined();
            expect(refreshRes.body.refreshToken).not.toBe(initialRefreshToken);

            // New access token works to access protected route
            const meRes = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${refreshRes.body.accessToken}`);
            expect(meRes.status).toBe(200);
        });

        it('refreshes token successfully via cookie', async () => {
            const { cookies } = await registerCompanyAdmin(app);
            expect(cookies).toBeDefined();

            // Find the refreshToken cookie
            const refreshCookie = cookies.find(c => c.startsWith('refreshToken='));
            expect(refreshCookie).toBeDefined();

            const refreshRes = await request(app)
                .post('/api/auth/refresh')
                .set('Cookie', [refreshCookie]);

            expect(refreshRes.status).toBe(200);
            expect(refreshRes.body.accessToken).toBeDefined();
            expect(refreshRes.body.refreshToken).toBeDefined();
        });

        it('enforces rotation: cannot reuse an already rotated refresh token', async () => {
            const { refreshToken: initialRefreshToken } = await registerCompanyAdmin(app);

            // First refresh succeeds and rotates
            const firstRefresh = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: initialRefreshToken });
            expect(firstRefresh.status).toBe(200);

            // Second attempt to use initialRefreshToken triggers reuse detection
            const reuseAttempt = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: initialRefreshToken });
            expect(reuseAttempt.status).toBe(403);
            expect(reuseAttempt.body.code).toBe('TOKEN_REUSE_DETECTED');

            // Even the rotated token from the first refresh should now be revoked due to family invalidation
            const attemptWithRotated = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: firstRefresh.body.refreshToken });
            expect(attemptWithRotated.status).toBe(403);
            expect(attemptWithRotated.body.code).toBe('TOKEN_REUSE_DETECTED');
        });

        it('revokes refresh token on logout', async () => {
            const { refreshToken } = await registerCompanyAdmin(app);

            const logoutRes = await request(app)
                .post('/api/auth/logout')
                .send({ refreshToken });
            expect(logoutRes.status).toBe(200);

            // Trying to refresh after logout should fail
            const refreshRes = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken });
            expect(refreshRes.status).toBe(403);
        });

        it('revokes all active refresh tokens on password change', async () => {
            const email = uniqueEmail();
            const { token, refreshToken } = await registerCompanyAdmin(app, { email, password: 'oldPassword123' });

            const changeRes = await request(app)
                .post('/api/auth/me/change-password')
                .set('Authorization', `Bearer ${token}`)
                .send({ currentPassword: 'oldPassword123', newPassword: 'newPassword123' });
            expect(changeRes.status).toBe(200);

            // Refresh token issued before password change should now be revoked
            const refreshRes = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken });
            expect(refreshRes.status).toBe(403);
        });
    });
});
