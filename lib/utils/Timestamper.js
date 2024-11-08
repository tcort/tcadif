'use strict';

class Timestamper {

    static CREATED_TIMESTAMP(now = new Date()) {
        const YYYY = `${now.getUTCFullYear()}`.padStart(4, '0');
        const MM = `${now.getUTCMonth() + 1}`.padStart(2, '0');
        const DD = `${now.getUTCDate()}`.padStart(2, '0');

        const HH = `${now.getUTCHours()}`.padStart(2, '0');
        const mm = `${now.getUTCMinutes()}`.padStart(2, '0');
        const ss = `${now.getUTCSeconds()}`.padStart(2, '0');

        return `${YYYY}${MM}${DD} ${HH}${mm}${ss}`;
    }

}

module.exports = Timestamper;
