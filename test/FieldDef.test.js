'use strict';

const FieldDef = require('../lib/defs/FieldDef');
const expect = require('expect.js');

describe('FieldDef', function () {
    it('should be a class', function () {
        expect(FieldDef).to.be.a('function');
        expect(FieldDef).to.have.property('constructor');
    });

    describe('.normalize(value)', function () {
        it('should be a function', function () {
            const fd = new FieldDef();
            expect(fd.normalize).to.be.a('function');
        });
        it('should accept 1 argument', function () {
            const fd = new FieldDef();
            expect(fd.normalize).to.have.length(1);
        });
        it('should normalize a value when normalizer is set', function () {
            const fd = new FieldDef({
                normalizer: value => value.toUpperCase(),
            });
            expect(fd.normalize('y')).to.be('Y');
        });
        it('should pass through a value when normalizer is not set', function () {
            const fd = new FieldDef({ });
            expect(fd.normalize('y')).to.be('y');
        });
    });
});
