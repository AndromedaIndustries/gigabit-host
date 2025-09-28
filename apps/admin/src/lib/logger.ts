import { pino, type Logger } from 'pino'

export const logger: Logger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
        },
    },
    level: process.env.LOG_LEVEL || 'info',

    redact: [], // prevent logging of sensitive data
});