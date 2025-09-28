'use strict';

import Tag from './Tag.mjs';

class EndOfRecordTag extends Tag {

    static get tagName() {
        return 'EOR';
    }

    static toADI() {
        return Tag.toADI(EndOfRecordTag.tagName);
    }

}

export default EndOfRecordTag;
