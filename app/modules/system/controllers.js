(function () {
  'use strict';
	
  var system = hmd.system,
  	fs = require('fs');
  system.controller('system', function ($scope) {
    //读取theme目录,生成样式列表
    var files = fs.readdirSync('./app/lib/codemirror/theme'),themes={};
    files.forEach(function (file) {
      if(~file.indexOf('.css')){
      	file = file.replace('.css','');
        themes[file] = file;
      } 
    });
    $scope.themes = themes;
    $scope.systemSetting = system.get();
    $scope.save = function (systemSetting) {
      system.save(systemSetting);
    };
  });
})();