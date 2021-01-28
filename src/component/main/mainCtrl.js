(function () {
  "use strict";

  var siGLControllers = angular.module("siGLControllers");

  siGLControllers.controller("mainCtrl", [
    "$scope",
    "$rootScope",
    "$cookies",
    "$location",
    "$state",
    function ($scope, $rootScope, $cookies, $location, $state) {
      $scope.logo = "images/usgsLogo.png";
      $rootScope.isAuth = {};
      // reset to login page if logged out
      if (
        $cookies.get("siGLCreds") === undefined ||
        $cookies.get("siGLCreds") === ""
      ) {
        $scope.auth = false;
        $location.path("/login");
      } else {
        $rootScope.isAuth.val = true;
        $rootScope.usersName = $cookies.get("usersName");
        $rootScope.userID = $cookies.get("dmID");
        $rootScope.Role = $cookies.get("usersRole");

        $state.go("projectList");
      }
    },
  ]);
})();
