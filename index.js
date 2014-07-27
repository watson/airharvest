#!/usr/bin/env node

'use strict';

var fs = require('fs');
var crypto = require('crypto');
var http = require('http');
var mdns = require('mdns');

var found = false;
var cbCount = 0;

var isKnown = function (service, callback) {
  var key = getKey(service);
  console.log('Found an %s service with hash %s - verifying...', service.type, key);
  var req = http.request({
    method: 'HEAD',
    host: 'mindus.iriscouch.com',
    path: '/airharvest/' + key
  });
  req.on('response', function (res) {
    cbCount--;
    if (res.statusCode === 200) callback(null, true);
    else callback(null, false);
  });
  req.on('error', callback);
  req.end();
  cbCount++;
};

var insert = function (service, callback) {
  var key = getKey(service);
  var json = JSON.stringify(service);
  var req = http.request({
    method: 'PUT',
    host: 'mindus.iriscouch.com',
    path: '/airharvest/' + key,
    headers: {
      'Content-Length': json.length,
      'Content-Type': 'application/json'
    }
  });
  req.on('response', function (res) {
    cbCount--;
    if (res.statusCode === 201) callback();
    else callback(new Error('Unexpected response from the database: ' + res.statusCode));
  });
  req.on('error', callback);
  req.end(json);
  cbCount++;
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
  service = anon(filter(service));
  isKnown(service, function (err, known) {
    if (err) throw err;
    if (known) {
      console.log('Found known configuration - skipping...');
      done();
      return;
    }

    found = true;
    console.log('Found unknown configuration - publishing data...');
    insert(service, function (err) {
      if (err) throw err;
      console.log('Successfully stored the new configuration');
      done();
    });
  });
};

var done = function () {
  if (cbCount) return;
  if (found)
    console.log('\nWow! You discovered new configurations! - You deserved a nice cold beer :)');
  else
    console.log('\nDid not find anything new on your network - Thanks for being awesome! :)');
  process.exit();
};

console.log('Analyting network...');
mdns.createBrowser(mdns.tcp('raop')).on('serviceUp', save).start();
mdns.createBrowser(mdns.tcp('airplay')).on('serviceUp', save).start();
