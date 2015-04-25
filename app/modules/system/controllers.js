(function () {
  'use strict';
	
  var system = hmd.system,
  	fs = require('fs');
  //读取theme目录,生成样式列表
  var readCssList = function(path){
    var files = fs.readdirSync(path),themes={};
    files.forEach(function (file) {
      if(~file.indexOf('.css')){
      	file = file.replace('.css','');
        themes[file] = file;
      } 
    });
    return themes;
  };
  system.controller('system', function ($scope) {
    $scope.themes = readCssList('./app/lib/codemirror/theme');
    $scope.preViewThemes = readCssList('./app/css/previewtheme');
    $scope.preViewHighLightThemes = readCssList('./app/node_modules/highlight.js/styles');
    $scope.systemSetting = system.get();
    $scope.save = function (systemSetting) {
      system.save(systemSetting);
    };
  });
})();