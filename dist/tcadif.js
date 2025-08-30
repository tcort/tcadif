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

},{"../package.json":223,"./Field":6,"./Header":7,"./QSO":8,"os":203}],2:[function(require,module,exports){
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

const Field = require('./Field');
const Header = require('./Header');
const QSO = require('./QSO');
const { Duplex } = require('stream');

class AdifReader extends Duplex {

    #queue = '';
    #fields = [];

    constructor() {
        super({
            readableObjectMode: true,
        });
    }

    appendQueue(chunk) {
        this.#queue = [ this.#queue, chunk.toString() ].join('');
    }

    processFields(endTag) {
        const entries = this.#fields;
        this.#fields = [];

        const block = Object.fromEntries(entries);
        if (endTag === 'EOH') { // end-of-header
            // end-of-record;
            this.emit('header', new Header(block));
            return;
        }

        // end-of-record;
        this.emit('record', new QSO(block));
        this.push(new QSO(block).toObject());
    }

    processQueue() {

        while (this.readableFlowing) { // process as many fields as we can
            const field = Field.parse(this.#queue);
            if (field === null) {
                break;
            }
            this.#queue = this.#queue.slice(field.bytesConsumed);
            this.emit('field', field.toEntry());

            if (field.fieldName === 'EOR' || field.fieldName === 'EOH') {
                this.processFields(field.fieldName);
            } else {
                this.#fields.push(field.toEntry());
            }
        }
    }

    _read(size) {
        this.processQueue();
    }

    _write(chunk, encoding, callback) {
        this.appendQueue(chunk);
        callback(null);        
    }

    _final(callback) {
        this.processQueue();
        callback(null);
    }
}

module.exports = AdifReader;

},{"./Field":6,"./Header":7,"./QSO":8,"stream":206}],4:[function(require,module,exports){
'use strict';

const Header = require('./Header');
const Timestamper = require('./utils/Timestamper');
const QSO = require('./QSO');
const os = require('os');
const pkg = require('../package.json');
const { Transform } = require('stream');

class AdifWriter extends Transform {

    #header = null;
    #headerWritten = false;
    #options = {};

    constructor(header, options = {}) {
        super({
            writableObjectMode: true,
        });

        this.#header = header ?? {};
        this.#header.ADIF_VER = this.#header.ADIF_VER ?? '3.1.5';
        this.#header.CREATED_TIMESTAMP = this.#header.CREATED_TIMESTAMP ?? Timestamper.CREATED_TIMESTAMP();
        this.#header.PROGRAMID = this.#header.PROGRAMID ?? pkg.name;
        this.#header.PROGRAMVERSION = this.#header.PROGRAMVERSION ?? pkg.version;

        this.#options = options ?? {};
        this.#options.recordDelim = this.#options?.recordDelim ?? `${os.EOL}${os.EOL}`;
    }

    _transform(chunk, encoding, callback) {
        const parts = [];

        if (!this.#headerWritten) {
            parts.push(new Header(this.#header).stringify(this.#options));
            parts.push(os.EOL);
            this.#headerWritten = true;
            parts.push(this.#options.recordDelim);
        }

        parts.push(new QSO(chunk).stringify(this.#options));
        parts.push(this.#options.recordDelim);

        this.push(parts.join(''));
        callback();
    }
}

module.exports = AdifWriter;

},{"../package.json":223,"./Header":7,"./QSO":8,"./utils/Timestamper":196,"os":203,"stream":206}],5:[function(require,module,exports){
'use strict';

const Continent = require('./enums/Continent.js');
const Credit = require('./enums/Credit.js');
const QslMedium = require('./enums/QslMedium.js');

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

function checkCreditList(s) {

    const members = s.split(/,/g);

    const isInCreditEnum = (member) => Credit.hasOwnProperty(member);
    const isInQslMedium = (member) => QslMedium.hasOwnProperty(member);

    return members.every(member => {
        if (isInCreditEnum(member)) {
            return true;
        }

        const parts = member.split(/:/g);
        if (parts.length !== 2 || !isInCreditEnum(parts[0])) {
            return false;
        }

        const mediums = parts[1].split(/&/g);
        return mediums.every(medium => isInQslMedium(medium));
    });
}

function checkIotaRefNo(s) {

    const parts = s.split(/-/g);
    if (parts.length !== 2) {
        return false;
    }

    const continent = parts[0].toUpperCase();
    if (!Continent.hasOwnProperty(continent)) {
        return false;
    }

    return /^[0-9]{3}$/.test(parts[1]) && parts[1] !== '000';
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
    'IotaRefNo': s => typeof s === 'string' && s.length > 0 && checkIotaRefNo(s),
    'CreditList': s => typeof s === 'string' && s.length > 0 && checkCreditList(s),
    'check': (dataType, value) => dataType in module.exports ? module.exports[dataType](value) : false,
};

},{"./enums/Continent.js":178,"./enums/Credit.js":179,"./enums/QslMedium.js":184}],6:[function(require,module,exports){
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
        return new RegExp("<(?<fieldName>[^ ]?[^,:<>{}]+[^ ]?)(:(?<dataLength>[0-9]+))?(:(?<dataTypeIndicator>[A-Z]))?>");
    }
}

module.exports = Field;

},{"./AdifError":2}],7:[function(require,module,exports){
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

},{"../package.json":223,"./AdifError":2,"./DataTypes":5,"./Field":6,"./defs":172,"os":203}],8:[function(require,module,exports){
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

},{"./AdifError":2,"./DataTypes":5,"./Field":6,"./defs":172,"os":203}],9:[function(require,module,exports){
'use strict';

const { name, version, homepage } = require('../package.json');
module.exports = { name, version, homepage };

},{"../package.json":223}],10:[function(require,module,exports){
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

},{"./FieldDef":56}],11:[function(require,module,exports){
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

},{"./FieldDef":56}],12:[function(require,module,exports){
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

},{"./FieldDef":56}],13:[function(require,module,exports){
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

},{"./FieldDef":56}],14:[function(require,module,exports){
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

},{"./FieldDef":56}],15:[function(require,module,exports){
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

},{"./FieldDef":56}],16:[function(require,module,exports){
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

},{"./FieldDef":56}],17:[function(require,module,exports){
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

},{"./FieldDef":56}],18:[function(require,module,exports){
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

},{"./FieldDef":56}],19:[function(require,module,exports){
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

},{"./FieldDef":56}],20:[function(require,module,exports){
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

},{"./FieldDef":56}],21:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class BAND extends FieldDef {
    constructor() {
        super({
            fieldName: 'BAND',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'Band',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = BAND;

},{"./FieldDef":56}],22:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class BAND_RX extends FieldDef {
    constructor() {
        super({
            fieldName: 'BAND_RX',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'Band',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = BAND_RX;

},{"./FieldDef":56}],23:[function(require,module,exports){
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

},{"./FieldDef":56}],24:[function(require,module,exports){
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

},{"./FieldDef":56}],25:[function(require,module,exports){
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

},{"./FieldDef":56}],26:[function(require,module,exports){
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

},{"./FieldDef":56}],27:[function(require,module,exports){
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

},{"./FieldDef":56}],28:[function(require,module,exports){
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

},{"./FieldDef":56}],29:[function(require,module,exports){
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

},{"./FieldDef":56}],30:[function(require,module,exports){
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

},{"./FieldDef":56}],31:[function(require,module,exports){
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

},{"./FieldDef":56}],32:[function(require,module,exports){
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

},{"./FieldDef":56}],33:[function(require,module,exports){
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

},{"./FieldDef":56}],34:[function(require,module,exports){
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

},{"./FieldDef":56}],35:[function(require,module,exports){
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

},{"../DataTypes":5,"./FieldDef":56}],36:[function(require,module,exports){
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

},{"../enums":192,"./FieldDef":56}],37:[function(require,module,exports){
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

},{"../enums":192,"./FieldDef":56}],38:[function(require,module,exports){
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

},{"./FieldDef":56}],39:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class DCL_QSLRDATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'DCL_QSLRDATE',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = DCL_QSLRDATE;

},{"./FieldDef":56}],40:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class DCL_QSLSDATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'DCL_QSLSDATE',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = DCL_QSLSDATE;

},{"./FieldDef":56}],41:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class DCL_QSL_RCVD extends FieldDef {
    constructor() {
        super({
            fieldName: 'DCL_QSL_RCVD',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QslRcvd',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = DCL_QSL_RCVD;

},{"./FieldDef":56}],42:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class DCL_QSL_SENT extends FieldDef {
    constructor() {
        super({
            fieldName: 'DCL_QSL_SENT',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QslSent',
            normalizer: (value) => value?.toUpperCase(),
        });
    }
}

module.exports = DCL_QSL_SENT;

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

},{"../AdifError":2,"../DataTypes":5,"../enums":192}],57:[function(require,module,exports){
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
            dataType: 'IotaRefNo',
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

class MORSE_KEY_INFO extends FieldDef {
    constructor() {
        super({
            fieldName: 'MORSE_KEY_INFO',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = MORSE_KEY_INFO;

},{"./FieldDef":56}],78:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MORSE_KEY_TYPE extends FieldDef {
    constructor() {
        super({
            fieldName: 'MORSE_KEY_TYPE',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'MorseKeyType',
        });
    }
}

module.exports = MORSE_KEY_TYPE;

},{"./FieldDef":56}],79:[function(require,module,exports){
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

},{"./FieldDef":56}],80:[function(require,module,exports){
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

},{"./FieldDef":56}],81:[function(require,module,exports){
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

},{"./FieldDef":56}],82:[function(require,module,exports){
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

},{"./FieldDef":56}],83:[function(require,module,exports){
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

},{"./FieldDef":56}],84:[function(require,module,exports){
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

},{"./FieldDef":56}],85:[function(require,module,exports){
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

},{"./FieldDef":56}],86:[function(require,module,exports){
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

},{"./FieldDef":56}],87:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_DARC_DOK extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_DARC_DOK',
            dataType: 'String',
        });
    }
}

module.exports = MY_DARC_DOK;

},{"./FieldDef":56}],88:[function(require,module,exports){
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

},{"./FieldDef":56}],89:[function(require,module,exports){
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

},{"./FieldDef":56}],90:[function(require,module,exports){
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

},{"./FieldDef":56}],91:[function(require,module,exports){
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

},{"./FieldDef":56}],92:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_IOTA extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_IOTA',
            dataType: 'IotaRefNo',
        });
    }
}

