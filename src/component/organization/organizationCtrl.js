(function () {
    'use strict';

    var siGLControllers = angular.module('siGLControllers');

    siGLControllers.controller('organizationCtrl', ['$scope','$q', '$http', '$cookies', '$uibModal', 'allDMs', 'allOrgRes', 'allOrgs', 'allDivs', 'allSecs', 'ORGANIZATION_RESOURCE',
    function ($scope, $q, $http, $cookies, $uibModal, allDMs, allOrgRes, allOrgs, allDivs, allSecs, ORGANIZATION_RESOURCE) {
        $scope.accountRole = $cookies.get('usersRole');
        $scope.OrgListModel = allOrgRes;
        $scope.orgCntLoading = true; // show/hide loading next to proj cnt
        var oPromises = [];
        $http.defaults.headers.common.Accept = 'application/json';
        //get all the projects at these lakes
        angular.forEach($scope.OrgListModel, function (o) {
            var oDeferred = $q.defer();
            ORGANIZATION_RESOURCE.getOrgProjects({ id: o.OrganizationSystemID }, function success(response) {
                o.Projects = response;
                oDeferred.resolve(response);
            });
            oPromises.push(oDeferred.promise);
        });
        $q.all(oPromises).then(function () {
            //now turn off loading
            $scope.orgCntLoading = false;
        });
        $scope.OrgsortingOrder = 'OrganizationName';
        $scope.Orgreverse = false;
        $scope.Orgsort_by = function (newSortingOrder) {
            if ($scope.OrgsortingOrder == newSortingOrder) {
                $scope.Orgreverse = !$scope.Orgreverse;
            }
            $scope.OrgsortingOrder = newSortingOrder;
            // icon setup
            $('th i').each(function () {
                // icon reset
                $(this).removeClass().addClass('glyphicon glyphicon-sort');
            });
            if ($scope.Orgreverse) {
                $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-up');
            } else {
                $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-down');
            }
        };
        $scope.showAddOrgForm = false;  //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
        $scope.addOrgButtonShowing = true; //start it at true..when clicked, show form, hide button
        $scope.newOrg = {};
        //show Add New .... clicked, hide the button and show the form
        $scope.showAddOrgClicked = function () {
            $scope.showAddOrgForm = true; //show the form
            $scope.addOrgButtonShowing = false; //hide button
        };
        $scope.NeverMindOrg = function () {
            $scope.newLT = {};
            $scope.showAddOrgForm = false; //hide the form
            $scope.addOrgButtonShowing = true; //show button

        };
        $scope.AddOrg = function (valid) {
            if (valid) {
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                //LAKE_TYPE.save($scope.newLT, function success(response) {
                //    $scope.lakeTypeList.push(response);
                //    $scope.newLT = {};
                //    $scope.showAddOrgForm = false; //hide the form
                //    $scope.addOrgButtonShowing = true; //show the button again
                //    toastr.success("Lake Type Added");
                //}, function error(errorResponse) {
                //    toastr.error("Error: " + errorResponse.statusText);
                //});
            }
        };
        $scope.storeExistingOrg = function (data) {
            $scope.thisOrg = angular.copy(data);
        };
        
        $scope.saveOrg = function (data, id) {
            var b4ChangeOrg = $scope.thisOrg;
            //section change or addition/subraction
            var Changes = [];
            angular.forEach(this.orgRowform.$editables, function (value, key) {
                if (key[0] == '$') return;
                for (var x = 0; x < value.inputEl[0].classList.length; x++){
                    var val = value.inputEl[0].classList[x];
                    if (val == 'ng-modified') Changes.push(value.name);
                }
            });
            //var retur = false;
            $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
            $http.defaults.headers.common.Accept = 'application/json';
            //LAKE_TYPE.update({ id: id }, data, function success(response) {
            //    retur = response;
            //    toastr.success("Lake Type Updated");
            //}, function error(errorResponse) {
            //    retur = false;
            //    toastr.error("Error: " + errorResponse.statusText);
            //});
           // return retur;
        };
        $scope.deleteOrg = function (lt) {
            var modalInstance = $uibModal.open({
                templateUrl: 'removemodal.html',
                controller: 'ConfirmModalCtrl',
                size: 'sm',
                resolve: {
                    keyToRemove: function () {
                        return lt;
                    },
                    what: function () {
                        return "Organization";
                    }
                }
            });
            modalInstance.result.then(function (keyToRemove) {
                var index = $scope.lakeTypeList.indexOf(lt);
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                //LAKE_TYPE.delete({ id: lt.LAKE_TYPE_ID }, function success(response) {
                //    $scope.lakeTypeList.splice(index, 1);
                //    toastr.success("Lake Type Removed");
                //}, function error(errorResponse) {
                //    toastr.error("Error: " + errorResponse.statusText);
                //});
            }, function () {
                //logic for cancel
            });//end modal
        };

        $scope.showProjectCntModal = function (p, type) {
            var projModal = $uibModal.open({
                templateUrl: 'lookupProjectListModal.html',
                controller: function ($scope, $uibModalInstance, DMList) {
                    $scope.plsortingOrder = 'NAME';
                    $scope.plreverse = false;
                    $scope.plsort_by = function (newSortingOrder) {
                        if ($scope.plsortingOrder == newSortingOrder) {
                            $scope.plreverse = !$scope.plreverse;
                        }
                        $scope.plsortingOrder = newSortingOrder;
                        // icon setup
                        $('th i').each(function () {
                            // icon reset
                            $(this).removeClass().addClass('glyphicon glyphicon-sort');
                        });
                        if ($scope.plreverse) {
                            $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-up');
                        } else {
                            $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-down');
                        }
                    };

                    $scope.Type = type;
                    $scope.ProjectList = p;
                    angular.forEach($scope.ProjectList, function (p) {
                        p.DataManager = DMList.filter(function (d) { return d.DATA_MANAGER_ID == p.DATA_MANAGER_ID; })[0];
                    });

                    $scope.ok = function () {
                        $uibModalInstance.dismiss();
                    };
                },
                size: 'lg',
                resolve: {
                    DMList: function () {
                        return allDMs;
                    }
                }
            });
        };
    }]);
})();