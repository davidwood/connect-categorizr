var assert = require('assert'),
    http = require('http'),
    connect = require('connect'),
    categorizr = require('../');

describe('Connect middleware', function() {

  function get(fn, userAgent) {
    if (typeof fn === 'function') {
      handler = fn;
      var opts = { host: 'localhost', port: 8080, agent: false };
      if (typeof userAgent === 'string') opts.headers = { 'User-Agent': userAgent };
      http.get(opts);
    }
  }

  var server,
      handler;
  before(function() {
    var app = connect();
    app.use(categorizr());
    app.use(function(req, res, next) {
      if (typeof handler === 'function') {
        handler(req, res);
      } else {
        next();
      }
    });
    server = http.createServer(app).listen(8080);
  });

  after(function() {
    server.close();
  });

  afterEach(function() {
    handler = null;
  });

  it('should set the device type to "mobile" if the user agent header is undefined', function(done) {
    get(function(req, res) {
      assert.strictEqual(req.deviceType, 'mobile');
      assert.strictEqual(req.isMobile, true);
      assert.strictEqual(req.isTablet, false);
      assert.strictEqual(req.isDesktop, false);
      assert.strictEqual(req.isTV, false);
      done();
    });
  });

  it('should create immutable properties on the request', function(done) {
    get(function(req, res) {
      assert.strictEqual(req.deviceType, 'mobile');
      assert.strictEqual(req.isMobile, true);
      assert.strictEqual(req.isTablet, false);
      assert.strictEqual(req.isDesktop, false);
      assert.strictEqual(req.isTV, false);
      req.deviceType = 'foo';
      req.isMobile = true;
      req.isTablet = true;
      req.isDesktop = true;
      req.isTV = true;
      assert.equal(req.deviceType, 'mobile');
      assert.strictEqual(req.isMobile, true);
      assert.strictEqual(req.isTablet, false);
      assert.strictEqual(req.isDesktop, false);
      assert.strictEqual(req.isTV, false);
      done();
    });
  });

  it('should set the device type to "mobile" if the user agent header matches a known mobile device ', function(done) {
    get(function(req, res) {
      assert.equal(req.deviceType, 'mobile');
      assert.ok(req.isMobile);
      assert.ok(!req.isTablet);
      assert.ok(!req.isDesktop);
      assert.ok(!req.isTV);
      done();
    }, 'Mozilla/5.0 (iPhone; U; CPU like Mac OS X; en) AppleWebKit/420+ (KHTML, like Gecko) Version/3.0 Mobile/1A538a Safari/419.3');
  });

  it('should set the device type to "mobile" if the user agent header does not match a known device', function(done) {
    get(function(req, res) {
      assert.equal(req.deviceType, 'mobile');
      assert.ok(req.isMobile);
      assert.ok(!req.isTablet);
      assert.ok(!req.isDesktop);
      assert.ok(!req.isTV);
      done();
    }, 'This/is/not/a/valid/user/agent');
  });

  it('should set the device type to "desktop" if the user agent header matches a known desktop browser', function(done) {
    get(function(req, res) {
      assert.equal(req.deviceType, 'desktop');
      assert.ok(!req.isMobile);
      assert.ok(!req.isTablet);
      assert.ok(req.isDesktop);
      assert.ok(!req.isTV);
      done();
    }, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_0) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.79 Safari/537.1');
  });

  it('should set the device type to "tablet" if the user agent header matches a known tablet', function(done) {
    get(function(req, res) {
      assert.equal(req.deviceType, 'tablet');
      assert.ok(!req.isMobile);
      assert.ok(req.isTablet);
      assert.ok(!req.isDesktop);
      assert.ok(!req.isTV);
      done();
    }, 'Mozilla/5.0 (iPad; U; CPU iPhone OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Mobile/7D11');
  });

  it('should set the device type to "tv" if the user agent header matches a known TV', function(done) {
    get(function(req, res) {
      assert.equal(req.deviceType, 'tv');
      assert.ok(!req.isMobile);
      assert.ok(!req.isTablet);
      assert.ok(!req.isDesktop);
      assert.ok(req.isTV);
      done();
    }, 'Mozilla/5.0 (X11; U; Linux i686; en-US) AppleWebKit/533.4 (KHTML, like Gecko) Chrome/5.0.375.127 Large Screen Safari/533.4 GoogleTV/b54202');
  });

});

