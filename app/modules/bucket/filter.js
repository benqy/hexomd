(function() {
  'use strict';

   hmd.bucket.filter('date', function () {
      return function (input) {
        var date = new Date(input/10000);
        return date.toDateString();
      };
    })
})();