'use strict';

import Field from './Field.mjs';
import GridSquareListDataType from '../datatypes/GridSquareListDataType.mjs';

class MyVuccGridsField extends Field {

    constructor(value) {
        super(MyVuccGridsField.fieldName, GridSquareListDataType, value);
    }

    static get fieldName() {
        return 'MY_VUCC_GRIDS';
    }

}

export default MyVuccGridsField;
