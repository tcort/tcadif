'use strict';

import Enum from './Enum.mjs';

class QslViaEnum extends Enum {

    constructor() {
        super([
            'B',
            'D',
            'E',
        ], [
            'M',
        ]);
    }

}

export default QslViaEnum;
