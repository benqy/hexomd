(function () {
  'use strict';

  var util = require('./helpers/util'),
      fs = require('fs'),
      system = hmd.system,
      //存储设置的文件
      dataFile = system.dataPath + '\\system.json';

  //初始化存储目录
  if (!fs.existsSync(system.dataPath)) {
    fs.mkdirSync(system.dataPath);
  }
 	
  //默认设置
  var defaultSystemData = {
    //最后一次打开的文件
    lastFile: null,
    //编辑器样式
    theme:'ambiance',
    //预览窗口样式
    preViewTheme:'github',
    //预览代码块样式
    preViewHighLightTheme:'default'
  };
  
  //读取设置
  system.get = function () {
    return $.extend(defaultSystemData,util.readJsonSync(dataFile));
  };

  //保存设置
  system.save = function (data) {
    data = data || defaultSystemData;
    util.writeFileSync(dataFile, JSON.stringify(data));
  };
  
    //设置最后打开的文件
  system.setLastFile = function (filepath) {
    var systemData  = system.get();
    systemData.lastFile = filepath;
    system.save(systemData);
  };
})();