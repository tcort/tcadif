'use strict';

import Enum from './Enum.mjs';

class SponsoredAwardEnum extends Enum {

    constructor() {
        super([
            'ADIF_',
            'ARI_',
            'ARRL_',
            'CQ_',
            'DARC_',
            'EQSL_',
            'IARU_',
            'JARL_',
            'RSGB_',
            'TAG_',
            'WABAG_',
        ]);
    }

}

export default SponsoredAwardEnum;
