'use strict';

class Tag {

    static toADI(tagName) {
        tagName = `${tagName}`.toUpperCase();
        return `<${tagName}>`;
    }

}

export default Tag;
