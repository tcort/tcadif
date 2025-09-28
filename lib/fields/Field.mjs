'use strict';

import AdifError from '../errors/AdifError.mjs';
import EnumerationDataType from '../datatypes/EnumerationDataType.mjs';

class Field {

    #fieldName;
    #dataType;
    #value;

    constructor(fieldName, dataType, value = null) {
        this.#fieldName = fieldName;
        this.#dataType = dataType;
        this.value = value ?? null; // Set to this.defaultValue to enable automatic defaulting
    }

    /* accessors/mutators */

    get defaultValue() {
        return null;
    }

    get fieldName() {
        return this.#fieldName;
    }

    set value(value) {
        if (value !== null) {
            value = this.normalize(value);
            try {
                this.validate(value);
            } catch (cause) {
                throw new AdifError('Field validation failed', { fieldName: this.#fieldName, value, cause });
            }
        }
        this.#value = value;
    }

    get value() {
        return this.#value;
    }

    get dataTypeIndicator() {
        return this.#dataType.dataTypeIndicator;
    }

    get importOnly() {
        if (typeof this.#dataType?.isImportOnly === 'function') {
            return this.#dataType.isImportOnly(this.value);
        }
        return false;
    }

    /* conversions */

    toADI() {
        if (this.#value === null || this.importOnly) {
            return '';
        }
        return `<${this.#fieldName}:${this.#value.length}${this.dataTypeIndicator === null ? '' : (':' + this.dataTypeIndicator)}>${this.value}`;
    }

    toObj() {
        if (this.#value === null || this.importOnly) {
            return {};
        }
        return { [this.#fieldName]: this.#value };
    }

    /* normalization */

    normalize(value) {
        return this.#dataType.normalize(value);
    }

    /* validation */

    validate(value) {
        return this.#dataType.validate(value);
    }


}

export default Field;
