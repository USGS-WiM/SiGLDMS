(function () {
    'use strict';

    var siGLControllers = angular.module('siGLControllers');

    siGLControllers.controller('dataManagerCtrl', ['$scope', '$rootScope', '$location', '$http', '$uibModal', '$cookies', 'DATA_MANAGER', 'allOrgRes', 'allOrgs', 'allDivs', 'allSecs', 'allRoles', 'userProfileId',
    function ($scope, $rootScope, $location, $http, $uibModal, $cookies, DATA_MANAGER, allOrgRes, allOrgs, allDivs, allSecs, allRoles, userProfileId) {
        //get all datamanagers once here to ensure passing auth
        if ($cookies.get('siGLCreds') === undefined || $cookies.get('siGLCreds') === "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            ////global vars
            //$scope.allORG_RES = allOrgRes;
            //$scope.allORGs = allOrgs;
            //$scope.allDIVs = allDivs;
            //$scope.allSECs = allSecs;

            $scope.loggedInUser = {};
            $scope.allROLEs = allRoles.filter(function (r) { return r.role_id < 3;});
            //$scope.loggedInUser.Name = $cookies.get('usersName'); //User's name
            //$scope.loggedInUser.ID = $cookies.get('dmID');
            $scope.loggedInUser.Role = $cookies.get('usersRole');
           
            //show modal of dm info and projects
            $scope.showDataManagerModal = function (dmClicked) {
                var indexClicked = $scope.allDMs.indexOf(dmClicked);
                $rootScope.stateIsLoading = { showLoading: true }; //Loading...
                //modal
                var modalInstance = $uibModal.open({
                    templateUrl: 'dataManagerModal.html',
                    controller: 'dataManagerModal',
                    size: 'lg',
                    backdrop: 'static',
                    keyboard: false,
                    windowClass: 'rep-dialog',
                    resolve: {
                        thisDM: function () {
                            return dmClicked !== 0 ? dmClicked : "empty";
                        },
                        dmProjects: function () {
                            if (dmClicked !== 0)
                                return DATA_MANAGER.getDMProject({ DataManager: dmClicked.data_manager_id }).$promise;
                        },
                        allRoles: function () {
                            return $scope.allROLEs;
                        },
                        allOrgList: function () {
                            return allOrgs;
                        },
                        allDivList: function (){
                            return allDivs;
                        },
                        allSecList: function () {
                            return allSecs;
                        },
                        allOrgResList: function () {
                            return allOrgRes;
                        },
                        allDMList: function () {
                            return $scope.allDMs;
                        }
                    }
                });
                modalInstance.result.then(function (createdDM) {
                    //is there a new op or just closed modal
                    $rootScope.stateIsLoading = { showLoading: false }; //Loading...
                    if (createdDM !== undefined) {
                        if (createdDM[1] == 'created') {
                            $scope.allDMs.push(createdDM[0]);
                        }
                        if (createdDM[1] === 'updated') {
                            //update the list
                            $scope.allDMs[indexClicked] = createdDM[0];
                        }
                        if (createdDM[1] == 'deleted') {
                            $scope.allDMs.splice(indexClicked, 1);
                        }
                    }
                });
            }

            //get all the roles and data managers
            $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
            $http.defaults.headers.common.Accept = 'application/json';
            DATA_MANAGER.getDMListModel().$promise.then(function (result) {
                for (var x = 0; x < result.length; x++) {
                    var orgName = allOrgRes.filter(function (or) { return or.organization_system_id == result[x].organization_system_id; })[0];
                    result[x].OrgName = orgName !== undefined ? orgName.OrganizationName : "";
                }
                $scope.allDMs = result;
                //if someone clicked on their name in the upper right corner or 'Your Account' tab, come in and straight away open modal
                if (userProfileId !== undefined && userProfileId !== null) {
                    var resp = $scope.allDMs.filter(function (dm) { return dm.data_manager_id == userProfileId; })[0];
                    $scope.stateParamId = userProfileId
                    $scope.showDataManagerModal(resp);
                }
            });

            
            //see if sorting order has already been set, preserve if so, otherwise set to 'lname'
            $scope.sortingOrder = $cookies.get('DMListSortOrder') !== undefined ? $cookies.get('DMListSortOrder') : 'lname';
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