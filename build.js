#!/usr/bin/env node
var fs = require('fs'),
    path = require('path'),
    http = require('http'),
    https = require('https'),
    sax = require('sax'),
    total = 2,
    done = function() {
      if (--total === 0) console.log('complete\n');
    };

process.stdout.write('Building connect-categorizr...');

/* Build the user agent detection middleware */
// Retrieve the latest Categorizr script
https.get({ host: 'raw.github.com', path: '/bjankord/Categorizr/master/categorizr.php' }, function(res) {
  var phpSource = '';
  res.on('data', function(data) {
    phpSource += data;
  }).on('end', function() {
    // Extract the device detection logic
    var match = /if\(!isset\(\$_SESSION\[\$category\]\)\)\{\s*([\s\S]*?)\}\/\/ End if session not set/g.exec(phpSource);
    if (match) {
      // Reformat regular expressions and trim trailing whitespace
      var script = match[1].replace(/preg_match\('/g, '').replace(/', \$ua\)/g, '.test(userAgent)').replace(/\s+$/, '');
      // Remove the leading indent
      var indent = /^(\s+)if/m.exec(script);
      if (indent) script = script.replace(new RegExp('^' + indent[1], 'gm'), '');
      // Replace the session variable assignment
      script = script.replace(/^\s+\$_SESSION\[\$category\]/gm, '  deviceType');
      // Read the source script and insert the converted Categorizr script
      var source = fs.readFileSync('./source.js', 'utf8'),
          insertMatch = /^(\s+)\/\* SCRIPT/gm.exec(source);
      if (insertMatch) {
        // Update the leading indent and insert the script
        source = source.replace(/^(\s+)\/\* SCRIPT \*\//m, script.replace(/^/gm, insertMatch[1]));
        // Write the source
        fs.writeFileSync(path.join(__dirname, 'index.js'), source, 'utf8');
        done();
      }
    }
  });
}).on('error', function(e) {
  console.error('Error retrieving categorizr.php:', e);
});

/* Build the test cases */
var saxStream = sax.createStream(false, { trim: true, lowercase: true }),
    State = {
      None: 0,
      Table: 1,
      Header: 2,
      Data: 3,
      Row: 4
    },
    current = State.None,
    isWriting = false,
    hasDeviceType = false,
    def = { name: null, deviceType: null },
    shouldCapture = false,
    captured = [],
    writeStream;
// Open the write stream
function open(id) {
  close();
  if (id) {
    isWriting = true;
    hasDeviceType = false;
    writeStream = fs.createWriteStream(path.join(__dirname, 'test', id + '.json'));
    writeStream.write('{"devices":[', 'utf8');
  }
}
// Close the write stream
function close() {
  if (isWriting && writeStream) {
    writeStream.write('],\n', 'utf8');
    writeStream.write('"name":"' + def.name + '",\n"deviceType":"' + def.deviceType + '"\n}\n', 'utf8');
    writeStream.end();
    isWriting = false;
    def = { name: null, deviceType: null };
  }
}
// Write to the stream
function write(name, userAgent, deviceType) {
  if (isWriting && writeStream) {
    var output = JSON.stringify({ name: name, userAgent:  userAgent });
    if (!def.deviceType) {
      def.deviceType = deviceType;
    } else {
      output = ',' + output;
    }
    writeStream.write(output, 'utf8');
  }
}
// Parse the HTML
saxStream.on('error', function(e) {
  console.error('Parsing error:', e);
}).on('opentag', function(node) {
  if (node.name === 'table') {
    if (current > State.None) close();
    current = State.Table;
  } else if (node.name === 'h1' && current === State.Table) {
    if (node.attributes && node.attributes.id) {
      current = State.Header;
      open(node.attributes.id);
    }
  } else if (node.name === 'tr' && current === State.Data) {
    if (!(node.attributes.class === 'table-fields')) {
      current = State.Row;
      captured = [];
      shouldCapture = true;
    }
  }
}).on('closetag', function(nodeName) {
  if (nodeName === 'table' && current === State.Table) {
    close();
    current = State.None;
  } else if (nodeName === 'h1' && current === State.Header) {
    current = State.Table;
  } else if (nodeName === 'tr' && current === State.Row) {
    current = State.Data;
    shouldCapture = false;
    if (captured.length === 3) write.apply(write, captured);
  }
}).on('text', function(text) {
  if (current === State.Header) {
    current = State.Data;
    def.name = text;
  } else if (shouldCapture === true) {
    captured.push(text);
  }
}).on('end', function() {
  close();
  done();
});
http.get('http://brettjankord.com/categorizr/categorizr-user-agents.php', function(res) {
  res.pipe(saxStream);
});

