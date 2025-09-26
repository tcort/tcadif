'use strict';

import Tag from '../tags/Tag.mjs';

class Segment {

    #fields = {};
    #tag;

    constructor(fields = [], tag = Tag, obj = {}) {
        fields.forEach(Field => {

            this.#fields[Field.fieldName] = new Field();
            Object.defineProperty(this, Field.fieldName, {
                configurable: true,
                enumerable: true,
                get: function () {
                    return this.#fields[Field.fieldName].value;
                },
                set: function (value) {
                    return this.#fields[Field.fieldName].value = value;
                },
            });

        });

        this.#tag = tag;

        obj = typeof obj === 'object' && obj !== null ? obj : {};
        fields.map(Field => Field.fieldName).forEach(fieldName => {
            if (obj.hasOwnProperty(fieldName)) {
                this[fieldName] = obj[fieldName];
            }
        });
    }

    toADI() {
        return Object.keys(this.#fields).map(fieldName => this.#fields[fieldName].toADI()).filter(adi => adi.length > 0).concat([ this.#tag.toADI() ]).join('\r\n') ;
    }

    toJSON() {
        const obj = {};
        Object.keys(this.#fields).map(fieldName => this.#fields[fieldName].toJSON()).forEach(fieldObject => Object.assign(obj, fieldObject));
        return obj;
    }
}

export default Segment;
