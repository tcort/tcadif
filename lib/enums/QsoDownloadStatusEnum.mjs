'use strict';

import Enum from './Enum.mjs';

class QsoDownloadStatusEnum extends Enum {

    constructor() {
        super([
            'Y',
            'N',
            'I',
        ]);
    }

}

export default QsoDownloadStatusEnum;
