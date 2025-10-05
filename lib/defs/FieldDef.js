'use strict';

const AdifError = require('../AdifError');
const DataTypes = require('../DataTypes');
const enums = require('../enums');

class FieldDef {

    #fieldName;
    #dataType;
    #dataTypeIndicator;
    #enumeration;
    #validator;
    #check;
    #normalizer;
    #importOnly;

    constructor(obj = {}) {
        this.#fieldName = obj.fieldName;
        this.#dataType = obj.dataType;
        this.#dataTypeIndicator = obj.dataTypeIndicator ?? null;
        this.#enumeration = obj.enumeration;
        this.#validator = obj.validator;
        this.#check = obj.check;
        this.#normalizer = obj.normalizer;
        this.#importOnly = obj.importOnly ?? false;
    }

    get fieldName() {
        return this.#fieldName;
    }

    get dataType() {
        return this.#dataType;
    }

    get dataTypeIndicator() {
        return this.#dataTypeIndicator;
    }

    get enumeration() {
        return this.#enumeration;
    }

    get validator() {
        return this.#validator;
    }

    get check() {
        return this.#check;
    }

    get normalizer() {
        return this.#normalizer;
    }

    get importOnly() {
        return this.#importOnly;
    }

    normalize(value) {
        if (this.normalizer instanceof Function) {
            value = this.normalizer(value);
        }

        return value;
    }

    validate(value) {
        const dataTypeOk = DataTypes.check(this.dataType, value);
        if (!dataTypeOk) {
            throw new AdifError('data type check failed', { field: this.fieldName, value });
        }

        if (this.validator instanceof RegExp) {
            const validatorOk = this.validator.test(value);
            if (!validatorOk) {
                throw new AdifError('field validation check failed', { field: this.fieldName, value });
            }
        }

        if (this.enumeration in enums) {
            const enumOk = (value in enums[this.enumeration]);
            if (!enumOk) {
                throw new AdifError('field enumeration check failed', { field: this.fieldName, value, validValues: Object.keys(enums[this.enumeration]) });
            }
        }

        if (this.check instanceof Function) {
            const checkOk = this.check(value);
            if (!checkOk) {
                throw new AdifError('field check failed', { field: this.fieldName, value });
            }
        }
    }

}

module.exports = FieldDef;
