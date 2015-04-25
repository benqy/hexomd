var gui = require('nw.gui'), win = gui.Window.get();
win.on('change', function (mdHtml) {
  $('#content').html(mdHtml);
});

win.on('editorScroll',function(scrollInfo){
  var scrollTop = $(document.body).height()*scrollInfo.top/scrollInfo.height;
  $(document.body).scrollTop(scrollTop);
});

win.on('setTheme',function(setting){
  $('head').append('<link href="../../../node_modules/highlight.js/styles/' + setting.preViewHighLightTheme +'.css" rel="stylesheet" />');
  $('head').append('<link href="../../../css/previewtheme/'+setting.preViewTheme+'.css" rel="stylesheet" />');
});