'use strict';

const AdifError = require('./AdifError');

class Field {

    #fieldName;
    #dataLength;
    #dataTypeIndicator;
    #data;
    #bytesConsumed;

    constructor(fieldName, dataLength = null, dataTypeIndicator = null, data = null, bytesConsumed = 0) {
        this.#fieldName = fieldName.toUpperCase();
        this.#dataLength = isNaN(parseInt(dataLength)) ? null : parseInt(dataLength);
        this.#dataTypeIndicator = dataTypeIndicator;
        this.#data = data;
        this.#bytesConsumed = isNaN(parseInt(bytesConsumed)) ? 0 : parseInt(bytesConsumed);
    }

    get fieldName() {
        return this.#fieldName;
    }

    get dataLength() {
        return this.#dataLength;
    }

    get dataTypeIndicator() {
        return this.#dataTypeIndicator;
    }

    get data() {
        return this.#data;
    }

    get bytesConsumed() {
        return this.#bytesConsumed;
    }

    stringify() {
        return `<${this.fieldName}${this.dataLength !== null ? ':' + this.dataLength : ''}${this.dataTypeIndicator !== null ? ':' + this.dataTypeIndicator : ''}>${this.data !== null ? this.data : ''}`;
    }

    toObject() {
        const obj = Object.create(null);
        obj[this.fieldName] = this.data;
        return obj;
    }

    toEntry() {
        return [ this.fieldName, this.data ];
    }

    static stringify(fieldName, dataTypeIndicator, data) {
        return new Field(fieldName, `${data}`.length, dataTypeIndicator, `${data}`).stringify();
    }

    static parse(s) {

        const matches = Field.matcher.exec(s); // not a tag
        if (!matches) {
            return null;
        }

        const [ original ] = matches;

        const fieldName = matches.groups.fieldName.toUpperCase();
        const dataLength = matches.groups.dataLength === undefined ? null : parseInt(matches.groups.dataLength);
        const dataTypeIndicator = matches.groups.dataTypeIndicator?.toUpperCase() ?? null;
        const data = dataLength === null ? null : s.substring(matches.index + original.length, matches.index + original.length + dataLength);
        const bytesConsumed = matches.index + original.length + (dataLength ?? 0);

        if (data !== null && data.length !== dataLength) {
            return null; // more data needs to be read
        }

        return new Field(fieldName, dataLength, dataTypeIndicator, data, bytesConsumed);
        
    }

    static get matcher() {
        return new RegExp("<(?<fieldName>[^ ]?[^,:<>{}]+[^ ]?)(:(?<dataLength>[0-9]+))?(:(?<dataTypeIndicator>[BNDTSIMGEL]))?>", "i");
    }
}

module.exports = Field;
