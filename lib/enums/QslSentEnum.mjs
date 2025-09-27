'use strict';

import Enum from './Enum.mjs';

class QslSentEnum extends Enum {

    constructor() {
        super([
            'Y',
            'N',
            'R',
            'Q',
            'I',
        ]);
    }

}

export default QslSentEnum;
