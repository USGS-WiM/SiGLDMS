(function () {
    'use strict';

    var siGLControllers = angular.module('siGLControllers');

    siGLControllers.controller('projectListCtrl', ['$scope', '$rootScope', '$cookies', 'PROJECT', '$location', '$http',
        function ($scope, $rootScope, $cookies, PROJECT, $location, $http) {
            if ($cookies.get('siGLCreds') === undefined || $cookies.get('siGLCreds') === "") {
                $scope.auth = false;
                $location.path('/login');
            } else {
                //array of projects
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $rootScope.stateIsLoading.showLoading = true; //loading...
                //get the projects to list
                PROJECT.getIndexProjects(function success(data) {
                    data.sort(function (a, b) {
                        var nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase();
                        if (nameA < nameB)
                            return -1;
                        if (nameA > nameB)
                            return 1;
                        return 0;
                    });
                    $scope.userRole = $cookies.get('usersRole');

                    $scope.projects = data;
                    $scope.ProjCnt = data.length;
                    $scope.MoreThan20 = data.length >= 20 ? true : false;
                    $rootScope.stateIsLoading.showLoading = false; //loading...                 
                }, function error(errorResponse) {
                    $rootScope.stateIsLoading.showLoading = false; //loading...
                    toastr.error("Error: " + errorResponse.statusText);
                }).$promise;

                //see if sorting order has already been set, preserve if so, otherwise set to 'Name'
                $scope.sortingOrder = $cookies.get('projListSortOrder') !== undefined ? $cookies.get('projListSortOrder') : 'name';
                $scope.reverse = $cookies.get('pl_reverse') !== undefined ? Boolean($cookies.get('pl_reverse')) : false;

                $scope.sort_by = function (newSortingOrder) {
                    $cookies.put('projListSortOrder', newSortingOrder);
                    if ($scope.sortingOrder == newSortingOrder) {
                        $scope.reverse = !$scope.reverse;
                        $cookies.put('pl_reverse', $scope.reverse);
                    }
                    $scope.sortingOrder = newSortingOrder;
                    // icon setup
                    $('th i').each(function () {
                        // icon reset
                        $(this).removeClass().addClass('glyphicon glyphicon-sort');
                    });
                    if ($scope.reverse) {
                        $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-up');
                    } else {
                        $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-down');
                    }
                };

                $scope.User = $cookies.get('usersName');
            }
        }]);
})();