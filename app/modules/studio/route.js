(function () {
  'use strict';

  hmd.studio.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('studio', {
        url: "/studio",
        templateUrl: "modules/studio/views/studio.html",
        controller: 'studio'
      });
  });
})();