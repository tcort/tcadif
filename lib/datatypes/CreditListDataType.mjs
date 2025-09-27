'use strict';

import AdifError from '../errors/AdifError.mjs';
import DataType from './DataType.mjs';
import CreditEnumerationDataType from './CreditEnumerationDataType.mjs';
import QslMediumEnumerationDataType from './QslMediumEnumerationDataType.mjs';

class CreditListDataType extends DataType {

    static normalize(value) {
        if (Array.isArray(value)) {
            value = value.join(',');
        }
        return value;
    }

    static validate(value) {
        if (typeof value !== 'string') {
            throw new AdifError('value not valid for CreditListDataType', { value });
        }

        value.split(',').forEach(item => {
            const [ credit, qsls ] = item.split(':');
            CreditEnumerationDataType.validate(credit);
            if (typeof qsls === 'string' && qsls.length > 0) {
                qsls.split('&').forEach(qsl => {
                    QslMediumEnumerationDataType.validate(qsl);
                });
            }
        });

        return true;
    }

}

export default CreditListDataType;
