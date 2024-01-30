'use strict';

const { Transform } = require('stream');

class Filter extends Transform {

    constructor(fn = () => true) {
        super({
            readableObjectMode: true,
            writableObjectMode: true
        });

        this.filterfn = fn;
    }

    _transform(chunk, encoding, next) {
        if (this.filterfn(chunk)) {
            return next(null, chunk);
        }

        next();
    }

}

module.exports = Filter;
