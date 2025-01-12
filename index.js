#!/usr/bin/env node

var os = require('os'),
    proxy = require('http-proxy'),
    interfaces = os.networkInterfaces(),
    pkg = require('./package'),
    ver = pkg.version,
    exit = function() {
      console.log('Usage example:\n %s [192.168.0.100:]51123 to 3000', Object.keys(pkg.bin)[0]);
      process.exit();
    },
    source, host, port, proxyPort, currentProxy;

console.log('IIS Express Proxy %s', ver);

if (process.argv.length != 5 || process.argv[3].toLowerCase() !== 'to') {
  exit();
}

source    = process.argv[2].split(':');
host      = source.length == 1 ? 'localhost' : source[0];
port      = parseInt(source[source.length == 1 ? 0 : 1]);
proxyPort = parseInt(process.argv[4]);

if (isNaN(port) || isNaN(proxyPort)) {
  exit();
}

console.log('Proxying %s:%d to:', host, port);

Object.keys(interfaces).forEach(function(name) {
  interfaces[name].filter(function(item) {
    return item.family == 'IPv4' && !item.internal;
  }).forEach(function(item) {
    console.log("- %s: %s:%s", name, item.address, proxyPort);
  });
});

currentProxy = proxy.createProxyServer({
  target: 'http://' + host + ':' + port,
  changeOrigin: true
}).listen(proxyPort, function() {
  console.log('Listening... [ press Control-C to exit ]');
});

currentProxy.on('error', function (err, req, res) {
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });
  console.log(err.stack);
  res.end('Aw snap; something went wrong. Check your console to see the error.');
});
