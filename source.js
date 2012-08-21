function updateRequest(req, deviceType) {
  Object.defineProperties(req, {
    deviceType: { value: deviceType, writable: false },
    isMobile: { value: deviceType === 'mobile', writable: false },
    isTablet: { value: deviceType === 'tablet', writable: false },
    isDesktop: { value: deviceType === 'desktop', writable: false },
    isTV: { value: deviceType === 'tv', writable: false }
  });
}

module.exports = function(opts) {
  opts || (opts = {});
  var useSession = opts.useSession !== false;
  return function categorizr(req, res, next) {
    if (!req.deviceType) {
      if (useSession && req.session && req.session.deviceType) {
        updateRequest(req, req.session.deviceType);
      } else if (req.headers && 'user-agent' in req.headers) {
        var deviceType = detectDevice(req.headers['user-agent']);
        if (deviceType) {
          updateRequest(req, deviceType);
          if (useSession && req.session) req.session.deviceType = deviceType;
        }
      } else {
        updateRequest(req, 'No User-Agent Provided');
      }
    }
    next();
  };
};

var detectDevice = module.exports.detect = function(userAgent) {
  var deviceType;
  if (typeof userAgent === 'string' && userAgent !== '') {
    /* SCRIPT */
  }
  return deviceType;
};

