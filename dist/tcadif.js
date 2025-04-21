require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

const Field = require('./Field');
const Header = require('./Header');
const QSO = require('./QSO');
const os = require('os');
const pkg = require('../package.json');

class ADIF {

    #header = null;
    #qsos = [];

    constructor(obj = {}) {
        this.#header = typeof obj?.header === 'object' && obj?.header !== null ? new Header(obj.header) : null;
        this.#qsos = Array.isArray(obj?.qsos) ? obj.qsos.map(qso => qso instanceof QSO ? qso : new QSO(qso)) : [];
    }

    static parse(text = '') {

        let fields = [];

        const adif = {
            header: null,
            qsos: [],
        };

        do {

            const field = Field.parse(text);
            if (field === null) {
                break;
            }

            text = text.slice(field.bytesConsumed);

            if (field.fieldName === 'EOR' || field.fieldName === 'EOH') {
                const entries = fields;
                fields = [];

                const block = Object.fromEntries(entries);
                if (field.fieldName === 'EOH') { // end-of-header
                    adif.header = new Header(block);
                } else { // end-of-record;
                    adif.qsos.push(new QSO(block));
                }
            } else {
                fields.push(field.toEntry());
            }

        } while (true);

        return new ADIF(adif);

    }

    toObject() {
        const adif = { header: null, qsos: [] };

        if (this.#header !== null) {
            adif.header = this.#header.toObject();
        }

        adif.qsos = this.#qsos.map(qso => qso.toObject());

        return adif;
    }

    stringify(options = {}) {

        options = options ?? {};
        options.fieldDelim = options?.fieldDelim ?? `${os.EOL}`;
        options.recordDelim = options?.recordDelim ?? `${os.EOL}${os.EOL}`;
        options.programName = options?.programName ?? `${pkg.name}`;
        options.programVersion = options?.programVersion ?? `${pkg.version}`;
        options.verbosity = options?.verbosity ?? 'full';

        const result = [];

        if (this.#header && options.verbosity !== 'compact') {
            result.push(this.#header.stringify(options));
        }

        this.#qsos.forEach(qso => result.push(qso.stringify(options)));

        return result.join(options.recordDelim);
    }

    get header() {
        return new Header(this.#header.toObject());
    }

    get qsos() {
        return this.#qsos.map(qso => new QSO(qso.toObject()));
    }

}

module.exports = ADIF;

},{"../package.json":184,"./Field":4,"./Header":5,"./QSO":6,"os":183}],2:[function(require,module,exports){
'use strict';

class AdifError extends Error {
    constructor(message = 'something went wrong', baggage = {}) {
        super();
        this.name = 'AdifError';
        this.message = message;
        Object.assign(this, baggage);
    }
}

module.exports = AdifError;

},{}],3:[function(require,module,exports){
'use strict';

function checkDate(s) {
    const year = parseInt(s.slice(0, 4));
    const month = parseInt(s.slice(4, 6));
    const day = parseInt(s.slice(6, 8));

    // check month/day range
    // javascript will return NaN for valueOf when month is out of range (e.g. '2023-22-30 00:00:00' becomes NaN / Invalid Date)
    // javascript will change the day/month if day is out of range (e.g. '2023-02-30 00:00:00' becomes '2023-03-03 00:00:00')
    // so we can verify the date is in range by checking for NaN and that month and date are unchanged.
    // this saves us the trouble of calculating leap years for number of days in february
    const d = new Date(`${year}-${month}-${day} 00:00:00`);
    return !isNaN(d.valueOf()) && 1930 <= year && month === (1 + d.getMonth()) && day === d.getDate();
}

function checkTime(s) {

    s = s.length === 4 ? `${s}00` : s; /* normalize to 6 digit time */

    const hour = parseInt(s.slice(0, 2));
    const minute = parseInt(s.slice(2, 4));
    const second = parseInt(s.slice(4, 6));

    return (0 <= hour && hour <= 23) && (0 <= minute && minute <= 59) && (0 <= second && second <= 59);
}

function checkNumber(s) {
    if (s.codePointAt(0) === 45) { // eat optional minus sign
        s = s.slice(1);
    }

    const [ digits, decimalDigits, ...rest ] = s.split('.');
    
    return digits.split('').every(c => module.exports['Digit'](c)) && (decimalDigits ?? '').split('').every(c => module.exports['Digit'](c)) && rest.length === 0;
}

function checkInteger(s) {

    if (s.codePointAt(0) === 45) { // eat optional minus sign
        s = s.slice(1);
    }

    return s.split('').every(c => module.exports['Digit'](c));
}

function checkLocation(s) {

    const ddd = s.slice(1,4);
    const mm = s.slice(5,7);

    return 0 <= ddd && ddd <= 180 && 0 <= mm && mm <= 59;
}

module.exports = {
    'Boolean': c => typeof c === 'string' && c.length === 1 && ['Y','y','N','n'].includes(c),
    'Character': c => typeof c === 'string' && c.length === 1 && c.codePointAt(0) >= 32 && c.codePointAt(0) <= 126,
    'Digit': c => typeof c === 'string' && c.length === 1 && c.codePointAt(0) >= 48 && c.codePointAt(0) <= 57,
    'String': s => typeof s === 'string' && s.split('').every(c => module.exports['Character'](c)),
    'MultilineString': s => typeof s === 'string' && s.split('').every(c => module.exports['Character'](c) || c.codePointAt(0) === 13 || c.codePointAt(0) === 10),
    'Number': s => typeof s === 'string' && s.length > 0 && checkNumber(s),
    'Integer': s => typeof s === 'string' && s.length > 0 && checkInteger(s),
    'PositiveInteger': s => typeof s === 'string' && s.length > 0 && module.exports['Integer'](s) && parseInt(s) > 0,
    'Date': s => typeof s === 'string' && /^[0-9]{8}$/.test(s) && checkDate(s),
    'Time': s => typeof s === 'string' && /^([0-9]{4}|[0-9]{6})$/.test(s) && checkTime(s),
    'Enumeration': s => typeof s === 'string',
    'Location': s => typeof s === 'string' && s.length === 11 && /^[NSEW][0-9]{3} [0-9]{2}\.[0-9]{3}$/.test(s) && checkLocation(s),
    'GridSquare': s => typeof s === 'string' && /^[A-R]{2}([0-9]{2}([A-X]{2}([0-9]{2})?)?)?$/.test(s),
    'GridSquareExt': s => typeof s === 'string' && /^[A-X]{2}([0-9]{2})?$/.test(s),
    'GridSquareList': s => typeof s === 'string' && s.split(/,/g).every(val => module.exports['GridSquare'](val)),
    'SponsoredAward': s => typeof s === 'string' && /^(ADIF_|ARI_|ARRL_|CQ_|DARC_|EQSL_|IARU_|JARL_|RSGB_|TAG_|WABAG_)/.test(s),
    'SponsoredAwardList': s => typeof s === 'string' && s.split(/,/g).every(val => module.exports['SponsoredAward'](val)),
    'PotaRef': s => typeof s === 'string' && /^[0-9A-Z]{1,4}-[0-9A-Z]{4,5}(@[0-9A-Z-]{4,6})?$/.test(s),
    'PotaRefList':  s => typeof s === 'string' && s.split(/,/g).every(val => module.exports['PotaRef'](val)),
    'SotaRef': s => typeof s === 'string' && /^[0-9A-Z\/-]+$/.test(s),
    'WwffRef': s => typeof s === 'string' && /^[0-9A-Z]{1,4}[0-9A-Z]{2}\-[0-9]{4}$/.test(s),
    'IotaRef': s => typeof s === 'string' && /^(NA|SA|EU|AF|OC|AS|AN)\-[0-9]{3}$/.test(s),
    'CreditList': s => typeof s === 'string',
    'Uuid': s => typeof s === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(s),
    'check': (dataType, value) => dataType in module.exports ? module.exports[dataType](value) : false,
};

},{}],4:[function(require,module,exports){
'use strict';

const AdifError = require('./AdifError');

class Field {

    #fieldName;
    #dataLength;
    #dataTypeIndicator;
    #data;
    #bytesConsumed;

    constructor(fieldName, dataLength = null, dataTypeIndicator = null, data = null, bytesConsumed = 0) {
        this.#fieldName = fieldName.toUpperCase();
        this.#dataLength = isNaN(parseInt(dataLength)) ? null : parseInt(dataLength);
        this.#dataTypeIndicator = dataTypeIndicator;
        this.#data = data;
        this.#bytesConsumed = isNaN(parseInt(bytesConsumed)) ? 0 : parseInt(bytesConsumed);
    }

    get fieldName() {
        return this.#fieldName;
    }

    get dataLength() {
        return this.#dataLength;
    }

    get dataTypeIndicator() {
        return this.#dataTypeIndicator;
    }

    get data() {
        return this.#data;
    }

    get bytesConsumed() {
        return this.#bytesConsumed;
    }

    stringify() {
        return `<${this.fieldName}${this.dataLength !== null ? ':' + this.dataLength : ''}${this.dataTypeIndicator !== null ? ':' + this.dataTypeIndicator : ''}>${this.data !== null ? this.data : ''}`;
    }

    toObject() {
        const obj = Object.create(null);
        obj[this.fieldName] = this.data;
        return obj;
    }

    toEntry() {
        return [ this.fieldName, this.data ];
    }

    static stringify(fieldName, dataTypeIndicator, data) {
        return new Field(fieldName, `${data}`.length, dataTypeIndicator, `${data}`).stringify();
    }

    static parse(s) {

        const matches = Field.matcher.exec(s); // not a tag
        if (!matches) {
            return null;
        }

        const [ original ] = matches;

        const fieldName = matches.groups.fieldName.toUpperCase();
        const dataLength = matches.groups.dataLength === undefined ? null : parseInt(matches.groups.dataLength);
        const dataTypeIndicator = matches.groups.dataTypeIndicator ?? null;
        const data = dataLength === null ? null : s.substring(matches.index + original.length, matches.index + original.length + dataLength);
        const bytesConsumed = matches.index + original.length + (dataLength ?? 0);

        if (data !== null && data.length !== dataLength) {
            return null; // more data needs to be read
        }

        return new Field(fieldName, dataLength, dataTypeIndicator, data, bytesConsumed);
        
    }

    static get matcher() {
        return new RegExp("<(?<fieldName>[A-Za-z0-9_]+)(:(?<dataLength>[0-9]+))?(:(?<dataTypeIndicator>[A-Z]))?>");
    }
}

module.exports = Field;

},{"./AdifError":2}],5:[function(require,module,exports){
'use strict';

const AdifError = require('./AdifError');
const defs = require('./defs');
const DataTypes = require('./DataTypes');
const Field = require('./Field');
const os = require('os');
const pkg = require('../package.json');

class Header {

    #data = {};
    #bytesConsumed = 0;

    static get defs() {
        return Object.values(defs.header).map(Class => new Class());
    }

    constructor(obj, bytesConsumed = 0) {
        Header.defs.filter(def => def.fieldName in obj).filter(def => obj[def.fieldName] !== '' && obj[def.fieldName] !== null && obj[def.fieldName] !== undefined).forEach(def => {
            const value = def.normalize(obj[def.fieldName]);
            def.validate(value);
            this.#data[def.fieldName] = value;
        });
        this.#bytesConsumed = bytesConsumed;
    }

    get bytesConsumed() {
        return this.#bytesConsumed;
    }

    toObject() {
        return Header.defs.filter(def => this.#data[def.fieldName] !== undefined).reduce((obj, def) => {
            obj[def.fieldName] = this.#data[def.fieldName];
            return obj;
        }, Object.create(null));
    }

    stringify(options = {}) {

        options = options ?? {};
        options.fieldDelim = options?.fieldDelim ?? `${os.EOL}`;
        options.recordDelim = options?.recordDelim ?? `${os.EOL}${os.EOL}`;
        options.programName = options?.programName ?? `${pkg.name}`;
        options.programVersion = options?.programVersion ?? `${pkg.version}`;

        return `Generated ${new Date().toJSON()} by ${options.programName}/${options.programVersion}` + options.recordDelim +
                Header.defs
                    .filter(def => this.#data[def.fieldName] !== undefined)
                    .map(def => Field.stringify(def.fieldName, def.dataTypeIndicator, this.#data[def.fieldName]))
                    .concat([ new Field('EOH').stringify() ]).join(options.fieldDelim);
    }

}

module.exports = Header;

},{"../package.json":184,"./AdifError":2,"./DataTypes":3,"./Field":4,"./defs":164,"os":183}],6:[function(require,module,exports){
'use strict';

const AdifError = require('./AdifError');
const defs = require('./defs');
const DataTypes = require('./DataTypes');
const Field = require('./Field');
const os = require('os');

class QSO {

    #data = {};
    #bytesConsumed = 0;

    static get defs() {
        return Object.values(defs.qso).map(Class => new Class());
    }

    constructor(obj, bytesConsumed = 0) {
        QSO.defs.filter(def => def.fieldName in obj).filter(def => obj[def.fieldName] !== '' && obj[def.fieldName] !== null && obj[def.fieldName] !== undefined).forEach(def => {
            const value = def.normalize(obj[def.fieldName]);
            def.validate(value);
            this.#data[def.fieldName] = value;
        });
        this.#bytesConsumed = bytesConsumed;

        if (this.#data.QSO_DATE === undefined ||
                this.#data.TIME_ON === undefined ||
                this.#data.CALL === undefined ||
                (this.#data.BAND === undefined && this.#data.FREQ === undefined) ||
                this.#data.MODE === undefined) {
            throw new AdifError('QSO missing one or more required fields: QSO_DATE, TIME_ON, CALL, BAND or FREQ, MODE');
        }

    }

    toObject() {
        return QSO.defs.filter(def => this.#data[def.fieldName] !== undefined).reduce((obj, def) => {
            obj[def.fieldName] =  this.#data[def.fieldName];
            return obj;
        }, Object.create(null));
    }

    stringify(options = {}) {

        const compactFields = [ 'QSO_DATE', 'TIME_ON', 'CALL', 'BAND', 'FREQ', 'MODE' ];

        options = options ?? {};
        options.fieldDelim = options?.fieldDelim ?? `${os.EOL}`;
        options.recordDelim = options?.recordDelim ?? `${os.EOL}${os.EOL}`;
        options.verbosity = options?.verbosity ?? 'full';

        return QSO.defs
            .filter(def => this.#data[def.fieldName] !== undefined)
            .filter(def => options.verbosity === 'compact' ? compactFields.includes(def.fieldName) : true)
            .filter(def => options.verbosity === 'compact' ? ((def.fieldName !== 'FREQ') || (def.fieldName === 'FREQ' && !(typeof this.#data.BAND === 'string' && this.#data.BAND.length > 0))) : true)
            .map(def => Field.stringify(def.fieldName, def.dataTypeIndicator, this.#data[def.fieldName]))
            .concat([ new Field('EOR').stringify() ]).join(options.fieldDelim);
    }

}

module.exports = QSO;

},{"./AdifError":2,"./DataTypes":3,"./Field":4,"./defs":164,"os":183}],7:[function(require,module,exports){
'use strict';

const { name, version, homepage } = require('../package.json');
module.exports = { name, version, homepage };

},{"../package.json":184}],8:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class ADDRESS extends FieldDef {
    constructor() {
        super({
            fieldName: 'ADDRESS',
            dataType: 'MultilineString',
            dataTypeIndicator: 'M',
        });
    }
}

module.exports = ADDRESS;

},{"./FieldDef":56}],9:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class ADIF_VER extends FieldDef {
    constructor() {
        super({
            fieldName: 'ADIF_VER',
            dataType: 'String',
            dataTypeIndicator: 'S',
            enumeration: null,
            validator: new RegExp("^[0-9]+\.[0-9]\.[0-9]$"),
        });
    }
}

module.exports = ADIF_VER;

},{"./FieldDef":56}],10:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class AGE extends FieldDef {
    constructor() {
        super({
            fieldName: 'AGE',
            dataType: 'Number',
            dataTypeIndicator: 'N',
            check: value => 0 <= parseFloat(value) && parseFloat(value) <= 120,
        });
    }
}

module.exports = AGE;

},{"./FieldDef":56}],11:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class ALTITUDE extends FieldDef {
    constructor() {
        super({
            fieldName: 'ALTITUDE',
            dataType: 'Number',
            dataTypeIndicator: 'N',
        });
    }
}

module.exports = ALTITUDE;

},{"./FieldDef":56}],12:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class ANT_AZ extends FieldDef {
    constructor() {
        super({
            fieldName: 'ANT_AZ',
            dataType: 'Number',
            dataTypeIndicator: 'N',
            check: value => 0 <= parseFloat(value) && parseFloat(value) <= 360,
            normalizer: value => {
                if (parseFloat(value) > 360) {
                    value = parseFloat(value) % 360;
                    return `${value}`;
                } else if (parseFloat(value) < 0) {
                    value = 360 - (Math.abs(parseFloat(value)) % 360);
                    return `${value}`;
                }
                return value;
            },
        });
    }
}

module.exports = ANT_AZ;

},{"./FieldDef":56}],13:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class ANT_EL extends FieldDef {
    constructor() {
        super({
            fieldName: 'ANT_EL',
            dataType: 'Number',
            dataTypeIndicator: 'N',
            check: value => -90 <= parseFloat(value) && parseFloat(value) <= 90,
            normalizer: value => {
                if (parseFloat(value) > 90) {
                    value = parseFloat(value) % 90;
                    return `${value}`;
                } else if (parseFloat(value) < 0) {
                    value = 90 - (Math.abs(parseFloat(value)) % 90);
                    return `${value}`;
                }
                return value;
            },
        });
    }
}

