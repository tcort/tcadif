'use strict';

const FieldDef = require('./FieldDef');

class AWARD_GRANTED extends FieldDef {
    constructor() {
        super({
            fieldName: 'AWARD_GRANTED',
            dataType: 'SponsoredAwardList',
        });
    }
}

module.exports = AWARD_GRANTED;
