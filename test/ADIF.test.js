'use strict';

const ADIF = require('../lib/ADIF');
const expect = require('expect.js');

const adif = `
<APP_TCADIF_QSO_ID:36>9a86f211-1160-4e35-be93-dc888b201d71
<BAND:3:E>10m
<CALL:6:S>CX5ABM
<COMMENT:25:S>FT8  Sent: +05  Rcvd: -14
<COUNTRY:7:S>URUGUAY
<CQZ:2>13
<DXCC:3:E>144
<FREQ:8:N>28.07582
<GRIDSQUARE:6>GF15UE
<ITUZ:2>14
<MODE:3:E>FT8
<MY_ALTITUDE:4:N>95.3
<MY_ANTENNA:23:S>Homebrew EFRW 29' + 17'
<MY_ARRL_SECT:2:E>QC
<MY_CITY:8:S>Gatineau
<MY_CNTY:9:S>Outaouais
<MY_COUNTRY:6:S>CANADA
<MY_CQ_ZONE:2>05
<MY_DXCC:1:E>1
<MY_FISTS:5>14205
<MY_GRIDSQUARE:8>FN25CK55
<MY_GRIDSQUARE_EXT:2>DW
<MY_ITU_ZONE:2>04
<MY_LAT:11:L>N045 26.488
<MY_LON:11:L>W075 47.422
<MY_NAME:11:S>Thomas Cort
<MY_POSTAL_CODE:7:S>J9A 3K5
<MY_RIG:12:S>Yaesu FT-891
<MY_STATE:2>QC
<MY_STREET:20:S>rue de l'Arc-en-Ciel
<OPERATOR:6:S>VA2EPR
<OWNER_CALLSIGN:6:S>VA2EPR
<PFX:3:S>CX5
<QSLRDATE:8:D>20231105
<QSL_RCVD:1:E>Y
<QSO_DATE:8:D>20231103
<QSO_DATE_OFF:8:D>20231103
<QSO_RANDOM:1:B>Y
<RST_RCVD:3:S>-14
<RST_SENT:3:S>+05
<STATION_CALLSIGN:6:S>VA2EPR
<TIME_OFF:6:T>203715
<TIME_ON:6:T>203615
<TX_PWR:1:N>5
<EOR>
`;

describe('ADIF', function () {
    it('should be a class', function () {
        expect(ADIF).to.be.a('function');
        expect(ADIF).to.have.property('constructor');
    });
    it('.stringify(options)', function () {
        const obj = ADIF.parse(adif);
        console.log(obj.stringify({ verbosity: 'compact', recordDelim: '\n', fieldDelim: ' ' }));
    });
});