module.exports = ANT_EL;

},{"./FieldDef":56}],14:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class ANT_PATH extends FieldDef {
    constructor() {
        super({
            fieldName: 'ANT_PATH',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'AntPath',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = ANT_PATH;

},{"./FieldDef":56}],15:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class APP_TCADIF_KEY extends FieldDef {
    constructor() {
        super({
            fieldName: 'APP_TCADIF_KEY',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'AppTcadifKey',
        });
    }
}

module.exports = APP_TCADIF_KEY;

},{"./FieldDef":56}],16:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class APP_TCADIF_KEY_INFO extends FieldDef {
    constructor() {
        super({
            fieldName: 'APP_TCADIF_KEY_INFO',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = APP_TCADIF_KEY_INFO;

},{"./FieldDef":56}],17:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class APP_TCADIF_LICW extends FieldDef {
    constructor() {
        super({
            fieldName: 'APP_TCADIF_LICW',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = APP_TCADIF_LICW;

},{"./FieldDef":56}],18:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class APP_TCADIF_MY_KEY extends FieldDef {
    constructor() {
        super({
            fieldName: 'APP_TCADIF_MY_KEY',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'AppTcadifKey',
        });
    }
}

module.exports = APP_TCADIF_MY_KEY;

},{"./FieldDef":56}],19:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class APP_TCADIF_MY_KEY_INFO extends FieldDef {
    constructor() {
        super({
            fieldName: 'APP_TCADIF_MY_KEY_INFO',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = APP_TCADIF_MY_KEY_INFO;

},{"./FieldDef":56}],20:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class APP_TCADIF_QSO_ID extends FieldDef {
    constructor() {
        super({
            fieldName: 'APP_TCADIF_QSO_ID',
            dataType: 'Uuid',
        });
    }
}

module.exports = APP_TCADIF_QSO_ID;

},{"./FieldDef":56}],21:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class ARRL_SECT extends FieldDef {
    constructor() {
        super({
            fieldName: 'ARRL_SECT',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'ArrlSect',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = ARRL_SECT;

},{"./FieldDef":56}],22:[function(require,module,exports){
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

},{"./FieldDef":56}],23:[function(require,module,exports){
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

},{"./FieldDef":56}],24:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class A_INDEX extends FieldDef {
    constructor() {
        super({
            fieldName: 'A_INDEX',
            dataType: 'Number',
            dataTypeIndicator: 'N',
            check: value => 0 <= parseFloat(value) && parseFloat(value) <= 400,
        });
    }
}

module.exports = A_INDEX;

},{"./FieldDef":56}],25:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class BAND extends FieldDef {
    constructor() {
        super({
            fieldName: 'BAND',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'Band',
            normalizer: (value) => value?.toLowerCase(),
        });
    }
}

module.exports = BAND;

},{"./FieldDef":56}],26:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class BAND_RX extends FieldDef {
    constructor() {
        super({
            fieldName: 'BAND_RX',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'Band',
            normalizer: (value) => value?.toLowerCase(),
        });
    }
}

module.exports = BAND_RX;

},{"./FieldDef":56}],27:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class CALL extends FieldDef {
    constructor() {
        super({
            fieldName: 'CALL',
            dataType: 'String',
            dataTypeIndicator: 'S',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = CALL;

},{"./FieldDef":56}],28:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class CHECK extends FieldDef {
    constructor() {
        super({
            fieldName: 'CHECK',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = CHECK;

},{"./FieldDef":56}],29:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class CLASS extends FieldDef {
    constructor() {
        super({
            fieldName: 'CLASS',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = CLASS;

},{"./FieldDef":56}],30:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class CLUBLOG_QSO_UPLOAD_DATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'CLUBLOG_QSO_UPLOAD_DATE',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = CLUBLOG_QSO_UPLOAD_DATE;

},{"./FieldDef":56}],31:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class CLUBLOG_QSO_UPLOAD_STATUS extends FieldDef {
    constructor() {
        super({
            fieldName: 'CLUBLOG_QSO_UPLOAD_STATUS',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QsoUploadStatus',
        });
    }
}

module.exports = CLUBLOG_QSO_UPLOAD_STATUS;

},{"./FieldDef":56}],32:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class CNTY extends FieldDef {
    constructor() {
        super({
            fieldName: 'CNTY',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = CNTY;

},{"./FieldDef":56}],33:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class COMMENT extends FieldDef {
    constructor() {
        super({
            fieldName: 'COMMENT',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = COMMENT;

},{"./FieldDef":56}],34:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class CONT extends FieldDef {
    constructor() {
        super({
            fieldName: 'CONT',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'Continent',
        });
    }
}

module.exports = CONT;

},{"./FieldDef":56}],35:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class CONTACTED_OP extends FieldDef {
    constructor() {
        super({
            fieldName: 'CONTACTED_OP',
            dataType: 'String',
            dataTypeIndicator: 'S',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = CONTACTED_OP;

},{"./FieldDef":56}],36:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class CONTEST_ID extends FieldDef {
    constructor() {
        super({
            fieldName: 'CONTEST_ID',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = CONTEST_ID;

},{"./FieldDef":56}],37:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class COUNTRY extends FieldDef {
    constructor() {
        super({
            fieldName: 'COUNTRY',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = COUNTRY;

},{"./FieldDef":56}],38:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class CQZ extends FieldDef {
    constructor() {
        super({
            fieldName: 'CQZ',
            dataType: 'PositiveInteger',
            check: value => 1 <= parseInt(value) && parseInt(value) <= 40,
        });
    }
}

module.exports = CQZ;

},{"./FieldDef":56}],39:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');
const DataTypes = require('../DataTypes');

class CREATED_TIMESTAMP extends FieldDef {
    constructor() {
        super({
            fieldName: 'CREATED_TIMESTAMP',
            dataType: 'String',
            dataTypeIndicator: 'S',
            enumeration: null,
            validator: new RegExp("^[0-9]{8} [0-9]{6}$"),
            check: (value) => {
                const [ date, time ] = value.split(' ');
                return DataTypes.check('Date', date) && DataTypes.check('Time', time);
            },
        });
    }
}

module.exports = CREATED_TIMESTAMP;

},{"../DataTypes":3,"./FieldDef":56}],40:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');
const { Credit, QslMedium } = require('../enums');

class CREDIT_GRANTED extends FieldDef {
    constructor() {
        super({
            fieldName: 'CREDIT_GRANTED',
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

module.exports = CREDIT_GRANTED;

},{"../enums":182,"./FieldDef":56}],41:[function(require,module,exports){
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

},{"../enums":182,"./FieldDef":56}],42:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class DARC_DOK extends FieldDef {
    constructor() {
        super({
            fieldName: 'DARC_DOK',
            dataType: 'String',
        });
    }
}

module.exports = DARC_DOK;

},{"./FieldDef":56}],43:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class DISTANCE extends FieldDef {
    constructor() {
        super({
            fieldName: 'DISTANCE',
            dataType: 'Number',
            dataTypeIndicator: 'N',
            check: value => parseFloat(value) >= 0,
        });
    }
}

module.exports = DISTANCE;

},{"./FieldDef":56}],44:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class DXCC extends FieldDef {
    constructor() {
        super({
            fieldName: 'DXCC',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'Dxcc',
        });
    }
}

module.exports = DXCC;

},{"./FieldDef":56}],45:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class EMAIL extends FieldDef {
    constructor() {
        super({
            fieldName: 'EMAIL',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = EMAIL;

},{"./FieldDef":56}],46:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class EQSL_QSLRDATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'EQSL_QSLRDATE',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = EQSL_QSLRDATE;

},{"./FieldDef":56}],47:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class EQSL_QSLSDATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'EQSL_QSLSDATE',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = EQSL_QSLSDATE;

},{"./FieldDef":56}],48:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class EQSL_QSL_RCVD extends FieldDef {
    constructor() {
        super({
            fieldName: 'EQSL_QSL_RCVD',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QslRcvd',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = EQSL_QSL_RCVD;

},{"./FieldDef":56}],49:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class EQSL_QSL_SENT extends FieldDef {
    constructor() {
        super({
            fieldName: 'EQSL_QSL_SENT',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QslSent',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = EQSL_QSL_SENT;

},{"./FieldDef":56}],50:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class EQ_CALL extends FieldDef {
    constructor() {
        super({
            fieldName: 'EQ_CALL',
            dataType: 'String',
            dataTypeIndicator: 'S',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = EQ_CALL;

},{"./FieldDef":56}],51:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class FISTS extends FieldDef {
    constructor() {
        super({
            fieldName: 'FISTS',
            dataType: 'PositiveInteger',
        });
    }
}

module.exports = FISTS;

},{"./FieldDef":56}],52:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class FISTS_CC extends FieldDef {
    constructor() {
        super({
            fieldName: 'FISTS_CC',
            dataType: 'PositiveInteger',
        });
    }
}

module.exports = FISTS_CC;

},{"./FieldDef":56}],53:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class FORCE_INIT extends FieldDef {
    constructor() {
        super({
            fieldName: 'FORCE_INIT',
            dataType: 'Boolean',
            dataTypeIndicator: 'B',
        });
    }
}

module.exports = FORCE_INIT;

},{"./FieldDef":56}],54:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class FREQ extends FieldDef {
    constructor() {
        super({
            fieldName: 'FREQ',
            dataType: 'Number',
            dataTypeIndicator: 'N',
        });
    }
}

module.exports = FREQ;

},{"./FieldDef":56}],55:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class FREQ_RX extends FieldDef {
    constructor() {
        super({
            fieldName: 'FREQ_RX',
            dataType: 'Number',
            dataTypeIndicator: 'N',
        });
    }
}

