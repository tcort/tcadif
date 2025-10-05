'use strict';

const QSO = require('../lib/QSO');
const expect = require('expect.js');

describe('QSO', function () {
    it('should be a class', function () {
        expect(QSO).to.be.a('function');
        expect(QSO).to.have.property('constructor');
    });
    describe('toObject()', function () {
        it('should include import only fields', function () {
            expect(new QSO({
                CALL: 'W1AW',
                TIME_ON: '1234',
                QSO_DATE: '20191211',
                BAND: '40M',
                MODE: 'CW',
                VE_PROV: 'QC',
                GUEST_OP: 'KB1EPR',
            }).toObject()).to.eql({
                CALL: 'W1AW',
                TIME_ON: '1234',
                QSO_DATE: '20191211',
                BAND: '40M',
                MODE: 'CW',
                VE_PROV: 'QC',
                GUEST_OP: 'KB1EPR',
            });
        });
    });
    describe('stringify()', function () {
        it('should stringify an object', function () {
            expect(new QSO({
                CALL: 'W1AW',
                TIME_ON: '1234',
                QSO_DATE: '20191211',
                BAND: '40M',
                MODE: 'CW',
            }).stringify()).to.be('<BAND:3:E>40M\n<CALL:4:S>W1AW\n<MODE:2:E>CW\n<QSO_DATE:8:D>20191211\n<TIME_ON:4:T>1234\n<EOR>');
        });
        it('should not stringify import only fields', function () {
            expect(new QSO({
                CALL: 'W1AW',
                TIME_ON: '1234',
                QSO_DATE: '20191211',
                BAND: '40M',
                MODE: 'CW',
                VE_PROV: 'QC',
                GUEST_OP: 'KB1EPR',
            }).stringify()).to.be('<BAND:3:E>40M\n<CALL:4:S>W1AW\n<MODE:2:E>CW\n<QSO_DATE:8:D>20191211\n<TIME_ON:4:T>1234\n<EOR>');
        });
    });
});
