jest.mock('mongoose', () => ({
    set: jest.fn(),
    connect: jest.fn(),
}));

describe('config/db connectDB', () => {
    let mongoose;
    let consoleLogSpy;
    let consoleErrorSpy;
    let processExitSpy;

    beforeEach(() => {
        jest.resetModules();
        mongoose = require('mongoose');
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
        processExitSpy.mockRestore();
    });

    it('connects successfully and logs a confirmation', async () => {
        mongoose.connect.mockResolvedValueOnce(undefined);
        const connectDB = require('../config/db');

        await connectDB();

        expect(mongoose.set).toHaveBeenCalledWith('sanitizeFilter', true);
        expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI);
        expect(consoleLogSpy).toHaveBeenCalledWith('MongoDB connected');
        expect(processExitSpy).not.toHaveBeenCalled();
    });

    it('logs the error and exits the process when connection fails', async () => {
        const connectionError = new Error('connection refused');
        mongoose.connect.mockRejectedValueOnce(connectionError);
        const connectDB = require('../config/db');

        await connectDB();

        expect(consoleErrorSpy).toHaveBeenCalledWith('MongoDB connection error:', connectionError);
        expect(processExitSpy).toHaveBeenCalledWith(1);
    });
});
