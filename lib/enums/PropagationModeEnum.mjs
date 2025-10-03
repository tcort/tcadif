'use strict';

import Enum from './Enum.mjs';

class PropagationModeEnum extends Enum {

    constructor() {
        super([
            'AS',
            'AUE',
            'AUR',
            'BS',
            'ECH',
            'EME',
            'ES',
            'F2',
            'FAI',
            'GWAVE',
            'INTERNET',
            'ION',
            'IRL',
            'LOS',
            'MS',
            'RPT',
            'RS',
            'SAT',
            'TEP',
            'TR',
        ]);
    }

}

export default PropagationModeEnum;
