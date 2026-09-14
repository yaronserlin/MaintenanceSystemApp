describe('Logger utility', () => {
    const originalEnv = { ...process.env };
    let consoleErrorSpy;
    let consoleWarnSpy;
    let consoleLogSpy;

    beforeEach(() => {
        jest.resetModules();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
        consoleLogSpy.mockRestore();
        process.env = { ...originalEnv };
    });

    it('suppresses all log output in test environment by default', () => {
        process.env.NODE_ENV = 'test';
        delete process.env.TEST_LOGS;
        const logger = require('../utils/logger');

        logger.error('boom');
        logger.warn('careful');
        logger.info('fyi');
        logger.http('GET /x');
        logger.debug('trace');

        expect(consoleErrorSpy).not.toHaveBeenCalled();
        expect(consoleWarnSpy).not.toHaveBeenCalled();
        expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('logs all levels when TEST_LOGS is enabled and formats string meta', () => {
        process.env.NODE_ENV = 'test';
        process.env.TEST_LOGS = '1';
        delete process.env.LOG_LEVEL;
        const logger = require('../utils/logger');

        logger.error('boom', 'extra context');
        logger.warn('careful');
        logger.info('fyi');
        logger.http('GET /x');
        logger.debug('trace');

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy.mock.calls[0][0]).toMatch(/\[ERROR\]/);
        expect(consoleErrorSpy.mock.calls[0][0]).toMatch(/boom extra context/);
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleLogSpy).toHaveBeenCalledTimes(3);
    });

    it('formats an Error meta using its stack', () => {
        process.env.NODE_ENV = 'test';
        process.env.TEST_LOGS = '1';
        const logger = require('../utils/logger');
        const err = new Error('failure reason');

        logger.error('Unhandled server error:', err);

        expect(consoleErrorSpy.mock.calls[0][0]).toContain('failure reason');
    });

    it('formats an object meta as JSON', () => {
        process.env.NODE_ENV = 'test';
        process.env.TEST_LOGS = '1';
        const logger = require('../utils/logger');

        logger.info('user action', { userId: '123' });

        expect(consoleLogSpy.mock.calls[0][0]).toContain('"userId":"123"');
    });

    it('respects a LOG_LEVEL override, suppressing lower-priority levels', () => {
        process.env.NODE_ENV = 'test';
        process.env.TEST_LOGS = '1';
        process.env.LOG_LEVEL = 'warn';
        const logger = require('../utils/logger');

        logger.error('boom');
        logger.warn('careful');
        logger.info('fyi');
        logger.debug('trace');

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('defaults to warn level in production', () => {
        process.env.NODE_ENV = 'production';
        delete process.env.LOG_LEVEL;
        delete process.env.TEST_LOGS;
        const logger = require('../utils/logger');

        logger.error('boom');
        logger.warn('careful');
        logger.info('fyi');

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleLogSpy).not.toHaveBeenCalled();
    });
});
