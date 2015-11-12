'use strict';

const expect = require('chai').expect,
      Redis = require('ioredis'),
      ObjectStore = require('../index');

let redisClient = new Redis({
    db: 15
});

let store;
let id;

describe('Size', function() {
    beforeEach(function() {
        return redisClient.flushdb().then(function() {
            store = new ObjectStore('foo', {
                car: {
                    definition: {
                        color: 'string',
                        mileage: 'int',
                        convertible: 'boolean',
                        purchaseDate: 'date'
                    },
                    indices: [{
                        uniq: true,
                        fields: [ 'purchaseDate' ]
                    }, {
                        uniq: false,
                        fields: [ 'color', 'mileage', 'convertible' ]
                    }]
                }
            }, {
                db: 15
            });
        });
    });

    it('Get size', function() {
        return store.create('car', {
            color: 'blue',
            mileage: 12345,
            convertible: true,
            purchaseDate: new Date('Sun Nov 01 2015 17:41:24 GMT+0100 (CET)')
        }).then(function(result) {
            return store.create('car', {
                color: 'black',
                mileage: 4242,
                convertible: false,
                purchaseDate: new Date('Sun Nov 20 2015 07:41:24 GMT+0100 (CET)')
            });
        }).then(function(result) {
            return store.size('car');
        }).then(function(result) {
            expect(result).to.deep.equal({
                val: 2
            });
        });
    });

    it('Get size for empty collection', function() {
        return store.size('car').then(function(result) {
            expect(result).to.deep.equal({
                val: 0
            });
        });
    });

    it('Get size for invalid type', function() {
        return store.size('bikes').then(function(result) {
            expect(result).to.deep.equal({
                err: 'E_COLLECTION',
                command: 'SIZE',
                val: false
            });
        });
    });
});