module.exports = MY_IOTA;

},{"./FieldDef":56}],93:[function(require,module,exports){
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

},{"./FieldDef":56}],94:[function(require,module,exports){
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

},{"./FieldDef":56}],95:[function(require,module,exports){
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

},{"./FieldDef":56}],96:[function(require,module,exports){
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

},{"./FieldDef":56}],97:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_MORSE_KEY_INFO extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_MORSE_KEY_INFO',
            dataType: 'String',
            dataTypeIndicator: 'S',
        });
    }
}

module.exports = MY_MORSE_KEY_INFO;

},{"./FieldDef":56}],98:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class MY_MORSE_KEY_TYPE extends FieldDef {
    constructor() {
        super({
            fieldName: 'MY_MORSE_KEY_TYPE',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'MorseKeyType',
        });
    }
}

module.exports = MY_MORSE_KEY_TYPE;

},{"./FieldDef":56}],99:[function(require,module,exports){
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

},{"./FieldDef":56}],100:[function(require,module,exports){
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

},{"./FieldDef":56}],101:[function(require,module,exports){
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

},{"./FieldDef":56}],102:[function(require,module,exports){
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

},{"./FieldDef":56}],103:[function(require,module,exports){
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

},{"./FieldDef":56}],104:[function(require,module,exports){
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

},{"./FieldDef":56}],105:[function(require,module,exports){
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

},{"./FieldDef":56}],106:[function(require,module,exports){
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

},{"./FieldDef":56}],107:[function(require,module,exports){
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

},{"./FieldDef":56}],108:[function(require,module,exports){
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

},{"./FieldDef":56}],109:[function(require,module,exports){
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

},{"./FieldDef":56}],110:[function(require,module,exports){
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

},{"./FieldDef":56}],111:[function(require,module,exports){
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

},{"./FieldDef":56}],112:[function(require,module,exports){
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

},{"./FieldDef":56}],113:[function(require,module,exports){
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

},{"./FieldDef":56}],114:[function(require,module,exports){
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

},{"./FieldDef":56}],115:[function(require,module,exports){
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

},{"./FieldDef":56}],116:[function(require,module,exports){
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

},{"./FieldDef":56}],117:[function(require,module,exports){
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

},{"./FieldDef":56}],118:[function(require,module,exports){
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

},{"./FieldDef":56}],119:[function(require,module,exports){
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

},{"./FieldDef":56}],120:[function(require,module,exports){
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

},{"./FieldDef":56}],121:[function(require,module,exports){
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

},{"./FieldDef":56}],122:[function(require,module,exports){
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

},{"./FieldDef":56}],123:[function(require,module,exports){
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

},{"./FieldDef":56}],124:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class QRZCOM_QSO_DOWNLOAD_DATE extends FieldDef {
    constructor() {
        super({
            fieldName: 'QRZCOM_QSO_DOWNLOAD_DATE',
            dataType: 'Date',
            dataTypeIndicator: 'D',
        });
    }
}

module.exports = QRZCOM_QSO_DOWNLOAD_DATE;

},{"./FieldDef":56}],125:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class QRZCOM_QSO_DOWNLOAD_STATUS extends FieldDef {
    constructor() {
        super({
            fieldName: 'QRZCOM_QSO_DOWNLOAD_STATUS',
            dataType: 'Enumeration',
            dataTypeIndicator: 'E',
            enumeration: 'QsoDownloadStatus',
        });
    }
}

module.exports = QRZCOM_QSO_DOWNLOAD_STATUS;

},{"./FieldDef":56}],126:[function(require,module,exports){
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

},{"./FieldDef":56}],127:[function(require,module,exports){
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

},{"./FieldDef":56}],128:[function(require,module,exports){
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

},{"./FieldDef":56}],129:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class QSLMSG_RCVD extends FieldDef {
    constructor() {
        super({
            fieldName: 'QSLMSG_RCVD',
            dataType: 'MultilineString',
            dataTypeIndicator: 'M',
        });
    }
}

