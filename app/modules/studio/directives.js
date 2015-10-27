(function () {
  var studio = hmd.studio,
      fs = require('fs');
  studio.directive('hmdEditor', function () {
    return function ($scope, elem) {
      var systemData = hmd.system.get();
      hmd.editor.init({
        el:elem[0],
        theme:systemData.theme,
        qiniuToken:hmd.system.qiniuKeygen(systemData).qiniutoken,
        //qiniuDocShareToken:hmd.system.qiniuKeygen(systemData,systemData.docBucketName).qiniutoken,
        bucketHost:systemData.bucketHost
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
      hmd.editor.on('error',function(err){
        hmd.msg(err.msg,hmd.MSG_LEVEL.error);
      });
      //监听拖动事件
      document.ondrop = function (e) {
        var filepath;
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
  
  //预览
  studio.directive('studioPreview',function(){
    return function($scope,elem){
      
      //修改文本时更新预览,change事件触发非常频繁,所以这里使用setTimeout防止无意义的频繁解析.
      var changeTimer;
      hmd.editor.on('change',function(){
        clearTimeout(changeTimer);
        changeTimer = setTimeout(function(){
        	hmd.previewWin && hmd.previewWin.emit('change', hmd.editor.parse());
        },200);
      });
      //打开文件时更新预览
      hmd.editor.on('setFiled',function(filepath){
        hmd.previewWin && hmd.previewWin.emit('change', hmd.editor.parse());
      });
      
      //编辑器滚动
      var scrollTimer;
      hmd.editor.on('scroll',function(scrollInfo){
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(function(){
        	hmd.previewWin && hmd.previewWin.emit('editorScroll',scrollInfo);
        },150);
      });
      
      $(elem[0]).on('click',function(){
        var previewWinUrl = ('file:///' + require('path').dirname(process.execPath) + '/app/modules/studio/views/preview.html').replace(/\\/g,'/');
        if (!hmd.previewWin) {
          hmd.previewWin = require('nw.gui').Window.open(previewWinUrl, {
            position: 'center',
            "toolbar": false,
            "frame": true,
            "width": 800,
            "height": 600,
            "min_width": 600,
            "min_height": 400,
            "icon": "app/img/logo.png"
          });
          hmd.previewWin.on('loaded',function(){
          	hmd.previewWin.emit('setTheme',hmd.system.get());
            hmd.previewWin && hmd.previewWin.emit('change', hmd.editor.parse());
          });
          hmd.previewWin.on('close', function () {
            hmd.previewWin = null;
            this.close(true);
          });
        }
      });
    };
  });

  studio.directive('studioExport', function () {
    return function ($scope, elem) {
      $(elem[0]).on('click',function(){
        hmd.editor.export();
      });
    };
  });

  studio.directive('studioShare', function () {
    return function ($scope, elem) {
      $(elem[0]).on('click',function(){
        hmd.editor.share(function(href){
          href += '?' + Date.now();
          require('nw.gui').Shell.openItem(href);
        });
      });
    };
  });

  //保存
  studio.directive('studioSave',function(){
    return function($scope,elem){
      var editor = hmd.editor;
       //标识是否有未改动的变更.
      $scope.editorChanged = false;
      hmd.editorChanged = false;
      editor.on('change', function (cm, change) {
        hmd.editorChanged = true;
        $scope.editorChanged = true;
        $scope.$digest();
      });
      editor.on('saved', function () {
        $scope.editorChanged = false;
        hmd.editorChanged = false;
        $scope.$digest();
      });
      
      $(elem[0]).on('click',function(){
        editor.save();
      });
    };
	});
  
  studio.directive('studioTheme',function(){
    return function($scope,elem){      
      $(elem[0]).on('click','a',function(){
        $('.themeBtn').removeClass('current');
        $(this).addClass('current');
        var systemData = hmd.system.get();
        systemData.theme = $(this).text();
        hmd.system.save(systemData);
        hmd.editor.setTheme(systemData.theme);
      });
    };
	});
  
  studio.directive('studioPreviewtheme',function(){
    return function($scope,elem){  
      $(elem[0]).on('click','a',function(){
        $('.previewThemeBtn').removeClass('current');
        $(this).addClass('current');
        var ssData = hmd.system.get();
        ssData.preViewTheme = $(this).text();
        hmd.system.save(ssData);
        hmd.previewWin && hmd.previewWin.emit('setTheme',ssData);
      });
    };
	});
  
  studio.directive('studioPreviewhighlighttheme',function(){
    return function($scope,elem){  
      $(elem[0]).on('click','a',function(){
        $('.previewHighlightThemeBtn').removeClass('current');
        $(this).addClass('current');
        var ssData = hmd.system.get();
        ssData.preViewHighLightTheme = $(this).text();
        hmd.system.save(ssData);
        hmd.previewWin && hmd.previewWin.emit('setTheme',ssData);
      });
    };
	});
})();