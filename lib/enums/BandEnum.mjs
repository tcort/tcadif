'use strict';

import Enum from './Enum.mjs';

class BandEnum extends Enum {

    constructor() {
        super([
            '2190m',
            '630m',
            '560m',
            '160m',
            '80m',
            '60m',
            '40m',
            '30m',
            '20m',
            '17m',
            '15m',
            '12m',
            '10m',
            '8m',
            '6m',
            '5m',
            '4m',
            '2m',
            '1.25m',
            '70cm',
            '33cm',
            '23cm',
            '13cm',
            '9cm',
            '6cm',
            '3cm',
            '1.25cm',
            '6mm',
            '4mm',
            '2.5mm',
            '2mm',
            '1mm',
            'submm',
        ]);
    }

}

export default BandEnum;
