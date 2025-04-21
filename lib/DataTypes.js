'use strict';

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
    'IotaRef': s => typeof s === 'string' && /^(NA|SA|EU|AF|OC|AS|AN)\-[0-9]{3}$/i.test(s),
    'CreditList': s => typeof s === 'string' && s.length > 0 && checkCreditList(s),
    'check': (dataType, value) => dataType in module.exports ? module.exports[dataType](value) : false,
};
