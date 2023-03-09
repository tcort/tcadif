'use strict';

const QSO = require('../lib/QSO');
const expect = require('expect.js');

describe('QSO', function () {
    it('should be a class', function () {
        expect(QSO).to.be.a('function');
        expect(QSO).to.have.property('constructor');
    });
});
