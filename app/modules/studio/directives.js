(function () {
  var studio = hmd.studio,
      fs = require('fs'),
      argsFirstRead = true;
  studio.directive('hmdEditor', function () {
    return function ($scope, elem) {
      var systemData = hmd.system.get(),
      	gui = require('nw.gui'),
        filepath = gui.App.argv[0];
      if(argsFirstRead && filepath){
        hmd.system.setLastFile(filepath);
      }
      hmd.editor.init({
        el:elem[0],
        theme:systemData.theme
      },systemData.lastFile);
      //保存最后一次打开的文件
      hmd.editor.on('setFiled',function(filepath){hmd.editor.reset();
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
      if(argsFirstRead && filepath){
        argsFirstRead = false;
        ~filepath.indexOf('.md') && hmd.editor.setFile(filepath);
      }
      //如果程序已经打开,则会触发open事件
      gui.App.on('open', function(cmdline) {
        window.focus();
        filepath = cmdline.split(' ')[2].replace(/\"/g,'');
        ~filepath.indexOf('.md') && hmd.editor.setFile(filepath);
      });
    };
  });


  studio.directive('hmdPreviewwindow', function () {
    return function ($scope, elem) {
      var ss = hmd.system.get(),
          preWin = $(elem[0]);
      //ss.preViewWindow == 'in' ? preWin.show()
    };
  });
  studio.directive('studioNewfile', function () {
    return function ($scope, elem) {
      $(elem[0]).on('click',function(){
        hmd.system.setLastFile();
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
        var ss = hmd.system.get();
        if(hmd.editor.filepath){
        	hmd.editor.filepath && require('nw.gui').Shell.showItemInFolder(hmd.editor.filepath);
        }
        else if(~ss.lastFile.indexOf('http')){
          require('nw.gui').Shell.openItem(ss.lastFile);
        }
      });
    };
  });

  //预览
  studio.directive('studioPreview',function(){
    return function($scope,elem){
      //修改文本时更新预览,change事件触发非常频繁,所以这里使用setTimeout防止频繁解析.
      var changeTimer;
      var ss = hmd.system.get();
      var gui = require('nw.gui'), win = gui.Window.get();
      hmd.iframePreWin = null;
      hmd.editor.on('change',function(){
        clearTimeout(changeTimer);
        changeTimer = setTimeout(function(){
          console.log('change');
        	hmd.previewWin && hmd.previewWin.emit('change', hmd.editor.parse());
          hmd.iframePreWin && hmd.iframePreWin.emit('change', hmd.editor.parse());
        },300);
      });
      //打开文件时更新预览
      hmd.editor.on('setFiled',function(filepath){
        hmd.previewWin && hmd.previewWin.emit('change', hmd.editor.parse());
        hmd.iframePreWin && hmd.iframePreWin.emit('change', hmd.editor.parse());
      });

      //编辑器滚动
      var scrollTimer;
      hmd.editor.on('scroll',function(scrollInfo){
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(function(){
        	hmd.previewWin && hmd.previewWin.emit('editorScroll',scrollInfo);
          hmd.iframePreWin && hmd.iframePreWin.emit('editorScroll',scrollInfo);
        },10);
      });

      $(elem[0]).on('click',function(){
        var previewWinUrl = ('file:///' + require('path').dirname(process.execPath) +
                             '/app/modules/studio/views/preview.html').replace(/\\/g,'/');
        if(ss.preViewWindow == 'in'){
          if(!hmd.iframePreWin){
            hmd.iframePreWin = gui.Window.get(document.getElementById('preViewWindow').contentWindow);
            hmd.iframePreWin.on('loaded',function(){
              hmd.iframePreWin && hmd.iframePreWin.emit('setTheme',hmd.system.get());
              hmd.iframePreWin && hmd.iframePreWin.emit('change', hmd.editor.parse());
            });
            document.getElementById('preViewWindow').src = previewWinUrl;
          	$('.CodeMirror').addClass('half-width');
            $('.preview-in').removeClass('hide');
          }
          else{
            hmd.iframePreWin = null;
          	$('.CodeMirror').removeClass('half-width');
            $('.preview-in').addClass('hide');
          }
          hmd.editor.reset();
        }
        else{
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
          else{
            hmd.previewWin.close();
          }
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
        hmd.iframePreWin && hmd.iframePreWin.emit('setTheme',ssData);
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