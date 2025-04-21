'use strict';

const AdifError = require('./AdifError');
const defs = require('./defs');
const DataTypes = require('./DataTypes');
const Field = require('./Field');
const pkg = require('../package.json');

class Header {

    #data = {};
    #bytesConsumed = 0;

    static get defs() {
        return Object.values(defs.header).map(Class => new Class());
    }

    constructor(obj, bytesConsumed = 0) {
        Header.defs.filter(def => def.fieldName in obj).forEach(def => {
            const value = def.normalize(obj[def.fieldName]);
            def.validate(value);
            this.#data[def.fieldName] = value;
        });
        this.#bytesConsumed = bytesConsumed;
    }

    get bytesConsumed() {
        return this.#bytesConsumed;
    }

    toObject() {
        return Header.defs.filter(def => this.#data[def.fieldName] !== undefined).reduce((obj, def) => {
            obj[def.fieldName] = this.#data[def.fieldName];
            return obj;
        }, Object.create(null));
    }

    stringify(banner = `Generated ${new Date().toJSON()} by ${pkg.name}/${pkg.version}`) {
        return banner + '\r\n\r\n' +
                Header.defs
                    .filter(def => this.#data[def.fieldName] !== undefined)
                    .map(def => Field.stringify(def.fieldName, def.dataTypeIndicator, this.#data[def.fieldName]))
                    .concat([ new Field('EOH').stringify() ]).join('\r\n');
    }

}

module.exports = Header;
