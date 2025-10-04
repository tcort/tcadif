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
        const matcher = new RegExp("<(?<fieldName>[^ ]?[^,:<>{}]+[^ ]?)(:(?<dataLength>[0-9]+))?(:(?<dataTypeIndicator>[A-Za-z]))?>");
        const readNextField = (s) => {
            const matches = matcher.exec(s); // not a tag
            if (!matches) {
                return { };
            }

            const [ original ] = matches;

            const fieldName = matches.groups.fieldName.toUpperCase();
            const dataLength = matches.groups.dataLength === undefined ? null : parseInt(matches.groups.dataLength);
            const dataTypeIndicator = matches.groups.dataTypeIndicator?.toUpperCase() ?? null;
            const data = dataLength === null ? null : s.substring(matches.index + original.length, matches.index + original.length + dataLength);
            const charactersConsumed = matches.index + original.length + (dataLength ?? 0);

            return { fieldName, dataLength, dataTypeIndicator, data, charactersConsumed };
        }

        let i;

        for (i = 0; true; i++) {
            const { fieldName, dataLength, dataTypeIndicator, data, charactersConsumed } = readNextField(s.slice(i));
            if (fieldName === undefined) { // end of input, no more data specifiers found
                if (JSON.stringify(segment.toObj()) !== '{}') { // segment has data specifiers but no end tag
                    throw new AdifError('Premature end of input. Expected end tag', { expectedTag: segment.#tag.toADI(), segment: segment.toObj() });
                }
                return { segment: null, charactersConsumed: s.length };
            } else if (fieldName === segment.#tag.tagName) { // end of segment
                return { segment, charactersConsumed: i + charactersConsumed };
            }

            // lookup field definition
            const key = Object.keys(segment.#fields).find(key => segment.#fields[key].fieldName === fieldName);
            if (key === undefined) { // unknown field, skip it
                i += charactersConsumed - 1; // -1 because the loop does an i++;
                continue;
            }

            // if data type indicator specified, check against field definition
            if (typeof dataTypeIndicator === 'string' && dataTypeIndicator.length > 0 && segment.#fields[key].dataTypeIndicator !== dataTypeIndicator) {
                throw new AdifError('Data type indicator in ADI does not match data type indicator in field definition', { expectedDataTypeIndicator: field.dataTypeIndicator, actualDataTypeIndicator: dataTypeIndicator });
            }

            segment[key] = data;
            i += charactersConsumed - 1; // consume the characters, -1 because the loop does an i++;
        }

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
