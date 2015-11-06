(function (global) {
  var gui = require('nw.gui');

  var hmd = global.hmd = angular.module('hmd', ['ui.router','hmd.directives','hmd.filters','hmd.studio','hmd.system','hmd.bucket']),
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
        $('head').append('<script src="modules/' + name + '/' + file + '"></script>');
      }
    });
  };
  //消息等级
  var msgTimer = null;
  var MSG_LEVEL = hmd.MSG_LEVEL = {
      info: 'info',
      warning: 'warning',
      debug: 'debug',
      error:'error'
  };
  //状态栏消息
  hmd.msg = function (txt, lv) {
    lv = lv || MSG_LEVEL.info;
    $('#msg')
    .removeClass(MSG_LEVEL.info)
    .removeClass(MSG_LEVEL.warning)
    .removeClass(MSG_LEVEL.debug)
    .removeClass(MSG_LEVEL.error)
    .addClass(lv).text(txt);
    clearTimeout(msgTimer);
    msgTimer = setTimeout(function () {
      $('#msg')
      .removeClass(MSG_LEVEL.info)
      .removeClass(MSG_LEVEL.warning)
      .removeClass(MSG_LEVEL.debug)
      .removeClass(MSG_LEVEL.error);
    }, 5000);
  };

  //TODO:更优雅的导航栏切换逻辑
  hmd.changeStatus =  function (state) {
    var $navList = $('#navlist');
    $navList.find('li').removeClass('active');
    $navList.find('.' + state).addClass('active');
  };

  //引入模块
 	hmd.regModule('studio');
  hmd.regModule('system');
	hmd.regModule('bucket');

  window.ondragover = function (e) { e.preventDefault(); return false; };
  window.ondrop = function (e) { e.preventDefault(); return false; };

  process.on('uncaughtException', function(err) {
    console.dir(err);
  });
})(this);