export const MAIL_CONFIG = {
    MAIL_HOST: 'MAIL_HOST',
    MAIL_PORT: 'MAIL_PORT',
    MAIL_USER: 'MAIL_USER',
    MAIL_PASS: 'MAIL_PASS',
} as const;

export const MAIL_SUBJECTS = {
    WELCOME: 'Welcome to EventHub!',
    TICKET_PURCHASED: 'Your ticket has been confirmed!',
    TICKET_CANCELLED: 'Your ticket has been cancelled',
} as const;

export const MAIL_TEMPLATES = {
    WELCOME: 'auth/welcome',
    TICKET_PURCHASED: 'tickets/ticket-purchased',
    TICKET_CANCELLED: 'tickets/ticket-cancelled',
} as const;