'use strict';

import AdifError from '../errors/AdifError.mjs';
import DataType from './DataType.mjs';
import ContinentEnumerationDataType from './ContinentEnumerationDataType.mjs';

class IotaRefNoDataType extends DataType {

    static validate(value) {
        if (typeof value !== 'string') {
            throw new AdifError('value not valid for IotaRefNoDataType', { value });
        }

        const [ continent, islandGroupDesignator ] = value.split('-');

        try {
            ContinentEnumerationDataType.validate(continent);
        } catch (cause) {
            throw new AdifError('IOTA Ref No continent part is invalid', { value, continent, cause });
        }

        const intIslandGroupDesignator = parseInt(islandGroupDesignator);
        const minIslandGroupDesignator = 1;
        const maxIslangGroupDesignator = 999;
        if (islandGroupDesignator.length !== 3 || isNaN(intIslandGroupDesignator) || !(minIslandGroupDesignator <= intIslandGroupDesignator && intIslandGroupDesignator <= maxIslangGroupDesignator)) {
            throw new AdifError('Island group designator part of IOTA Ref No is outside the range', { value, islandGroupDesignator, intIslandGroupDesignator, minIslandGroupDesignator, maxIslangGroupDesignator });
        }

        return true;
    }

}

export default IotaRefNoDataType;
