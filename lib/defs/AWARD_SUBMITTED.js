'use strict';

const FieldDef = require('./FieldDef');

class AWARD_SUBMITTED extends FieldDef {
    constructor() {
        super({
            fieldName: 'AWARD_SUBMITTED',
            dataType: 'SponsoredAwardList',
        });
    }
}

module.exports = AWARD_SUBMITTED;
