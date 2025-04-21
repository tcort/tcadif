'use strict';

const Field = require('../lib/Field');
const expect = require('expect.js');

describe('Fields', function () {
    describe('AGE', function () {
        it('should accept decimal years', function () {
            expect(Field.parse('<AGE:4>43.2').toObject().AGE).to.be('43.2');
        });
    });
    describe('FREQ', function () {
        it('should accept integer Hertz', function () {
            expect(Field.parse('<FREQ:2>18').toObject().FREQ).to.be('18');
        });
        it('should accept decimal Hertz', function () {
            expect(Field.parse('<FREQ:6>14.060').toObject().FREQ).to.be('14.060');
        });
        it('should accept less than 1 decimal Hertz', function () {
            expect(Field.parse('<FREQ:5>0.472').toObject().FREQ).to.be('0.472');
        });
    });
    describe('TX_PWR', function () {
        it('should accept whole number watts', function () {
            expect(Field.parse('<TX_PWR:2>69').toObject().TX_PWR).to.be('69');
        });
        it('should accept decimal watts', function () {
            expect(Field.parse('<TX_PWR:3>6.9').toObject().TX_PWR).to.be('6.9');
        });
        it('should accept less than 1 decimal watts', function () {
            expect(Field.parse('<TX_PWR:4>0.69').toObject().TX_PWR).to.be('0.69');
        });
    });

});
