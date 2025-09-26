'use strict';

import AdifError from '../errors/AdifError.mjs';

class DataType {

    static get dataTypeIndicator() {
        return null;
    }

    static normalize(value) {
        return value;
    }

    static validate() {
        return true;
    }

}

export default DataType;
