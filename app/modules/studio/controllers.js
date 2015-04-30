(function () {
  var studio = hmd.studio;
  studio
    .controller('studio', function ($scope, $state, $stateParams) {
    	var ssData = hmd.system.get();
      $scope.themes = hmd.system.readCssList('./app/lib/codemirror/theme');
    	$scope.preViewThemes = hmd.system.readCssList('./app/css/previewtheme');
    	$scope.preViewHighLightThemes = hmd.system.readCssList('./app/node_modules/highlight.js/styles');
    	$scope.currpreTheme = ssData.theme;
    	$scope.currPreviewTheme = hmd.system.get().preViewTheme;
    	$scope.currpreViewHighLightThemes = ssData.preViewHighLightTheme;
    });
})();