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
      systemSetting = system.qiniuKeygen(systemSetting);
      system.save(systemSetting);
    };
  });
})();