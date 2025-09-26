'use strict';

import Enum from './Enum.mjs';

class AwardEnum extends Enum {

    constructor() {
        super([
            // none
        ], [
            'AJA',
            'CQDX',
            'CQDXFIELD',
            'CQWAZ_MIXED',
            'CQWAZ_CW',
            'CQWAZ_PHONE',
            'CQWAZ_RTTY',
            'CQWAZ_160m',
            'CQWPX',
            'DARC_DOK',
            'DXCC',
            'DXCC_MIXED',
            'DXCC_CW',
            'DXCC_PHONE',
            'DXCC_RTTY',
            'IOTA',
            'JCC',
            'JCG',
            'MARATHON',
            'RDA',
            'WAB',
            'WAC',
            'WAE',
            'WAIP',
            'WAJA',
            'WAS',
            'WAZ',
            'USACA',
            'VUCC',
        ]);
    }

}

export default AwardEnum;