module.exports = QSLMSG_RCVD;

},{"./FieldDef":56}],130:[function(require,module,exports){
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

},{"./FieldDef":56}],131:[function(require,module,exports){
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

},{"./FieldDef":56}],132:[function(require,module,exports){
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

},{"./FieldDef":56}],133:[function(require,module,exports){
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

},{"./FieldDef":56}],134:[function(require,module,exports){
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

},{"./FieldDef":56}],135:[function(require,module,exports){
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

},{"./FieldDef":56}],136:[function(require,module,exports){
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

},{"./FieldDef":56}],137:[function(require,module,exports){
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

},{"./FieldDef":56}],138:[function(require,module,exports){
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

},{"./FieldDef":56}],139:[function(require,module,exports){
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

},{"./FieldDef":56}],140:[function(require,module,exports){
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

},{"./FieldDef":56}],141:[function(require,module,exports){
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

},{"./FieldDef":56}],142:[function(require,module,exports){
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

},{"./FieldDef":56}],143:[function(require,module,exports){
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

},{"./FieldDef":56}],144:[function(require,module,exports){
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

},{"./FieldDef":56}],145:[function(require,module,exports){
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

},{"./FieldDef":56}],146:[function(require,module,exports){
'use strict';

const FieldDef = require('./FieldDef');

class RX_PWR extends FieldDef {
    constructor() {
        super({
            fieldName: 'RX_PWR',
            dataType: 'Number',
            dataTypeIndicator: 'N',
            check: value => parseFloat(value) >= 0,
            normalizer: value =>
                value
                        .replace(/^kw?$/i, '1000')
                        .replace(/T/gi, '0')
                        .replace(/A/gi, '1')
                        .replace(/U/gi, '2')
                        .replace(/V/gi, '3')
                        .replace(/E/gi, '5')
                        .replace(/G/gi, '7')
                        .replace(/D/gi, '8')
                        .replace(/N/gi, '9')
            ,
        });
    }
}

module.exports = RX_PWR;

},{"./FieldDef":56}],147:[function(require,module,exports){
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

},{"./FieldDef":56}],148:[function(require,module,exports){
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

},{"./FieldDef":56}],149:[function(require,module,exports){
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

},{"./FieldDef":56}],150:[function(require,module,exports){
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

},{"./FieldDef":56}],151:[function(require,module,exports){
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

},{"./FieldDef":56}],152:[function(require,module,exports){
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

},{"./FieldDef":56}],153:[function(require,module,exports){
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

},{"./FieldDef":56}],154:[function(require,module,exports){
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

},{"./FieldDef":56}],155:[function(require,module,exports){
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

},{"./FieldDef":56}],156:[function(require,module,exports){
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

},{"./FieldDef":56}],157:[function(require,module,exports){
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

},{"./FieldDef":56}],158:[function(require,module,exports){
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

},{"./FieldDef":56}],159:[function(require,module,exports){
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

},{"./FieldDef":56}],160:[function(require,module,exports){
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

},{"./FieldDef":56}],161:[function(require,module,exports){
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

},{"./FieldDef":56}],162:[function(require,module,exports){
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

},{"./FieldDef":56}],163:[function(require,module,exports){
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

},{"./FieldDef":56}],164:[function(require,module,exports){
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

},{"./FieldDef":56}],165:[function(require,module,exports){
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

},{"./FieldDef":56}],166:[function(require,module,exports){
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

},{"./FieldDef":56}],167:[function(require,module,exports){
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

},{"./FieldDef":56}],168:[function(require,module,exports){
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

},{"./FieldDef":56}],169:[function(require,module,exports){
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

},{"./FieldDef":56}],170:[function(require,module,exports){
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

},{"./FieldDef":56}],171:[function(require,module,exports){
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

},{"./FieldDef":56}],172:[function(require,module,exports){
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

},{"./ADDRESS":10,"./ADIF_VER":11,"./AGE":12,"./ALTITUDE":13,"./ANT_AZ":14,"./ANT_EL":15,"./ANT_PATH":16,"./ARRL_SECT":17,"./AWARD_GRANTED":18,"./AWARD_SUBMITTED":19,"./A_INDEX":20,"./BAND":21,"./BAND_RX":22,"./CALL":23,"./CHECK":24,"./CLASS":25,"./CLUBLOG_QSO_UPLOAD_DATE":26,"./CLUBLOG_QSO_UPLOAD_STATUS":27,"./CNTY":28,"./COMMENT":29,"./CONT":30,"./CONTACTED_OP":31,"./CONTEST_ID":32,"./COUNTRY":33,"./CQZ":34,"./CREATED_TIMESTAMP":35,"./CREDIT_GRANTED":36,"./CREDIT_SUBMITTED":37,"./DARC_DOK":38,"./DCL_QSLRDATE":39,"./DCL_QSLSDATE":40,"./DCL_QSL_RCVD":41,"./DCL_QSL_SENT":42,"./DISTANCE":43,"./DXCC":44,"./EMAIL":45,"./EQSL_QSLRDATE":46,"./EQSL_QSLSDATE":47,"./EQSL_QSL_RCVD":48,"./EQSL_QSL_SENT":49,"./EQ_CALL":50,"./FISTS":51,"./FISTS_CC":52,"./FORCE_INIT":53,"./FREQ":54,"./FREQ_RX":55,"./GRIDSQUARE":57,"./GRIDSQUARE_EXT":58,"./HAMLOGEU_QSO_UPLOAD_DATE":59,"./HAMLOGEU_QSO_UPLOAD_STATUS":60,"./HAMQTH_QSO_UPLOAD_DATE":61,"./HAMQTH_QSO_UPLOAD_STATUS":62,"./HRDLOG_QSO_UPLOAD_DATE":63,"./HRDLOG_QSO_UPLOAD_STATUS":64,"./IOTA":65,"./IOTA_ISLAND_ID":66,"./ITUZ":67,"./K_INDEX":68,"./LAT":69,"./LON":70,"./LOTW_QSLRDATE":71,"./LOTW_QSLSDATE":72,"./LOTW_QSL_RCVD":73,"./LOTW_QSL_SENT":74,"./MAX_BURSTS":75,"./MODE":76,"./MORSE_KEY_INFO":77,"./MORSE_KEY_TYPE":78,"./MS_SHOWER":79,"./MY_ALTITUDE":80,"./MY_ANTENNA":81,"./MY_ARRL_SECT":82,"./MY_CITY":83,"./MY_CNTY":84,"./MY_COUNTRY":85,"./MY_CQ_ZONE":86,"./MY_DARC_DOK":87,"./MY_DXCC":88,"./MY_FISTS":89,"./MY_GRIDSQUARE":90,"./MY_GRIDSQUARE_EXT":91,"./MY_IOTA":92,"./MY_IOTA_ISLAND_ID":93,"./MY_ITU_ZONE":94,"./MY_LAT":95,"./MY_LON":96,"./MY_MORSE_KEY_INFO":97,"./MY_MORSE_KEY_TYPE":98,"./MY_NAME":99,"./MY_POSTAL_CODE":100,"./MY_POTA_REF":101,"./MY_RIG":102,"./MY_SIG":103,"./MY_SIG_INFO":104,"./MY_SOTA_REF":105,"./MY_STATE":106,"./MY_STREET":107,"./MY_USACA_COUNTIES":108,"./MY_VUCC_GRIDS":109,"./MY_WWFF_REF":110,"./NAME":111,"./NOTES":112,"./NR_BURSTS":113,"./NR_PINGS":114,"./OPERATOR":115,"./OWNER_CALLSIGN":116,"./PFX":117,"./POTA_REF":118,"./PRECEDENCE":119,"./PROGRAMID":120,"./PROGRAMVERSION":121,"./PROP_MODE":122,"./PUBLIC_KEY":123,"./QRZCOM_QSO_DOWNLOAD_DATE":124,"./QRZCOM_QSO_DOWNLOAD_STATUS":125,"./QRZCOM_QSO_UPLOAD_DATE":126,"./QRZCOM_QSO_UPLOAD_STATUS":127,"./QSLMSG":128,"./QSLMSG_RCVD":129,"./QSLRDATE":130,"./QSLSDATE":131,"./QSL_RCVD":132,"./QSL_RCVD_VIA":133,"./QSL_SENT":134,"./QSL_SENT_VIA":135,"./QSL_VIA":136,"./QSO_COMPLETE":137,"./QSO_DATE":138,"./QSO_DATE_OFF":139,"./QSO_RANDOM":140,"./QTH":141,"./REGION":142,"./RIG":143,"./RST_RCVD":144,"./RST_SENT":145,"./RX_PWR":146,"./SAT_MODE":147,"./SAT_NAME":148,"./SFI":149,"./SIG":150,"./SIG_INFO":151,"./SILENT_KEY":152,"./SKCC":153,"./SOTA_REF":154,"./SRX":155,"./SRX_STRING":156,"./STATE":157,"./STATION_CALLSIGN":158,"./STX":159,"./STX_STRING":160,"./SUBMODE":161,"./SWL":162,"./TEN_TEN":163,"./TIME_OFF":164,"./TIME_ON":165,"./TX_PWR":166,"./UKSMG":167,"./USACA_COUNTIES":168,"./VUCC_GRIDS":169,"./WEB":170,"./WWFF_REF":171}],173:[function(require,module,exports){
'use strict';

// III.B.1 Ant Path Enumeration
module.exports = {
    'G': 'grayline',
    'O': 'other',
    'S': 'short path',
    'L': 'long path',
};

},{}],174:[function(require,module,exports){
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

},{}],175:[function(require,module,exports){
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
    "GH": "Golden Horseshoe",
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
    "NB": "New Brunswick",
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
    "NS": "Nova Scotia",
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
    "TER": "Territories",
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

},{}],176:[function(require,module,exports){
'use strict';

module.exports = {
    "2190M": { "lowerFreq": ".1357", "upperFreq": ".1378"},
    "630M": { "lowerFreq": ".472", "upperFreq": ".479"},
    "560M": { "lowerFreq": ".501", "upperFreq": ".504"},
    "160M": { "lowerFreq": "1.8", "upperFreq": "2.0"},
    "80M": { "lowerFreq": "3.5", "upperFreq": "4.0"},
    "60M": { "lowerFreq": "5.06", "upperFreq": "5.45"},
    "40M": { "lowerFreq": "7.0", "upperFreq": "7.3"},
    "30M": { "lowerFreq": "10.1", "upperFreq": "10.15"},
    "20M": { "lowerFreq": "14.0", "upperFreq": "14.35"},
    "17M": { "lowerFreq": "18.068", "upperFreq": "18.168"},
    "15M": { "lowerFreq": "21.0", "upperFreq": "21.45"},
    "12M": { "lowerFreq": "24.890", "upperFreq": "24.99"},
    "10M": { "lowerFreq": "28.0", "upperFreq": "29.7"},
    "8M": { "lowerFreq": "40", "upperFreq": "45"},
    "6M": { "lowerFreq": "50", "upperFreq": "54"},
    "5M": { "lowerFreq": "54.000001", "upperFreq": "69.9"},
    "4M": { "lowerFreq": "70", "upperFreq": "71"},
    "2M": { "lowerFreq": "144", "upperFreq": "148"},
    "1.25M": { "lowerFreq": "222", "upperFreq": "225"},
    "70CM": { "lowerFreq": "420", "upperFreq": "450"},
    "33CM": { "lowerFreq": "902", "upperFreq": "928"},
    "23CM": { "lowerFreq": "1240", "upperFreq": "1300"},
    "13CM": { "lowerFreq": "2300", "upperFreq": "2450"},
    "9CM": { "lowerFreq": "3300", "upperFreq": "3500"},
    "6CM": { "lowerFreq": "5650", "upperFreq": "5925"},
    "3CM": { "lowerFreq": "10000", "upperFreq": "10500"},
    "1.25CM": { "lowerFreq": "24000", "upperFreq": "24250"},
    "6MM": { "lowerFreq": "47000", "upperFreq": "47200"},
    "4MM": { "lowerFreq": "75500", "upperFreq": "81000"},
    "2.5MM": { "lowerFreq": "119980", "upperFreq": "123000"},
    "2MM": { "lowerFreq": "134000", "upperFreq": "149000"},
    "1MM": { "lowerFreq": "241000", "upperFreq": "250000"},
    "SUBMM": { "lowerFreq": "300000", "upperFreq": "7500000"},
};

},{}],177:[function(require,module,exports){
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
    "ARI-EME": "ARI Italian EME Trophy",
    "ARI-IAC-13CM": "ARI Italian Activity Contest (13cm+)",
    "ARI-IAC-23CM": "ARI Italian Activity Contest (23cm)",
    "ARI-IAC-6M": "ARI Italian Activity Contest (6m)",
    "ARI-IAC-UHF": "ARI Italian Activity Contest (UHF)",
    "ARI-IAC-VHF": "ARI Italian Activity Contest (VHF)",
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
    "DARC-FT4": "DARC FT4 Contest",
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
    "K1USN-SSO": "K1USN Slow Speed Open",
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
    "PCC": "PCCPro CW Contest",
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

},{}],178:[function(require,module,exports){
'use strict';

// III.B.6 Continent Enumeration
module.exports = {
    "NA":   "North America",
    "SA":   "South America",
    "EU":   "Europe",
    "AF":   "Africa",
    "OC":   "Oceania",
    "AS":   "Asia",
    "AN":   "Antarctica",
};

},{}],179:[function(require,module,exports){
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

},{}],180:[function(require,module,exports){
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
    "207": "RODRIGUES I.",
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
    "462": "REPUBLIC OF SOUTH AFRICA",
    "464": "NAMIBIA",
    "466": "SUDAN",
    "468": "KINGDOM OF ESWATINI",
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
    "502": "NORTH MACEDONIA (REPUBLIC OF)",
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
    "518": "SINT MAARTEN",
    "519": "SABA & ST. EUSTATIUS",
    "520": "BONAIRE",
    "521": "SOUTH SUDAN (REPUBLIC OF)",
    "522": "REPUBLIC OF KOSOVO",
};

},{}],181:[function(require,module,exports){
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

},{}],182:[function(require,module,exports){
'use strict';

module.exports = {
    "SK": "Straight Key",
    "SS": "Sideswiper",
    "BUG": "Mechanical semi-automatic keyer or Bug",
    "FAB": "Mechanical fully-automatic keyer or Bug",
    "SP": "Single Paddle",
    "DP": "Dual Paddle",
    "CPU": "Computer Driven",
};

},{}],183:[function(require,module,exports){
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

},{}],184:[function(require,module,exports){
'use strict';

module.exports = {
    "CARD": "QSO confirmation via paper QSL card",
    "EQSL": "QSO confirmation via eQSL.cc",
    "LOTW": "QSO confirmation via ARRL Logbook of the World",
};

},{}],185:[function(require,module,exports){
'use strict';

module.exports = {
    "Y": "yes (confirmed)",
    "N": "no",
    "R": "requested",
    "I": "ignore or invalid",
    "V": "verified",
};

},{}],186:[function(require,module,exports){
'use strict';

module.exports = {
    "Y": "yes",
    "N": "no",
    "R": "requested",
    "Q": "queued",
    "I": "ignore or invalid",
};

},{}],187:[function(require,module,exports){
'use strict';

module.exports = {
    "B": "bureau",
    "D": "direct",
    "E": "electronic",
    "M": "manager",
};

},{}],188:[function(require,module,exports){
'use strict';

// III.B.18 QSO Complete Enumeration
module.exports = {
    'Y':    'yes',
    'N':    'no',
    'NIL':  'not heard',
    '?':    'uncertain',
};

},{}],189:[function(require,module,exports){
'use strict';

module.exports = {
    "Y": "the QSO has been downloaded from the online service",
    "N": "the QSO has not been downloaded from the online service",
    "I": "ignore or invalid",
};

},{}],190:[function(require,module,exports){
'use strict';

// III.B.19 QSO Upload Status Enumeration
module.exports = {
    "Y":    "the QSO has been uploaded to, and accepted by, the online service",
    "N":    "do not upload the QSO to the online service",
    "M":    "the QSO has been modified since being uploaded to the online service",
};

},{}],191:[function(require,module,exports){
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

},{}],192:[function(require,module,exports){
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
const MorseKeyType = require('./MorseKeyType');
const PropagationMode = require('./PropagationMode');
const QslMedium = require('./QslMedium');
const QslRcvd = require('./QslRcvd');
const QslSent = require('./QslSent');
const QslVia = require('./QslVia');
const QsoComplete = require('./QsoComplete');
const QsoDownloadStatus = require('./QsoDownloadStatus');
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
    MorseKeyType,
    PropagationMode,
    QslMedium,
    QslRcvd,
    QslSent,
    QslVia,
    QsoComplete,
    QsoDownloadStatus,
    QsoUploadStatus,
    Region,
};

},{"./AntPath":173,"./AppTcadifKey":174,"./ArrlSection":175,"./Band":176,"./ContestID":177,"./Continent":178,"./Credit":179,"./Dxcc":180,"./Mode":181,"./MorseKeyType":182,"./PropagationMode":183,"./QslMedium":184,"./QslRcvd":185,"./QslSent":186,"./QslVia":187,"./QsoComplete":188,"./QsoDownloadStatus":189,"./QsoUploadStatus":190,"./Region":191}],193:[function(require,module,exports){
'use strict';

const { Transform } = require('stream');

class Filter extends Transform {

    constructor(fn = () => true) {
        super({
            readableObjectMode: true,
            writableObjectMode: true
        });

        this.filterfn = fn;
    }

    _transform(chunk, encoding, next) {
        if (this.filterfn(chunk)) {
            return next(null, chunk);
        }

        next();
    }

}

module.exports = Filter;

},{"stream":206}],194:[function(require,module,exports){
'use strict';

const { Transform } = require('stream');

class Map extends Transform {

    constructor(fn = () => true) {
        super({
            readableObjectMode: true,
            writableObjectMode: true
        });

        this.mapfn = fn;
    }

    _transform(chunk, encoding, next) {
        return next(null, this.mapfn(chunk));
    }

}

module.exports = Map;

},{"stream":206}],195:[function(require,module,exports){
'use strict';

const Filter = require('./Filter');
const Map = require('./Map');
module.exports = { Filter, Map };

},{"./Filter":193,"./Map":194}],196:[function(require,module,exports){
'use strict';

class Timestamper {

    static CREATED_TIMESTAMP(now = new Date()) {
        const YYYY = `${now.getUTCFullYear()}`.padStart(4, '0');
        const MM = `${now.getUTCMonth() + 1}`.padStart(2, '0');
        const DD = `${now.getUTCDate()}`.padStart(2, '0');

        const HH = `${now.getUTCHours()}`.padStart(2, '0');
        const mm = `${now.getUTCMinutes()}`.padStart(2, '0');
        const ss = `${now.getUTCSeconds()}`.padStart(2, '0');

        return `${YYYY}${MM}${DD} ${HH}${mm}${ss}`;
    }

}

module.exports = Timestamper;

},{}],197:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],198:[function(require,module,exports){

},{}],199:[function(require,module,exports){
(function (Buffer){(function (){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this)}).call(this,require("buffer").Buffer)
},{"base64-js":197,"buffer":199,"ieee754":201}],200:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };

    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}

},{}],201:[function(require,module,exports){
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],202:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}

},{}],203:[function(require,module,exports){
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

},{}],204:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],205:[function(require,module,exports){
/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
/* eslint-disable node/no-deprecated-api */
var buffer = require('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.prototype = Object.create(Buffer.prototype)

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}

},{"buffer":199}],206:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = require('events').EventEmitter;
var inherits = require('inherits');

