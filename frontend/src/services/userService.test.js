jest.mock('./apiClient', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
    },
}));

import apiClient from './apiClient';
import userService from './userService';

describe('userService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('getProfile calls GET /auth/me', () => {
        userService.getProfile();
        expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
    });

    it('updateProfile calls PUT /auth/me with the payload', () => {
        const data = { name: 'Jane', email: 'jane@example.com' };
        userService.updateProfile(data);
        expect(apiClient.put).toHaveBeenCalledWith('/auth/me', data);
    });

    it('changePassword calls POST /auth/me/change-password with the payload', () => {
        const payload = { currentPassword: 'a', newPassword: 'b' };
        userService.changePassword(payload);
        expect(apiClient.post).toHaveBeenCalledWith('/auth/me/change-password', payload);
    });

    it('uploadAvatar wraps the file in FormData and sets multipart headers', () => {
        const file = new Blob(['data'], { type: 'image/png' });
        userService.uploadAvatar(file);
        expect(apiClient.post).toHaveBeenCalledWith(
            '/auth/me/avatar',
            expect.any(FormData),
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        const formData = apiClient.post.mock.calls[0][1];
        expect(formData.get('avatar')).toBeTruthy();
        expect(formData.get('avatar').size).toBe(file.size);
    });
});
