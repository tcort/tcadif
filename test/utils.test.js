'use strict';

const expect = require('expect.js');
const Timestamper = require('../lib/utils/Timestamper');

describe('utils', function () {

    describe('Timestamper', function () {

        describe('CREATED_TIMESTAMP', function () {

            it('should format the date in UTC', function () {

                expect(Timestamper.CREATED_TIMESTAMP(new Date('2024-11-08T13:28:27-0500'))).to.be('20241108 182827');

            });

        });

    });

});
