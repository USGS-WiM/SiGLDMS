(function () {
    'use strict';

    var siGLControllers = angular.module('siGLControllers');

    siGLControllers.controller('settingsCtrl', ['$scope', '$location', '$state', '$cookies',
    function ($scope, $location, $state, $cookies) {
        if ($cookies.get('siGLCreds') === undefined || $cookies.get('siGLCreds') === "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            $scope.changeView = function (view) {
                $state.go(view);
            };
        }
    }]);
})();