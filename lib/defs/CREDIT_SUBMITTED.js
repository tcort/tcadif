'use strict';

const FieldDef = require('./FieldDef');
const { Credit, QslMedium } = require('../enums');

class CREDIT_SUBMITTED extends FieldDef {
    constructor() {
        super({
            fieldName: 'CREDIT_SUBMITTED',
            dataType: 'CreditList',
            check: value => {
                return value.split(/,/g).every(credit => {
                    if (credit in Credit) {
                        return true;
                    }
                    if (!(credit.split(':')[0] in Credit)) {
                        return false;
                    }
                    const mediums = credit.split(':')[1]?.split(/&/g);
                    if (!Array.isArray(mediums)) {
                        return false;
                    }
                    return mediums.every(medium => medium in QslMedium);
                });                
            },
        });
    }
}

module.exports = CREDIT_SUBMITTED;
