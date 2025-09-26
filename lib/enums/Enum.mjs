'use strict';

class Enum {

    #values;
    #importOnlyValues;

    constructor(values = [], importOnlyValues = []) {
        this.#values = values.map(value => value.toUpperCase());
        this.#importOnlyValues = importOnlyValues.map(importOnlyValue => importOnlyValue.toUpperCase());
    }

    includes(value) {
        if (typeof value !== 'string') {
            return false;
        }
        return this.#values.includes(value.toUpperCase()) || this.#importOnlyValues.includes(value.toUpperCase());
    }

    isImportOnly(value) {
        return this.#importOnlyValues.includes(value.toUpperCase());
    }

    get values() {
        return this.#values;
    }
}

export default Enum;
