'use strict';

import Segment from './Segment.mjs';

import AdifVerField from '../fields/AdifVerField.mjs';
import CreatedTimestampField from '../fields/CreatedTimestampField.mjs';
import ProgramidField from '../fields/ProgramidField.mjs';
import ProgramversionField from '../fields/ProgramversionField.mjs';

import EndOfHeaderTag from '../tags/EndOfHeaderTag.mjs';

class HeaderSegment extends Segment {

    constructor(obj = {}) {
        super([
            AdifVerField,
            CreatedTimestampField,
            ProgramidField,
            ProgramversionField,
        ], EndOfHeaderTag, obj);
    }

    static timestamp(now = new Date()) {

        const year = now.getUTCFullYear()
        const month = 1 + now.getUTCMonth();
        const day = now.getUTCDate(); 

        const hours = now.getUTCHours();
        const minutes = now.getUTCMinutes();
        const seconds = now.getUTCSeconds();


        return [
            `${year}`.padStart(4, '0'),
            `${month}`.padStart(2, '0'),
            `${day}`.padStart(2, '0'),
            ' ',
            `${hours}`.padStart(2, '0'),
            `${minutes}`.padStart(2, '0'),
            `${seconds}`.padStart(2, '0'),
        ].join('');

    }

    static factory() {
        return new HeaderSegment({
            ADIF_VER: '3.1.6',
            PROGRAMID: 'tcadif',
            PROGRAMVERSION: '3.0.0',
            CREATED_TIMESTAMP: HeaderSegment.timestamp(),
        });
    }
}

export default HeaderSegment;
