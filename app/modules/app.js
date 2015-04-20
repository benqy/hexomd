(function (global) {
  var gui = require('nw.gui');
  gui.App.setCrashDumpDir(require('path').dirname(process.execPath) + '\\dump');

  var hmd = global.hmd = angular.module('hmd', ['ui.router','hmd.studio']),
      fs = require('fs'),
      //功能模块根目录
      baseModuleDir = './app/modules/';
  hmd.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/studio");
  });

  hmd.extend = function (obj) {
    Object.keys(obj).forEach(function (key) {
      hmd[key] = obj[key];
    });
  };

  //注册模块,代码会被自动加载到页面中
  hmd.regModule = function (name, reqModule) {
    hmd[name] = angular.module('hmd.' + name, reqModule || []);
    hmd[name].moduleName = name;
    //模块存储数据的目录
    hmd[name].dataPath = hmd.storeDir + '\\' + hmd[name].moduleName;
    fs.readdirSync(baseModuleDir + name)
      .forEach(function (file) {
        if (~file.indexOf('.js')) {
          document.write('<script src="modules/' + name + '/' + file + '"></script>');
        }
      });
  };

  hmd.extend({      
    storeDir: require('nw.gui').App.dataPath,
    msg:function(txt){
      $('#msg').text(txt);
    }
  });


 	hmd.regModule('studio');
 

  window.ondragover = function (e) { e.preventDefault(); return false; };
  window.ondrop = function (e) { e.preventDefault(); return false; };

  process.on('uncaughtException', function(err) {
    console.dir(err);
  });
})(this);