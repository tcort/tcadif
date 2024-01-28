'use strict';

const Field = require('../lib/Field');
const expect = require('expect.js');

describe('Field', function () {
    it('should be a class', function () {
        expect(Field).to.be.a('function');
        expect(Field).to.have.property('constructor');
    });
    describe('static .stringify(fieldName, dataTypeIndicator, data)', function () {
        it('should be a function', function () {
            expect(Field.stringify).to.be.a('function');
        });
        it('should accept 3 argument', function () {
            expect(Field.stringify).to.have.length(3);
        });
        it('should stringify some data', function () {
            expect(Field.stringify('call','S','VA2NW')).to.be('<CALL:5:S>VA2NW');
            expect(Field.stringify('call','S','K3Y')).to.be('<CALL:3:S>K3Y');
            expect(Field.stringify('call','S','XX1X')).to.be('<CALL:4:S>XX1X');
        });
    });
});
