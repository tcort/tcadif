'use strict';

const ADIF_VER = require('./ADIF_VER');
const CREATED_TIMESTAMP = require('./CREATED_TIMESTAMP');
const PROGRAMID = require('./PROGRAMID');
const PROGRAMVERSION = require('./PROGRAMVERSION');

const ADDRESS = require('./ADDRESS');
const AGE = require('./AGE');
const ALTITUDE = require('./ALTITUDE');
const ANT_AZ = require('./ANT_AZ');
const ANT_EL = require('./ANT_EL');
const ANT_PATH = require('./ANT_PATH');
const ARRL_SECT = require('./ARRL_SECT');
const AWARD_SUBMITTED = require('./AWARD_SUBMITTED');
const AWARD_GRANTED = require('./AWARD_GRANTED');
const A_INDEX = require('./A_INDEX');
const BAND = require('./BAND');
const BAND_RX = require('./BAND_RX');
const CALL = require('./CALL');
const CHECK = require('./CHECK');
const CLASS = require('./CLASS');
const CLUBLOG_QSO_UPLOAD_DATE = require('./CLUBLOG_QSO_UPLOAD_DATE');
const CLUBLOG_QSO_UPLOAD_STATUS = require('./CLUBLOG_QSO_UPLOAD_STATUS');
const CNTY = require('./CNTY');
const COMMENT = require('./COMMENT');
const CONT = require('./CONT');
const CONTACTED_OP = require('./CONTACTED_OP');
const CONTEST_ID = require('./CONTEST_ID');
const COUNTRY = require('./COUNTRY');
const CQZ = require('./CQZ');
const CREDIT_SUBMITTED = require('./CREDIT_SUBMITTED');
const CREDIT_GRANTED = require('./CREDIT_GRANTED');
const DARC_DOK = require('./DARC_DOK');
const DCL_QSLRDATE = require('./DCL_QSLRDATE');
const DCL_QSLSDATE = require('./DCL_QSLSDATE');
const DCL_QSL_RCVD = require('./DCL_QSL_RCVD');
const DCL_QSL_SENT = require('./DCL_QSL_SENT');
const DISTANCE = require('./DISTANCE');
const DXCC = require('./DXCC');
const EMAIL = require('./EMAIL');
const EQ_CALL = require('./EQ_CALL');
const EQSL_AG = require('./EQSL_AG');
const EQSL_QSLRDATE = require('./EQSL_QSLRDATE');
const EQSL_QSLSDATE = require('./EQSL_QSLSDATE');
const EQSL_QSL_RCVD = require('./EQSL_QSL_RCVD');
const EQSL_QSL_SENT = require('./EQSL_QSL_SENT');
const FISTS = require('./FISTS');
const FISTS_CC = require('./FISTS_CC');
const FREQ = require('./FREQ');
const FREQ_RX = require('./FREQ_RX');
const FORCE_INIT = require('./FORCE_INIT');
const GRIDSQUARE = require('./GRIDSQUARE');
const GRIDSQUARE_EXT = require('./GRIDSQUARE_EXT');
const HAMLOGEU_QSO_UPLOAD_DATE = require('./HAMLOGEU_QSO_UPLOAD_DATE');
const HAMLOGEU_QSO_UPLOAD_STATUS = require('./HAMLOGEU_QSO_UPLOAD_STATUS');
const HAMQTH_QSO_UPLOAD_DATE = require('./HAMQTH_QSO_UPLOAD_DATE');
const HAMQTH_QSO_UPLOAD_STATUS = require('./HAMQTH_QSO_UPLOAD_STATUS');
const HRDLOG_QSO_UPLOAD_DATE = require('./HRDLOG_QSO_UPLOAD_DATE');
const HRDLOG_QSO_UPLOAD_STATUS = require('./HRDLOG_QSO_UPLOAD_STATUS');
const IOTA = require('./IOTA');
const IOTA_ISLAND_ID = require('./IOTA_ISLAND_ID');
const ITUZ = require('./ITUZ');
const K_INDEX = require('./K_INDEX');
const LAT = require('./LAT');
const LON = require('./LON');
const LOTW_QSLRDATE = require('./LOTW_QSLRDATE');
const LOTW_QSLSDATE = require('./LOTW_QSLSDATE');
const LOTW_QSL_RCVD = require('./LOTW_QSL_RCVD');
const LOTW_QSL_SENT = require('./LOTW_QSL_SENT');
const MAX_BURSTS = require('./MAX_BURSTS');
const MODE = require('./MODE');
const MORSE_KEY_INFO = require('./MORSE_KEY_INFO');
const MORSE_KEY_TYPE = require('./MORSE_KEY_TYPE');
const MS_SHOWER = require('./MS_SHOWER');
const MY_ALTITUDE = require('./MY_ALTITUDE');
const MY_ANTENNA = require('./MY_ANTENNA');
const MY_ARRL_SECT = require('./MY_ARRL_SECT');
const MY_CITY = require('./MY_CITY');
const MY_CNTY = require('./MY_CNTY');
const MY_COUNTRY = require('./MY_COUNTRY');
const MY_CQ_ZONE = require('./MY_CQ_ZONE');
const MY_DARC_DOK = require('./MY_DARC_DOK');
const MY_DXCC = require('./MY_DXCC');
const MY_FISTS = require('./MY_FISTS');
const MY_GRIDSQUARE = require('./MY_GRIDSQUARE');
const MY_GRIDSQUARE_EXT = require('./MY_GRIDSQUARE_EXT');
const MY_IOTA = require('./MY_IOTA');
const MY_IOTA_ISLAND_ID = require('./MY_IOTA_ISLAND_ID');
const MY_ITU_ZONE = require('./MY_ITU_ZONE');
const MY_LAT = require('./MY_LAT');
const MY_LON = require('./MY_LON');
const MY_MORSE_KEY_INFO = require('./MY_MORSE_KEY_INFO');
const MY_MORSE_KEY_TYPE = require('./MY_MORSE_KEY_TYPE');
const MY_NAME = require('./MY_NAME');
const MY_POSTAL_CODE = require('./MY_POSTAL_CODE');
const MY_POTA_REF = require('./MY_POTA_REF');
const MY_RIG = require('./MY_RIG');
const MY_SIG = require('./MY_SIG');
const MY_SIG_INFO = require('./MY_SIG_INFO');
const MY_STREET = require('./MY_STREET');
const MY_STATE = require('./MY_STATE');
const MY_SOTA_REF = require('./MY_SOTA_REF');
const MY_USACA_COUNTIES = require('./MY_USACA_COUNTIES');
const MY_VUCC_GRIDS = require('./MY_VUCC_GRIDS');
const MY_WWFF_REF = require('./MY_WWFF_REF');
const NAME = require('./NAME');
const NOTES = require('./NOTES');
const NR_BURSTS = require('./NR_BURSTS');
const NR_PINGS = require('./NR_PINGS');
const OPERATOR = require('./OPERATOR');
const OWNER_CALLSIGN = require('./OWNER_CALLSIGN');
const POTA_REF = require('./POTA_REF');
const PFX = require('./PFX');
const PRECEDENCE = require('./PRECEDENCE');
const PROP_MODE = require('./PROP_MODE');
const PUBLIC_KEY = require('./PUBLIC_KEY');
const QRZCOM_QSO_DOWNLOAD_DATE = require('./QRZCOM_QSO_DOWNLOAD_DATE');
const QRZCOM_QSO_DOWNLOAD_STATUS = require('./QRZCOM_QSO_DOWNLOAD_STATUS');
const QRZCOM_QSO_UPLOAD_DATE = require('./QRZCOM_QSO_UPLOAD_DATE');
const QRZCOM_QSO_UPLOAD_STATUS = require('./QRZCOM_QSO_UPLOAD_STATUS');
const QSLMSG = require('./QSLMSG');
const QSLMSG_RCVD = require('./QSLMSG_RCVD');
const QSLRDATE = require('./QSLRDATE');
const QSLSDATE = require('./QSLSDATE');
const QSL_RCVD = require('./QSL_RCVD');
const QSL_RCVD_VIA = require('./QSL_RCVD_VIA');
const QSL_SENT = require('./QSL_SENT');
const QSL_SENT_VIA = require('./QSL_SENT_VIA');
const QSL_VIA = require('./QSL_VIA');
const QSO_COMPLETE = require('./QSO_COMPLETE');
const QSO_DATE = require('./QSO_DATE');
const QSO_DATE_OFF = require('./QSO_DATE_OFF');
const QSO_RANDOM = require('./QSO_RANDOM');
const QTH = require('./QTH');
const REGION = require('./REGION');
const RIG = require('./RIG');
const RST_RCVD = require('./RST_RCVD');
const RST_SENT = require('./RST_SENT');
const RX_PWR = require('./RX_PWR');
const SAT_MODE = require('./SAT_MODE');
const SAT_NAME = require('./SAT_NAME');
const SIG = require('./SIG');
const SIG_INFO = require('./SIG_INFO');
const SILENT_KEY = require('./SILENT_KEY');
const SFI = require('./SFI');
const SKCC = require('./SKCC');
const SOTA_REF = require('./SOTA_REF');
const SRX = require('./SRX');
const SRX_STRING = require('./SRX_STRING');
const STATE = require('./STATE');
const STATION_CALLSIGN = require('./STATION_CALLSIGN');
const STX = require('./STX');
const STX_STRING = require('./STX_STRING');
const SUBMODE = require('./SUBMODE');
const SWL = require('./SWL');
const TEN_TEN = require('./TEN_TEN');
const TIME_OFF = require('./TIME_OFF');
const TIME_ON = require('./TIME_ON');
const TX_PWR = require('./TX_PWR');
const UKSMG = require('./UKSMG');
const USACA_COUNTIES = require('./USACA_COUNTIES');
const VUCC_GRIDS = require('./VUCC_GRIDS');
const WEB = require('./WEB');
const WWFF_REF = require('./WWFF_REF');

