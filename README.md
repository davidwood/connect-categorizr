# connect-categorizr [![Build Status](https://secure.travis-ci.org/davidwood/connect-categorizr.png)](http://travis-ci.org/davidwood/connect-categorizr)

Connect middleware that provides device detection, based on Brett Jankord's [Categorizr](http://www.brettjankord.com/2012/01/16/categorizr-a-modern-device-detection-script). 


## Installation

```bash
npm install connect-categorizr
```

## Options

* `useSession`: Store the device type in the session for quicker lookups on subsequent requests.  Defaults to `true`.

## Usage

```js
var connect = require('connect'),
    categorizr = require('connect-categorizr');

var app = connect();
app.use(categorizr());
```

The middleware will add the following immutable properties to the `req` object:

* `deviceType`: String containing the matched device type (`mobile`, `tablet`, `desktop` or `tv`)
* `isMobile`: `true` if the device is a phone
* `isTablet`: `true` if the device is a tablet
* `isDesktop`: `true` if the device is a desktop browser
* `isTV`: `true` if the device is a TV

## Testing

First, install the test dependencies

```bash
npm install -d
```

and then run the tests

```bash
make test
```

