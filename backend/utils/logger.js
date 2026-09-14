// utils/logger.js

const LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const COLORS = {
    error: '\x1b[31m', // Red
    warn: '\x1b[33m',  // Yellow
    info: '\x1b[32m',  // Green
    http: '\x1b[35m',  // Magenta
    debug: '\x1b[36m', // Cyan
    reset: '\x1b[0m',
};

const currentLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'debug');

function shouldLog(level) {
    if (process.env.NODE_ENV === 'test' && !process.env.TEST_LOGS) {
        return false;
    }
    const currentWeight = LEVELS[currentLevel] ?? LEVELS.info;
    const levelWeight = LEVELS[level] ?? LEVELS.info;
    return levelWeight <= currentWeight;
}

function formatMessage(level, message, meta = '') {
    const timestamp = new Date().toISOString();
    const color = COLORS[level] || COLORS.reset;
    const tag = `${color}[${level.toUpperCase()}]${COLORS.reset}`;
    const metaStr = meta ? (meta instanceof Error ? meta.stack || meta.message : (typeof meta === 'object' ? ` ${JSON.stringify(meta)}` : ` ${meta}`)) : '';
    return `${timestamp} ${tag} ${message}${metaStr}`;
}

const logger = {
    error: (msg, meta) => {
        if (shouldLog('error')) {
            console.error(formatMessage('error', msg, meta));
        }
    },
    warn: (msg, meta) => {
        if (shouldLog('warn')) {
            console.warn(formatMessage('warn', msg, meta));
        }
    },
    info: (msg, meta) => {
        if (shouldLog('info')) {
            console.log(formatMessage('info', msg, meta));
        }
    },
    http: (msg, meta) => {
        if (shouldLog('http')) {
            console.log(formatMessage('http', msg, meta));
        }
    },
    debug: (msg, meta) => {
        if (shouldLog('debug')) {
            console.log(formatMessage('debug', msg, meta));
        }
    },
};

module.exports = logger;
