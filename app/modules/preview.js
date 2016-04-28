var gui = require('nw.gui'), win = gui.Window.get();
var baseDir = require('path').dirname(process.execPath);

win.on('change', function (html) {
  $('#content').html(html);
  var match = html.match(/<h1>.*<\/h1>/);
  var h1 = match ? match[0]:'预览';
  $('title').text($(h1).text());
});

win.on('editorScroll',function(scrollInfo){
  var scrollTop;
  if(scrollInfo.height - (scrollInfo.clientHeight + scrollInfo.top) < 20){
    $(document.body).scrollTop($(document.body).height());
  }
  else{
  	scrollTop = $(document.body).height()*scrollInfo.top/scrollInfo.height;
  	$(document.body).scrollTop(scrollTop);
  }
});

win.on('setTheme',function(setting){
  $('#preViewHighLightTheme').remove();
  $('#preViewTheme').remove();
  $('head').append('<link id="preViewHighLightTheme" href="file:///'+ baseDir.replace(/\\/g,'/') + '/app/node_modules/highlight.js/styles/' + setting.preViewHighLightTheme +'.css" rel="stylesheet" />');
  $('head').append('<link id="preViewTheme" href="file:///'+ baseDir.replace(/\\/g,'/') + '/app/css/previewtheme/'+setting.preViewTheme+'.css" rel="stylesheet" />');
});