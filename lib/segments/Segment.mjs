'use strict';

import AdifError from '../errors/AdifError.mjs';
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

    static fromADI(s, segment) {
        let i;

        for (i = 0; i < s.length; i++) {
            if (s[i] !== '<') { // scan until '<'
                continue;
            }
            // else s[i] === '<' and at least one more character

            const [ dataSpecifier, rest ] = s.slice(i+1).split(/>/);
            const [ fieldName, dataLength, dataTypeIndicator ] = dataSpecifier.split(/:/g);

            const dataSpecifierLength = 1 /* '<' */ + dataSpecifier.length + 1 /* '>' */;
            const intDataLength = parseInt(dataLength ?? 0);
            if (isNaN(intDataLength) || intDataLength < 0) {
                throw new AdifError('Length component of data specifier is invalid', { dataSpecifier, dataLength });
            }

            if (fieldName.toUpperCase() === segment.#tag.tagName) {
                // end of segment....
                i += dataSpecifierLength + intDataLength; // consume the characters
                return { segment, charactersConsumed: i };
            }

            // lookup field definition
            const key = Object.keys(segment.#fields).find(key => segment.#fields[key].fieldName === fieldName.toUpperCase());
            if (key === undefined) { // unknown field, skip it
                i += dataSpecifierLength + intDataLength - 1; // -1 because the loop does an i++;
                continue;
            }

            // if data type indicator specified, check against field definition
            if (typeof dataTypeIndicator === 'string' && dataTypeIndicator.length > 0 && segment.#fields[key].dataTypeIndicator !== dataTypeIndicator) {
                throw new AdifError('Data type indicator in ADI does not match data type indicator in field definition', { expectedDataTypeIndicator: field.dataTypeIndicator, actualDataTypeIndicator: dataTypeIndicator });
            }

            segment[key] = rest.slice(0, intDataLength);
            i += dataSpecifierLength + intDataLength - 1; // consume the characters
        }

        if (JSON.stringify(segment.toObj()) !== '{}') {
            throw new AdifError('Premature end of input. Expected end tag', { expectedTag: segment.#tag.toADI(), segment: segment.toObj() });
        }

        return { segment: null, charactersConsumed: i };
    }

    toADI() {
        return Object.keys(this.#fields).map(fieldName => this.#fields[fieldName].toADI()).filter(adi => adi.length > 0).concat([ this.#tag.toADI() ]).join('\r\n') ;
    }

    toObj() {
        const obj = {};
        Object.keys(this.#fields).map(fieldName => this.#fields[fieldName].toObj()).forEach(fieldObject => Object.assign(obj, fieldObject));
        return obj;
    }
}

export default Segment;
