'use strict';

class AdifError extends Error {
    constructor(message = 'something went wrong', baggage = {}) {
        super();
        this.name = 'AdifError';
        this.message = message;
        Object.assign(this, baggage);
    }
}

module.exports = AdifError;