inherits(Stream, EE);
Stream.Readable = require('readable-stream/lib/_stream_readable.js');
Stream.Writable = require('readable-stream/lib/_stream_writable.js');
Stream.Duplex = require('readable-stream/lib/_stream_duplex.js');
Stream.Transform = require('readable-stream/lib/_stream_transform.js');
Stream.PassThrough = require('readable-stream/lib/_stream_passthrough.js');
Stream.finished = require('readable-stream/lib/internal/streams/end-of-stream.js')
Stream.pipeline = require('readable-stream/lib/internal/streams/pipeline.js')

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"events":200,"inherits":202,"readable-stream/lib/_stream_duplex.js":208,"readable-stream/lib/_stream_passthrough.js":209,"readable-stream/lib/_stream_readable.js":210,"readable-stream/lib/_stream_transform.js":211,"readable-stream/lib/_stream_writable.js":212,"readable-stream/lib/internal/streams/end-of-stream.js":216,"readable-stream/lib/internal/streams/pipeline.js":218}],207:[function(require,module,exports){
'use strict';

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var codes = {};

function createErrorType(code, message, Base) {
  if (!Base) {
    Base = Error;
  }

  function getMessage(arg1, arg2, arg3) {
    if (typeof message === 'string') {
      return message;
    } else {
      return message(arg1, arg2, arg3);
    }
  }

  var NodeError =
  /*#__PURE__*/
  function (_Base) {
    _inheritsLoose(NodeError, _Base);

    function NodeError(arg1, arg2, arg3) {
      return _Base.call(this, getMessage(arg1, arg2, arg3)) || this;
    }

    return NodeError;
  }(Base);

  NodeError.prototype.name = Base.name;
  NodeError.prototype.code = code;
  codes[code] = NodeError;
} // https://github.com/nodejs/node/blob/v10.8.0/lib/internal/errors.js


function oneOf(expected, thing) {
  if (Array.isArray(expected)) {
    var len = expected.length;
    expected = expected.map(function (i) {
      return String(i);
    });

    if (len > 2) {
      return "one of ".concat(thing, " ").concat(expected.slice(0, len - 1).join(', '), ", or ") + expected[len - 1];
    } else if (len === 2) {
      return "one of ".concat(thing, " ").concat(expected[0], " or ").concat(expected[1]);
    } else {
      return "of ".concat(thing, " ").concat(expected[0]);
    }
  } else {
    return "of ".concat(thing, " ").concat(String(expected));
  }
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith


function startsWith(str, search, pos) {
  return str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith


function endsWith(str, search, this_len) {
  if (this_len === undefined || this_len > str.length) {
    this_len = str.length;
  }

  return str.substring(this_len - search.length, this_len) === search;
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes


function includes(str, search, start) {
  if (typeof start !== 'number') {
    start = 0;
  }

  if (start + search.length > str.length) {
    return false;
  } else {
    return str.indexOf(search, start) !== -1;
  }
}

createErrorType('ERR_INVALID_OPT_VALUE', function (name, value) {
  return 'The value "' + value + '" is invalid for option "' + name + '"';
}, TypeError);
createErrorType('ERR_INVALID_ARG_TYPE', function (name, expected, actual) {
  // determiner: 'must be' or 'must not be'
  var determiner;

  if (typeof expected === 'string' && startsWith(expected, 'not ')) {
    determiner = 'must not be';
    expected = expected.replace(/^not /, '');
  } else {
    determiner = 'must be';
  }

  var msg;

  if (endsWith(name, ' argument')) {
    // For cases like 'first argument'
    msg = "The ".concat(name, " ").concat(determiner, " ").concat(oneOf(expected, 'type'));
  } else {
    var type = includes(name, '.') ? 'property' : 'argument';
    msg = "The \"".concat(name, "\" ").concat(type, " ").concat(determiner, " ").concat(oneOf(expected, 'type'));
  }

  msg += ". Received type ".concat(typeof actual);
  return msg;
}, TypeError);
createErrorType('ERR_STREAM_PUSH_AFTER_EOF', 'stream.push() after EOF');
createErrorType('ERR_METHOD_NOT_IMPLEMENTED', function (name) {
  return 'The ' + name + ' method is not implemented';
});
createErrorType('ERR_STREAM_PREMATURE_CLOSE', 'Premature close');
createErrorType('ERR_STREAM_DESTROYED', function (name) {
  return 'Cannot call ' + name + ' after a stream was destroyed';
});
createErrorType('ERR_MULTIPLE_CALLBACK', 'Callback called multiple times');
createErrorType('ERR_STREAM_CANNOT_PIPE', 'Cannot pipe, not readable');
createErrorType('ERR_STREAM_WRITE_AFTER_END', 'write after end');
createErrorType('ERR_STREAM_NULL_VALUES', 'May not write null values to stream', TypeError);
createErrorType('ERR_UNKNOWN_ENCODING', function (arg) {
  return 'Unknown encoding: ' + arg;
}, TypeError);
createErrorType('ERR_STREAM_UNSHIFT_AFTER_END_EVENT', 'stream.unshift() after end event');
module.exports.codes = codes;

},{}],208:[function(require,module,exports){
(function (process){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

'use strict';

/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
};
/*</replacement>*/

module.exports = Duplex;
var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');
require('inherits')(Duplex, Readable);
{
  // Allow the keys array to be GC'ed.
  var keys = objectKeys(Writable.prototype);
  for (var v = 0; v < keys.length; v++) {
    var method = keys[v];
    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
  }
}
function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);
  Readable.call(this, options);
  Writable.call(this, options);
  this.allowHalfOpen = true;
  if (options) {
    if (options.readable === false) this.readable = false;
    if (options.writable === false) this.writable = false;
    if (options.allowHalfOpen === false) {
      this.allowHalfOpen = false;
      this.once('end', onend);
    }
  }
}
Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.highWaterMark;
  }
});
Object.defineProperty(Duplex.prototype, 'writableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState && this._writableState.getBuffer();
  }
});
Object.defineProperty(Duplex.prototype, 'writableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.length;
  }
});

// the no-half-open enforcer
function onend() {
  // If the writable side ended, then we're ok.
  if (this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  process.nextTick(onEndNT, this);
}
function onEndNT(self) {
  self.end();
}
Object.defineProperty(Duplex.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }
    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});
}).call(this)}).call(this,require('_process'))
},{"./_stream_readable":210,"./_stream_writable":212,"_process":204,"inherits":202}],209:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

'use strict';

