'use strict';

import Enum from './Enum.mjs';

class MorseKeyTypeEnum extends Enum {

    constructor() {
        super([
            'SK',
            'SS',
            'BUG',
            'FAB',
            'SP',
            'DP',
            'CPU',
        ]);
    }

}

export default MorseKeyTypeEnum;
