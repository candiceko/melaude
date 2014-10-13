'use strict';

angular.module('mean.system')

.controller('CreateProfileCtrl',
    ['$scope',
    function ($scope) {

    function init() {
        console.log($scope.user);
    }

    init();
}])

;