module.exports = PassThrough;
var Transform = require('./_stream_transform');
require('inherits')(PassThrough, Transform);
function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);
  Transform.call(this, options);
}
PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};
},{"./_stream_transform":211,"inherits":202}],210:[function(require,module,exports){
(function (process,global){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

module.exports = Readable;

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = require('events').EventEmitter;
var EElistenerCount = function EElistenerCount(emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

var Buffer = require('buffer').Buffer;
var OurUint8Array = (typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : {}).Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*<replacement>*/
var debugUtil = require('util');
var debug;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function debug() {};
}
/*</replacement>*/

var BufferList = require('./internal/streams/buffer_list');
var destroyImpl = require('./internal/streams/destroy');
var _require = require('./internal/streams/state'),
  getHighWaterMark = _require.getHighWaterMark;
var _require$codes = require('../errors').codes,
  ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
  ERR_STREAM_PUSH_AFTER_EOF = _require$codes.ERR_STREAM_PUSH_AFTER_EOF,
  ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
  ERR_STREAM_UNSHIFT_AFTER_END_EVENT = _require$codes.ERR_STREAM_UNSHIFT_AFTER_END_EVENT;

// Lazy loaded to improve the startup performance.
var StringDecoder;
var createReadableStreamAsyncIterator;
var from;
require('inherits')(Readable, Stream);
var errorOrDestroy = destroyImpl.errorOrDestroy;
var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];
function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);

  // This is a hack to make sure that our error handler is attached before any
  // userland ones.  NEVER DO THIS. This is here only because this code needs
  // to continue to work with older versions of Node.js that do not include
  // the prependListener() method. The goal is to eventually remove this hack.
  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (Array.isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
}
function ReadableState(options, stream, isDuplex) {
  Duplex = Duplex || require('./_stream_duplex');
  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex;

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;
  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  this.highWaterMark = getHighWaterMark(this, options, 'readableHighWaterMark', isDuplex);

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;
  this.paused = true;

  // Should close be emitted on destroy. Defaults to true.
  this.emitClose = options.emitClose !== false;

  // Should .destroy() be called after 'end' (and potentially 'finish')
  this.autoDestroy = !!options.autoDestroy;

  // has it been destroyed
  this.destroyed = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;
  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}
function Readable(options) {
  Duplex = Duplex || require('./_stream_duplex');
  if (!(this instanceof Readable)) return new Readable(options);

  // Checking for a Stream.Duplex instance is faster here instead of inside
  // the ReadableState constructor, at least with V8 6.5
  var isDuplex = this instanceof Duplex;
  this._readableState = new ReadableState(options, this, isDuplex);

  // legacy
  this.readable = true;
  if (options) {
    if (typeof options.read === 'function') this._read = options.read;
    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }
  Stream.call(this);
}
Object.defineProperty(Readable.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._readableState === undefined) {
      return false;
    }
    return this._readableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
  }
});
Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;
Readable.prototype._destroy = function (err, cb) {
  cb(err);
};

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;
  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;
      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }
      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }
  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};
function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  debug('readableAddChunk', chunk);
  var state = stream._readableState;
  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
    if (er) {
      errorOrDestroy(stream, er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }
      if (addToFront) {
        if (state.endEmitted) errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF());
      } else if (state.destroyed) {
        return false;
      } else {
        state.reading = false;
        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
      maybeReadMore(stream, state);
    }
  }

  // We can push more data if we are below the highWaterMark.
  // Also, if we have no data yet, we can stand some more bytes.
  // This is to work around cases where hwm=0, such as the repl.
  return !state.ended && (state.length < state.highWaterMark || state.length === 0);
}
function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    state.awaitDrain = 0;
    stream.emit('data', chunk);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);
    if (state.needReadable) emitReadable(stream);
  }
  maybeReadMore(stream, state);
}
function chunkInvalid(state, chunk) {
  var er;
  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer', 'Uint8Array'], chunk);
  }
  return er;
}
Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
  var decoder = new StringDecoder(enc);
  this._readableState.decoder = decoder;
  // If setEncoding(null), decoder.encoding equals utf8
  this._readableState.encoding = this._readableState.decoder.encoding;

  // Iterate over current buffer to convert already stored Buffers:
  var p = this._readableState.buffer.head;
  var content = '';
  while (p !== null) {
    content += decoder.write(p.data);
    p = p.next;
  }
  this._readableState.buffer.clear();
  if (content !== '') this._readableState.buffer.push(content);
  this._readableState.length = content.length;
  return this;
};

// Don't raise the hwm > 1GB
var MAX_HWM = 0x40000000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    // TODO(ronag): Throw ERR_VALUE_OUT_OF_RANGE.
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;
  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }
  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }
  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;
  if (ret === null) {
    state.needReadable = state.length <= state.highWaterMark;
    n = 0;
  } else {
    state.length -= n;
    state.awaitDrain = 0;
  }
  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }
  if (ret !== null) this.emit('data', ret);
  return ret;
};
function onEofChunk(stream, state) {
  debug('onEofChunk');
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;
  if (state.sync) {
    // if we are sync, wait until next tick to emit the data.
    // Otherwise we risk emitting data in the flow()
    // the readable code triggers during a read() call
    emitReadable(stream);
  } else {
    // emit 'readable' now to make sure it gets picked up.
    state.needReadable = false;
    if (!state.emittedReadable) {
      state.emittedReadable = true;
      emitReadable_(stream);
    }
  }
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  debug('emitReadable', state.needReadable, state.emittedReadable);
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    process.nextTick(emitReadable_, stream);
  }
}
function emitReadable_(stream) {
  var state = stream._readableState;
  debug('emitReadable_', state.destroyed, state.length, state.ended);
  if (!state.destroyed && (state.length || state.ended)) {
    stream.emit('readable');
    state.emittedReadable = false;
  }

  // The stream needs another readable event if
  // 1. It is not flowing, as the flow mechanism will take
  //    care of it.
  // 2. It is not ended.
  // 3. It is below the highWaterMark, so we can schedule
  //    another readable later.
  state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    process.nextTick(maybeReadMore_, stream, state);
  }
}
function maybeReadMore_(stream, state) {
  // Attempt to read more data if we should.
  //
  // The conditions for reading more data are (one of):
  // - Not enough data buffered (state.length < state.highWaterMark). The loop
  //   is responsible for filling the buffer with enough data if such data
  //   is available. If highWaterMark is 0 and we are not in the flowing mode
  //   we should _not_ attempt to buffer any extra data. We'll get more data
  //   when the stream consumer calls read() instead.
  // - No data in the buffer, and the stream is in flowing mode. In this mode
  //   the loop below is responsible for ensuring read() is called. Failing to
  //   call read here would abort the flow and there's no other mechanism for
  //   continuing the flow if the stream consumer has just subscribed to the
  //   'data' event.
  //
  // In addition to the above conditions to keep reading data, the following
  // conditions prevent the data from being read:
  // - The stream has ended (state.ended).
  // - There is already a pending 'read' operation (state.reading). This is a
  //   case where the the stream has called the implementation defined _read()
  //   method, but they are processing the call asynchronously and have _not_
  //   called push() with new data. In this case we skip performing more
  //   read()s. The execution ends in this method again after the _read() ends
  //   up calling push() with more data.
  while (!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0)) {
    var len = state.length;
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  errorOrDestroy(this, new ERR_METHOD_NOT_IMPLEMENTED('_read()'));
};
Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;
  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);
  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) process.nextTick(endFn);else src.once('end', endFn);
  dest.on('unpipe', onunpipe);
  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');
    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }
  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);
  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);
    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    var ret = dest.write(chunk);
    debug('dest.write', ret);
    if (ret === false) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', state.awaitDrain);
        state.awaitDrain++;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) errorOrDestroy(dest, er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);
  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }
  return dest;
};
function pipeOnDrain(src) {
  return function pipeOnDrainFunctionResult() {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}
Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = {
    hasUnpiped: false
  };

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;
    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    for (var i = 0; i < len; i++) dests[i].emit('unpipe', this, {
      hasUnpiped: false
    });
    return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;
  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];
  dest.emit('unpipe', this, unpipeInfo);
  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);
  var state = this._readableState;
  if (ev === 'data') {
    // update readableListening so that resume() may be a no-op
    // a few lines down. This is needed to support once('readable').
    state.readableListening = this.listenerCount('readable') > 0;

    // Try start flowing on next tick if stream isn't explicitly paused
    if (state.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.flowing = false;
      state.emittedReadable = false;
      debug('on readable', state.length, state.reading);
      if (state.length) {
        emitReadable(this);
      } else if (!state.reading) {
        process.nextTick(nReadingNextTick, this);
      }
    }
  }
  return res;
};
Readable.prototype.addListener = Readable.prototype.on;
Readable.prototype.removeListener = function (ev, fn) {
  var res = Stream.prototype.removeListener.call(this, ev, fn);
  if (ev === 'readable') {
    // We need to check if there is someone still listening to
    // readable and reset the state. However this needs to happen
    // after readable has been emitted but before I/O (nextTick) to
    // support once('readable', fn) cycles. This means that calling
    // resume within the same tick will have no
    // effect.
    process.nextTick(updateReadableListening, this);
  }
  return res;
};
Readable.prototype.removeAllListeners = function (ev) {
  var res = Stream.prototype.removeAllListeners.apply(this, arguments);
  if (ev === 'readable' || ev === undefined) {
    // We need to check if there is someone still listening to
    // readable and reset the state. However this needs to happen
    // after readable has been emitted but before I/O (nextTick) to
    // support once('readable', fn) cycles. This means that calling
    // resume within the same tick will have no
    // effect.
    process.nextTick(updateReadableListening, this);
  }
  return res;
};
function updateReadableListening(self) {
  var state = self._readableState;
  state.readableListening = self.listenerCount('readable') > 0;
  if (state.resumeScheduled && !state.paused) {
    // flowing needs to be set to true now, otherwise
    // the upcoming resume will not flow.
    state.flowing = true;

    // crude way to check if we should resume
  } else if (self.listenerCount('data') > 0) {
    self.resume();
  }
}
function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    // we flow only if there is no one listening
    // for readable, but we still have to call
    // resume()
    state.flowing = !state.readableListening;
    resume(this, state);
  }
  state.paused = false;
  return this;
};
function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    process.nextTick(resume_, stream, state);
  }
}
function resume_(stream, state) {
  debug('resume', state.reading);
  if (!state.reading) {
    stream.read(0);
  }
  state.resumeScheduled = false;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}
Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (this._readableState.flowing !== false) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  this._readableState.paused = true;
  return this;
};
function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null);
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var _this = this;
  var state = this._readableState;
  var paused = false;
  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) _this.push(chunk);
    }
    _this.push(null);
  });
  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;
    var ret = _this.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function methodWrap(method) {
        return function methodWrapReturnFunction() {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
  }

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  this._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };
  return this;
};
if (typeof Symbol === 'function') {
  Readable.prototype[Symbol.asyncIterator] = function () {
    if (createReadableStreamAsyncIterator === undefined) {
      createReadableStreamAsyncIterator = require('./internal/streams/async_iterator');
    }
    return createReadableStreamAsyncIterator(this);
  };
}
Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.highWaterMark;
  }
});
Object.defineProperty(Readable.prototype, 'readableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState && this._readableState.buffer;
  }
});
Object.defineProperty(Readable.prototype, 'readableFlowing', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.flowing;
  },
  set: function set(state) {
    if (this._readableState) {
      this._readableState.flowing = state;
    }
  }
});

