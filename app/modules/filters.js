(function() {
  'use strict';

  angular.module('hmd.filters', [])
    .filter('boolean', function () {
      return function (input) {
        return input ? '是' : '否';
      };
    })
    .filter('toArray', function () {
      return function (listObject) {
        var list = [];
        for (var key in listObject) {
          list.push(listObject[key]);
        }
        return list;
      };
    })
})();