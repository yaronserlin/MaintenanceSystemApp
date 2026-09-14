const request = require('supertest');
const fs = require('fs');
const path = require('path');
const { connectTestDB, closeTestDB, registerCompanyAdmin } = require('./helpers/setup');

const app = require('../app');

jest.setTimeout(90000);

const uploadsDir = path.join(__dirname, '../uploads');

beforeAll(async () => {
    await connectTestDB();
}, 90000);

afterAll(async () => {
    await closeTestDB();
});

async function createTool(token, overrides = {}) {
    const res = await request(app)
        .post('/api/tools')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test Tool', ...overrides });
    return res.body;
}

describe('App-level middleware and error handling', () => {
    describe('CORS', () => {
        it('blocks a disallowed origin', async () => {
            const res = await request(app)
                .get('/api/health')
                .set('Origin', 'http://evil-site.example.com');
            expect(res.status).toBe(403);
            expect(res.body.message).toMatch(/cors forbidden/i);
        });
    });

    describe('Malformed JSON body', () => {
        it('returns 400 for invalid JSON payloads', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .set('Content-Type', 'application/json')
                .send('{ this is not valid json');
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/invalid json payload/i);
        });
    });

    describe('Mongoose CastError handling', () => {
        it('returns 400 with a cast error message for a malformed ObjectId in the body', async () => {
            const { token } = await registerCompanyAdmin(app);
            const res = await request(app)
                .post('/api/faults')
                .set('Authorization', `Bearer ${token}`)
                .send({ description: 'Broken', tool: 'not-a-valid-objectid' });
            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/invalid/i);
        });
    });

    describe('GET /uploads/:filename', () => {
        const filename = `test-file-${Date.now()}.pdf`;
        const filePath = path.join(uploadsDir, filename);

        beforeAll(() => {
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            fs.writeFileSync(filePath, '%PDF-1.4 test file');
        });

        afterAll(() => {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        it('requires authentication', async () => {
            const res = await request(app).get(`/uploads/${filename}`);
            expect(res.status).toBe(401);
        });

        it('returns 404 when the file does not exist on disk', async () => {
            const { token } = await registerCompanyAdmin(app);
            const res = await request(app)
                .get('/uploads/does-not-exist-at-all.pdf')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(404);
        });

        it('serves the file when it belongs to the requesting company (equipment book)', async () => {
            const { token } = await registerCompanyAdmin(app);
            const tool = await createTool(token);
            await request(app)
                .post(`/api/tools/${tool._id}/books`)
                .set('Authorization', `Bearer ${token}`)
                .field('title', 'Manual')
                .attach('book', Buffer.from('%PDF-1.4'), {
                    filename: 'owned-manual.pdf',
                    contentType: 'application/pdf',
                });

            // Find the actual generated filename for this company's uploaded book
            const toolRes = await request(app)
                .get(`/api/tools/${tool._id}`)
                .set('Authorization', `Bearer ${token}`);
            const bookFileUrl = toolRes.body.books[0].fileUrl;
            const bookFilename = bookFileUrl.split('/').pop();

            const res = await request(app)
                .get(`/uploads/${bookFilename}`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
        });

        it('forbids access to media owned by another company', async () => {
            const { token: ownerToken } = await registerCompanyAdmin(app);
            const tool = await createTool(ownerToken);
            await request(app)
                .post(`/api/tools/${tool._id}/books`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .field('title', 'Manual')
                .attach('book', Buffer.from('%PDF-1.4'), {
                    filename: 'other-company-manual.pdf',
                    contentType: 'application/pdf',
                });
            const toolRes = await request(app)
                .get(`/api/tools/${tool._id}`)
                .set('Authorization', `Bearer ${ownerToken}`);
            const bookFilename = toolRes.body.books[0].fileUrl.split('/').pop();

            const { token: outsiderToken } = await registerCompanyAdmin(app);
            const res = await request(app)
                .get(`/uploads/${bookFilename}`)
                .set('Authorization', `Bearer ${outsiderToken}`);
            expect(res.status).toBe(403);
        });

        it('falls back to serving unassigned media not referenced by any record', async () => {
            const { token } = await registerCompanyAdmin(app);
            const res = await request(app)
                .get(`/uploads/${filename}`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
        });
    });
});
