'use strict';

const AdifError = require('./AdifError');
const defs = require('./defs');
const DataTypes = require('./DataTypes');
const Field = require('./Field');

class QSO {

    #data = {};
    #bytesConsumed = 0;

    static get defs() {
        return Object.values(defs.qso).map(Class => new Class());
    }

    constructor(obj, bytesConsumed = 0) {
        QSO.defs.filter(def => def.fieldName in obj).forEach(def => {
            const value = def.normalize(obj[def.fieldName]);
            def.validate(value);
            this.#data[def.fieldName] = value;
        });
        this.#bytesConsumed = bytesConsumed;

        if (this.#data.QSO_DATE === undefined ||
                this.#data.TIME_ON === undefined ||
                this.#data.CALL === undefined ||
                (this.#data.BAND === undefined && this.#data.FREQ === undefined) ||
                this.#data.MODE === undefined) {
            throw new AdifError('QSO missing one or more required fields: QSO_DATE, TIME_ON, CALL, BAND or FREQ, MODE');
        }

    }

    toObject() {
        return QSO.defs.filter(def => this.#data[def.fieldName] !== undefined).reduce((obj, def) => {
            obj[def.fieldName] =  this.#data[def.fieldName];
            return obj;
        }, Object.create(null));
    }

    stringify() {
        return QSO.defs
            .filter(def => this.#data[def.fieldName] !== undefined)
            .map(def => Field.stringify(def.fieldName, def.dataTypeIndicator, this.#data[def.fieldName]))
            .concat([ new Field('EOR').stringify() ]).join('\r\n');
    }

}

module.exports = QSO;
