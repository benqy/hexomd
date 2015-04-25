var gui = require('nw.gui'), win = gui.Window.get();
win.on('change', function (mdHtml) {
  $('#content').html(mdHtml);
});

win.on('editorScroll',function(scrollInfo){
  var scrollTop = $(document.body).height()*scrollInfo.top/scrollInfo.height;
  $(document.body).scrollTop(scrollTop);
});