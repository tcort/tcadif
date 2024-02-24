'use strict';

const { Transform } = require('stream');

class Map extends Transform {

    constructor(fn = () => true) {
        super({
            readableObjectMode: true,
            writableObjectMode: true
        });

        this.mapfn = fn;
    }

    _transform(chunk, encoding, next) {
        return next(null, this.mapfn(chunk));
    }

}

module.exports = Map;
