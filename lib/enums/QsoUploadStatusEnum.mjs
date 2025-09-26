'use strict';

import Enum from './Enum.mjs';

class QsoUploadStatusEnum extends Enum {

    constructor() {
        super([
            'Y',
            'N',
            'M',
        ]);
    }

}

export default QsoUploadStatusEnum;
