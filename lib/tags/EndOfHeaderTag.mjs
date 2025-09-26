'use strict';

import Tag from './Tag.mjs';

class EndOfHeaderTag extends Tag {

    static toADI() {
        return Tag.toADI('EOH');
    }

}

export default EndOfHeaderTag;