module.exports = FREQ_RX;

},{"./FieldDef":56}],56:[function(require,module,exports){
'use strict';

const AdifError = require('../AdifError');
const DataTypes = require('../DataTypes');
const enums = require('../enums');

class FieldDef {

    #fieldName;
    #dataType;
    #dataTypeIndicator;
    #enumeration;
    #validator;
    #check;
    #normalizer;

    constructor(obj = {}) {
        this.#fieldName = obj.fieldName;
        this.#dataType = obj.dataType;
        this.#dataTypeIndicator = obj.dataTypeIndicator ?? null;
        this.#enumeration = obj.enumeration;
        this.#validator = obj.validator;
        this.#check = obj.check;
        this.#normalizer = obj.normalizer;
    }

    get fieldName() {
        return this.#fieldName;
    }

    get dataType() {
        return this.#dataType;
    }

    get dataTypeIndicator() {
        return this.#dataTypeIndicator;
    }

    get enumeration() {
        return this.#enumeration;
    }

    get validator() {
        return this.#validator;
    }

    get check() {
        return this.#check;
    }

    get normalizer() {
        return this.#normalizer;
    }

    normalize(value) {
        if (this.normalizer instanceof Function) {
            value = this.normalizer(value);
        }

        return value;
    }

    validate(value) {
        const dataTypeOk = DataTypes.check(this.dataType, value);
        if (!dataTypeOk) {
            throw new AdifError('data type check failed', { field: this.fieldName, value });
        }

        if (this.validator instanceof RegExp) {
            const validatorOk = this.validator.test(value);
            if (!validatorOk) {
                throw new AdifError('field validation check failed', { field: this.fieldName, value });
            }
        }

        if (this.enumeration in enums) {
            const enumOk = (value in enums[this.enumeration]);
            if (!enumOk) {
                throw new AdifError('field enumeration check failed', { field: this.fieldName, value, validValues: Object.keys(enums[this.enumeration]) });
            }
        }

        if (this.check instanceof Function) {
            const checkOk = this.check(value);
            if (!checkOk) {
                throw new AdifError('field check failed', { field: this.fieldName, value });
            }
        }
    }
}

module.exports = FieldDef;

},{"../AdifError":2,"../DataTypes":3,"../enums":182}],57:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class GRIDSQUARE extends FieldDef {
    constructor() {
        super({
            fieldName: 'GRIDSQUARE',
            dataType: 'GridSquare',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = GRIDSQUARE;

},{"./FieldDef":56}],58:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class GRIDSQUARE_EXT extends FieldDef {
    constructor() {
        super({
            fieldName: 'GRIDSQUARE_EXT',
            dataType: 'GridSquareExt',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = GRIDSQUARE_EXT;

},{"./FieldDef":56}],59:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class HAMLOGEU_QSO_UPLOAD_DATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'HAMLOGEU_QSO_UPLOAD_DATE',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = HAMLOGEU_QSO_UPLOAD_DATE;

},{"./FieldDef":56}],60:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class HAMLOGEU_QSO_UPLOAD_STATUS extends FieldDef {
    constructor() {
        super({
            fieldName: 'HAMLOGEU_QSO_UPLOAD_STATUS',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QsoUploadStatus',
        });
    }
}

module.exports = HAMLOGEU_QSO_UPLOAD_STATUS;

},{"./FieldDef":56}],61:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class HAMQTH_QSO_UPLOAD_DATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'HAMQTH_QSO_UPLOAD_DATE',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = HAMQTH_QSO_UPLOAD_DATE;

},{"./FieldDef":56}],62:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class HAMQTH_QSO_UPLOAD_STATUS extends FieldDef {
    constructor() {
        super({
            fieldName: 'HAMQTH_QSO_UPLOAD_STATUS',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QsoUploadStatus',
        });
    }
}

module.exports = HAMQTH_QSO_UPLOAD_STATUS;

},{"./FieldDef":56}],63:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class HRDLOG_QSO_UPLOAD_DATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'HRDLOG_QSO_UPLOAD_DATE',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = HRDLOG_QSO_UPLOAD_DATE;

},{"./FieldDef":56}],64:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class HRDLOG_QSO_UPLOAD_STATUS extends FieldDef {
    constructor() {
        super({
            fieldName: 'HRDLOG_QSO_UPLOAD_STATUS',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QsoUploadStatus',
        });
    }
}

module.exports = HRDLOG_QSO_UPLOAD_STATUS;

},{"./FieldDef":56}],65:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class IOTA extends FieldDef {
    constructor() {
        super({
            fieldName: 'IOTA',
            dataType: 'IotaRef',
        });
    }
}

module.exports = IOTA;

},{"./FieldDef":56}],66:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class IOTA_ISLAND_ID extends FieldDef {
    constructor() {
        super({
            fieldName: 'IOTA_ISLAND_ID',
            dataType: 'PositiveInteger',
            check: value => 1 <= parseInt(value) && parseInt(value) <= 99999999,
        });
    }
}

module.exports = IOTA_ISLAND_ID;

},{"./FieldDef":56}],67:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class ITUZ extends FieldDef {
    constructor() {
        super({
            fieldName: 'ITUZ',
            dataType: 'PositiveInteger',
            check: value => 1 <= parseInt(value) && parseInt(value) <= 90,
        });
    }
}

module.exports = ITUZ;

},{"./FieldDef":56}],68:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class K_INDEX extends FieldDef {
    constructor() {
        super({
            fieldName: 'K_INDEX',
            dataType: 'Integer',
            check: value => 0 <= parseInt(value) && parseInt(value) <= 9,
        });
    }
}

module.exports = K_INDEX;

},{"./FieldDef":56}],69:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class LAT extends FieldDef {
    constructor() {
        super({
            fieldName: 'LAT',
            dataType: 'Location',
            dataTypeIndicator: 'L',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = LAT;

},{"./FieldDef":56}],70:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class LON extends FieldDef {
    constructor() {
        super({
            fieldName: 'LON',
            dataType: 'Location',
            dataTypeIndicator: 'L',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = LON;

},{"./FieldDef":56}],71:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class LOTW_QSLRDATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'LOTW_QSLRDATE',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = LOTW_QSLRDATE;

},{"./FieldDef":56}],72:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class LOTW_QSLSDATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'LOTW_QSLSDATE',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = LOTW_QSLSDATE;

},{"./FieldDef":56}],73:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class LOTW_QSL_RCVD extends FieldDef {
    constructor() {
        super({
            fieldName: 'LOTW_QSL_RCVD',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QslRcvd',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = LOTW_QSL_RCVD;

},{"./FieldDef":56}],74:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class LOTW_QSL_SENT extends FieldDef {
    constructor() {
        super({
            fieldName: 'LOTW_QSL_SENT',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QslSent',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = LOTW_QSL_SENT;

},{"./FieldDef":56}],75:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MAX_BURSTS extends FieldDef {
    constructor() {
        super({
            fieldName: 'MAX_BURSTS',
            dataType: 'Number',
            check: value => 0 <= parseFloat(value),
        });
    }
}

module.exports = MAX_BURSTS;

},{"./FieldDef":56}],76:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MODE extends FieldDef {
    constructor() {
        super({
            fieldName: 'MODE',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'Mode',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = MODE;

},{"./FieldDef":56}],77:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MS_SHOWER extends FieldDef {
    constructor() {
        super({
            fieldName: 'MS_SHOWER',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = MS_SHOWER;

},{"./FieldDef":56}],78:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_ALTITUDE extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_ALTITUDE',
            dataType: 'Number',
            dataTypeIndicator: 'N',
        });
    }
}

module.exports = MY_ALTITUDE;

},{"./FieldDef":56}],79:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_ANTENNA extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_ANTENNA',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = MY_ANTENNA;

},{"./FieldDef":56}],80:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_ARRL_SECT extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_ARRL_SECT',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'ArrlSect',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = MY_ARRL_SECT;

},{"./FieldDef":56}],81:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_CITY extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_CITY',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = MY_CITY;

},{"./FieldDef":56}],82:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_CNTY extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_CNTY',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = MY_CNTY;

},{"./FieldDef":56}],83:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_COUNTRY extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_COUNTRY',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = MY_COUNTRY;

},{"./FieldDef":56}],84:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_CQ_ZONE extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_CQ_ZONE',
            dataType: 'PositiveInteger',
            check: value => 1 <= parseInt(value) && parseInt(value) <= 40,
        });
    }
}

module.exports = MY_CQ_ZONE;

},{"./FieldDef":56}],85:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_DXCC extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_DXCC',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'Dxcc',
        });
    }
}

module.exports = MY_DXCC;

},{"./FieldDef":56}],86:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_FISTS extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_FISTS',
            dataType: 'PositiveInteger',
        });
    }
}

module.exports = MY_FISTS;

},{"./FieldDef":56}],87:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_GRIDSQUARE extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_GRIDSQUARE',
            dataType: 'GridSquare',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = MY_GRIDSQUARE;

},{"./FieldDef":56}],88:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_GRIDSQUARE_EXT extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_GRIDSQUARE_EXT',
            dataType: 'GridSquareExt',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = MY_GRIDSQUARE_EXT;

},{"./FieldDef":56}],89:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_IOTA extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_IOTA',
            dataType: 'IotaRef',
        });
    }
}

module.exports = MY_IOTA;

},{"./FieldDef":56}],90:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_IOTA_ISLAND_ID extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_IOTA_ISLAND_ID',
            dataType: 'PositiveInteger',
            check: value => 1 <= parseInt(value) && parseInt(value) <= 99999999,
        });
    }
}

module.exports = MY_IOTA_ISLAND_ID;

},{"./FieldDef":56}],91:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_ITU_ZONE extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_ITU_ZONE',
            dataType: 'PositiveInteger',
            check: value => 1 <= parseInt(value) && parseInt(value) <= 90,
        });
    }
}

module.exports = MY_ITU_ZONE;

},{"./FieldDef":56}],92:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_LAT extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_LAT',
            dataType: 'Location',
            dataTypeIndicator: 'L',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = MY_LAT;

},{"./FieldDef":56}],93:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_LON extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_LON',
            dataType: 'Location',
            dataTypeIndicator: 'L',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = MY_LON;

},{"./FieldDef":56}],94:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_NAME extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_NAME',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = MY_NAME;

},{"./FieldDef":56}],95:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_POSTAL_CODE extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_POSTAL_CODE',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = MY_POSTAL_CODE;

},{"./FieldDef":56}],96:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_POTA_REF extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_POTA_REF',
            dataType: 'PotaRefList',
        });
    }
}

module.exports = MY_POTA_REF;

},{"./FieldDef":56}],97:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_RIG extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_RIG',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = MY_RIG;

},{"./FieldDef":56}],98:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_SIG extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_SIG',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = MY_SIG;

},{"./FieldDef":56}],99:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_SIG_INFO extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_SIG_INFO',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = MY_SIG_INFO;

},{"./FieldDef":56}],100:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_SOTA_REF extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_SOTA_REF',
            dataType: 'SotaRef',
        });
    }
}

module.exports = MY_SOTA_REF;

},{"./FieldDef":56}],101:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_STATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_STATE',
            dataType: 'String',
        });
    }
}

module.exports = MY_STATE;

},{"./FieldDef":56}],102:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_STREET extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_STREET',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = MY_STREET;

},{"./FieldDef":56}],103:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_USACA_COUNTIES extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_USACA_COUNTIES',
            dataType: 'String',
        });
    }
}

module.exports = MY_USACA_COUNTIES;

},{"./FieldDef":56}],104:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_VUCC_GRIDS extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_VUCC_GRIDS',
            dataType: 'GridSquareList',
            normalizer: (value) => value?.toUpperCase(),
            check: value => (value.split(/,/g).length === 2 || value.split(/,/g).length === 4) && value.split(/,/g).every(grid => grid.length === 4),
        });
    }
}

module.exports = MY_VUCC_GRIDS;

},{"./FieldDef":56}],105:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_WWFF_REF extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_WWFF_REF',
            dataType: 'WwffRef',
        });
    }
}

module.exports = MY_WWFF_REF;

},{"./FieldDef":56}],106:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class NAME extends FieldDef {
    constructor() {
        super({
            fieldName: 'NAME',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = NAME;

},{"./FieldDef":56}],107:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class NOTES extends FieldDef {
    constructor() {
        super({
            fieldName: 'NOTES',
            dataType: 'MultilineString',
            dataTypeIndicator: 'M',
        });
    }
}

module.exports = NOTES;

},{"./FieldDef":56}],108:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class NR_BURSTS extends FieldDef {
    constructor() {
        super({
            fieldName: 'NR_BURSTS',
            dataType: 'Integer',
            check: value => 0 <= parseInt(value),
        });
    }
}

module.exports = NR_BURSTS;

},{"./FieldDef":56}],109:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class NR_PINGS extends FieldDef {
    constructor() {
        super({
            fieldName: 'NR_PINGS',
            dataType: 'Integer',
            check: value => 0 <= parseInt(value),
        });
    }
}

