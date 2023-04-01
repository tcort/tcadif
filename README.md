# tcadif

Read and write data in Amateur Data Interchange Format (ADIF) with node.js.

## Examples

###  AdifReader

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

### AdifWriter

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

### Passthrough

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
| `APP_TCADIF_MY_KEY` | `Enumeration` | App TCADIF Key Enumeration | the logging station's Morse key. |

### App TCADIF Key Enumeration

| Abbreviation | Key |
|------|-------------|
| `SK` | Straight key |
| `SS` | Sideswiper |
| `BUG` | Bug |
| `SLP` | Single-Lever Paddle |
| `DLP` | Dual-Lever Paddle |

## ADIF Implementation Notes

- QSO valid requires the following fields: `QSO_DATE`, `TIME_ON`, `CALL`, `BAND` or `FREQ`, `MODE`.
- Unknown Application-defined Fields, User-defined Fields, and Deprecated Fields are ignored.
- No referential integrity checks have been implemented (e.g. there are no checks that the state is valid for the country).
- If a field appears more than once in a record, the last instance is the one used.
