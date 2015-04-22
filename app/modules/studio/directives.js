(function () {
  var studio = hmd.studio;
  
  studio.directive('hmdEditor', function () {
    return function ($scope, elem) {
      hmd.editor.init({el:elem[0]},'E:\\Temp\\test\\test.md');
    };
  });
})();