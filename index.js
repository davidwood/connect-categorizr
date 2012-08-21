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
    // Check if user agent is a smart TV - http://goo.gl/FocDk
    if ((/GoogleTV|SmartTV|Internet.TV|NetCast|NETTV|AppleTV|boxee|Kylo|Roku|DLNADOC|CE\-HTML/i.test(userAgent)))
    {
      deviceType = "tv";
    }
    // Check if user agent is a TV Based Gaming Console
    else if ((/Xbox|PLAYSTATION.3|Wii/i.test(userAgent)))
    {
      deviceType = "tv";
    }  
    // Check if user agent is a Tablet
    else if((/iP(a|ro)d/i.test(userAgent)) || (/tablet/i.test(userAgent)) && (!/RX-34/i.test(userAgent)) || (/FOLIO/i.test(userAgent)))
    {
      deviceType = "tablet";
    }
    // Check if user agent is an Android Tablet
    else if ((/Linux/i.test(userAgent)) && (/Android/i.test(userAgent)) && (!/Fennec|mobi|HTC.Magic|HTCX06HT|Nexus.One|SC-02B|fone.945/i.test(userAgent)))
    {
      deviceType = "tablet";
    }
    // Check if user agent is a Kindle or Kindle Fire
    else if ((/Kindle/i.test(userAgent)) || (/Mac.OS/i.test(userAgent)) && (/Silk/i.test(userAgent)))
    {
      deviceType = "tablet";
    }
    // Check if user agent is a pre Android 3.0 Tablet
    else if ((/GT-P10|SC-01C|SHW-M180S|SGH-T849|SCH-I800|SHW-M180L|SPH-P100|SGH-I987|zt180|HTC(.Flyer|\_Flyer)|Sprint.ATP51|ViewPad7|pandigital(sprnova|nova)|Ideos.S7|Dell.Streak.7|Advent.Vega|A101IT|A70BHT|MID7015|Next2|nook/i.test(userAgent)) || (/MB511/i.test(userAgent)) && (/RUTEM/i.test(userAgent)))
    {
      deviceType = "tablet";
    } 
    // Check if user agent is unique Mobile User Agent	
    else if ((/BOLT|Fennec|Iris|Maemo|Minimo|Mobi|mowser|NetFront|Novarra|Prism|RX-34|Skyfire|Tear|XV6875|XV6975|Google.Wireless.Transcoder/i.test(userAgent)))
    {
      deviceType = "mobile";
    }
    // Check if user agent is an odd Opera User Agent - http://goo.gl/nK90K
    else if ((/Opera/i.test(userAgent)) && (/Windows.NT.5/i.test(userAgent)) && (/HTC|Xda|Mini|Vario|SAMSUNG\-GT\-i8000|SAMSUNG\-SGH\-i9/i.test(userAgent)))
    {
      deviceType = "mobile";
    }
    // Check if user agent is Windows Desktop
    else if ((/Windows.(NT|XP|ME|9)/.test(userAgent)) && (!/Phone/i.test(userAgent)) || (/Win(9|.9|NT)/i.test(userAgent)))
    {
      deviceType = "desktop";
    }  
    // Check if agent is Mac Desktop
    else if ((/Macintosh|PowerPC/i.test(userAgent)) && (!/Silk/i.test(userAgent)))
    {
      deviceType = "desktop";
    } 
    // Check if user agent is a Linux Desktop
    else if ((/Linux/i.test(userAgent)) && (/X11/i.test(userAgent)))
    {
      deviceType = "desktop";
    } 
    // Check if user agent is a Solaris, SunOS, BSD Desktop
    else if ((/Solaris|SunOS|BSD/i.test(userAgent)))
    {
      deviceType = "desktop";
    }
    // Check if user agent is a Desktop BOT/Crawler/Spider
    else if ((/Bot|Crawler|Spider|Yahoo|ia_archiver|Covario-IDS|findlinks|DataparkSearch|larbin|Mediapartners-Google|NG-Search|Snappy|Teoma|Jeeves|TinEye/i.test(userAgent)) && (!/Mobile/i.test(userAgent)))
    {
      deviceType = "desktop";
    }  
    // Otherwise assume it is a Mobile Device
    else {
      deviceType = "mobile";
    }
  }
  return deviceType;
};

var updateRequest = module.exports.updateRequest = function(req, deviceType) {
  Object.defineProperties(req, {
    deviceType: { value: deviceType, writable: false },
    isMobile: { value: deviceType === 'mobile', writable: false },
    isTablet: { value: deviceType === 'tablet', writable: false },
    isDesktop: { value: deviceType === 'desktop', writable: false },
    isTV: { value: deviceType === 'tv', writable: false }
  });
};

