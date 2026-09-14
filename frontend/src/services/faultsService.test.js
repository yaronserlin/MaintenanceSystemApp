jest.mock('./apiClient', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
    },
}));

import apiClient from './apiClient';
import faultService from './faultsService';

const resolveWithData = (data) => Promise.resolve({ data });

describe('faultsService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        it('returns the array directly when the API returns an array', async () => {
            apiClient.get.mockReturnValueOnce(resolveWithData([{ _id: '1' }]));
            const result = await faultService.getAll();
            expect(result).toEqual([{ _id: '1' }]);
        });

        it('unwraps a paginated { faults } response', async () => {
            apiClient.get.mockReturnValueOnce(resolveWithData({ faults: [{ _id: '2' }], total: 1 }));
            const result = await faultService.getAll();
            expect(result).toEqual([{ _id: '2' }]);
        });

        it('returns an empty array when neither shape matches', async () => {
            apiClient.get.mockReturnValueOnce(resolveWithData({}));
            const result = await faultService.getAll();
            expect(result).toEqual([]);
        });
    });

    it('getById calls GET /faults/:id', async () => {
        apiClient.get.mockReturnValueOnce(resolveWithData({ _id: '1' }));
        await faultService.getById('1');
        expect(apiClient.get).toHaveBeenCalledWith('/faults/1');
    });

    describe('create', () => {
        it('posts FormData as-is with multipart headers', async () => {
            apiClient.post.mockReturnValueOnce(resolveWithData({}));
            const formData = new FormData();
            await faultService.create(formData);
            expect(apiClient.post).toHaveBeenCalledWith('/faults', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        });

        it('builds FormData from a payload containing files', async () => {
            apiClient.post.mockReturnValueOnce(resolveWithData({}));
            const file = new Blob(['x'], { type: 'image/jpeg' });
            await faultService.create({ description: 'Broken', tool: 't1', files: [file] });
            const [url, sentData, config] = apiClient.post.mock.calls[0];
            expect(url).toBe('/faults');
            expect(sentData).toBeInstanceOf(FormData);
            expect(sentData.get('description')).toBe('Broken');
            expect(sentData.get('tool')).toBe('t1');
            expect(sentData.getAll('photos')).toHaveLength(1);
            expect(config).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } });
        });

        it('sends a plain JSON payload when there are no files', async () => {
            apiClient.post.mockReturnValueOnce(resolveWithData({}));
            const payload = { description: 'Broken', tool: 't1' };
            await faultService.create(payload);
            expect(apiClient.post).toHaveBeenCalledWith('/faults', payload);
        });
    });

    it('close calls PATCH /faults/:id/close with the payload', async () => {
        apiClient.patch.mockReturnValueOnce(resolveWithData({}));
        await faultService.close('1', { engineHours: 20 });
        expect(apiClient.patch).toHaveBeenCalledWith('/faults/1/close', { engineHours: 20 });
    });

    it('close defaults to an empty payload', async () => {
        apiClient.patch.mockReturnValueOnce(resolveWithData({}));
        await faultService.close('1');
        expect(apiClient.patch).toHaveBeenCalledWith('/faults/1/close', {});
    });

    it('reopen calls PATCH /faults/:id/reopen', async () => {
        apiClient.patch.mockReturnValueOnce(resolveWithData({}));
        await faultService.reopen('1');
        expect(apiClient.patch).toHaveBeenCalledWith('/faults/1/reopen');
    });

    it('update calls PUT /faults/:id with the payload', async () => {
        apiClient.put.mockReturnValueOnce(resolveWithData({}));
        await faultService.update('1', { description: 'Updated' });
        expect(apiClient.put).toHaveBeenCalledWith('/faults/1', { description: 'Updated' });
    });

    it('delete calls DELETE /faults/:id', async () => {
        apiClient.delete.mockReturnValueOnce(resolveWithData({}));
        await faultService.delete('1');
        expect(apiClient.delete).toHaveBeenCalledWith('/faults/1');
    });
});
