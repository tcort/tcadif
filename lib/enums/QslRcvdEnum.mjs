'use strict';

import Enum from './Enum.mjs';

class QslRcvdEnum extends Enum {

    constructor() {
        super([
            'Y',
            'N',
            'R',
            'I',
        ], [
            'V',
        ]);
    }

}

export default QslRcvdEnum;
