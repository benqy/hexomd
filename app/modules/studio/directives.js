(function () {
  var studio = hmd.studio,
      fs = require('fs');
  studio.directive('hmdEditor', function () {
    return function ($scope, elem) {
      var systemData = hmd.system.get();
      hmd.editor.init({
        el:elem[0],
        theme:systemData.theme
      },systemData.lastFile);
      //保存最后一次打开的文件
      hmd.editor.on('setFiled',function(filepath){
        hmd.system.setLastFile(filepath);
      });
      
      //显示保存信息
      hmd.editor.on('saved',function(filepath){
        var fileNameArr = filepath.split('\\');
        hmd.msg('文件:' + fileNameArr[fileNameArr.length - 1] + '保存成功!');
      });
      //监听拖动事件
      document.ondrop = function (e) {
        var filepath, $target = $(e.target), dir, system;
        e.preventDefault();
        if (!e.dataTransfer.files.length) return;
        //取到文件路径
        filepath = e.dataTransfer.files[0].path;
        //非目录,并且包含.md才会在编辑器里打开
        if (!fs.statSync(filepath).isDirectory() && ~filepath.indexOf('.md')) {
          hmd.editor.setFile(filepath);
        }
      };
      //双击md文件打开
      var gui = require('nw.gui'),
          filepath = gui.App.argv[0];
			filepath && ~filepath.indexOf('.md') && hmd.editor.setFile(filepath);
      //如果程序已经打开,则会触发open事件
      gui.App.on('open', function(cmdline) {
        window.focus();
        filepath = cmdline.split(' ')[2].replace(/\"/g,'');
        ~filepath.indexOf('.md') && hmd.editor.setFile(filepath);
      });
    };
  });
  
  
  studio.directive('studioNewfile', function () {
    return function ($scope, elem) {
      $(elem[0]).on('click',function(){
        hmd.editor.setFile();
      });
    };
  });
  
  studio.directive('studioOpenfile', function () {
    return function ($scope, elem) {
      $(elem[0]).on('click',function(){
        hmd.editor.openFile();
      });
    };
  });
  
  //打开目录
  studio.directive('studioOpendir', function () {    
    return function ($scope, elem) {
      $(elem[0]).on('click',function(){
        hmd.editor.filepath && require('nw.gui').Shell.showItemInFolder(hmd.editor.filepath);
      });
    };
  });
  
  studio.directive('studioSave',function(){
    return function($scope,elem){
      var editor = hmd.editor;
       //标识是否有未改动的变更.
      $scope.editorChanged = false;
      editor.on('change', function (cm, change) {
        $scope.editorChanged = true;
        $scope.$digest();
      });
      editor.on('saved', function () {
        $scope.editorChanged = false;
        $scope.$digest();
      });
      
      $(elem[0]).on('click',function(){
        editor.save();
      });
    };
	});
})();