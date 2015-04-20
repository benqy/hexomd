var pth = require('path');
var fs = require('fs');
var CONF_DIR = '../conf/';
var readFile = function (filename, encoding, fn) {
  if (arguments.length < 3) {
    fn = arguments[1];
    encoding = 'utf-8';
  }
  fs.readFile(filename, encoding, fn);
};

var readFileSync = function (filename, encoding) {
  encoding = encoding || 'utf-8';
  return fs.readFileSync(filename, encoding);
};

var writeFile = function (filename, data, encoding, fn) {
  if (arguments.length < 4) {
    fn = arguments[2];
    encoding = 'utf-8';
  }
  fs.writeFile(filename, data, encoding, fn);
};

var writeFileSync = function (filename, data, encoding) {
  if (arguments.length < 3) {
    encoding = 'utf-8';
    data = arguments[1];
  }
  return fs.writeFileSync(filename, data, encoding);
};


var readJson = function (filename, fn) {
  readFile(filename, function (err, txt) {
    try {
      fn(undefined, JSON.parse(txt));
    } catch (e) {
      fn(e, undefined);
    }
  });
};

var readJsonSync = function (filename) {
  var txt='{}', data = null;
  if (fs.existsSync(filename)) {
    txt = readFileSync(filename);
  }
  try {
    data = JSON.parse(txt);
  } catch (e) {
    data = {};
  }
  return data;
};

var readConf = function (name) {
  return require(CONF_DIR + name);
};

var renameSync = function (oldPath, newPath) {
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
  }
  return false;
};

var unlinkSync = function (path) {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
  return false;
};

function exists(path) {
  return fs.existsSync(path);
}

function isfile(path) {
  return fs.statSync(path).isFile();
}

var isdir = function (path) {
  return fs.statSync(path).isDirectory();
};

function dirname(path) {
  return pth.dirname(path).replace(/\\/g, '/');
}

var mkdir = function (path, recursivly) {
  if (exists(path) && isdir(path)) {
    return;
  }

  if (recursivly) {
    var parent = dirname(path);
    if (!exists(parent)) {
      mkdir(parent, true);
    }
  }
  fs.mkdirSync(path);
};

exports.readFile = readFile;
exports.readFileSync = readFileSync;
exports.readConf = readConf;
exports.writeFile = writeFile;
exports.readJson = readJson;
exports.readJsonSync = readJsonSync;
exports.writeFileSync = writeFileSync;
exports.renameSync = renameSync;
exports.unlinkSync = unlinkSync;
exports.generalId = function () {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

exports.toCamel = function (str) {
  return str.slice(0, 1).toUpperCase() + str.slice(1);
};
exports.isdir = isdir;
exports.url2FileName = function (url) {
  var urlOpt = require('url').parse(url),
  urlPathArr = urlOpt.path.split('/'),
  fileName = urlPathArr[urlPathArr.length - 1].split(/\?|\#/)[0],
  path = urlPathArr.slice(0, urlPathArr.length - 1);
  return {
    path: path.join('\\'),
    fileName: fileName
  };
};

exports.getFilename = function (path) {
  var pathArr = path.split('\\');
  return pathArr[pathArr.length - 1];
};

exports.getFileDir = function (path) {
  var pathArr = path.split('\\');
  return pathArr.slice(0,pathArr.length - 1).join('\\');
};

exports.url2SiteDir = function (url) {
  var urlOpt = require('url').parse(url),
  urlPathArr = urlOpt.href.split('/');
  urlPathArr = urlPathArr.filter(function (n) {
    return !~n.indexOf('http:') && n;
  });
  var path = urlPathArr.slice(0, urlPathArr.length - 1),
  fileName = urlPathArr[urlPathArr.length - 1].split(/\?|\#/)[0];
  if (~fileName.indexOf('.')) {
    path.push(fileName);
    fileName = 'index.html';
  }
  return {
    path: '\\' + path.join('\\'),
    fileName:fileName
  };
};

exports.mkdir = mkdir;