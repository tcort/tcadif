'use strict';

const defs = require('../lib/defs');
const expect = require('expect.js');

describe('defs', function () {
    describe('qso', function () {
        describe('ANT_AZ', function () {
            describe('.normalize(value)', function () {
                it('should normalize values outside the range (>360)', function () {
                    const antAz = new defs.qso.ANT_AZ();
                    expect(antAz.normalize('370')).to.be('10');
                });
                it('should normalize values outside the range (<0)', function () {
                    const antAz = new defs.qso.ANT_AZ();
                    expect(antAz.normalize('-1')).to.be('359');
                });
                it('should pass values in the correct range', function () {
                    const antAz = new defs.qso.ANT_AZ();
                    expect(antAz.normalize('52')).to.be('52');
                });
            });
        });
        describe('ANT_EL', function () {
            describe('.normalize(value)', function () {
                it('should normalize values outside the range (>90)', function () {
                    const antAz = new defs.qso.ANT_EL();
                    expect(antAz.normalize('100')).to.be('10');
                });
                it('should normalize values outside the range (<-90)', function () {
                    const antAz = new defs.qso.ANT_EL();
                    expect(antAz.normalize('-91')).to.be('89');
                });
                it('should pass values in the correct range', function () {
                    const antAz = new defs.qso.ANT_EL();
                    expect(antAz.normalize('52')).to.be('52');
                });
            });
        });
        describe('CREDIT_SUBMITTED', function () {
            describe('.check(value)', function () {
                it('should accept valid values', function () {
                    const cr = new defs.qso.CREDIT_SUBMITTED();
                    expect(cr.check('IOTA,WAS:LOTW&CARD,DXCC:CARD')).to.be(true);
                });
            });
        });
    });
});