// exposed for testing purposes only.
Readable._fromList = fromList;
Object.defineProperty(Readable.prototype, 'readableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.length;
  }
});

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;
  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.first();else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = state.buffer.consume(n, state.decoder);
  }
  return ret;
}
function endReadable(stream) {
  var state = stream._readableState;
  debug('endReadable', state.endEmitted);
  if (!state.endEmitted) {
    state.ended = true;
    process.nextTick(endReadableNT, state, stream);
  }
}
function endReadableNT(state, stream) {
  debug('endReadableNT', state.endEmitted, state.length);

  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
    if (state.autoDestroy) {
      // In case of duplex streams we need a way to detect
      // if the writable side is ready for autoDestroy as well
      var wState = stream._writableState;
      if (!wState || wState.autoDestroy && wState.finished) {
        stream.destroy();
      }
    }
  }
}
if (typeof Symbol === 'function') {
  Readable.from = function (iterable, opts) {
    if (from === undefined) {
      from = require('./internal/streams/from');
    }
    return from(Readable, iterable, opts);
  };
}
function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}
}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../errors":207,"./_stream_duplex":208,"./internal/streams/async_iterator":213,"./internal/streams/buffer_list":214,"./internal/streams/destroy":215,"./internal/streams/from":217,"./internal/streams/state":219,"./internal/streams/stream":220,"_process":204,"buffer":199,"events":200,"inherits":202,"string_decoder/":221,"util":198}],211:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

'use strict';

module.exports = Transform;
var _require$codes = require('../errors').codes,
  ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
  ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
  ERR_TRANSFORM_ALREADY_TRANSFORMING = _require$codes.ERR_TRANSFORM_ALREADY_TRANSFORMING,
  ERR_TRANSFORM_WITH_LENGTH_0 = _require$codes.ERR_TRANSFORM_WITH_LENGTH_0;
var Duplex = require('./_stream_duplex');
require('inherits')(Transform, Duplex);
function afterTransform(er, data) {
  var ts = this._transformState;
  ts.transforming = false;
  var cb = ts.writecb;
  if (cb === null) {
    return this.emit('error', new ERR_MULTIPLE_CALLBACK());
  }
  ts.writechunk = null;
  ts.writecb = null;
  if (data != null)
    // single equals check for both `null` and `undefined`
    this.push(data);
  cb(er);
  var rs = this._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    this._read(rs.highWaterMark);
  }
}
function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);
  Duplex.call(this, options);
  this._transformState = {
    afterTransform: afterTransform.bind(this),
    needTransform: false,
    transforming: false,
    writecb: null,
    writechunk: null,
    writeencoding: null
  };

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;
  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;
    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.on('prefinish', prefinish);
}
function prefinish() {
  var _this = this;
  if (typeof this._flush === 'function' && !this._readableState.destroyed) {
    this._flush(function (er, data) {
      done(_this, er, data);
    });
  } else {
    done(this, null, null);
  }
}
Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  cb(new ERR_METHOD_NOT_IMPLEMENTED('_transform()'));
};
Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;
  if (ts.writechunk !== null && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};
Transform.prototype._destroy = function (err, cb) {
  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
  });
};
function done(stream, er, data) {
  if (er) return stream.emit('error', er);
  if (data != null)
    // single equals check for both `null` and `undefined`
    stream.push(data);

  // TODO(BridgeAR): Write a test for these two error cases
  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  if (stream._writableState.length) throw new ERR_TRANSFORM_WITH_LENGTH_0();
  if (stream._transformState.transforming) throw new ERR_TRANSFORM_ALREADY_TRANSFORMING();
  return stream.push(null);
}
},{"../errors":207,"./_stream_duplex":208,"inherits":202}],212:[function(require,module,exports){
(function (process,global){(function (){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.

'use strict';

module.exports = Writable;

/* <replacement> */
function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;
  this.next = null;
  this.entry = null;
  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/
var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var internalUtil = {
  deprecate: require('util-deprecate')
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

var Buffer = require('buffer').Buffer;
var OurUint8Array = (typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : {}).Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}
var destroyImpl = require('./internal/streams/destroy');
var _require = require('./internal/streams/state'),
  getHighWaterMark = _require.getHighWaterMark;
var _require$codes = require('../errors').codes,
  ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
  ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
  ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
  ERR_STREAM_CANNOT_PIPE = _require$codes.ERR_STREAM_CANNOT_PIPE,
  ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED,
  ERR_STREAM_NULL_VALUES = _require$codes.ERR_STREAM_NULL_VALUES,
  ERR_STREAM_WRITE_AFTER_END = _require$codes.ERR_STREAM_WRITE_AFTER_END,
  ERR_UNKNOWN_ENCODING = _require$codes.ERR_UNKNOWN_ENCODING;
var errorOrDestroy = destroyImpl.errorOrDestroy;
require('inherits')(Writable, Stream);
function nop() {}
function WritableState(options, stream, isDuplex) {
  Duplex = Duplex || require('./_stream_duplex');
  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream,
  // e.g. options.readableObjectMode vs. options.writableObjectMode, etc.
  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex;

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;
  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  this.highWaterMark = getHighWaterMark(this, options, 'writableHighWaterMark', isDuplex);

  // if _final has been called
  this.finalCalled = false;

  // drain event flag.
  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // has it been destroyed
  this.destroyed = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;
  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // Should close be emitted on destroy. Defaults to true.
  this.emitClose = options.emitClose !== false;

  // Should .destroy() be called after 'finish' (and potentially 'end')
  this.autoDestroy = !!options.autoDestroy;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}
WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};
(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function writableStateBufferGetter() {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})();

// Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.
var realHasInstance;
if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function value(object) {
      if (realHasInstance.call(this, object)) return true;
      if (this !== Writable) return false;
      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function realHasInstance(object) {
    return object instanceof this;
  };
}
function Writable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.

  // Checking for a Stream.Duplex instance is faster here instead of inside
  // the WritableState constructor, at least with V8 6.5
  var isDuplex = this instanceof Duplex;
  if (!isDuplex && !realHasInstance.call(Writable, this)) return new Writable(options);
  this._writableState = new WritableState(options, this, isDuplex);

  // legacy.
  this.writable = true;
  if (options) {
    if (typeof options.write === 'function') this._write = options.write;
    if (typeof options.writev === 'function') this._writev = options.writev;
    if (typeof options.destroy === 'function') this._destroy = options.destroy;
    if (typeof options.final === 'function') this._final = options.final;
  }
  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
};
function writeAfterEnd(stream, cb) {
  var er = new ERR_STREAM_WRITE_AFTER_END();
  // TODO: defer error events consistently everywhere, not just the cb
  errorOrDestroy(stream, er);
  process.nextTick(cb, er);
}

// Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.
function validChunk(stream, state, chunk, cb) {
  var er;
  if (chunk === null) {
    er = new ERR_STREAM_NULL_VALUES();
  } else if (typeof chunk !== 'string' && !state.objectMode) {
    er = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer'], chunk);
  }
  if (er) {
    errorOrDestroy(stream, er);
    process.nextTick(cb, er);
    return false;
  }
  return true;
}
Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;
  var isBuf = !state.objectMode && _isUint8Array(chunk);
  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }
  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }
  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;
  if (typeof cb !== 'function') cb = nop;
  if (state.ending) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }
  return ret;
};
Writable.prototype.cork = function () {
  this._writableState.corked++;
};
Writable.prototype.uncork = function () {
  var state = this._writableState;
  if (state.corked) {
    state.corked--;
    if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};
Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new ERR_UNKNOWN_ENCODING(encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};
Object.defineProperty(Writable.prototype, 'writableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState && this._writableState.getBuffer();
  }
});
function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }
  return chunk;
}
Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.highWaterMark;
  }
});

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);
    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }
  var len = state.objectMode ? 1 : chunk.length;
  state.length += len;
  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;
  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }
  return ret;
}
function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (state.destroyed) state.onwrite(new ERR_STREAM_DESTROYED('write'));else if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}
function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;
  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    process.nextTick(cb, er);
    // this can emit finish, and it will always happen
    // after error
    process.nextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    errorOrDestroy(stream, er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    errorOrDestroy(stream, er);
    // this can emit finish, but finish must
    // always follow error
    finishMaybe(stream, state);
  }
}
function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}
function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;
  if (typeof cb !== 'function') throw new ERR_MULTIPLE_CALLBACK();
  onwriteStateUpdate(state);
  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state) || stream.destroyed;
    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }
    if (sync) {
      process.nextTick(afterWrite, stream, state, finished, cb);
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}
function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;
  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;
    var count = 0;
    var allBuffers = true;
    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }
    buffer.allBuffers = allBuffers;
    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
    state.bufferedRequestCount = 0;
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;
      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      state.bufferedRequestCount--;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }
    if (entry === null) state.lastBufferedRequest = null;
  }
  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}
Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new ERR_METHOD_NOT_IMPLEMENTED('_write()'));
};
Writable.prototype._writev = null;
Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;
  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }
  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending) endWritable(this, state, cb);
  return this;
};
Object.defineProperty(Writable.prototype, 'writableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.length;
  }
});
function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}
function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;
    if (err) {
      errorOrDestroy(stream, err);
    }
    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}
