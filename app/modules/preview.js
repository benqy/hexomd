var gui = require('nw.gui'), win = gui.Window.get();
var baseDir = require('path').dirname(process.execPath);

win.on('change', function (mdHtml) {
  $('#content').html(mdHtml);
});

win.on('editorScroll',function(scrollInfo){
  var scrollTop = $(document.body).height()*scrollInfo.top/scrollInfo.height;
  //console.log(scrollInfo.top/scrollInfo.height,$(document.body).height())
  $(document.body).scrollTop(scrollTop);
});

win.on('setTheme',function(setting){
  $('#preViewHighLightTheme').remove();
  $('#preViewTheme').remove();
  $('head').append('<link id="preViewHighLightTheme" href="file:///'+ baseDir.replace(/\\/g,'/') + '/app/node_modules/highlight.js/styles/' + setting.preViewHighLightTheme +'.css" rel="stylesheet" />');
  $('head').append('<link id="preViewTheme" href="file:///'+ baseDir.replace(/\\/g,'/') + '/app/css/previewtheme/'+setting.preViewTheme+'.css" rel="stylesheet" />');
});