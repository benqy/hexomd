(function () {
  'use strict';
	
  var system = hmd.system,
  	fs = require('fs');
  
  
  system.controller('system', function ($scope) {
    $scope.themes = system.readCssList('./app/lib/codemirror/theme');
    $scope.preViewThemes = system.readCssList('./app/css/previewtheme');
    $scope.preViewHighLightThemes = system.readCssList('./app/node_modules/highlight.js/styles');
    $scope.systemSetting = system.get();

    $scope.save = function (systemSetting) {
      var qiniu = require('../app/node_modules/qiniu');
      qiniu.conf.ACCESS_KEY = systemSetting.accessKey;
      qiniu.conf.SECRET_KEY = systemSetting.secretKey;
      var putPolicy = new qiniu.rs.PutPolicy(systemSetting.bucketName);
      putPolicy.expires = Math.round(new Date().getTime() / 1000) + systemSetting.deadline * 3600;
      systemSetting.qiniutoken = putPolicy.token();
      system.save(systemSetting);
    };
  });
})();