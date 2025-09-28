'use strict';

class Tag {

    static get tagName() {
        return null;
    }

    static toADI(tagName) {
        tagName = `${tagName}`.toUpperCase();
        return `<${tagName}>`;
    }

}

export default Tag;
