(function () {
  var studio = hmd.studio;
  

  
  studio.directive('mdEditor', function () {
    return function ($scope, elem) {
      hmd.editor.init({el:elem[0]},'E:\\Temp\\test\\test.md');
      hmd.editor.on('save',function(a){
        console.log(this)
      })
    };
  });
})();