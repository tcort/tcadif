'use strict';

import Enum from './Enum.mjs';

class RegionEnum extends Enum {

    constructor() {
        super([
            'NONE',
            'IV',
            'AI',
            'SY',
            'BI',
            'SI',
            'KO',
            'KO',
            'KO',
            'ET',
        ]);
    }

}

export default RegionEnum;
