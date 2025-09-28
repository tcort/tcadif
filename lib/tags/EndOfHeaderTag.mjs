'use strict';

import Tag from './Tag.mjs';

class EndOfHeaderTag extends Tag {

    static get tagName() {
        return 'EOH';
    }

    static toADI() {
        return Tag.toADI(EndOfHeaderTag.tagName);
    }

}

export default EndOfHeaderTag;
