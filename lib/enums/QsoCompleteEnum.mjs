'use strict';

import Enum from './Enum.mjs';

class QsoCompleteEnum extends Enum {

    constructor() {
        super([
            'Y',
            'N',
            'NIL',
            '?',
        ]);
    }

}

export default QsoCompleteEnum;
