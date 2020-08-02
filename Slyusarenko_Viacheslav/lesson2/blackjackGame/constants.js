module.exports = {
    USER: 'user',
    CPU: 'cpu',
    NO_WINNERS: 'draw',
    LOG_FILE: 'bj.log',

    CARTS_COUNT: 2,
    VALUE_MAX: 21,
    MIDDLE_VALUE: 16,

    /** игровые команды */
    COMMANDS: {
        START: 'r',
        EXIT: 'q',
        TAKE_CARD: 'y',
        PASS: 'p',
        MY_CARDS: 's'
    },
    CARDS: {
        6: { value: 6, count: 4 },
        7: { value: 7, count: 4 },
        8: { value: 8, count: 4 },
        9: { value: 9, count: 4 },
        10: { value: 10, count: 4 },
        J: { value: 2, count: 4 },
        Q: { value: 3, count: 4 },
        K: { value: 4, count: 4 },
        T: { value: 11, count: 4 }
    }
}