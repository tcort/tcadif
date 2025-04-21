'use strict';

const Header = require('../lib/Header');
const expect = require('expect.js');

describe('Header', function () {
    it('should be a class', function () {
        expect(Header).to.be.a('function');
        expect(Header).to.have.property('constructor');
    });
});
