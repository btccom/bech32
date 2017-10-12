'use strict';

var assert = require('assert');
var bech32 = require('./bech32');

function convertBits(data, inbits, outbits, pad) {
  var val = 0;
  var bits = 0;
  var maxv = (1 << outbits) - 1;
  var ret = [];

  for (var i = 0; i < data.length; ++i) {
    val = val << inbits | data[i];
    bits += inbits;

    while (bits >= outbits) {
      bits -= outbits;
      ret.push(val >> bits & maxv);
    }
  }

  if (pad) {
    if (bits > 0) {
      ret.push(val << outbits - bits & maxv);
    }
  } else {
    assert(bits < inbits);
    assert(!(val << outbits - bits & maxv));
  }

  return ret;
}

function encode(prefix, version, program) {
  // witness version 0 length checks
  if (version === 0) {
    assert(program.length === 20 || program.length === 32);
  }

  var bitData = convertBits(program, 8, 5, true);
  bitData.unshift(version);

  return bech32.encode(prefix, bitData);
}

function decode(expectedPrefix, string) {
  var result = bech32.decode(string);
  assert.equal(result.prefix, expectedPrefix);

  assert(result.bitData.length > 0 && result.bitData.length < 66);
  var version = result.bitData[0];
  var program = convertBits(result.bitData.slice(1), 5, 8, false);
  assert(program.length > 1 && program.length < 41);

  // witness version 0 length checks
  if (version === 0) {
    assert(program.length === 20 || program.length === 32);
  }

  return { version: version, program: Buffer.from(program) };
}

module.exports = { encode: encode, decode: decode };