function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function' && !state.destroyed) {
      state.pendingcb++;
      state.finalCalled = true;
      process.nextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}
function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    prefinish(stream, state);
    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');
      if (state.autoDestroy) {
        // In case of duplex streams we need a way to detect
        // if the readable side is ready for autoDestroy as well
        var rState = stream._readableState;
        if (!rState || rState.autoDestroy && rState.endEmitted) {
          stream.destroy();
        }
      }
    }
  }
  return need;
}
function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) process.nextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}
function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;
  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  }

  // reuse the free corkReq.
  state.corkedRequestsFree.next = corkReq;
}
Object.defineProperty(Writable.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._writableState === undefined) {
      return false;
    }
    return this._writableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._writableState.destroyed = value;
  }
});
Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;
Writable.prototype._destroy = function (err, cb) {
  cb(err);
};
}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../errors":207,"./_stream_duplex":208,"./internal/streams/destroy":215,"./internal/streams/state":219,"./internal/streams/stream":220,"_process":204,"buffer":199,"inherits":202,"util-deprecate":222}],213:[function(require,module,exports){
(function (process){(function (){
'use strict';

var _Object$setPrototypeO;
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var finished = require('./end-of-stream');
var kLastResolve = Symbol('lastResolve');
var kLastReject = Symbol('lastReject');
var kError = Symbol('error');
var kEnded = Symbol('ended');
var kLastPromise = Symbol('lastPromise');
var kHandlePromise = Symbol('handlePromise');
var kStream = Symbol('stream');
function createIterResult(value, done) {
  return {
    value: value,
    done: done
  };
}
function readAndResolve(iter) {
  var resolve = iter[kLastResolve];
  if (resolve !== null) {
    var data = iter[kStream].read();
    // we defer if data is null
    // we can be expecting either 'end' or
    // 'error'
    if (data !== null) {
      iter[kLastPromise] = null;
      iter[kLastResolve] = null;
      iter[kLastReject] = null;
      resolve(createIterResult(data, false));
    }
  }
}
function onReadable(iter) {
  // we wait for the next tick, because it might
  // emit an error with process.nextTick
  process.nextTick(readAndResolve, iter);
}
function wrapForNext(lastPromise, iter) {
  return function (resolve, reject) {
    lastPromise.then(function () {
      if (iter[kEnded]) {
        resolve(createIterResult(undefined, true));
        return;
      }
      iter[kHandlePromise](resolve, reject);
    }, reject);
  };
}
var AsyncIteratorPrototype = Object.getPrototypeOf(function () {});
var ReadableStreamAsyncIteratorPrototype = Object.setPrototypeOf((_Object$setPrototypeO = {
  get stream() {
    return this[kStream];
  },
  next: function next() {
    var _this = this;
    // if we have detected an error in the meanwhile
    // reject straight away
    var error = this[kError];
    if (error !== null) {
      return Promise.reject(error);
    }
    if (this[kEnded]) {
      return Promise.resolve(createIterResult(undefined, true));
    }
    if (this[kStream].destroyed) {
      // We need to defer via nextTick because if .destroy(err) is
      // called, the error will be emitted via nextTick, and
      // we cannot guarantee that there is no error lingering around
      // waiting to be emitted.
      return new Promise(function (resolve, reject) {
        process.nextTick(function () {
          if (_this[kError]) {
            reject(_this[kError]);
          } else {
            resolve(createIterResult(undefined, true));
          }
        });
      });
    }

    // if we have multiple next() calls
    // we will wait for the previous Promise to finish
    // this logic is optimized to support for await loops,
    // where next() is only called once at a time
    var lastPromise = this[kLastPromise];
    var promise;
    if (lastPromise) {
      promise = new Promise(wrapForNext(lastPromise, this));
    } else {
      // fast path needed to support multiple this.push()
      // without triggering the next() queue
      var data = this[kStream].read();
      if (data !== null) {
        return Promise.resolve(createIterResult(data, false));
      }
      promise = new Promise(this[kHandlePromise]);
    }
    this[kLastPromise] = promise;
    return promise;
  }
}, _defineProperty(_Object$setPrototypeO, Symbol.asyncIterator, function () {
  return this;
}), _defineProperty(_Object$setPrototypeO, "return", function _return() {
  var _this2 = this;
  // destroy(err, cb) is a private API
  // we can guarantee we have that here, because we control the
  // Readable class this is attached to
  return new Promise(function (resolve, reject) {
    _this2[kStream].destroy(null, function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(createIterResult(undefined, true));
    });
  });
}), _Object$setPrototypeO), AsyncIteratorPrototype);
var createReadableStreamAsyncIterator = function createReadableStreamAsyncIterator(stream) {
  var _Object$create;
  var iterator = Object.create(ReadableStreamAsyncIteratorPrototype, (_Object$create = {}, _defineProperty(_Object$create, kStream, {
    value: stream,
    writable: true
  }), _defineProperty(_Object$create, kLastResolve, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kLastReject, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kError, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kEnded, {
    value: stream._readableState.endEmitted,
    writable: true
  }), _defineProperty(_Object$create, kHandlePromise, {
    value: function value(resolve, reject) {
      var data = iterator[kStream].read();
      if (data) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        resolve(createIterResult(data, false));
      } else {
        iterator[kLastResolve] = resolve;
        iterator[kLastReject] = reject;
      }
    },
    writable: true
  }), _Object$create));
  iterator[kLastPromise] = null;
  finished(stream, function (err) {
    if (err && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
      var reject = iterator[kLastReject];
      // reject if we are waiting for data in the Promise
      // returned by next() and store the error
      if (reject !== null) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        reject(err);
      }
      iterator[kError] = err;
      return;
    }
    var resolve = iterator[kLastResolve];
    if (resolve !== null) {
      iterator[kLastPromise] = null;
      iterator[kLastResolve] = null;
      iterator[kLastReject] = null;
      resolve(createIterResult(undefined, true));
    }
    iterator[kEnded] = true;
  });
  stream.on('readable', onReadable.bind(null, iterator));
  return iterator;
};
module.exports = createReadableStreamAsyncIterator;
}).call(this)}).call(this,require('_process'))
},{"./end-of-stream":216,"_process":204}],214:[function(require,module,exports){
'use strict';

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var _require = require('buffer'),
  Buffer = _require.Buffer;
var _require2 = require('util'),
  inspect = _require2.inspect;
var custom = inspect && inspect.custom || 'inspect';
function copyBuffer(src, target, offset) {
  Buffer.prototype.copy.call(src, target, offset);
}
module.exports = /*#__PURE__*/function () {
  function BufferList() {
    _classCallCheck(this, BufferList);
    this.head = null;
    this.tail = null;
    this.length = 0;
  }
  _createClass(BufferList, [{
    key: "push",
    value: function push(v) {
      var entry = {
        data: v,
        next: null
      };
      if (this.length > 0) this.tail.next = entry;else this.head = entry;
      this.tail = entry;
      ++this.length;
    }
  }, {
    key: "unshift",
    value: function unshift(v) {
      var entry = {
        data: v,
        next: this.head
      };
      if (this.length === 0) this.tail = entry;
      this.head = entry;
      ++this.length;
    }
  }, {
    key: "shift",
    value: function shift() {
      if (this.length === 0) return;
      var ret = this.head.data;
      if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
      --this.length;
      return ret;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.head = this.tail = null;
      this.length = 0;
    }
  }, {
    key: "join",
    value: function join(s) {
      if (this.length === 0) return '';
      var p = this.head;
      var ret = '' + p.data;
      while (p = p.next) ret += s + p.data;
      return ret;
    }
  }, {
    key: "concat",
    value: function concat(n) {
      if (this.length === 0) return Buffer.alloc(0);
      var ret = Buffer.allocUnsafe(n >>> 0);
      var p = this.head;
      var i = 0;
      while (p) {
        copyBuffer(p.data, ret, i);
        i += p.data.length;
        p = p.next;
      }
      return ret;
    }

    // Consumes a specified amount of bytes or characters from the buffered data.
  }, {
    key: "consume",
    value: function consume(n, hasStrings) {
      var ret;
      if (n < this.head.data.length) {
        // `slice` is the same for buffers and strings.
        ret = this.head.data.slice(0, n);
        this.head.data = this.head.data.slice(n);
      } else if (n === this.head.data.length) {
        // First chunk is a perfect match.
        ret = this.shift();
      } else {
        // Result spans more than one buffer.
        ret = hasStrings ? this._getString(n) : this._getBuffer(n);
      }
      return ret;
    }
  }, {
    key: "first",
    value: function first() {
      return this.head.data;
    }

    // Consumes a specified amount of characters from the buffered data.
  }, {
    key: "_getString",
    value: function _getString(n) {
      var p = this.head;
      var c = 1;
      var ret = p.data;
      n -= ret.length;
      while (p = p.next) {
        var str = p.data;
        var nb = n > str.length ? str.length : n;
        if (nb === str.length) ret += str;else ret += str.slice(0, n);
        n -= nb;
        if (n === 0) {
          if (nb === str.length) {
            ++c;
            if (p.next) this.head = p.next;else this.head = this.tail = null;
          } else {
            this.head = p;
            p.data = str.slice(nb);
          }
          break;
        }
        ++c;
      }
      this.length -= c;
      return ret;
    }

    // Consumes a specified amount of bytes from the buffered data.
  }, {
    key: "_getBuffer",
    value: function _getBuffer(n) {
      var ret = Buffer.allocUnsafe(n);
      var p = this.head;
      var c = 1;
      p.data.copy(ret);
      n -= p.data.length;
      while (p = p.next) {
        var buf = p.data;
        var nb = n > buf.length ? buf.length : n;
        buf.copy(ret, ret.length - n, 0, nb);
        n -= nb;
        if (n === 0) {
          if (nb === buf.length) {
            ++c;
            if (p.next) this.head = p.next;else this.head = this.tail = null;
          } else {
            this.head = p;
            p.data = buf.slice(nb);
          }
          break;
        }
        ++c;
      }
      this.length -= c;
      return ret;
    }

    // Make sure the linked list only shows the minimal necessary information.
  }, {
    key: custom,
    value: function value(_, options) {
      return inspect(this, _objectSpread(_objectSpread({}, options), {}, {
        // Only inspect one level.
        depth: 0,
        // It should not recurse.
        customInspect: false
      }));
    }
  }]);
  return BufferList;
}();
},{"buffer":199,"util":198}],215:[function(require,module,exports){
(function (process){(function (){
'use strict';

// undocumented cb() API, needed for core, not for public API
function destroy(err, cb) {
  var _this = this;
  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;
  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err) {
      if (!this._writableState) {
        process.nextTick(emitErrorNT, this, err);
      } else if (!this._writableState.errorEmitted) {
        this._writableState.errorEmitted = true;
        process.nextTick(emitErrorNT, this, err);
      }
    }
    return this;
  }

  // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks

  if (this._readableState) {
    this._readableState.destroyed = true;
  }

  // if this is a duplex stream mark the writable part as destroyed as well
  if (this._writableState) {
    this._writableState.destroyed = true;
  }
  this._destroy(err || null, function (err) {
    if (!cb && err) {
      if (!_this._writableState) {
        process.nextTick(emitErrorAndCloseNT, _this, err);
      } else if (!_this._writableState.errorEmitted) {
        _this._writableState.errorEmitted = true;
        process.nextTick(emitErrorAndCloseNT, _this, err);
      } else {
        process.nextTick(emitCloseNT, _this);
      }
    } else if (cb) {
      process.nextTick(emitCloseNT, _this);
      cb(err);
    } else {
      process.nextTick(emitCloseNT, _this);
    }
  });
  return this;
}
function emitErrorAndCloseNT(self, err) {
  emitErrorNT(self, err);
  emitCloseNT(self);
}
function emitCloseNT(self) {
  if (self._writableState && !self._writableState.emitClose) return;
  if (self._readableState && !self._readableState.emitClose) return;
  self.emit('close');
}
function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }
  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finalCalled = false;
    this._writableState.prefinished = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}
function emitErrorNT(self, err) {
  self.emit('error', err);
}
function errorOrDestroy(stream, err) {
  // We have tests that rely on errors being emitted
  // in the same tick, so changing this is semver major.
  // For now when you opt-in to autoDestroy we allow
  // the error to be emitted nextTick. In a future
  // semver major update we should change the default to this.

  var rState = stream._readableState;
  var wState = stream._writableState;
  if (rState && rState.autoDestroy || wState && wState.autoDestroy) stream.destroy(err);else stream.emit('error', err);
}
module.exports = {
  destroy: destroy,
  undestroy: undestroy,
  errorOrDestroy: errorOrDestroy
};
}).call(this)}).call(this,require('_process'))
},{"_process":204}],216:[function(require,module,exports){
// Ported from https://github.com/mafintosh/end-of-stream with
// permission from the author, Mathias Buus (@mafintosh).

'use strict';

var ERR_STREAM_PREMATURE_CLOSE = require('../../../errors').codes.ERR_STREAM_PREMATURE_CLOSE;
function once(callback) {
  var called = false;
  return function () {
    if (called) return;
    called = true;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    callback.apply(this, args);
  };
}
function noop() {}
function isRequest(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}
function eos(stream, opts, callback) {
  if (typeof opts === 'function') return eos(stream, null, opts);
  if (!opts) opts = {};
  callback = once(callback || noop);
  var readable = opts.readable || opts.readable !== false && stream.readable;
  var writable = opts.writable || opts.writable !== false && stream.writable;
  var onlegacyfinish = function onlegacyfinish() {
    if (!stream.writable) onfinish();
  };
  var writableEnded = stream._writableState && stream._writableState.finished;
  var onfinish = function onfinish() {
    writable = false;
    writableEnded = true;
    if (!readable) callback.call(stream);
  };
  var readableEnded = stream._readableState && stream._readableState.endEmitted;
  var onend = function onend() {
    readable = false;
    readableEnded = true;
    if (!writable) callback.call(stream);
  };
  var onerror = function onerror(err) {
    callback.call(stream, err);
  };
  var onclose = function onclose() {
    var err;
    if (readable && !readableEnded) {
      if (!stream._readableState || !stream._readableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
      return callback.call(stream, err);
    }
    if (writable && !writableEnded) {
      if (!stream._writableState || !stream._writableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
      return callback.call(stream, err);
    }
  };
  var onrequest = function onrequest() {
    stream.req.on('finish', onfinish);
  };
  if (isRequest(stream)) {
    stream.on('complete', onfinish);
    stream.on('abort', onclose);
    if (stream.req) onrequest();else stream.on('request', onrequest);
  } else if (writable && !stream._writableState) {
    // legacy streams
    stream.on('end', onlegacyfinish);
    stream.on('close', onlegacyfinish);
  }
  stream.on('end', onend);
  stream.on('finish', onfinish);
  if (opts.error !== false) stream.on('error', onerror);
  stream.on('close', onclose);
  return function () {
    stream.removeListener('complete', onfinish);
    stream.removeListener('abort', onclose);
    stream.removeListener('request', onrequest);
    if (stream.req) stream.req.removeListener('finish', onfinish);
    stream.removeListener('end', onlegacyfinish);
    stream.removeListener('close', onlegacyfinish);
    stream.removeListener('finish', onfinish);
    stream.removeListener('end', onend);
    stream.removeListener('error', onerror);
    stream.removeListener('close', onclose);
  };
}
module.exports = eos;
},{"../../../errors":207}],217:[function(require,module,exports){
module.exports = function () {
  throw new Error('Readable.from is not available in the browser')
};

},{}],218:[function(require,module,exports){
// Ported from https://github.com/mafintosh/pump with
// permission from the author, Mathias Buus (@mafintosh).

'use strict';

var eos;
function once(callback) {
  var called = false;
  return function () {
    if (called) return;
    called = true;
    callback.apply(void 0, arguments);
  };
}
var _require$codes = require('../../../errors').codes,
  ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS,
  ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;
function noop(err) {
  // Rethrow the error if it exists to avoid swallowing it
  if (err) throw err;
}
function isRequest(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}
function destroyer(stream, reading, writing, callback) {
  callback = once(callback);
  var closed = false;
  stream.on('close', function () {
    closed = true;
  });
  if (eos === undefined) eos = require('./end-of-stream');
  eos(stream, {
    readable: reading,
    writable: writing
  }, function (err) {
    if (err) return callback(err);
    closed = true;
    callback();
  });
  var destroyed = false;
  return function (err) {
    if (closed) return;
    if (destroyed) return;
    destroyed = true;

    // request.destroy just do .end - .abort is what we want
    if (isRequest(stream)) return stream.abort();
    if (typeof stream.destroy === 'function') return stream.destroy();
    callback(err || new ERR_STREAM_DESTROYED('pipe'));
  };
}
function call(fn) {
  fn();
}
function pipe(from, to) {
  return from.pipe(to);
}
function popCallback(streams) {
  if (!streams.length) return noop;
  if (typeof streams[streams.length - 1] !== 'function') return noop;
  return streams.pop();
}
function pipeline() {
  for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++) {
    streams[_key] = arguments[_key];
  }
  var callback = popCallback(streams);
  if (Array.isArray(streams[0])) streams = streams[0];
  if (streams.length < 2) {
    throw new ERR_MISSING_ARGS('streams');
  }
  var error;
  var destroys = streams.map(function (stream, i) {
    var reading = i < streams.length - 1;
    var writing = i > 0;
    return destroyer(stream, reading, writing, function (err) {
      if (!error) error = err;
      if (err) destroys.forEach(call);
      if (reading) return;
      destroys.forEach(call);
      callback(error);
    });
  });
  return streams.reduce(pipe);
}
module.exports = pipeline;
},{"../../../errors":207,"./end-of-stream":216}],219:[function(require,module,exports){
'use strict';

var ERR_INVALID_OPT_VALUE = require('../../../errors').codes.ERR_INVALID_OPT_VALUE;
function highWaterMarkFrom(options, isDuplex, duplexKey) {
  return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
}
function getHighWaterMark(state, options, duplexKey, isDuplex) {
  var hwm = highWaterMarkFrom(options, isDuplex, duplexKey);
  if (hwm != null) {
    if (!(isFinite(hwm) && Math.floor(hwm) === hwm) || hwm < 0) {
      var name = isDuplex ? duplexKey : 'highWaterMark';
      throw new ERR_INVALID_OPT_VALUE(name, hwm);
    }
    return Math.floor(hwm);
  }

  // Default value
  return state.objectMode ? 16 : 16 * 1024;
}
module.exports = {
  getHighWaterMark: getHighWaterMark
};
},{"../../../errors":207}],220:[function(require,module,exports){
module.exports = require('events').EventEmitter;

},{"events":200}],221:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
/*</replacement>*/

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.StringDecoder = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte. If an invalid byte is detected, -2 is returned.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return byte >> 6 === 0x02 ? -1 : -2;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd';
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd';
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd';
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character is added when ending on a partial
// character.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd';
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}
},{"safe-buffer":205}],222:[function(require,module,exports){
(function (global){(function (){

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],223:[function(require,module,exports){
module.exports={
  "name": "tcadif",
  "version": "2.2.0",
  "description": "read and write Amateur Data Interchange Format (ADIF)",
  "main": "index.js",
  "bin": {
    "tcadif": "bin/tcadif.js"
  },
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
    "browserify": "^17.0.1",
    "expect.js": "^0.3.1",
    "mocha": "^11.7.1"
  }
}

},{}],"tcadif":[function(require,module,exports){
'use strict';

const AdifReader = require('./lib/AdifReader');
const AdifWriter = require('./lib/AdifWriter');
const Field = require('./lib/Field');
const Header = require('./lib/Header');
const QSO = require('./lib/QSO');
const ADIF = require('./lib/ADIF');
const Version = require('./lib/Version');
const defs = require('./lib/defs');
const enums = require('./lib/enums');
const transforms = require('./lib/transforms');

module.exports = {
    AdifReader, AdifWriter,
    ADIF, Field, Header, QSO, Version,
    defs,
    enums,
    transforms,
};

},{"./lib/ADIF":1,"./lib/AdifReader":3,"./lib/AdifWriter":4,"./lib/Field":6,"./lib/Header":7,"./lib/QSO":8,"./lib/Version":9,"./lib/defs":172,"./lib/enums":192,"./lib/transforms":195}]},{},[]);
