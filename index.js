#!/usr/bin/env node

'use strict';

var crypto = require('crypto');
var http = require('http');
var mdns = require('mdns');
var roundround = require('roundround');

var found = 0;
var cbCount = 0;

var head = function (key, callback) {
  var req = http.request({
    method: 'HEAD',
    host: 'airharvest.couchappy.com',
    path: '/airharvest/' + key
  });
  req.on('response', function (res) {
    cbCount--;
    if (res.statusCode === 200) callback(null, res.headers.etag.replace(/"/g, ''));
    else callback();
  });
  req.on('error', callback);
  req.end();
  cbCount++;
};

var insert = function (key, service, callback) {
  head(key, function (err, rev) {
    if (rev) {
      service._id = key;
      service._rev = rev;
    }
    var json = JSON.stringify(service);
    var req = http.request({
      method: 'PUT',
      host: 'airharvest.couchappy.com',
      path: '/airharvest/' + key,
      headers: {
        'Content-Length': json.length,
        'Content-Type': 'application/json'
      }
    });
    req.on('response', function (res) {
      cbCount--;
      if (res.statusCode === 201) callback();
      else if (res.statusCode === 409) insert(key, service, callback);
      else callback(new Error('Unexpected response from the database: ' + res.statusCode));
    });
    req.on('error', callback);
    req.end(json);
    cbCount++;
  });
};

var filter = function (service) {
  return {
    type: service.type.name,
    port: service.port,
    txt: service.txtRecord
  };
};

var anon = function (service) {
  if ('deviceid' in service.txt) service.txt.deviceid = '***';
  if ('pk' in service.txt) service.txt.pk = service.txt.pk.replace(/./g, '*');
  return service;
};

var getKey = function (service) {
  var md5sum = crypto.createHash('md5');
  md5sum.update(JSON.stringify(service));
  return md5sum.digest('hex');
};

var save = function (service) {
  found++;
  service = anon(filter(service));
  var key = getKey(service);
  console.log('Found an %s service on your network - registering...', service.type);
  insert(key, service, function (err) {
    if (err) throw err;
    done();
  });
};

var done = function () {
  if (cbCount) return;
  if (found)
    console.log('\nThanks for your help! You deserve a nice cold beer :)');
  else
    console.log('\nDid not find anything new on your network, but you\'re still awesome :)');
  process.exit();
};

console.log('Taking a look around on your network...\nThe whole thing should not take more than a minute');
mdns.createBrowser(mdns.tcp('raop')).on('serviceUp', save).start();
mdns.createBrowser(mdns.tcp('airplay')).on('serviceUp', save).start();

var msg = roundround([
  'Still working...',
  'You rock! Thanks for waiting :)',
  'Ok, I\'m really sorry about this - please wait a little longer',
  'While you wait you should check out https://github.com/watson/roundround',
  'If you ever bump into me I\'ll buy you a beer...',
  'Almost there... almost... I promise',
  'I\'m working as fast as I can given your poor network conditions - P.s. I love you!'
]);
setInterval(function () {
  console.log(msg());
}, 10000);

setTimeout(done, 5000);
