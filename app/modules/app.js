(function (global) {
  var gui = require('nw.gui');

  var hmd = global.hmd = angular.module('hmd', ['ui.router','hmd.directives','hmd.studio']),
      fs = require('fs'),
      //模块根目录
      baseModuleDir = './app/modules/';
  hmd.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/studio");
  });
  
	hmd.storeDir =  require('nw.gui').App.dataPath;

  //注册模块,模块内js文件会被自动加载到页面中
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

  
  
  hmd.msg = function(txt){
    $('.tool').text(txt);
  };


  //引入模块
 	hmd.regModule('studio');
 

  window.ondragover = function (e) { e.preventDefault(); return false; };
  window.ondrop = function (e) { e.preventDefault(); return false; };

  process.on('uncaughtException', function(err) {
    console.dir(err);
  });
})(this);