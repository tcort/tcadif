'use strict';

import Enum from './Enum.mjs';

class ContEnum extends Enum {

    constructor() {
        super([
            'NA',
            'SA',
            'EU',
            'AF',
            'OC',
            'AS',
            'AN',
        ]);
    }

}

export default ContEnum;
