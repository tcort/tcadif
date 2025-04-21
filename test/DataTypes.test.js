'use strict';

const DataTypes = require('../lib/DataTypes');
const expect = require('expect.js');

describe('DataTypes', function () {
    describe('.Boolean(value)', function () {
        it('should be a function', function () {
            expect(DataTypes.Boolean).to.be.a('function');
        });
        it('should accept 1 argument', function () {
            expect(DataTypes.Boolean).to.have.length(1);
        });
        it('should accept Y/y/N/n', function () {
            ['Y','y','N','n'].forEach(value => expect(DataTypes.Boolean(value)).to.be(true));
        });
        it('should reject all other values', function () {
            [null, undefined, 1, '', 'false', 'true', false, new Date(), /x/, 'X'].forEach(value => expect(DataTypes.Boolean(value)).to.be(false));
        });
    });
    describe('.Character(value)', function () {
        it('should be a function', function () {
            expect(DataTypes.Character).to.be.a('function');
        });
        it('should accept 1 argument', function () {
            expect(DataTypes.Character).to.have.length(1);
        });
        it('should accept single characters', function () {
            ['A','.','4','c'].forEach(value => expect(DataTypes.Character(value)).to.be(true));
        });
        it('should reject all other values', function () {
            [null, undefined, 1, '', 'false', 'true', false, new Date(), /x/, '\n'].forEach(value => expect(DataTypes.Character(value)).to.be(false));
        });
    });
    describe('.CreditList(value)', function () {
        it('should be a function', function () {
            expect(DataTypes.CreditList).to.be.a('function');
        });
        it('should accept 1 argument', function () {
            expect(DataTypes.CreditList).to.have.length(1);
        });
        it('should accept a comma-delimited list of members of the Credit enumeration', function () {
            [ 'CQWAZ_MIXED', 'CQDXFIELD_QRP,CQDX_QRP', 'EZ40,IOTA_GROUP,WAS' ].forEach(value => expect(DataTypes.CreditList(value)).to.be(true));
        });
        it('should accept a comma-delimited list of members of the Credit enumeration with a colon separator followed by an ampersand separated list of members of QSL Medium enumeration', function () {
            [ 'CQDXFIELD_QRP:CARD', 'CQDXFIELD_QRP:CARD&LOTW', 'CQWAZ_MIXED:CARD,CQDXFIELD_QRP:CARD&LOTW' ].forEach(value => expect(DataTypes.CreditList(value)).to.be(true));
        });
        it('should handle mixed lists of both of the above', function () {
            expect(DataTypes.CreditList('IOTA,WAS:LOTW&CARD,DXCC:CARD')).to.be(true);
        });
        it('should rejact all other values', function () {
            [null, undefined, 1, '', 'false', 'true', false, new Date(), /x/, '\n', 'LOTW', 'WAS:CART', 'POLO:CARD', 'WAS:LOTW&', 'DXCC,CARD' ].forEach(value => expect(DataTypes.CreditList(value)).to.be(false));
        });
    });
    describe('.Digit(value)', function () {
        it('should be a function', function () {
            expect(DataTypes.Digit).to.be.a('function');
        });
        it('should accept 1 argument', function () {
            expect(DataTypes.Digit).to.have.length(1);
        });
        it('should accept single digits', function () {
            ['0','1','2','3','4','5','6','7','8','9'].forEach(value => expect(DataTypes.Digit(value)).to.be(true));
        });
        it('should reject all other values', function () {
            [null, undefined, 1, '', 'false', 'true', false, new Date(), /x/, 'X', '\n'].forEach(value => expect(DataTypes.Digit(value)).to.be(false));
        });
    });
    describe('.Number(value)', function () {
        it('should be a function', function () {
            expect(DataTypes.Number).to.be.a('function');
        });
        it('should accept 1 argument', function () {
            expect(DataTypes.Number).to.have.length(1);
        });
        it('should accept valid numbers', function () {
            ['0','-1','10.37','.333','0008.50'].forEach(value => expect(DataTypes.Number(value)).to.be(true));
        });
        it('should reject all other values', function () {
            ['+10.37','0008,59', '1,000,000', '10.100.500', '0x3c', null, undefined, 1, '', 'false', 'true', false, new Date(), /x/, 'X', '\n'].forEach(value => expect(DataTypes.Number(value)).to.be(false));
        });
    });
    describe('.Integer(value)', function () {
        it('should be a function', function () {
            expect(DataTypes.Integer).to.be.a('function');
        });
        it('should accept 1 argument', function () {
            expect(DataTypes.Integer).to.have.length(1);
        });
        it('should accept valid numbers', function () {
            ['0','-1','1','1000','00050'].forEach(value => expect(DataTypes.Integer(value)).to.be(true));
        });
        it('should reject all other values', function () {
            ['+1','+10.37','0008,59', '1,000,000', '10100500ft', '0x3c', null, undefined, 1, '', 'false', 'true', false, new Date(), /x/, 'X', '\n'].forEach(value => expect(DataTypes.Integer(value)).to.be(false));
        });
    });
    describe('.PositiveInteger(value)', function () {
        it('should be a function', function () {
            expect(DataTypes.PositiveInteger).to.be.a('function');
        });
        it('should accept 1 argument', function () {
            expect(DataTypes.PositiveInteger).to.have.length(1);
        });
        it('should accept valid numbers', function () {
            ['1','1000','00050'].forEach(value => expect(DataTypes.PositiveInteger(value)).to.be(true));
        });
        it('should reject all other values', function () {
            ['+1','0','-1','+10.37','0008,59', '1,000,000', '10100500ft', '0x3c', null, undefined, 1, '', 'false', 'true', false, new Date(), /x/, 'X', '\n'].forEach(value => expect(DataTypes.PositiveInteger(value)).to.be(false));
        });
    });
    describe('.Number(value)', function () {
        it('should be a function', function () {
            expect(DataTypes.Number).to.be.a('function');
        });
        it('should accept 1 argument', function () {
            expect(DataTypes.Number).to.have.length(1);
        });
        it('should accept valid numbers', function () {
            ['0','-1','10.37','.333','0008.50'].forEach(value => expect(DataTypes.Number(value)).to.be(true));
        });
        it('should reject all other values', function () {
            ['+10.37','0008,59', '1,000,000', '10.100.500', '0x3c', null, undefined, 1, '', 'false', 'true', false, new Date(), /x/, 'X', '\n'].forEach(value => expect(DataTypes.Number(value)).to.be(false));
        });
    });
    describe('.String(value)', function () {
        it('should be a function', function () {
            expect(DataTypes.String).to.be.a('function');
        });
        it('should accept 1 argument', function () {
            expect(DataTypes.String).to.have.length(1);
        });
        it('should accept strings', function () {
            [' ', '', 'asdf', 'foo', 'this is a test!'].forEach(value => expect(DataTypes.String(value)).to.be(true));
        });
        it('should reject all other values', function () {
            [null, undefined, 1, false, new Date(), /x/, '\n'].forEach(value => expect(DataTypes.String(value)).to.be(false));
        });
    });
    describe('.MultilineString(value)', function () {
        it('should be a function', function () {
            expect(DataTypes.MultilineString).to.be.a('function');
        });
        it('should accept 1 argument', function () {
            expect(DataTypes.MultilineString).to.have.length(1);
        });
        it('should accept multi-line strings', function () {
            [' ', '', 'asdf', 'foo', 'this is a test!','foo\r\nbar\r\nbaz','foo\nbar\n'].forEach(value => expect(DataTypes.MultilineString(value)).to.be(true));
        });
        it('should reject all other values', function () {
            [null, undefined, 1, false, new Date(), /x/ ].forEach(value => expect(DataTypes.MultilineString(value)).to.be(false));
        });
    });
    describe('.Time(value)', function () {
        it('should be a function', function () {
            expect(DataTypes.Time).to.be.a('function');
        });
        it('should accept 1 argument', function () {
            expect(DataTypes.Time).to.have.length(1);
        });
        it('should accept 4 digit HHMM times', function () {
            ['2023','2359','0031','0001'].forEach(value => expect(DataTypes.Time(value)).to.be(true));
        });
        it('should accept 6 digit HHMMSS times', function () {
            ['202359','235946','003123','000000'].forEach(value => expect(DataTypes.Time(value)).to.be(true));
        });
        it('should reject all other values', function () {
            [null, undefined, 1, '', '19291231', 'false', 'true', false, new Date(), /x/, '\n'].forEach(value => expect(DataTypes.Time(value)).to.be(false));
        });
    });
    describe('.Date(value)', function () {
        it('should be a function', function () {
            expect(DataTypes.Date).to.be.a('function');
        });
        it('should accept 1 argument', function () {
            expect(DataTypes.Date).to.have.length(1);
        });
        it('should accept valid dates', function () {
            ['20230101','19300101','19841231'].forEach(value => expect(DataTypes.Date(value)).to.be(true));
        });
        it('should reject all other values', function () {
            [null, undefined, 1, '', '19291231', 'false', 'true', false, new Date(), /x/, '\n'].forEach(value => expect(DataTypes.Date(value)).to.be(false));
        });
    });
    describe('.Location(value)', function () {
        it('should be a function', function () {
            expect(DataTypes.Location).to.be.a('function');
        });
        it('should accept 1 argument', function () {
            expect(DataTypes.Location).to.have.length(1);
        });
        it('should accept valid locations', function () {
            ['N120 45.678', 'W075 00.000', 'E180 59.999', 'S000 00.000'].forEach(value => expect(DataTypes.Location(value)).to.be(true));
        });
        it('should reject all other values', function () {
            ['N181 11.111', 'X012 34.567', 'S123 60.000', null, undefined, 1, '', '19291231', 'false', 'true', false, new Date(), /x/, '\n'].forEach(value => expect(DataTypes.Location(value)).to.be(false));
        });
    });
    describe('.Enumeration(value)', function () {
        it('should be a function', function () {
            expect(DataTypes.Enumeration).to.be.a('function');
        });
        it('should accept 1 argument', function () {
            expect(DataTypes.Enumeration).to.have.length(1);
        });
        it('should accept an enumeration name', function () {
            ['Mode','Band','QsoComplete'].forEach(value => expect(DataTypes.Enumeration(value)).to.be(true));
        });
        it('should reject all other values', function () {
            [null, undefined, 1, false, new Date(), /x/ ].forEach(value => expect(DataTypes.Enumeration(value)).to.be(false));
        });
    });
    describe('.GridSquare(value)', function () {
        it('should be a function', function () {
            expect(DataTypes.GridSquare).to.be.a('function');
        });
        it('should accept 1 argument', function () {
            expect(DataTypes.GridSquare).to.have.length(1);
        });
        it('should accept valid grid squares', function () {
            ['FN', 'FN25', 'FN25CK', 'FN25CK69', 'AA','AA00','AA00AA', 'AA00AA00','RR','RR99', 'RR99XX', 'RR99XX99' ].forEach(value => expect(DataTypes.GridSquare(value)).to.be(true));
        });
        it('should reject all other values', function () {
            ['AX', 'A', 'AR2', 'AX99', 'AA2233', 'AA33A',  null, undefined, 1, '', '19291231', 'false', 'true', false, new Date(), /x/, '\n'].forEach(value => expect(DataTypes.GridSquare(value)).to.be(false));
        });
    });
    describe('.GridSquareExt(value)', function () {
        it('should be a function', function () {
            expect(DataTypes.GridSquareExt).to.be.a('function');
        });
        it('should accept 1 argument', function () {
            expect(DataTypes.GridSquareExt).to.have.length(1);
        });
        it('should accept valid grid square extensions', function () {
            ['FN', 'FN25', 'FN25', 'AA','AA00','XX', 'XX99' ].forEach(value => expect(DataTypes.GridSquareExt(value)).to.be(true));
        });
        it('should reject all other values', function () {
            ['YY', 'A', 'AY99', 'AA2233', 'AA33A',  null, undefined, 1, '', '19291231', 'false', 'true', false, new Date(), /x/, '\n'].forEach(value => expect(DataTypes.GridSquareExt(value)).to.be(false));
        });
    });
    describe('.GridSquareList(value)', function () {
        it('should be a function', function () {
            expect(DataTypes.GridSquareList).to.be.a('function');
        });
        it('should accept 1 argument', function () {
            expect(DataTypes.GridSquareList).to.have.length(1);
        });
        it('should accept valid grid square list', function () {
            ['AA01,AA00', 'EN98,FM08,EM97,FM07' ].forEach(value => expect(DataTypes.GridSquareList(value)).to.be(true));
        });
        it('should reject all other values', function () {
            ['YY', 'A', 'AY99', 'AA2233', 'AA33A', 'FN25ck,FN25dk',  null, undefined, 1, '', '19291231', 'false', 'true', false, new Date(), /x/, '\n'].forEach(value => expect(DataTypes.GridSquareList(value)).to.be(false));
        });
    });
    describe('.IotaRefNo(value)', function () {
        it('should be a function', function () {
            expect(DataTypes.IotaRefNo).to.be.a('function');
        });
        it('should accept 1 argument', function () {
            expect(DataTypes.IotaRefNo).to.have.length(1);
        });
        it('should accept valid ref', function () {
            [ 'NA-136' ].forEach(value => expect(DataTypes.IotaRefNo(value)).to.be(true));
        });
        it('should reject all other values', function () {
            ['FN25ck,FN25dk', 'NA-000', 'NA-136 ', null, undefined, 1, '', 'false', 'true', false, new Date(), /x/, '\n'].forEach(value => expect(DataTypes.IotaRefNo(value)).to.be(false));
        });
    });
    describe('.SotaRef(value)', function () {
        it('should be a function', function () {
            expect(DataTypes.SotaRef).to.be.a('function');
        });
        it('should accept 1 argument', function () {
            expect(DataTypes.SotaRef).to.have.length(1);
        });
        it('should accept valid ref', function () {
            [ 'W2/WE-003', 'G/LD-003' ].forEach(value => expect(DataTypes.SotaRef(value)).to.be(true));
        });
        it('should reject all other values', function () {
            ['FN25ck,FN25dk',  null, undefined, 1, '', 'false', 'true', false, new Date(), /x/, '\n'].forEach(value => expect(DataTypes.SotaRef(value)).to.be(false));
        });
    });
    describe('.WwffRef(value)', function () {
        it('should be a function', function () {
            expect(DataTypes.WwffRef).to.be.a('function');
        });
        it('should accept 1 argument', function () {
            expect(DataTypes.WwffRef).to.have.length(1);
        });
        it('should accept valid ref', function () {
            [ 'KFF-4655','3DAFF-0002' ].forEach(value => expect(DataTypes.WwffRef(value)).to.be(true));
        });
        it('should reject all other values', function () {
            ['YY', 'A', 'AY99', 'AA2233', 'AA33A', 'FN25ck,FN25dk',  null, undefined, 1, '', '19291231', 'false', 'true', false, new Date(), /x/, '\n'].forEach(value => expect(DataTypes.WwffRef(value)).to.be(false));
        });
    });
    describe('.PotaRef(value)', function () {
        it('should be a function', function () {
            expect(DataTypes.PotaRef).to.be.a('function');
        });
        it('should accept 1 argument', function () {
            expect(DataTypes.PotaRef).to.have.length(1);
        });
        it('should accept valid ref', function () {
            [ 'K-5033', 'K-10000', 'VE-5082@CA-AB', '8P-0012','VK-0556','K-4562@US-CA',  ].forEach(value => expect(DataTypes.PotaRef(value)).to.be(true));
        });
        it('should reject all other values', function () {
            ['YY', 'A', 'AY99', 'AA2233', 'AA33A', 'FN25ck,FN25dk',  null, undefined, 1, '', '19291231', 'false', 'true', false, new Date(), /x/, '\n'].forEach(value => expect(DataTypes.PotaRef(value)).to.be(false));
        });
    });
    describe('.PotaRefList(value)', function () {
        it('should be a function', function () {
            expect(DataTypes.PotaRefList).to.be.a('function');
        });
        it('should accept 1 argument', function () {
            expect(DataTypes.PotaRefList).to.have.length(1);
        });
        it('should accept valid ref list', function () {
            [ 'K-0817,K-4566,K-4576,K-4573,K-4578@US-WY', 'K-5033', 'K-10000', 'VE-5082@CA-AB', '8P-0012','VK-0556','K-4562@US-CA',  ].forEach(value => expect(DataTypes.PotaRefList(value)).to.be(true));
        });
        it('should reject all other values', function () {
            ['YY', 'A', 'AY99', 'AA2233', 'AA33A', 'FN25ck,FN25dk',  null, undefined, 1, '', '19291231', 'false', 'true', false, new Date(), /x/, '\n'].forEach(value => expect(DataTypes.PotaRefList(value)).to.be(false));
        });
    });
    describe('.SponsoredAward(value)', function () {
        it('should be a function', function () {
            expect(DataTypes.SponsoredAward).to.be.a('function');
        });
        it('should accept 1 argument', function () {
            expect(DataTypes.SponsoredAward).to.have.length(1);
        });
        it('should accept valid sponsored award', function () {
            [ 'ADIF_CENTURY_BASIC','ADIF_CENTURY_SILVER','ADIF_SPECTRUM_100-160m' ].forEach(value => expect(DataTypes.SponsoredAward(value)).to.be(true));
        });
        it('should reject all other values', function () {
            ['YY', 'A', 'AY99', 'AA2233', 'AA33A', 'FN25ck,FN25dk',  null, undefined, 1, '', '19291231', 'false', 'true', false, new Date(), /x/, '\n'].forEach(value => expect(DataTypes.SponsoredAward(value)).to.be(false));
        });
    });
    describe('.SponsoredAwardList(value)', function () {
        it('should be a function', function () {
            expect(DataTypes.SponsoredAwardList).to.be.a('function');
        });
        it('should accept 1 argument', function () {
            expect(DataTypes.SponsoredAwardList).to.have.length(1);
        });
        it('should accept valid sponsored award list', function () {
            [ 'ADIF_CENTURY_BASIC,ADIF_CENTURY_SILVER,ADIF_SPECTRUM_100-160m' ].forEach(value => expect(DataTypes.SponsoredAwardList(value)).to.be(true));
        });
        it('should reject all other values', function () {
            ['YY', 'A', 'AY99', 'AA2233', 'AA33A', 'FN25ck,FN25dk',  null, undefined, 1, '', '19291231', 'false', 'true', false, new Date(), /x/, '\n'].forEach(value => expect(DataTypes.SponsoredAwardList(value)).to.be(false));
        });
    });
    describe('.check(dataType, value)', function () {
        it('should be a function', function () {
            expect(DataTypes.check).to.be.a('function');
        });
        it('should accept 2 arguments', function () {
            expect(DataTypes.check).to.have.length(2);
        });
        it('should run the right check', function () {
            [' ', '', 'asdf', 'foo', 'this is a test!'].forEach(value => expect(DataTypes.check('String',value)).to.be(true));
            [null, undefined, 1, false, new Date(), /x/, '\n'].forEach(value => expect(DataTypes.check('String',value)).to.be(false));
        });
        it('should handle non-existant checks', function () {
            [null, undefined, 1, false, new Date(), /x/, '\n'].forEach(value => expect(DataTypes.check('BER',value)).to.be(false));
        });
    });
});
