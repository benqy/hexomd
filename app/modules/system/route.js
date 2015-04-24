(function () {
  'use strict';

  hmd.system.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('system', {
        url: "/system",
        templateUrl: "modules/system/views/system.html",
        controller: 'system',
        onEnter: function () {
          hmd.changeStatus('system');
        }
      });
  });
})();