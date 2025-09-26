'use strict';

import Tag from './Tag.mjs';

class EndOfRecordTag extends Tag {

    static toADI() {
        return Tag.toADI('EOR');
    }

}

export default EndOfRecordTag;
