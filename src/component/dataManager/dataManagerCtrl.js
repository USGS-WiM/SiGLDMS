(function () {
    'use strict';

    var siGLControllers = angular.module('siGLControllers');

    siGLControllers.controller('dataManagerCtrl', ['$scope', '$location', '$http', '$cookies', 'DATA_MANAGER', 'ROLE', 'allOrgRes', 'allOrgs', 'allDivs', 'allSecs', 'allRoles',
    function ($scope, $location, $http, $cookies, DATA_MANAGER, ROLE, allOrgRes, allOrgs, allDivs, allSecs, allRoles) {
        //get all datamanagers once here to ensure passing auth
        if ($cookies.get('siGLCreds') === undefined || $cookies.get('siGLCreds') === "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            //global vars
            $scope.allORG_RES = allOrgRes;
            $scope.allORGs = allOrgs;
            $scope.allDIVs = allDivs;
            $scope.allSECs = allSecs;

            $scope.loggedInUser = {};
            $scope.allROLEs = allRoles;
            //get all the roles and data managers
            $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
            $http.defaults.headers.common.Accept = 'application/json';

            DATA_MANAGER.getDMListModel().$promise.then(function (result) {
                for (var x = 0; x < result.length; x++) {
                    var orgName = allOrgRes.filter(function (or) { return or.OrganizationSystemID == result[x].ORGANIZATION_SYSTEM_ID; })[0];
                    result[x].OrgName = orgName !== undefined ? orgName.OrganizationName : "";
                }
                $scope.allDMs = result;
            });

            $scope.loggedInUser.Name = $cookies.get('usersName'); //User's NAME
            $scope.loggedInUser.ID = $cookies.get('dmID');
            $scope.loggedInUser.Role = $cookies.get('usersRole');
            //see if sorting order has already been set, preserve if so, otherwise set to 'LNAME'
            $scope.sortingOrder = $cookies.get('DMListSortOrder') !== undefined ? $cookies.get('DMListSortOrder') : 'LNAME';
            $scope.reverse = $cookies.get('dml_reverse') !== undefined ? Boolean($cookies.get('dml_reverse')) : true;
            $scope.sort_by = function (newSortingOrder) {
                $cookies.put('DMListSortOrder', newSortingOrder);
                if ($scope.sortingOrder == newSortingOrder) {
                    $scope.reverse = !$scope.reverse;
                    $cookies.put('dml_reverse', $scope.reverse);
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
        }//end auth user logged in
    }]);//end resourceCtrl

})();