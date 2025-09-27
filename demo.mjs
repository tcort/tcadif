'use strict';

import File from './lib/files/File.mjs';
import HeaderSegment from './lib/segments/HeaderSegment.mjs';

const f = File.fromJSON({
    HEADER: HeaderSegment.factory(),
    RECORDS: [
        {
            CALL: 'VA2NW',
            QSO_DATE: '20250925',
            QSO_DATE_OFF: '20250925',
            BAND: '20m',
            ITUZ: 4,
            TIME_ON: '2133',
            TIME_OFF: '213344',
            K_INDEX: '04',
            MODE: 'SSB',
            ADDRESS: 'ATTN: Hambone\r\n123 Main St',
            AGE: '43',
            ANT_AZ: '370',
            ANT_EL: 100,
            ANT_PATH: 'L',
            ARRL_SECT: 'VT',
            AWARD_SUBMITTED: 'ARRL_WAS,ADIF_UTF',
            CLUBLOG_QSO_UPLOAD_STATUS: 'y',
            COMMENT: 'HI',
            CONT: 'na',
            CQZ: '05',
            EMAIL: 'tcort@tcort.dev',
            WEB: 'https://www.va2nw.ca/',
            SKCC: '4889T',
            MY_MORSE_KEY_TYPE: 'SK',
            MORSE_KEY_TYPE: 'BUG',
            CREDIT_SUBMITTED: 'IOTA,WAS:LOTW&CARD,DXCC:CARD',
            CREDIT_GRANTED: 'AJA',
            DARC_DOK: 'Z84',
            MY_DARC_DOK: 'Z84',
            DXCC: '1',
            EQ_CALL: 'VA2NW',
            EQSL_AG: 'Y',
            VE_PROV: 'QC',
            EQSL_QSLRDATE: '20250912',
            EQSL_QSLSDATE: '20250914',
            FISTS: '14205',
            FREQ: '14.050',
            GRIDSQUARE: 'FN25ck',
        },
    ]
});
console.log(f.toADI());
console.log(f.toJSON());
