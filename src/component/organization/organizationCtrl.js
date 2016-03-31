(function () {
    'use strict';

    var siGLControllers = angular.module('siGLControllers');

    siGLControllers.controller('organizationCtrl', ['$scope',
    function ($scope) {
        $scope.holder = "Hi, from Organization Ctrler";
    }]);
})();