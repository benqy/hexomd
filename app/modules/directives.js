(function () {
  var gui = require('nw.gui'), win = gui.Window.get(), 
      //表示窗口当前是否是最大化的.
      winMaximize = false;
  win.on('close', function () {
    var me = this;
    hmd.previewWin && hmd.previewWin.close();
    if(!hmd.editorChanged || confirm('文档未保存,确定关闭么?')){
      me.close(true);
    }
  });
  angular.module('hmd.directives', [])
  //最小化窗口
  .directive('hmdMinisize', [function () {
    return function (scope, elem) {
      $(elem[0]).on('click', function () {
        win.minimize();
      });
    };
  }])
  //最大化与还原窗口
  .directive('hmdMaxToggle', [function () {
    return function (scope, elem) {
      //窗口最大化和还原时会触发对应的事件,在事件里去控制按钮样式.
      win.on('maximize', function () {
        winMaximize = true;
        $(elem[0]).find('i').removeClass('glyphicon-fullscreen').addClass('glyphicon-resize-small');
      });
      win.on('unmaximize', function () {
        winMaximize = false;
        $(elem[0]).find('i').removeClass('glyphicon-resize-small').addClass('glyphicon-fullscreen');
      });
			//切换窗口状态
      $(elem[0]).on('click', function () {
        if (winMaximize) {
          win.unmaximize();
        }
        else {
          win.maximize();
        }
      });
    };
  }])
  //关闭应用程序
  .directive('hmdClose', [function () {
    return function (scope, elem) {
      $(elem[0]).on('click', function () {
        require('nw.gui').Window.get().close();
      });
    };
  }])
  .directive('hmdDropdownlist',[function(){
    return function (scope, elem) {
      var $el = $(elem[0]);
      $el.on('click','button', function () {
        $el.find('ul').toggle();
      });
    };
  }])
  .directive('hmdUpdate', [function () {
    return function (scope, elem) {
      $(elem[0]).on('click', function () {
        hmd.updater.checkUpdate();
      });
    };
  }]);
})();