var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    categorizr = require('../');

describe('Device detection', function() {
  fs.readdirSync(__dirname).forEach(function(filename) {
    if (path.extname(filename) === '.json') {
      var def = require(path.join(__dirname, filename));
      if (Array.isArray(def.devices) && def.name && def.deviceType) {
        it('should match the ' + def.devices.length + ' "' + def.name + '" user agents', function() {
          def.devices.forEach(function(device) {
            if (device.name && device.userAgent) {
              assert.equal(categorizr.detect(device.userAgent), def.deviceType, 'Failed to match "' + device.name + '"');
            }
          });
        });
      }
    }
  });
});

