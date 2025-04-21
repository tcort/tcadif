# tcadif

Read and write data in Amateur Data Interchange Format (ADIF) with node.js.

## Examples

### Synchronous ADIF Reading and Writing

#### Reading

To parse ADIF text, simply call `ADIF.parse(text)`. The result is an ADIF
instance. To transform it into a plain old JavaScript object, call `.toObject();`

```
const { ADIF } = require('tcadif');
const fs = require('fs');
const path = require('path');

const input = fs.readFileSync(path.join(__dirname, 'sample.adi')).toString();

const adif = ADIF.parse(input);

console.log(adif.toObject());
```

#### Writing

To write ADIF text, simply instantiate an ADIF instance with an optional header
and qsos. Then call `.stringify()`.

```
const { ADIF } = require('tcadif');
const fs = require('fs');
const path = require('path');

const input = {
    qsos: [
        {
            BAND: '20m',
            CALL: 'KG9JP',
            FREQ: '14',
            MODE: 'SSB',
            NOTES: 'POTA K-4293 WI',
            QSL_RCVD: 'N',
            QSL_SENT: 'N',
            QSO_DATE: '20230217',
            QSO_DATE_OFF: '20230217',
            RST_RCVD: '57',
            RST_SENT: '59',
            TIME_OFF: '172600',
            TIME_ON: '172600',
            TX_PWR: '20'
        }
    ]
};

const adif = new ADIF(input);

console.log(adif.stringify());
```

`.stringify(options = {})` accepts an optional object argument which influences the output:

- `fieldDelim` - a string to insert between fields. Default end-of-line sequence (`\n` or `\r\n`).
- `recordDelim` - a string to insert between records (header and QSOs). Default two end-of-line sequences (`\n` or `\r\n`).
- `programName` - the name of your application. Defaults to this modules package.name (i.e. `tcadif`).
- `programVersion` - the version of your application. Defaults to this module's package.version (e.g. `1.6.1`).

### Streaming ADIF Reading and Writing

#### AdifReader

Read a text stream and ouputs an object stream:

```
'use strict';

const { AdifReader } = require('tcadif');
const fs = require('fs');
const path = require('path');

const input = fs.createReadStream(path.join(__dirname, 'sample.adi'));
const reader = new AdifReader();

reader.on('data', record => console.log('data', record));
reader.on('error', err => console.error('err', err));

input.pipe(reader);
```

#### AdifWriter

Reads an object stream and outputs a text stream:

```
'use strict';

const { AdifWriter } = require('tcadif');

const writer = new AdifWriter();

writer.pipe(process.stdout);

writer.write({
    BAND: '20m',
    CALL: 'VA2EPR',
    MODE: 'CW',
    QSO_DATE: '20230306',
    TIME_ON: '1728',
    OPERATOR: 'VA2NW',
});
```

#### Passthrough

Reads a text stream, transforms it into an object stream, transforms it
back into a text stream, and writes a text stream:

```
'use strict';

const { AdifReader, AdifWriter } = require('tcadif');
const fs = require('fs');
const path = require('path');

const input  = fs.createReadStream(path.join(__dirname, 'sample.adi'));
const reader = new AdifReader();
const writer = new AdifWriter();
const output = fs.createWriteStream(path.join(__dirname, 'sample-2.adi'));

input
    .pipe(reader)
    .pipe(writer)
    .pipe(output);
```

## Application-defined Fields

| Field | Data Type | Sub Type | Description |
|------------|------|-----|----|
| `APP_TCADIF_KEY` | `Enumeration` | App TCADIF Key Enumeration | the contacted station's Morse key. |
| `APP_TCADIF_KEY_INFO` | `String` |  | the contacted station's Morse key information (make, model, etc). |
| `APP_TCADIF_LICW` | `String` |   | the contacted station's Long Island CW Club (LICW) member information. |
| `APP_TCADIF_MY_KEY` | `Enumeration` | App TCADIF Key Enumeration | the logging station's Morse key. |
| `APP_TCADIF_MY_KEY_INFO` | `String` |  | the logging station's Morse key information (make, model, etc). |
| `APP_TCADIF_QSO_ID` | `Uuid` | App TCADIF QSO Identifier | Universally Unique IDentifier (UUID) for this QSO. |

### Data Types

| Data Type Name | Data Type Indicator | Description |
|----------------|---------------------|-------------|
| `Uuid` | | A string representation of a Universally Unique IDentifier. See [RFC4122](https://datatracker.ietf.org/doc/html/rfc4122). |

### App TCADIF Key Enumeration

| Abbreviation | Key |
|------|-------------|
| `SK` | Straight key |
| `SS` | Sideswiper |
| `BUG` | Bug |
| `SLP` | Single-Lever Paddle |
| `DLP` | Dual-Lever Paddle |
| `CPU` | Computer |

## ADIF Implementation Notes

- QSO valid requires the following fields: `QSO_DATE`, `TIME_ON`, `CALL`, `BAND` or `FREQ`, `MODE`.
- Unknown Application-defined Fields, User-defined Fields, and Deprecated Fields are ignored.
- No referential integrity checks have been implemented (e.g. there are no checks that the state is valid for the country, the band is valid for the frequency, etc)).
- If a field appears more than once in a record, the last instance is the one used.
