'use strict';

const AdifError = require('./AdifError');
const defs = require('./defs');
const DataTypes = require('./DataTypes');
const Field = require('./Field');
const os = require('os');

class Header {

    #data = {};
    #bytesConsumed = 0;

    static get defs() {
        return Object.values(defs.header).map(Class => new Class());
    }

    constructor(obj, bytesConsumed = 0) {
        Header.defs.filter(def => def.fieldName in obj).filter(def => obj[def.fieldName] !== '' && obj[def.fieldName] !== null && obj[def.fieldName] !== undefined).forEach(def => {
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

    stringify(options = {}) {

        options = options ?? {};
        options.fieldDelim = options?.fieldDelim ?? `${os.EOL}`;
        options.recordDelim = options?.recordDelim ?? `${os.EOL}${os.EOL}`;
        options.programName = options?.programName ?? `${pkg.name}`;
        options.programVersion = options?.programVersion ?? `${pkg.version}`;

        return `Generated ${new Date().toJSON()} by ${options.programName}/${options.programVersion}` + options.recordDelim +
                Header.defs
                    .filter(def => this.#data[def.fieldName] !== undefined)
                    .map(def => Field.stringify(def.fieldName, def.dataTypeIndicator, this.#data[def.fieldName]))
                    .concat([ new Field('EOH').stringify() ]).join(options.fieldDelim);
    }

}

module.exports = Header;