module.exports = NR_PINGS;

},{"./FieldDef":56}],110:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class OPERATOR extends FieldDef {
    constructor() {
        super({
            fieldName: 'OPERATOR',
            dataType: 'String',
            dataTypeIndicator: 'S',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = OPERATOR;

},{"./FieldDef":56}],111:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class OWNER_CALLSIGN extends FieldDef {
    constructor() {
        super({
            fieldName: 'OWNER_CALLSIGN',
            dataType: 'String',
            dataTypeIndicator: 'S',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = OWNER_CALLSIGN;

},{"./FieldDef":56}],112:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class PFX extends FieldDef {
    constructor() {
        super({
            fieldName: 'PFX',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = PFX;

},{"./FieldDef":56}],113:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class POTA_REF extends FieldDef {
    constructor() {
        super({
            fieldName: 'POTA_REF',
            dataType: 'PotaRefList',
        });
    }
}

module.exports = POTA_REF;

},{"./FieldDef":56}],114:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class PRECEDENCE extends FieldDef {
    constructor() {
        super({
            fieldName: 'PRECEDENCE',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = PRECEDENCE;

},{"./FieldDef":56}],115:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class PROGRAMID extends FieldDef {
    constructor() {
        super({
            fieldName: 'PROGRAMID',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = PROGRAMID;

},{"./FieldDef":56}],116:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class PROGRAMVERSION extends FieldDef {
    constructor() {
        super({
            fieldName: 'PROGRAMVERSION',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = PROGRAMVERSION;

},{"./FieldDef":56}],117:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class PROP_MODE extends FieldDef {
    constructor() {
        super({
            fieldName: 'PROP_MODE',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'PropagationMode',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = PROP_MODE;

},{"./FieldDef":56}],118:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class PUBLIC_KEY extends FieldDef {
    constructor() {
        super({
            fieldName: 'PUBLIC_KEY',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = PUBLIC_KEY;

},{"./FieldDef":56}],119:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class QRZCOM_QSO_UPLOAD_DATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'QRZCOM_QSO_UPLOAD_DATE',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = QRZCOM_QSO_UPLOAD_DATE;

},{"./FieldDef":56}],120:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class QRZCOM_QSO_UPLOAD_STATUS extends FieldDef {
    constructor() {
        super({
            fieldName: 'QRZCOM_QSO_UPLOAD_STATUS',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QsoUploadStatus',
        });
    }
}

module.exports = QRZCOM_QSO_UPLOAD_STATUS;

},{"./FieldDef":56}],121:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class QSLMSG extends FieldDef {
    constructor() {
        super({
            fieldName: 'QSLMSG',
            dataType: 'MultilineString',
            dataTypeIndicator: 'M',
        });
    }
}

module.exports = QSLMSG;

},{"./FieldDef":56}],122:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class QSLRDATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'QSLRDATE',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = QSLRDATE;

},{"./FieldDef":56}],123:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class QSLSDATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'QSLSDATE',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = QSLSDATE;

},{"./FieldDef":56}],124:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class QSL_RCVD extends FieldDef {
    constructor() {
        super({
            fieldName: 'QSL_RCVD',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QslRcvd',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = QSL_RCVD;

},{"./FieldDef":56}],125:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class QSL_RCVD_VIA extends FieldDef {
    constructor() {
        super({
            fieldName: 'QSL_RCVD_VIA',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QslVia',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = QSL_RCVD_VIA;

},{"./FieldDef":56}],126:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class QSL_SENT extends FieldDef {
    constructor() {
        super({
            fieldName: 'QSL_SENT',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QslSent',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = QSL_SENT;

},{"./FieldDef":56}],127:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class QSL_SENT_VIA extends FieldDef {
    constructor() {
        super({
            fieldName: 'QSL_SENT_VIA',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QslVia',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = QSL_SENT_VIA;

},{"./FieldDef":56}],128:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class QSL_VIA extends FieldDef {
    constructor() {
        super({
            fieldName: 'QSL_VIA',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = QSL_VIA;

},{"./FieldDef":56}],129:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class QSO_COMPLETE extends FieldDef {
    constructor() {
        super({
            fieldName: 'QSO_COMPLETE',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QsoComplete',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = QSO_COMPLETE;

},{"./FieldDef":56}],130:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class QSO_DATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'QSO_DATE',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = QSO_DATE;

},{"./FieldDef":56}],131:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class QSO_DATE_OFF extends FieldDef {
    constructor() {
        super({
            fieldName: 'QSO_DATE_OFF',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = QSO_DATE_OFF;

},{"./FieldDef":56}],132:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class QSO_RANDOM extends FieldDef {
    constructor() {
        super({
            fieldName: 'QSO_RANDOM',
            dataType: 'Boolean',
            dataTypeIndicator: 'B',
        });
    }
}

module.exports = QSO_RANDOM;

},{"./FieldDef":56}],133:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class QTH extends FieldDef {
    constructor() {
        super({
            fieldName: 'QTH',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = QTH;

},{"./FieldDef":56}],134:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class REGION extends FieldDef {
    constructor() {
        super({
            fieldName: 'REGION',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'Region',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = REGION;

},{"./FieldDef":56}],135:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class RIG extends FieldDef {
    constructor() {
        super({
            fieldName: 'RIG',
            dataType: 'MultilineString',
            dataTypeIndicator: 'M',
        });
    }
}

module.exports = RIG;

},{"./FieldDef":56}],136:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class RST_RCVD extends FieldDef {
    constructor() {
        super({
            fieldName: 'RST_RCVD',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = RST_RCVD;

},{"./FieldDef":56}],137:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class RST_SENT extends FieldDef {
    constructor() {
        super({
            fieldName: 'RST_SENT',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = RST_SENT;

},{"./FieldDef":56}],138:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class RX_PWR extends FieldDef {
    constructor() {
        super({
            fieldName: 'RX_PWR',
            dataType: 'Number',
            dataTypeIndicator: 'N',
            check: value => parseFloat(value) >= 0,
        });
    }
}

module.exports = RX_PWR;

},{"./FieldDef":56}],139:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class SAT_MODE extends FieldDef {
    constructor() {
        super({
            fieldName: 'SAT_MODE',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = SAT_MODE;

},{"./FieldDef":56}],140:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class SAT_NAME extends FieldDef {
    constructor() {
        super({
            fieldName: 'SAT_NAME',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = SAT_NAME;

},{"./FieldDef":56}],141:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class SFI extends FieldDef {
    constructor() {
        super({
            fieldName: 'SFI',
            dataType: 'Integer',
            check: value => 0 <= parseInt(value) && parseInt(value) <= 300,
        });
    }
}

module.exports = SFI;

},{"./FieldDef":56}],142:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class SIG extends FieldDef {
    constructor() {
        super({
            fieldName: 'SIG',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = SIG;

},{"./FieldDef":56}],143:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class SIG_INFO extends FieldDef {
    constructor() {
        super({
            fieldName: 'SIG_INFO',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = SIG_INFO;

},{"./FieldDef":56}],144:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class SILENT_KEY extends FieldDef {
    constructor() {
        super({
            fieldName: 'SILENT_KEY',
            dataType: 'Boolean',
            dataTypeIndicator: 'B',
        });
    }
}

module.exports = SILENT_KEY;

},{"./FieldDef":56}],145:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class SKCC extends FieldDef {
    constructor() {
        super({
            fieldName: 'SKCC',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = SKCC;

},{"./FieldDef":56}],146:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class SOTA_REF extends FieldDef {
    constructor() {
        super({
            fieldName: 'SOTA_REF',
            dataType: 'SotaRef',
        });
    }
}

module.exports = SOTA_REF;

},{"./FieldDef":56}],147:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class SRX extends FieldDef {
    constructor() {
        super({
            fieldName: 'SRX',
            dataType: 'Integer',
            check: value => 0 <= parseInt(value),
        });
    }
}

module.exports = SRX;

},{"./FieldDef":56}],148:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class SRX_STRING extends FieldDef {
    constructor() {
        super({
            fieldName: 'SRX_STRING',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = SRX_STRING;

},{"./FieldDef":56}],149:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class STATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'STATE',
            dataType: 'String',
        });
    }
}

module.exports = STATE;

},{"./FieldDef":56}],150:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class STATION_CALLSIGN extends FieldDef {
    constructor() {
        super({
            fieldName: 'STATION_CALLSIGN',
            dataType: 'String',
            dataTypeIndicator: 'S',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = STATION_CALLSIGN;

},{"./FieldDef":56}],151:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class STX extends FieldDef {
    constructor() {
        super({
            fieldName: 'STX',
            dataType: 'Integer',
            check: value => 0 <= parseInt(value),
        });
    }
}

module.exports = STX;

},{"./FieldDef":56}],152:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class STX_STRING extends FieldDef {
    constructor() {
        super({
            fieldName: 'STX_STRING',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = STX_STRING;

},{"./FieldDef":56}],153:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class SUBMODE extends FieldDef {
    constructor() {
        super({
            fieldName: 'SUBMODE',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = SUBMODE;

},{"./FieldDef":56}],154:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class SWL extends FieldDef {
    constructor() {
        super({
            fieldName: 'SWL',
            dataType: 'Boolean',
            dataTypeIndicator: 'B',
        });
    }
}

module.exports = SWL;

},{"./FieldDef":56}],155:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class TEN_TEN extends FieldDef {
    constructor() {
        super({
            fieldName: 'TEN_TEN',
            dataType: 'PositiveInteger',
        });
    }
}

module.exports = TEN_TEN;

},{"./FieldDef":56}],156:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class TIME_OFF extends FieldDef {
    constructor() {
        super({
            fieldName: 'TIME_OFF',
            dataType: 'Time',
            dataTypeIndicator: 'T',
        });
    }
}

module.exports = TIME_OFF;

},{"./FieldDef":56}],157:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class TIME_ON extends FieldDef {
    constructor() {
        super({
            fieldName: 'TIME_ON',
            dataType: 'Time',
            dataTypeIndicator: 'T',
        });
    }
}

module.exports = TIME_ON;

},{"./FieldDef":56}],158:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class TX_PWR extends FieldDef {
    constructor() {
        super({
            fieldName: 'TX_PWR',
            dataType: 'Number',
            dataTypeIndicator: 'N',
            check: value => parseFloat(value) >= 0,
        });
    }
}

module.exports = TX_PWR;

},{"./FieldDef":56}],159:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class UKSMG extends FieldDef {
    constructor() {
        super({
            fieldName: 'UKSMG',
            dataType: 'PositiveInteger',
        });
    }
}

module.exports = UKSMG;

},{"./FieldDef":56}],160:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class USACA_COUNTIES extends FieldDef {
    constructor() {
        super({
            fieldName: 'USACA_COUNTIES',
            dataType: 'String',
        });
    }
}

module.exports = USACA_COUNTIES;

},{"./FieldDef":56}],161:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class VUCC_GRIDS extends FieldDef {
    constructor() {
        super({
            fieldName: 'VUCC_GRIDS',
            dataType: 'GridSquareList',
            normalizer: (value) => value?.toUpperCase(),
            check: value => (value.split(/,/g).length === 2 || value.split(/,/g).length === 4) && value.split(/,/g).every(grid => grid.length === 4),
        });
    }
}

module.exports = VUCC_GRIDS;

},{"./FieldDef":56}],162:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class WEB extends FieldDef {
    constructor() {
        super({
            fieldName: 'WEB',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = WEB;

},{"./FieldDef":56}],163:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class WWFF_REF extends FieldDef {
    constructor() {
        super({
            fieldName: 'WWFF_REF',
            dataType: 'WwffRef',
        });
    }
}

module.exports = WWFF_REF;

},{"./FieldDef":56}],164:[function(require,module,exports){
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
const APP_TCADIF_KEY = require('./APP_TCADIF_KEY');
const APP_TCADIF_KEY_INFO = require('./APP_TCADIF_KEY_INFO');
const APP_TCADIF_MY_KEY = require('./APP_TCADIF_MY_KEY');
const APP_TCADIF_MY_KEY_INFO = require('./APP_TCADIF_MY_KEY_INFO');
const APP_TCADIF_LICW = require('./APP_TCADIF_LICW');
const APP_TCADIF_QSO_ID = require('./APP_TCADIF_QSO_ID');
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
const DISTANCE = require('./DISTANCE');
const DXCC = require('./DXCC');
const EMAIL = require('./EMAIL');
const EQ_CALL = require('./EQ_CALL');
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
const MS_SHOWER = require('./MS_SHOWER');
const MY_ALTITUDE = require('./MY_ALTITUDE');
const MY_ANTENNA = require('./MY_ANTENNA');
const MY_ARRL_SECT = require('./MY_ARRL_SECT');
const MY_CITY = require('./MY_CITY');
const MY_CNTY = require('./MY_CNTY');
const MY_COUNTRY = require('./MY_COUNTRY');
const MY_CQ_ZONE = require('./MY_CQ_ZONE');
const MY_DXCC = require('./MY_DXCC');
const MY_FISTS = require('./MY_FISTS');
const MY_GRIDSQUARE = require('./MY_GRIDSQUARE');
const MY_GRIDSQUARE_EXT = require('./MY_GRIDSQUARE_EXT');
const MY_IOTA = require('./MY_IOTA');
const MY_IOTA_ISLAND_ID = require('./MY_IOTA_ISLAND_ID');
const MY_ITU_ZONE = require('./MY_ITU_ZONE');
const MY_LAT = require('./MY_LAT');
const MY_LON = require('./MY_LON');
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
const QRZCOM_QSO_UPLOAD_DATE = require('./QRZCOM_QSO_UPLOAD_DATE');
const QRZCOM_QSO_UPLOAD_STATUS = require('./QRZCOM_QSO_UPLOAD_STATUS');
const QSLMSG = require('./QSLMSG');
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
        APP_TCADIF_KEY,
        APP_TCADIF_KEY_INFO,
        APP_TCADIF_MY_KEY,
        APP_TCADIF_MY_KEY_INFO,
        APP_TCADIF_LICW,
        APP_TCADIF_QSO_ID,
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
        DISTANCE,
        DXCC,
        EMAIL,
        EQ_CALL,
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
        MS_SHOWER,
        MY_ALTITUDE,
        MY_ANTENNA,
        MY_ARRL_SECT,
        MY_CITY,
        MY_CNTY,
        MY_COUNTRY,
        MY_CQ_ZONE,
        MY_DXCC,
        MY_FISTS,
        MY_GRIDSQUARE,
        MY_GRIDSQUARE_EXT,
        MY_IOTA,
        MY_IOTA_ISLAND_ID,
        MY_ITU_ZONE,
        MY_LAT,
        MY_LON,
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
        QRZCOM_QSO_UPLOAD_DATE,
        QRZCOM_QSO_UPLOAD_STATUS,
        QSLMSG,
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

},{"./ADDRESS":8,"./ADIF_VER":9,"./AGE":10,"./ALTITUDE":11,"./ANT_AZ":12,"./ANT_EL":13,"./ANT_PATH":14,"./APP_TCADIF_KEY":15,"./APP_TCADIF_KEY_INFO":16,"./APP_TCADIF_LICW":17,"./APP_TCADIF_MY_KEY":18,"./APP_TCADIF_MY_KEY_INFO":19,"./APP_TCADIF_QSO_ID":20,"./ARRL_SECT":21,"./AWARD_GRANTED":22,"./AWARD_SUBMITTED":23,"./A_INDEX":24,"./BAND":25,"./BAND_RX":26,"./CALL":27,"./CHECK":28,"./CLASS":29,"./CLUBLOG_QSO_UPLOAD_DATE":30,"./CLUBLOG_QSO_UPLOAD_STATUS":31,"./CNTY":32,"./COMMENT":33,"./CONT":34,"./CONTACTED_OP":35,"./CONTEST_ID":36,"./COUNTRY":37,"./CQZ":38,"./CREATED_TIMESTAMP":39,"./CREDIT_GRANTED":40,"./CREDIT_SUBMITTED":41,"./DARC_DOK":42,"./DISTANCE":43,"./DXCC":44,"./EMAIL":45,"./EQSL_QSLRDATE":46,"./EQSL_QSLSDATE":47,"./EQSL_QSL_RCVD":48,"./EQSL_QSL_SENT":49,"./EQ_CALL":50,"./FISTS":51,"./FISTS_CC":52,"./FORCE_INIT":53,"./FREQ":54,"./FREQ_RX":55,"./GRIDSQUARE":57,"./GRIDSQUARE_EXT":58,"./HAMLOGEU_QSO_UPLOAD_DATE":59,"./HAMLOGEU_QSO_UPLOAD_STATUS":60,"./HAMQTH_QSO_UPLOAD_DATE":61,"./HAMQTH_QSO_UPLOAD_STATUS":62,"./HRDLOG_QSO_UPLOAD_DATE":63,"./HRDLOG_QSO_UPLOAD_STATUS":64,"./IOTA":65,"./IOTA_ISLAND_ID":66,"./ITUZ":67,"./K_INDEX":68,"./LAT":69,"./LON":70,"./LOTW_QSLRDATE":71,"./LOTW_QSLSDATE":72,"./LOTW_QSL_RCVD":73,"./LOTW_QSL_SENT":74,"./MAX_BURSTS":75,"./MODE":76,"./MS_SHOWER":77,"./MY_ALTITUDE":78,"./MY_ANTENNA":79,"./MY_ARRL_SECT":80,"./MY_CITY":81,"./MY_CNTY":82,"./MY_COUNTRY":83,"./MY_CQ_ZONE":84,"./MY_DXCC":85,"./MY_FISTS":86,"./MY_GRIDSQUARE":87,"./MY_GRIDSQUARE_EXT":88,"./MY_IOTA":89,"./MY_IOTA_ISLAND_ID":90,"./MY_ITU_ZONE":91,"./MY_LAT":92,"./MY_LON":93,"./MY_NAME":94,"./MY_POSTAL_CODE":95,"./MY_POTA_REF":96,"./MY_RIG":97,"./MY_SIG":98,"./MY_SIG_INFO":99,"./MY_SOTA_REF":100,"./MY_STATE":101,"./MY_STREET":102,"./MY_USACA_COUNTIES":103,"./MY_VUCC_GRIDS":104,"./MY_WWFF_REF":105,"./NAME":106,"./NOTES":107,"./NR_BURSTS":108,"./NR_PINGS":109,"./OPERATOR":110,"./OWNER_CALLSIGN":111,"./PFX":112,"./POTA_REF":113,"./PRECEDENCE":114,"./PROGRAMID":115,"./PROGRAMVERSION":116,"./PROP_MODE":117,"./PUBLIC_KEY":118,"./QRZCOM_QSO_UPLOAD_DATE":119,"./QRZCOM_QSO_UPLOAD_STATUS":120,"./QSLMSG":121,"./QSLRDATE":122,"./QSLSDATE":123,"./QSL_RCVD":124,"./QSL_RCVD_VIA":125,"./QSL_SENT":126,"./QSL_SENT_VIA":127,"./QSL_VIA":128,"./QSO_COMPLETE":129,"./QSO_DATE":130,"./QSO_DATE_OFF":131,"./QSO_RANDOM":132,"./QTH":133,"./REGION":134,"./RIG":135,"./RST_RCVD":136,"./RST_SENT":137,"./RX_PWR":138,"./SAT_MODE":139,"./SAT_NAME":140,"./SFI":141,"./SIG":142,"./SIG_INFO":143,"./SILENT_KEY":144,"./SKCC":145,"./SOTA_REF":146,"./SRX":147,"./SRX_STRING":148,"./STATE":149,"./STATION_CALLSIGN":150,"./STX":151,"./STX_STRING":152,"./SUBMODE":153,"./SWL":154,"./TEN_TEN":155,"./TIME_OFF":156,"./TIME_ON":157,"./TX_PWR":158,"./UKSMG":159,"./USACA_COUNTIES":160,"./VUCC_GRIDS":161,"./WEB":162,"./WWFF_REF":163}],165:[function(require,module,exports){
'use strict';

// III.B.1 Ant Path Enumeration
module.exports = {
    'G': 'grayline',
    'O': 'other',
    'S': 'short path',
    'L': 'long path',
};

},{}],166:[function(require,module,exports){
'use strict';

// App TCADIF Key Enumeration
module.exports = {
    SK: "Straight key",
    SS: "Sideswiper",
    BUG: "Bug",
    SLP: "Single-Lever Paddle",
    DLP: "Dual-Lever Paddle",
    CPU: "Computer",
};

},{}],167:[function(require,module,exports){
'use strict';

// III.B.2 ARRL Section Enumeration
module.exports = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AB": "Alberta",
    "AR": "Arkansas",
    "AZ": "Arizona",
    "BC": "British Columbia",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "EB": "East Bay",
    "EMA": "Eastern Massachusetts",
    "ENY": "Eastern New York",
    "EPA": "Eastern Pennsylvania",
    "EWA": "Eastern Washington",
    "GA": "Georgia",
    "GTA": "Greater Toronto Area",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LAX": "Los Angeles",
    "LA": "Louisiana",
    "ME": "Maine",
    "MB": "Manitoba",
    "MAR": "Maritime",
    "MDC": "Maryland-DC",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NM": "New Mexico",
    "NLI": "New York City-Long Island",
    "NL": "Newfoundland/Labrador",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "NTX": "North Texas",
    "NFL": "Northern Florida",
    "NNJ": "Northern New Jersey",
    "NNY": "Northern New York",
    "NT": "Northwest Territories/Yukon/Nunavut",
    "NWT": "Northwest Territories/Yukon/Nunavut",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "ON": "Ontario",
    "ONE": "Ontario East",
    "ONN": "Ontario North",
    "ONS": "Ontario South",
    "ORG": "Orange",
    "OR": "Oregon",
    "PAC": "Pacific",
    "PE": "Prince Edward Island",
    "PR": "Puerto Rico",
    "QC": "Quebec",
    "RI": "Rhode Island",
    "SV": "Sacramento Valley",
    "SDG": "San Diego",
    "SF": "San Francisco",
    "SJV": "San Joaquin Valley",
    "SB": "Santa Barbara",
    "SCV": "Santa Clara Valley",
    "SK": "Saskatchewan",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "STX": "South Texas",
    "SFL": "Southern Florida",
    "SNJ": "Southern New Jersey",
    "TN": "Tennessee",
    "VI": "US Virgin Islands",
    "UT": "Utah",
    "VT": "Vermont",
    "VA": "Virginia",
    "WCF": "West Central Florida",
    "WTX": "West Texas",
    "WV": "West Virginia",
    "WMA": "Western Massachusetts",
    "WNY": "Western New York",
    "WPA": "Western Pennsylvania",
    "WWA": "Western Washington",
    "WI": "Wisconsin",
    "WY": "Wyoming",
};

},{}],168:[function(require,module,exports){
'use strict';

module.exports = {
    "2190m": { "lowerFreq": ".1357", "upperFreq": ".1378"},
    "630m": { "lowerFreq": ".472", "upperFreq": ".479"},
    "560m": { "lowerFreq": ".501", "upperFreq": ".504"},
    "160m": { "lowerFreq": "1.8", "upperFreq": "2.0"},
    "80m": { "lowerFreq": "3.5", "upperFreq": "4.0"},
    "60m": { "lowerFreq": "5.06", "upperFreq": "5.45"},
    "40m": { "lowerFreq": "7.0", "upperFreq": "7.3"},
    "30m": { "lowerFreq": "10.1", "upperFreq": "10.15"},
    "20m": { "lowerFreq": "14.0", "upperFreq": "14.35"},
    "17m": { "lowerFreq": "18.068", "upperFreq": "18.168"},
    "15m": { "lowerFreq": "21.0", "upperFreq": "21.45"},
    "12m": { "lowerFreq": "24.890", "upperFreq": "24.99"},
    "10m": { "lowerFreq": "28.0", "upperFreq": "29.7"},
    "8m": { "lowerFreq": "40", "upperFreq": "45"},
    "6m": { "lowerFreq": "50", "upperFreq": "54"},
    "5m": { "lowerFreq": "54.000001", "upperFreq": "69.9"},
    "4m": { "lowerFreq": "70", "upperFreq": "71"},
    "2m": { "lowerFreq": "144", "upperFreq": "148"},
    "1.25m": { "lowerFreq": "222", "upperFreq": "225"},
    "70cm": { "lowerFreq": "420", "upperFreq": "450"},
    "33cm": { "lowerFreq": "902", "upperFreq": "928"},
    "23cm": { "lowerFreq": "1240", "upperFreq": "1300"},
    "13cm": { "lowerFreq": "2300", "upperFreq": "2450"},
    "9cm": { "lowerFreq": "3300", "upperFreq": "3500"},
    "6cm": { "lowerFreq": "5650", "upperFreq": "5925"},
    "3cm": { "lowerFreq": "10000", "upperFreq": "10500"},
    "1.25cm": { "lowerFreq": "24000", "upperFreq": "24250"},
    "6mm": { "lowerFreq": "47000", "upperFreq": "47200"},
    "4mm": { "lowerFreq": "75500", "upperFreq": "81000"},
    "2.5mm": { "lowerFreq": "119980", "upperFreq": "123000"},
    "2mm": { "lowerFreq": "134000", "upperFreq": "149000"},
    "1mm": { "lowerFreq": "241000", "upperFreq": "250000"},
    "submm": { "lowerFreq": "300000", "upperFreq": "7500000"},
};

},{}],169:[function(require,module,exports){
'use strict';

// III.B.5 Contest ID Enumeration
module.exports = {
    "070-160M-SPRINT": "PODXS Great Pumpkin Sprint",
    "070-3-DAY": "PODXS Three Day Weekend",
    "070-31-FLAVORS": "PODXS 31 Flavors",
    "070-40M-SPRINT": "PODXS 40m Firecracker Sprint",
    "070-80M-SPRINT": "PODXS 80m Jay Hudak Memorial Sprint",
    "070-PSKFEST": "PODXS PSKFest",
    "070-ST-PATS-DAY": "PODXS St. Patricks Day",
    "070-VALENTINE-SPRINT": "PODXS Valentine Sprint",
    "10-RTTY": "Ten-Meter RTTY Contest (2011 onwards)",
    "1010-OPEN-SEASON": "Open Season Ten Meter QSO Party",
    "7QP": "7th-Area QSO Party",
    "AL-QSO-PARTY": "Alabama QSO Party",
    "ALL-ASIAN-DX-CW": "JARL All Asian DX Contest (CW)",
    "ALL-ASIAN-DX-PHONE": "JARL All Asian DX Contest (PHONE)",
    "ANARTS-RTTY": "ANARTS WW RTTY",
    "ANATOLIAN-RTTY": "Anatolian WW RTTY",
    "AP-SPRINT": "Asia - Pacific Sprint",
    "AR-QSO-PARTY": "Arkansas QSO Party",
    "ARI-DX": "ARI DX Contest",
    "ARRL-10": "ARRL 10 Meter Contest",
    "ARRL-10-GHZ": "ARRL 10 GHz and Up Contest",
    "ARRL-160": "ARRL 160 Meter Contest",
    "ARRL-222": "ARRL 222 MHz and Up Distance Contest",
    "ARRL-DIGI": "ARRL International Digital Contest",
    "ARRL-DX-CW": "ARRL International DX Contest (CW)",
    "ARRL-DX-SSB": "ARRL International DX Contest (Phone)",
    "ARRL-EME": "ARRL EME contest",
    "ARRL-FIELD-DAY": "ARRL Field Day",
    "ARRL-RR-CW": "ARRL Rookie Roundup (CW)",
    "ARRL-RR-RTTY": "ARRL Rookie Roundup (RTTY)",
    "ARRL-RR-SSB": "ARRL Rookie Roundup (Phone)",
    "ARRL-RTTY": "ARRL RTTY Round-Up",
    "ARRL-SCR": "ARRL School Club Roundup",
    "ARRL-SS-CW": "ARRL November Sweepstakes (CW)",
    "ARRL-SS-SSB": "ARRL November Sweepstakes (Phone)",
    "ARRL-UHF-AUG": "ARRL August UHF Contest",
    "ARRL-VHF-JAN": "ARRL January VHF Sweepstakes",
    "ARRL-VHF-JUN": "ARRL June VHF QSO Party",
    "ARRL-VHF-SEP": "ARRL September VHF QSO Party",
    "AZ-QSO-PARTY": "Arizona QSO Party",
    "BARTG-RTTY": "BARTG Spring RTTY Contest",
    "BARTG-SPRINT": "BARTG Sprint Contest",
    "BC-QSO-PARTY": "British Columbia QSO Party",
    "CA-QSO-PARTY": "California QSO Party",
    "CIS-DX": "CIS DX Contest",
    "CO-QSO-PARTY": "Colorado QSO Party",
    "CQ-160-CW": "CQ WW 160 Meter DX Contest (CW)",
    "CQ-160-SSB": "CQ WW 160 Meter DX Contest (SSB)",
    "CQ-M": "CQ-M International DX Contest",
    "CQ-VHF": "CQ World-Wide VHF Contest",
    "CQ-WPX-CW": "CQ WW WPX Contest (CW)",
    "CQ-WPX-RTTY": "CQ/RJ WW RTTY WPX Contest",
    "CQ-WPX-SSB": "CQ WW WPX Contest (SSB)",
    "CQ-WW-CW": "CQ WW DX Contest (CW)",
    "CQ-WW-RTTY": "CQ/RJ WW RTTY DX Contest",
    "CQ-WW-SSB": "CQ WW DX Contest (SSB)",
    "CT-QSO-PARTY": "Connecticut QSO Party",
    "CVA-DX-CW": "Concurso Verde e Amarelo DX CW Contest",
    "CVA-DX-SSB": "Concurso Verde e Amarelo DX CW Contest",
    "CWOPS-CW-OPEN": "CWops CW Open Competition",
    "CWOPS-CWT": "CWops Mini-CWT Test",
    "DARC-WAEDC-CW": "WAE DX Contest (CW)",
    "DARC-WAEDC-RTTY": "WAE DX Contest (RTTY)",
    "DARC-WAEDC-SSB": "WAE DX Contest (SSB)",
    "DARC-WAG": "DARC Worked All Germany",
    "DE-QSO-PARTY": "Delaware QSO Party",
    "DL-DX-RTTY": "DL-DX RTTY Contest",
    "DMC-RTTY": "DMC RTTY Contest",
    "EA-CNCW": "Concurso Nacional de Telegrafía",
    "EA-DME": "Municipios Españoles",
    "EA-MAJESTAD-CW": "His Majesty The King of Spain CW Contest (2022 and later)",
    "EA-MAJESTAD-SSB": "His Majesty The King of Spain SSB Contest (2022 and later)",
    "EA-PSK63": "EA PSK63",
    "EA-RTTY (import-only)": "Unión de Radioaficionados Españoles RTTY Contest",
    "EA-SMRE-CW": "Su Majestad El Rey de España - CW (2021 and earlier)",
    "EA-SMRE-SSB": "Su Majestad El Rey de España - SSB (2021 and earlier)",
    "EA-VHF-ATLANTIC": "Atlántico V-UHF",
    "EA-VHF-COM": "Combinado de V-UHF",
    "EA-VHF-COSTA-SOL": "Costa del Sol V-UHF",
    "EA-VHF-EA": "Nacional VHF",
    "EA-VHF-EA1RCS": "Segovia EA1RCS V-UHF",
    "EA-VHF-QSL": "QSL V-UHF & 50MHz",
    "EA-VHF-SADURNI": "Sant Sadurni V-UHF",
    "EA-WW-RTTY": "Unión de Radioaficionados Españoles RTTY Contest",
    "EPC-PSK63": "PSK63 QSO Party",
    "EU Sprint": "EU Sprint",
    "EU-HF": "EU HF Championship",
    "EU-PSK-DX": "EU PSK DX Contest",
    "EUCW160M": "European CW Association 160m CW Party",
    "FALL SPRINT": "FISTS Fall Sprint",
    "FL-QSO-PARTY": "Florida QSO Party",
    "GA-QSO-PARTY": "Georgia QSO Party",
    "HA-DX": "Hungarian DX Contest",
    "HELVETIA": "Helvetia Contest",
    "HI-QSO-PARTY": "Hawaiian QSO Party",
    "HOLYLAND": "IARC Holyland Contest",
    "IA-QSO-PARTY": "Iowa QSO Party",
    "IARU-FIELD-DAY": "DARC IARU Region 1 Field Day",
    "IARU-HF": "IARU HF World Championship",
    "ICWC-MST": "ICWC Medium Speed Test",
    "ID-QSO-PARTY": "Idaho QSO Party",
    "IL QSO Party": "Illinois QSO Party",
    "IN-QSO-PARTY": "Indiana QSO Party",
    "JARTS-WW-RTTY": "JARTS WW RTTY",
    "JIDX-CW": "Japan International DX Contest (CW)",
    "JIDX-SSB": "Japan International DX Contest (SSB)",
    "JT-DX-RTTY": "Mongolian RTTY DX Contest",
    "K1USN-SST": "K1USN Slow Speed Test",
    "KS-QSO-PARTY": "Kansas QSO Party",
    "KY-QSO-PARTY": "Kentucky QSO Party",
    "LA-QSO-PARTY": "Louisiana QSO Party",
    "LDC-RTTY": "DRCG Long Distance Contest (RTTY)",
    "LZ DX": "LZ DX Contest",
    "MAR-QSO-PARTY": "Maritimes QSO Party",
    "MD-QSO-PARTY": "Maryland QSO Party",
    "ME-QSO-PARTY": "Maine QSO Party",
    "MI-QSO-PARTY": "Michigan QSO Party",
    "MIDATLANTIC-QSO-PARTY": "Mid-Atlantic QSO Party",
    "MN-QSO-PARTY": "Minnesota QSO Party",
    "MO-QSO-PARTY": "Missouri QSO Party",
    "MS-QSO-PARTY": "Mississippi QSO Party",
    "MT-QSO-PARTY": "Montana QSO Party",
    "NA-SPRINT-CW": "North America Sprint (CW)",
    "NA-SPRINT-RTTY": "North America Sprint (RTTY)",
    "NA-SPRINT-SSB": "North America Sprint (Phone)",
    "NAQP-CW": "North America QSO Party (CW)",
    "NAQP-RTTY": "North America QSO Party (RTTY)",
    "NAQP-SSB": "North America QSO Party (Phone)",
    "NC-QSO-PARTY": "North Carolina QSO Party",
    "ND-QSO-PARTY": "North Dakota QSO Party",
    "NE-QSO-PARTY": "Nebraska QSO Party",
    "NEQP": "New England QSO Party",
    "NH-QSO-PARTY": "New Hampshire QSO Party",
    "NJ-QSO-PARTY": "New Jersey QSO Party",
    "NM-QSO-PARTY": "New Mexico QSO Party",
    "NRAU-BALTIC-CW": "NRAU-Baltic Contest (CW)",
    "NRAU-BALTIC-SSB": "NRAU-Baltic Contest (SSB)",
    "NV-QSO-PARTY": "Nevada QSO Party",
    "NY-QSO-PARTY": "New York QSO Party",
    "OCEANIA-DX-CW": "Oceania DX Contest (CW)",
    "OCEANIA-DX-SSB": "Oceania DX Contest (SSB)",
    "OH-QSO-PARTY": "Ohio QSO Party",
    "OK-DX-RTTY": "Czech Radio Club OK DX Contest",
    "OK-OM-DX": "Czech Radio Club OK-OM DX Contest",
    "OK-QSO-PARTY": "Oklahoma QSO Party",
    "OMISS-QSO-PARTY": "Old Man International Sideband Society QSO Party",
    "ON-QSO-PARTY": "Ontario QSO Party",
    "OR-QSO-PARTY": "Oregon QSO Party",
    "PA-QSO-PARTY": "Pennsylvania QSO Party",
    "PACC": "Dutch PACC Contest",
    "PSK-DEATHMATCH": "MDXA PSK DeathMatch (2005-2010)",
    "QC-QSO-PARTY": "Quebec QSO Party",
    "RAC (import-only)": "Canadian Amateur Radio Society Contest",
    "RAC-CANADA-DAY": "RAC Canada Day Contest",
    "RAC-CANADA-WINTER": "RAC Canada Winter Contest",
    "RDAC": "Russian District Award Contest",
    "RDXC": "Russian DX Contest",
    "REF-160M": "Reseau des Emetteurs Francais 160m Contest",
    "REF-CW": "Reseau des Emetteurs Francais Contest (CW)",
    "REF-SSB": "Reseau des Emetteurs Francais Contest (SSB)",
    "REP-PORTUGAL-DAY-HF": "Rede dos Emissores Portugueses Portugal Day HF Contest",
    "RI-QSO-PARTY": "Rhode Island QSO Party",
    "RSGB-160": "1.8MHz Contest",
    "RSGB-21/28-CW": "21/28 MHz Contest (CW)",
    "RSGB-21/28-SSB": "21/28 MHz Contest (SSB)",
    "RSGB-80M-CC": "80m Club Championships",
    "RSGB-AFS-CW": "Affiliated Societies Team Contest (CW)",
    "RSGB-AFS-SSB": "Affiliated Societies Team Contest (SSB)",
    "RSGB-CLUB-CALLS": "Club Calls",
    "RSGB-COMMONWEALTH": "Commonwealth Contest",
    "RSGB-IOTA": "IOTA Contest",
    "RSGB-LOW-POWER": "Low Power Field Day",
    "RSGB-NFD": "National Field Day",
    "RSGB-ROPOCO": "RoPoCo",
    "RSGB-SSB-FD": "SSB Field Day",
    "RUSSIAN-RTTY": "Russian Radio RTTY Worldwide Contest",
    "SAC-CW": "Scandinavian Activity Contest (CW)",
    "SAC-SSB": "Scandinavian Activity Contest (SSB)",
    "SARTG-RTTY": "SARTG WW RTTY",
    "SC-QSO-PARTY": "South Carolina QSO Party",
    "SCC-RTTY": "SCC RTTY Championship",
    "SD-QSO-PARTY": "South Dakota QSO Party",
    "SMP-AUG": "SSA Portabeltest",
    "SMP-MAY": "SSA Portabeltest",
    "SP-DX-RTTY": "PRC SPDX Contest (RTTY)",
    "SPAR-WINTER-FD": "SPAR Winter Field Day(2016 and earlier)",
    "SPDXContest": "SP DX Contest",
    "SPRING SPRINT": "FISTS Spring Sprint",
    "SR-MARATHON": "Scottish-Russian Marathon",
    "STEW-PERRY": "Stew Perry Topband Distance Challenge",
    "SUMMER SPRINT": "FISTS Summer Sprint",
    "TARA-GRID-DIP": "TARA Grid Dip PSK-RTTY Shindig",
    "TARA-RTTY": "TARA RTTY Mêlée",
    "TARA-RUMBLE": "TARA Rumble PSK Contest",
    "TARA-SKIRMISH": "TARA Skirmish Digital Prefix Contest",
    "TEN-RTTY": "Ten-Meter RTTY Contest (before 2011)",
    "TMC-RTTY": "The Makrothen Contest",
    "TN-QSO-PARTY": "Tennessee QSO Party",
    "TX-QSO-PARTY": "Texas QSO Party",
    "UBA-DX-CW": "UBA Contest (CW)",
    "UBA-DX-SSB": "UBA Contest (SSB)",
    "UK-DX-BPSK63": "European PSK Club BPSK63 Contest",
    "UK-DX-RTTY": "UK DX RTTY Contest",
    "UKR-CHAMP-RTTY": "Open Ukraine RTTY Championship",
    "UKRAINIAN DX": "Ukrainian DX",
    "UKSMG-6M-MARATHON": "UKSMG 6m Marathon",
    "UKSMG-SUMMER-ES": "UKSMG Summer Es Contest",
    "URE-DX  (import-only)": "Ukrainian DX Contest",
    "US-COUNTIES-QSO": "Mobile Amateur Awards Club",
    "UT-QSO-PARTY": "Utah QSO Party",
    "VA-QSO-PARTY": "Virginia QSO Party",
    "VENEZ-IND-DAY": "RCV Venezuelan Independence Day Contest",
    "VIRGINIA QSO PARTY (import-only)": "Virginia QSO Party",
    "VOLTA-RTTY": "Alessandro Volta RTTY DX Contest",
    "VT-QSO-PARTY": "Vermont QSO Party",
    "WA-QSO-PARTY": "Washington QSO Party",
    "WFD": "Winter Field Day (2017 and later)",
    "WI-QSO-PARTY": "Wisconsin QSO Party",
    "WIA-HARRY ANGEL": "WIA Harry Angel Memorial 80m Sprint",
    "WIA-JMMFD": "WIA John Moyle Memorial Field Day",
    "WIA-OCDX": "WIA Oceania DX (OCDX) Contest",
    "WIA-REMEMBRANCE": "WIA Remembrance Day",
    "WIA-ROSS HULL": "WIA Ross Hull Memorial VHF/UHF Contest",
    "WIA-TRANS TASMAN": "WIA Trans Tasman Low Bands Challenge",
    "WIA-VHF/UHF FD": "WIA VHF UHF Field Days",
    "WIA-VK SHIRES": "WIA VK Shires",
    "WINTER SPRINT": "FISTS Winter Sprint",
    "WV-QSO-PARTY": "West Virginia QSO Party",
    "WW-DIGI": "World Wide Digi DX Contest",
    "WY-QSO-PARTY": "Wyoming QSO Party",
    "XE-INTL-RTTY": "Mexico International Contest (RTTY)",
    "YOHFDX": "YODX HF contest",
    "YUDXC": "YU DX Contest",
};

},{}],170:[function(require,module,exports){
'use strict';

// III.B.6 Continent Enumeration
module.exports = {
    "NA":   "North America",
    "SA":   "South America",
    "EU":   "Europe",
    "AF":   "Africa",
    "OC":   "Oceana",
    "AS":   "Asia",
    "AN":   "Antarctica",
};

},{}],171:[function(require,module,exports){
'use strict';

module.exports = {
    "CQDX": "CQ Magazine DX Mixed",
    "CQDX_BAND": "CQ Magazine DX Band",
    "CQDX_MODE": "CQ Magazine DX Mode",
    "CQDX_MOBILE": "CQ Magazine DX Mobile",
    "CQDX_QRP": "CQ Magazine DX QRP",
    "CQDX_SATELLITE": "CQ Magazine DX Satellite",
    "CQDXFIELD": "CQ Magazine DX Field Mixed",
    "CQDXFIELD_BAND": "CQ Magazine DX Field Band",
    "CQDXFIELD_MODE": "CQ Magazine DX Field Mode",
    "CQDXFIELD_MOBILE": "CQ Magazine DX Field Mobile",
    "CQDXFIELD_QRP": "CQ Magazine DX Field QRP",
    "CQDXFIELD_SATELLITE": "CQ Magazine DX Field Satellite",
    "CQWAZ_MIXED": "CQ Magazine Worked All Zones (WAZ) Mixed",
    "CQWAZ_BAND": "CQ Magazine Worked All Zones (WAZ) Band",
    "CQWAZ_MODE": "CQ Magazine Worked All Zones (WAZ) Mode",
    "CQWAZ_SATELLITE": "CQ Magazine Worked All Zones (WAZ) Satellite",
    "CQWAZ_EME": "CQ Magazine Worked All Zones (WAZ) EME",
    "CQWAZ_MOBILE": "CQ Magazine Worked All Zones (WAZ) Mobile",
    "CQWAZ_QRP": "CQ Magazine Worked All Zones (WAZ) QRP",
    "CQWPX": "CQ Magazine WPX Mixed",
    "CQWPX_BAND": "CQ Magazine WPX Band",
    "CQWPX_MODE": "CQ Magazine WPX Mode",
    "DXCC": "ARRL DX Century Club (DXCC) Mixed",
    "DXCC_BAND": "ARRL DX Century Club (DXCC) Band",
    "DXCC_MODE": "ARRL DX Century Club (DXCC) Mode",
    "DXCC_SATELLITE": "ARRL DX Century Club (DXCC) Satellite",
    "EAUSTRALIA": "eQSL eAustralia Mixed",
    "ECANADA": "eQSL eCanada Mixed",
    "ECOUNTY_STATE": "eQSL eCounty State",
    "EDX": "eQSL eDX Mixed",
    "EDX100": "eQSL eDX100 Mixed",
    "EDX100_BAND": "eQSL eDX100 Band",
    "EDX100_MODE": "eQSL eDX100 Mode",
    "EECHOLINK50": "eQSL eEcholink50 Echolink",
    "EGRID_BAND": "eQSL eGrid Band",
    "EGRID_SATELLITE": "eQSL eGrid Satellite",
    "EPFX300": "eQSL ePfx300 Mixed",
    "EPFX300_MODE": "eQSL ePfx300 Mode",
    "EWAS": "eQSL eWAS Mixed",
    "EWAS_BAND": "eQSL eWAS Band",
    "EWAS_MODE": "eQSL eWAS Mode",
    "EWAS_SATELLITE": "eQSL eWAS Satellite",
    "EZ40": "eQSL eZ40 Mixed",
    "EZ40_MODE": "eQSL eZ40 Mode",
    "FFMA": "ARRL Fred Fish Memorial Award (FFMA) Mixed",
    "IOTA": "RSGB Islands on the Air (IOTA) Mixed",
    "IOTA_BASIC": "RSGB Islands on the Air (IOTA) Mixed",
    "IOTA_CONT": "RSGB Islands on the Air (IOTA) Continent",
    "IOTA_GROUP": "RSGB Islands on the Air (IOTA) Group",
    "RDA": "TAG Russian Districts Award (RDA) Mixed",
    "USACA": "CQ Magazine United States of America Counties (USA-CA) Mixed",
    "VUCC_BAND": "ARRL VHF/UHF Century Club Program (VUCC) Band",
    "VUCC_SATELLITE": "ARRL VHF/UHF Century Club Program (VUCC) Satellite",
    "WAB": "WAB AG Worked All Britain (WAB) Mixed",
    "WAC": "IARU Worked All Continents (WAC) Mixed",
    "WAC_BAND": "IARU Worked All Continents (WAC) Band",
    "WAE": "DARC Worked All Europe (WAE) Mixed",
    "WAE_BAND": "DARC Worked All Europe (WAE) Band",
    "WAE_MODE": "DARC Worked All Europe (WAE) Mode",
    "WAIP": "ARI Worked All Italian Provinces (WAIP) Mixed",
    "WAIP_BAND": "ARI Worked All Italian Provinces (WAIP) Band",
    "WAIP_MODE": "ARI Worked All Italian Provinces (WAIP) Mode",
    "WAS": "ARRL Worked All States (WAS) Mixed",
    "WAS_BAND": "ARRL Worked All States (WAS) Band",
    "WAS_EME": "ARRL Worked All States (WAS) EME",
    "WAS_MODE": "ARRL Worked All States (WAS) Mode",
    "WAS_NOVICE": "ARRL Worked All States (WAS) Novice",
    "WAS_QRP": "ARRL Worked All States (WAS) QRP",
    "WAS_SATELLITE": "ARRL Worked All States (WAS) Satellite",
    "WITUZ": "RSGB Worked ITU Zones (WITUZ) Mixed",
    "WITUZ_BAND": "RSGB Worked ITU Zones (WITUZ) Band",
};

},{}],172:[function(require,module,exports){
'use strict';

module.exports = {
    "0": "None (the contacted station is known to not be within a DXCC entity)",
    "1": "CANADA",
    "2": "ABU AIL IS.",
    "3": "AFGHANISTAN",
    "4": "AGALEGA & ST. BRANDON IS.",
    "5": "ALAND IS.",
    "6": "ALASKA",
    "7": "ALBANIA",
    "8": "ALDABRA",
    "9": "AMERICAN SAMOA",
    "10": "AMSTERDAM & ST. PAUL IS.",
    "11": "ANDAMAN & NICOBAR IS.",
    "12": "ANGUILLA",
    "13": "ANTARCTICA",
    "14": "ARMENIA",
    "15": "ASIATIC RUSSIA",
    "16": "NEW ZEALAND SUBANTARCTIC ISLANDS",
    "17": "AVES I.",
    "18": "AZERBAIJAN",
    "19": "BAJO NUEVO",
    "20": "BAKER & HOWLAND IS.",
    "21": "BALEARIC IS.",
    "22": "PALAU",
    "23": "BLENHEIM REEF",
    "24": "BOUVET",
    "25": "BRITISH NORTH BORNEO",
    "26": "BRITISH SOMALILAND",
    "27": "BELARUS",
    "28": "CANAL ZONE",
    "29": "CANARY IS.",
    "30": "CELEBE & MOLUCCA IS.",
    "31": "C. KIRIBATI (BRITISH PHOENIX IS.)",
    "32": "CEUTA & MELILLA",
    "33": "CHAGOS IS.",
    "34": "CHATHAM IS.",
    "35": "CHRISTMAS I.",
    "36": "CLIPPERTON I.",
    "37": "COCOS I.",
    "38": "COCOS (KEELING) IS.",
    "39": "COMOROS",
    "40": "CRETE",
    "41": "CROZET I.",
    "42": "DAMAO, DIU",
    "43": "DESECHEO I.",
    "44": "DESROCHES",
    "45": "DODECANESE",
    "46": "EAST MALAYSIA",
    "47": "EASTER I.",
    "48": "E. KIRIBATI (LINE IS.)",
    "49": "EQUATORIAL GUINEA",
    "50": "MEXICO",
    "51": "ERITREA",
    "52": "ESTONIA",
    "53": "ETHIOPIA",
    "54": "EUROPEAN RUSSIA",
    "55": "FARQUHAR",
    "56": "FERNANDO DE NORONHA",
    "57": "FRENCH EQUATORIAL AFRICA",
    "58": "FRENCH INDO-CHINA",
    "59": "FRENCH WEST AFRICA",
    "60": "BAHAMAS",
    "61": "FRANZ JOSEF LAND",
    "62": "BARBADOS",
    "63": "FRENCH GUIANA",
    "64": "BERMUDA",
    "65": "BRITISH VIRGIN IS.",
    "66": "BELIZE",
    "67": "FRENCH INDIA",
    "68": "KUWAIT/SAUDI ARABIA NEUTRAL ZONE",
    "69": "CAYMAN IS.",
    "70": "CUBA",
    "71": "GALAPAGOS IS.",
    "72": "DOMINICAN REPUBLIC",
    "74": "EL SALVADOR",
    "75": "GEORGIA",
    "76": "GUATEMALA",
    "77": "GRENADA",
    "78": "HAITI",
    "79": "GUADELOUPE",
    "80": "HONDURAS",
    "81": "GERMANY",
    "82": "JAMAICA",
    "84": "MARTINIQUE",
    "85": "BONAIRE, CURACAO",
    "86": "NICARAGUA",
    "88": "PANAMA",
    "89": "TURKS & CAICOS IS.",
    "90": "TRINIDAD & TOBAGO",
    "91": "ARUBA",
    "93": "GEYSER REEF",
    "94": "ANTIGUA & BARBUDA",
    "95": "DOMINICA",
    "96": "MONTSERRAT",
    "97": "ST. LUCIA",
    "98": "ST. VINCENT",
    "99": "GLORIOSO IS.",
    "100": "ARGENTINA",
    "101": "GOA",
    "102": "GOLD COAST, TOGOLAND",
    "103": "GUAM",
    "104": "BOLIVIA",
    "105": "GUANTANAMO BAY",
    "106": "GUERNSEY",
    "107": "GUINEA",
    "108": "BRAZIL",
    "109": "GUINEA-BISSAU",
    "110": "HAWAII",
    "111": "HEARD I.",
    "112": "CHILE",
    "113": "IFNI",
    "114": "ISLE OF MAN",
    "115": "ITALIAN SOMALILAND",
    "116": "COLOMBIA",
    "117": "ITU HQ",
    "118": "JAN MAYEN",
    "119": "JAVA",
    "120": "ECUADOR",
    "122": "JERSEY",
    "123": "JOHNSTON I.",
    "124": "JUAN DE NOVA, EUROPA",
    "125": "JUAN FERNANDEZ IS.",
    "126": "KALININGRAD",
    "127": "KAMARAN IS.",
    "128": "KARELO-FINNISH REPUBLIC",
    "129": "GUYANA",
    "130": "KAZAKHSTAN",
    "131": "KERGUELEN IS.",
    "132": "PARAGUAY",
    "133": "KERMADEC IS.",
    "134": "KINGMAN REEF",
    "135": "KYRGYZSTAN",
    "136": "PERU",
    "137": "REPUBLIC OF KOREA",
    "138": "KURE I.",
    "139": "KURIA MURIA I.",
    "140": "SURINAME",
    "141": "FALKLAND IS.",
    "142": "LAKSHADWEEP IS.",
    "143": "LAOS",
    "144": "URUGUAY",
    "145": "LATVIA",
    "146": "LITHUANIA",
    "147": "LORD HOWE I.",
    "148": "VENEZUELA",
    "149": "AZORES",
    "150": "AUSTRALIA",
    "151": "MALYJ VYSOTSKIJ I.",
    "152": "MACAO",
    "153": "MACQUARIE I.",
    "154": "YEMEN ARAB REPUBLIC",
    "155": "MALAYA",
    "157": "NAURU",
    "158": "VANUATU",
    "159": "MALDIVES",
    "160": "TONGA",
    "161": "MALPELO I.",
    "162": "NEW CALEDONIA",
    "163": "PAPUA NEW GUINEA",
    "164": "MANCHURIA",
    "165": "MAURITIUS",
    "166": "MARIANA IS.",
    "167": "MARKET REEF",
    "168": "MARSHALL IS.",
    "169": "MAYOTTE",
    "170": "NEW ZEALAND",
    "171": "MELLISH REEF",
    "172": "PITCAIRN I.",
    "173": "MICRONESIA",
    "174": "MIDWAY I.",
    "175": "FRENCH POLYNESIA",
    "176": "FIJI",
    "177": "MINAMI TORISHIMA",
    "178": "MINERVA REEF",
    "179": "MOLDOVA",
    "180": "MOUNT ATHOS",
    "181": "MOZAMBIQUE",
    "182": "NAVASSA I.",
    "183": "NETHERLANDS BORNEO",
    "184": "NETHERLANDS NEW GUINEA",
    "185": "SOLOMON IS.",
    "186": "NEWFOUNDLAND, LABRADOR",
    "187": "NIGER",
    "188": "NIUE",
    "189": "NORFOLK I.",
    "190": "SAMOA",
    "191": "NORTH COOK IS.",
    "192": "OGASAWARA",
    "193": "OKINAWA (RYUKYU IS.)",
    "194": "OKINO TORI-SHIMA",
    "195": "ANNOBON I.",
    "196": "PALESTINE",
    "197": "PALMYRA & JARVIS IS.",
    "198": "PAPUA TERRITORY",
    "199": "PETER 1 I.",
    "200": "PORTUGUESE TIMOR",
    "201": "PRINCE EDWARD & MARION IS.",
    "202": "PUERTO RICO",
    "203": "ANDORRA",
    "204": "REVILLAGIGEDO",
    "205": "ASCENSION I.",
    "206": "AUSTRIA",
    "207": "RODRIGUEZ I.",
    "208": "RUANDA-URUNDI",
    "209": "BELGIUM",
    "210": "SAAR",
    "211": "SABLE I.",
    "212": "BULGARIA",
    "213": "SAINT MARTIN",
    "214": "CORSICA",
    "215": "CYPRUS",
    "216": "SAN ANDRES & PROVIDENCIA",
    "217": "SAN FELIX & SAN AMBROSIO",
    "218": "CZECHOSLOVAKIA",
    "219": "SAO TOME & PRINCIPE",
    "220": "SARAWAK",
    "221": "DENMARK",
    "222": "FAROE IS.",
    "223": "ENGLAND",
    "224": "FINLAND",
    "225": "SARDINIA",
    "226": "SAUDI ARABIA/IRAQ NEUTRAL ZONE",
    "227": "FRANCE",
    "228": "SERRANA BANK & RONCADOR CAY",
    "229": "GERMAN DEMOCRATIC REPUBLIC",
    "230": "FEDERAL REPUBLIC OF GERMANY",
    "231": "SIKKIM",
    "232": "SOMALIA",
    "233": "GIBRALTAR",
    "234": "SOUTH COOK IS.",
    "235": "SOUTH GEORGIA I.",
    "236": "GREECE",
    "237": "GREENLAND",
    "238": "SOUTH ORKNEY IS.",
    "239": "HUNGARY",
    "240": "SOUTH SANDWICH IS.",
    "241": "SOUTH SHETLAND IS.",
    "242": "ICELAND",
    "243": "PEOPLE'S DEMOCRATIC REP. OF YEMEN",
    "244": "SOUTHERN SUDAN",
    "245": "IRELAND",
    "246": "SOVEREIGN MILITARY ORDER OF MALTA",
    "247": "SPRATLY IS.",
    "248": "ITALY",
    "249": "ST. KITTS & NEVIS",
    "250": "ST. HELENA",
    "251": "LIECHTENSTEIN",
    "252": "ST. PAUL I.",
    "253": "ST. PETER & ST. PAUL ROCKS",
    "254": "LUXEMBOURG",
    "255": "ST. MAARTEN, SABA, ST. EUSTATIUS",
    "256": "MADEIRA IS.",
    "257": "MALTA",
    "258": "SUMATRA",
    "259": "SVALBARD",
    "260": "MONACO",
    "261": "SWAN IS.",
    "262": "TAJIKISTAN",
    "263": "NETHERLANDS",
    "264": "TANGIER",
    "265": "NORTHERN IRELAND",
    "266": "NORWAY",
    "267": "TERRITORY OF NEW GUINEA",
    "268": "TIBET",
    "269": "POLAND",
    "270": "TOKELAU IS.",
    "271": "TRIESTE",
    "272": "PORTUGAL",
    "273": "TRINDADE & MARTIM VAZ IS.",
    "274": "TRISTAN DA CUNHA & GOUGH I.",
    "275": "ROMANIA",
    "276": "TROMELIN I.",
    "277": "ST. PIERRE & MIQUELON",
    "278": "SAN MARINO",
    "279": "SCOTLAND",
    "280": "TURKMENISTAN",
    "281": "SPAIN",
    "282": "TUVALU",
    "283": "UK SOVEREIGN BASE AREAS ON CYPRUS",
    "284": "SWEDEN",
    "285": "VIRGIN IS.",
    "286": "UGANDA",
    "287": "SWITZERLAND",
    "288": "UKRAINE",
    "289": "UNITED NATIONS HQ",
    "291": "UNITED STATES OF AMERICA",
    "292": "UZBEKISTAN",
    "293": "VIET NAM",
    "294": "WALES",
    "295": "VATICAN",
    "296": "SERBIA",
    "297": "WAKE I.",
    "298": "WALLIS & FUTUNA IS.",
    "299": "WEST MALAYSIA",
    "301": "W. KIRIBATI (GILBERT IS. )",
    "302": "WESTERN SAHARA",
    "303": "WILLIS I.",
    "304": "BAHRAIN",
    "305": "BANGLADESH",
    "306": "BHUTAN",
    "307": "ZANZIBAR",
    "308": "COSTA RICA",
    "309": "MYANMAR",
    "312": "CAMBODIA",
    "315": "SRI LANKA",
    "318": "CHINA",
    "321": "HONG KONG",
    "324": "INDIA",
    "327": "INDONESIA",
    "330": "IRAN",
    "333": "IRAQ",
    "336": "ISRAEL",
    "339": "JAPAN",
    "342": "JORDAN",
    "344": "DEMOCRATIC PEOPLE'S REP. OF KOREA",
    "345": "BRUNEI DARUSSALAM",
    "348": "KUWAIT",
    "354": "LEBANON",
    "363": "MONGOLIA",
    "369": "NEPAL",
    "370": "OMAN",
    "372": "PAKISTAN",
    "375": "PHILIPPINES",
    "376": "QATAR",
    "378": "SAUDI ARABIA",
    "379": "SEYCHELLES",
    "381": "SINGAPORE",
    "382": "DJIBOUTI",
    "384": "SYRIA",
    "386": "TAIWAN",
    "387": "THAILAND",
    "390": "TURKEY",
    "391": "UNITED ARAB EMIRATES",
    "400": "ALGERIA",
    "401": "ANGOLA",
    "402": "BOTSWANA",
    "404": "BURUNDI",
    "406": "CAMEROON",
    "408": "CENTRAL AFRICA",
    "409": "CAPE VERDE",
    "410": "CHAD",
    "411": "COMOROS",
    "412": "REPUBLIC OF THE CONGO",
    "414": "DEMOCRATIC REPUBLIC OF THE CONGO",
    "416": "BENIN",
    "420": "GABON",
    "422": "THE GAMBIA",
    "424": "GHANA",
    "428": "COTE D'IVOIRE",
    "430": "KENYA",
    "432": "LESOTHO",
    "434": "LIBERIA",
    "436": "LIBYA",
    "438": "MADAGASCAR",
    "440": "MALAWI",
    "442": "MALI",
    "444": "MAURITANIA",
    "446": "MOROCCO",
    "450": "NIGERIA",
    "452": "ZIMBABWE",
    "453": "REUNION I.",
    "454": "RWANDA",
    "456": "SENEGAL",
    "458": "SIERRA LEONE",
    "460": "ROTUMA I.",
    "462": "SOUTH AFRICA",
    "464": "NAMIBIA",
    "466": "SUDAN",
    "468": "SWAZILAND",
    "470": "TANZANIA",
    "474": "TUNISIA",
    "478": "EGYPT",
    "480": "BURKINA FASO",
    "482": "ZAMBIA",
    "483": "TOGO",
    "488": "WALVIS BAY",
    "489": "CONWAY REEF",
    "490": "BANABA I. (OCEAN I.)",
    "492": "YEMEN",
    "493": "PENGUIN IS.",
    "497": "CROATIA",
    "499": "SLOVENIA",
    "501": "BOSNIA-HERZEGOVINA",
    "502": "MACEDONIA",
    "503": "CZECH REPUBLIC",
    "504": "SLOVAK REPUBLIC",
    "505": "PRATAS I.",
    "506": "SCARBOROUGH REEF",
    "507": "TEMOTU PROVINCE",
    "508": "AUSTRAL I.",
    "509": "MARQUESAS IS.",
    "510": "PALESTINE",
    "511": "TIMOR-LESTE",
    "512": "CHESTERFIELD IS.",
    "513": "DUCIE I.",
    "514": "MONTENEGRO",
    "515": "SWAINS I.",
    "516": "SAINT BARTHELEMY",
    "517": "CURACAO",
    "518": "ST MAARTEN",
    "519": "SABA & ST. EUSTATIUS",
    "520": "BONAIRE",
    "521": "SOUTH SUDAN (REPUBLIC OF)",
    "522": "REPUBLIC OF KOSOVO",
};

},{}],173:[function(require,module,exports){
'use strict';

module.exports = {
    "AM": "AM",
    "ARDOP": "ARDOP",
    "ATV": "ATV",
    "CHIP": "CHIP",
    "CLO": "CLO",
    "CONTESTI": "CONTESTI",
    "CW": "CW",
    "DIGITALVOICE": "DIGITALVOICE",
    "DOMINO": "DOMINO",
    "DYNAMIC": "DYNAMIC",
    "FAX": "FAX",
    "FM": "FM",
    "FSK441": "FSK441",
    "FT8": "FT8",
    "HELL": "HELL",
    "ISCAT": "ISCAT",
    "JT4": "JT4",
    "JT6M": "JT6M",
    "JT9": "JT9",
    "JT44": "JT44",
    "JT65": "JT65",
    "MFSK": "MFSK",
    "MSK144": "MSK144",
    "MT63": "MT63",
    "OLIVIA": "OLIVIA",
    "OPERA": "OPERA",
    "PAC": "PAC",
    "PAX": "PAX",
    "PKT": "PKT",
    "PSK": "PSK",
    "PSK2K": "PSK2K",
    "Q15": "Q15",
    "QRA64": "QRA64",
    "ROS": "ROS",
    "RTTY": "RTTY",
    "RTTYM": "RTTYM",
    "SSB": "SSB",
    "SSTV": "SSTV",
    "T10": "T10",
    "THOR": "THOR",
    "THRB": "THRB",
    "TOR": "TOR",
    "V4": "V4",
    "VOI": "VOI",
    "WINMOR": "WINMOR",
    "WSPR": "WSPR",
};

},{}],174:[function(require,module,exports){
'use strict';

// III.B.13 Propagation Mode Enumeration
module.exports = {
    'AS':       'Aircraft Scatter',
    'AUE':      'Aurora-E',
    'AUR':      'Aurora',
    'BS':       'Back scatter',
    'ECH':      'EchoLink',
    'EME':      'Earth-Moon-Earth',
    'ES':       'Sporadic E',
    'F2':       'F2 Reflection',
    'FAI':      'Field Aligned Irregularities',
    'GWAVE':    'Ground Wave',
    'INTERNET': 'Internet-assisted',
    'ION':      'Ionoscatter',
    'IRL':      'IRLP',
    'LOS':      'Line of Sight (includes transmission through obstacles such as walls)',
    'MS':       'Meteor scatter',
    'RPT':      'Terrestrial or atmospheric repeater or transponder',
    'RS':       'Rain scatter',
    'SAT':      'Satellite',
    'TEP':      'Trans-equatorial',
    'TR':       'Tropospheric ducting',
};

},{}],175:[function(require,module,exports){
'use strict';

module.exports = {
    "CARD": "QSO confirmation via paper QSL card",
    "EQSL": "QSO confirmation via eQSL.cc",
    "LOTW": "QSO confirmation via ARRL Logbook of the World",
};

},{}],176:[function(require,module,exports){
'use strict';

module.exports = {
    "Y": "yes (confirmed)",
    "N": "no",
    "R": "requested",
    "I": "ignore or invalid",
    "V": "verified",
};

},{}],177:[function(require,module,exports){
'use strict';

module.exports = {
    "Y": "yes",
    "N": "no",
    "R": "requested",
    "Q": "queued",
    "I": "ignore or invalid",
};

},{}],178:[function(require,module,exports){
'use strict';

module.exports = {
    "B": "bureau",
    "D": "direct",
    "E": "electronic",
    "M": "manager",
};

},{}],179:[function(require,module,exports){
'use strict';

// III.B.18 QSO Complete Enumeration
module.exports = {
    'Y':    'yes',
    'N':    'no',
    'NIL':  'not heard',
    '?':    'uncertain',
};

},{}],180:[function(require,module,exports){
'use strict';

// III.B.19 QSO Upload Status Enumeration
module.exports = {
    "Y":    "the QSO has been uploaded to, and accepted by, the online service",
    "N":    "do not upload the QSO to the online service",
    "M":    "the QSO has been modified since being uploaded to the online service",
};

},{}],181:[function(require,module,exports){
'use strict';

module.exports = {
    "NONE": "Not within a WAE or CQ region that is within a DXCC entity",
    "IV": "ITU Vienna",
    "AI": "African Italy",
    "SY": "Sicily",
    "BI": "Bear Island",
    "SI": "Shetland Islands",
    "KO": "Kosovo",
    "ET": "European Turkey",
};

},{}],182:[function(require,module,exports){
'use strict';

const AntPath = require('./AntPath');
const AppTcadifKey = require('./AppTcadifKey');
const ArrlSection = require('./ArrlSection');
const Band = require('./Band');
const ContestID = require('./ContestID');
const Continent = require('./Continent');
const Credit = require('./Credit');
const Dxcc = require('./Dxcc');
const Mode = require('./Mode');
const PropagationMode = require('./PropagationMode');
const QslMedium = require('./QslMedium');
const QslRcvd = require('./QslRcvd');
const QslSent = require('./QslSent');
const QslVia = require('./QslVia');
const QsoComplete = require('./QsoComplete');
const QsoUploadStatus = require('./QsoUploadStatus');
const Region = require('./Region');

module.exports = {
    AntPath,
    AppTcadifKey,
    ArrlSection,
    Band,
    ContestID,
    Continent,
    Credit,
    Dxcc,
    Mode,
    PropagationMode,
    QslMedium,
    QslRcvd,
    QslSent,
    QslVia,
    QsoComplete,
    QsoUploadStatus,
    Region,
};

},{"./AntPath":165,"./AppTcadifKey":166,"./ArrlSection":167,"./Band":168,"./ContestID":169,"./Continent":170,"./Credit":171,"./Dxcc":172,"./Mode":173,"./PropagationMode":174,"./QslMedium":175,"./QslRcvd":176,"./QslSent":177,"./QslVia":178,"./QsoComplete":179,"./QsoUploadStatus":180,"./Region":181}],183:[function(require,module,exports){
exports.endianness = function () { return 'LE' };

exports.hostname = function () {
    if (typeof location !== 'undefined') {
        return location.hostname
    }
    else return '';
};

exports.loadavg = function () { return [] };

exports.uptime = function () { return 0 };

exports.freemem = function () {
    return Number.MAX_VALUE;
};

exports.totalmem = function () {
    return Number.MAX_VALUE;
};

exports.cpus = function () { return [] };

exports.type = function () { return 'Browser' };

exports.release = function () {
    if (typeof navigator !== 'undefined') {
        return navigator.appVersion;
    }
    return '';
};

exports.networkInterfaces
= exports.getNetworkInterfaces
= function () { return {} };

exports.arch = function () { return 'javascript' };

exports.platform = function () { return 'browser' };

exports.tmpdir = exports.tmpDir = function () {
    return '/tmp';
};

exports.EOL = '\n';

exports.homedir = function () {
	return '/'
};

},{}],184:[function(require,module,exports){
module.exports={
  "name": "tcadif",
  "version": "1.8.1",
  "description": "read and write Amateur Data Interchange Format (ADIF)",
  "main": "index.js",
  "scripts": {
    "prepare": "browserify -r ./index.js:tcadif -o ./dist/tcadif.js",
    "test": "mocha"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/tcort/tcadif.git"
  },
  "keywords": [
    "adif",
    "amateur",
    "radio",
    "ham",
    "adi",
    "data",
    "format",
    "log",
    "logger",
    "qso"
  ],
  "author": "Thomas Cort <linuxgeek@gmail.com>",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/tcort/tcadif/issues"
  },
  "homepage": "https://github.com/tcort/tcadif#readme",
  "devDependencies": {
    "expect.js": "^0.3.1",
    "mocha": "^10.2.0"
  },
  "dependencies": {
    "browserify": "^17.0.0",
    "moment": "^2.29.4"
  }
}

},{}],"tcadif":[function(require,module,exports){
'use strict';

const Field = require('./lib/Field');
const Header = require('./lib/Header');
const QSO = require('./lib/QSO');
const ADIF = require('./lib/ADIF');
const Version = require('./lib/Version');
const defs = require('./lib/defs');
const enums = require('./lib/enums');

module.exports = {
    ADIF, Field, Header, QSO, Version,
    defs,
    enums,
};

},{"./lib/ADIF":1,"./lib/Field":4,"./lib/Header":5,"./lib/QSO":6,"./lib/Version":7,"./lib/defs":164,"./lib/enums":182}]},{},[]);
