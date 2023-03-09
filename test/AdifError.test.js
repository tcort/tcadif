'use strict';

const AdifError = require('../lib/AdifError');
const expect = require('expect.js');

describe('AdifError', function () {
    it('should be an instance of Error', function () {
        const err = new AdifError();
        expect(err).to.be.an(Error);
    });
    it('should set name, message, and baggage', function () {
        const err = new AdifError('the arguments are bad', { foo: 1, bar: 2 });
        expect(err.name).to.be('AdifError');
        expect(err.message).to.be('the arguments are bad');
        expect(err.foo).to.be(1);
        expect(err.bar).to.be(2);
    });
});

module.exports = AdifError;
