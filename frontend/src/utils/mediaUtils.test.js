describe('getMediaUrl', () => {
    const originalEnv = { ...process.env };

    afterEach(() => {
        process.env = { ...originalEnv };
        jest.resetModules();
    });

    it('returns an empty string for falsy or non-string input', () => {
        const { getMediaUrl } = require('./mediaUtils');
        expect(getMediaUrl(null)).toBe('');
        expect(getMediaUrl(undefined)).toBe('');
        expect(getMediaUrl(42)).toBe('');
    });

    it('returns absolute http(s) URLs unchanged', () => {
        const { getMediaUrl } = require('./mediaUtils');
        expect(getMediaUrl('http://example.com/a.jpg')).toBe('http://example.com/a.jpg');
        expect(getMediaUrl('https://example.com/a.jpg')).toBe('https://example.com/a.jpg');
    });

    it('prefixes a relative path with the API origin when VITE_API_URL is absolute', () => {
        jest.resetModules();
        process.env.VITE_API_URL = 'http://localhost:5001/api';
        const { getMediaUrl } = require('./mediaUtils');
        expect(getMediaUrl('/uploads/photo.jpg')).toBe('http://localhost:5001/uploads/photo.jpg');
    });

    it('adds a leading slash to a relative path missing one', () => {
        jest.resetModules();
        process.env.VITE_API_URL = 'https://api.example.com/api/';
        const { getMediaUrl } = require('./mediaUtils');
        expect(getMediaUrl('uploads/photo.jpg')).toBe('https://api.example.com/uploads/photo.jpg');
    });

    it('returns the path unchanged when VITE_API_URL is not an absolute URL', () => {
        jest.resetModules();
        delete process.env.VITE_API_URL;
        const { getMediaUrl } = require('./mediaUtils');
        expect(getMediaUrl('/uploads/photo.jpg')).toBe('/uploads/photo.jpg');
    });
});