module.exports = {
    header: {
        ADIF_VER,
        CREATED_TIMESTAMP,
        PROGRAMID,
        PROGRAMVERSION,
    },
    qso: {
        ADDRESS,
        AGE,
        ALTITUDE,
        ANT_AZ,
        ANT_EL,
        ANT_PATH,
        ARRL_SECT,
        AWARD_SUBMITTED,
        AWARD_GRANTED,
        A_INDEX,
        BAND,
        BAND_RX,
        CALL,
        CHECK,
        CLASS,
        CLUBLOG_QSO_UPLOAD_DATE,
        CLUBLOG_QSO_UPLOAD_STATUS,
        CNTY,
        COMMENT,
        CONT,
        CONTACTED_OP,
        CONTEST_ID,
        COUNTRY,
        CQZ,
        CREDIT_SUBMITTED,
        CREDIT_GRANTED,
        DARC_DOK,
        DCL_QSLRDATE,
        DCL_QSLSDATE,
        DCL_QSL_RCVD,
        DCL_QSL_SENT,
        DISTANCE,
        DXCC,
        EMAIL,
        EQ_CALL,
        EQSL_AG,
        EQSL_QSLRDATE,
        EQSL_QSLSDATE,
        EQSL_QSL_RCVD,
        EQSL_QSL_SENT,
        FISTS,
        FISTS_CC,
        FORCE_INIT,
        FREQ,
        FREQ_RX,
        GRIDSQUARE,
        GRIDSQUARE_EXT,
        HAMLOGEU_QSO_UPLOAD_DATE,
        HAMLOGEU_QSO_UPLOAD_STATUS,
        HAMQTH_QSO_UPLOAD_DATE,
        HAMQTH_QSO_UPLOAD_STATUS,
        HRDLOG_QSO_UPLOAD_DATE,
        HRDLOG_QSO_UPLOAD_STATUS,
        IOTA,
        IOTA_ISLAND_ID,
        ITUZ,
        K_INDEX,
        LAT,
        LON,
        LOTW_QSLRDATE,
        LOTW_QSLSDATE,
        LOTW_QSL_RCVD,
        LOTW_QSL_SENT,
        MAX_BURSTS,
        MODE,
        MORSE_KEY_INFO,
        MORSE_KEY_TYPE,
        MS_SHOWER,
        MY_ALTITUDE,
        MY_ANTENNA,
        MY_ARRL_SECT,
        MY_CITY,
        MY_CNTY,
        MY_COUNTRY,
        MY_CQ_ZONE,
        MY_DARC_DOK,
        MY_DXCC,
        MY_FISTS,
        MY_GRIDSQUARE,
        MY_GRIDSQUARE_EXT,
        MY_IOTA,
        MY_IOTA_ISLAND_ID,
        MY_ITU_ZONE,
        MY_LAT,
        MY_LON,
        MY_MORSE_KEY_INFO,
        MY_MORSE_KEY_TYPE,
        MY_NAME,
        MY_POSTAL_CODE,
        MY_POTA_REF,
        MY_RIG,
        MY_SIG,
        MY_SIG_INFO,
        MY_SOTA_REF,
        MY_STATE,
        MY_STREET,
        MY_USACA_COUNTIES,
        MY_VUCC_GRIDS,
        MY_WWFF_REF,
        NAME,
        NOTES,
        NR_BURSTS,
        NR_PINGS,
        OPERATOR,
        OWNER_CALLSIGN,
        PFX,
        POTA_REF,
        PRECEDENCE,
        PROP_MODE,
        PUBLIC_KEY,
        QRZCOM_QSO_DOWNLOAD_DATE,
        QRZCOM_QSO_DOWNLOAD_STATUS,
        QRZCOM_QSO_UPLOAD_DATE,
        QRZCOM_QSO_UPLOAD_STATUS,
        QSLMSG,
        QSLMSG_RCVD,
        QSLRDATE,
        QSLSDATE,
        QSL_RCVD,
        QSL_RCVD_VIA,
        QSL_SENT,
        QSL_SENT_VIA,
        QSL_VIA,
        QSO_COMPLETE,
        QSO_DATE,
        QSO_DATE_OFF,
        QSO_RANDOM,
        QTH,
        REGION,
        RIG,
        RST_RCVD,
        RST_SENT,
        RX_PWR,
        SAT_MODE,
        SAT_NAME,
        SFI,
        SIG,
        SIG_INFO,
        SILENT_KEY,
        SKCC,
        SOTA_REF,
        SRX,
        SRX_STRING,
        STATE,
        STATION_CALLSIGN,
        STX,
        STX_STRING,
        SUBMODE,
        SWL,
        TEN_TEN,
        TIME_OFF,
        TIME_ON,
        TX_PWR,
        UKSMG,
        USACA_COUNTIES,
        VUCC_GRIDS,
        WEB,
        WWFF_REF,
    },
};
