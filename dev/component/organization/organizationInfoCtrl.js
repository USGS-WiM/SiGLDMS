(function () {
    'use strict';

    var siGLControllers = angular.module('siGLControllers');

    siGLControllers.controller('organizationInfoCtrl', ['$scope',
    function ($scope) {
        $scope.holder = "Hi, from Organization INFO Ctrler";
    }]);

})();