(function () {
  'use strict';

  hmd.bucket.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('bucket', {
        url: "/bucket",
        templateUrl: "modules/bucket/views/index.html",
        controller: 'bucket',
        onEnter: function () {
          hmd.changeStatus('bucket');
        }
      });
  });
})();