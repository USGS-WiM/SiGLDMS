(function () {
    'use strict';

    var siGLControllers = angular.module('siGLControllers');

    siGLControllers.controller('helpCtrl', ['$scope',
        function ($scope) {
            $scope.helpInfo = {};
            $scope.helpInfo.fact = "Some really interesting help will be here.";
        }]);
})();
