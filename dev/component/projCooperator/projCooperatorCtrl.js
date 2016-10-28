(function () {
    'use strict';

    var siGLControllers = angular.module('siGLControllers');
    siGLControllers.controller('projCooperatorCtrl', ['$scope', '$http', '$cookies', '$filter', '$uibModal', 'ProjParts_Service', 'thisProject', 'allOrgList', 'allDivisionList', 'allSectionList', 'PROJECT',
        function ($scope, $http, $cookies, $filter, $uibModal, ProjParts_Service, thisProject, allOrgList, allDivisionList, allSectionList, PROJECT) {
            $scope.ProjOrgs = ProjParts_Service.getAllProjectOrgs();// projOrgs;
            $scope.allOrgs = allOrgList; 
            $scope.allDivisions = allDivisionList; 
            $scope.allSections = allSectionList; 

            $scope.selectedOrgID = "";
            $scope.selectedDivID = "";
            $scope.selectedSecID = "";

            $scope.getDivs = function (orgID) {
                $scope.alldivs = {}; $scope.selectedDivID = ""; $scope.selectedSecID = "";
                $scope.alldivs = $scope.allDivisions.filter(function (d) {
                    return d.org_id == orgID;
                });
                $scope.allsecs = {};
            };

            $scope.getSecs = function (divID) {
                $scope.selectedSecID = "";
                $scope.allsecs = $scope.allSections.filter(function (s) { return s.div_id == divID; });
            };

            //ADD ORG MODAL CONTENT (Add New ORG NAME, DIVISION, OR SECTION)
            $scope.addNewOrg = function () {
                //modal
                //pass array of chosen org/div so they will be prepopulated in modal
                var chosenparts = [$scope.selectedOrgID, $scope.selectedDivID, $scope.selectedSecID];
                var modalInstance = $uibModal.open({
                    templateUrl: 'AddOrganizationModal.html',
                    controller: 'AddOrgModalCtrl',
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false,
                    resolve: {
                        chosenParts: function () { return chosenparts; },
                        allOrgs: function () { return $scope.allOrgs; },
                        allDivs: function () { return $scope.allDivisions; },
                        allSecs: function () { return $scope.allSections; }
                    }
                });
                modalInstance.result.then(function (updatedOrgDivSec) {
                    //make sure parent. are all updated
                    $scope.allOrgs = updatedOrgDivSec[0]; //allOrgs updated
                    $scope.allDivisions = updatedOrgDivSec[1]; //allDivs updated
                    $scope.allSections = updatedOrgDivSec[2]; //allSecs updated
                    //set selected choices
                    $scope.selectedOrgID = updatedOrgDivSec[3];
                    //need to populate all divs before making one selected
                    if ($scope.selectedOrgID !== "")
                        $scope.alldivs = $scope.allDivisions.filter(function (d) { return d.org_id == $scope.selectedOrgID; });

                    $scope.selectedDivID = updatedOrgDivSec[4];

                    //need to populate all secs before making one selected
                    if ($scope.selectedDivID !== "")
                        $scope.allsecs = $scope.allSections.filter(function (s) { return s.div_id == $scope.selectedDivID; });

                    $scope.selectedSecID = updatedOrgDivSec[5];
                }, function () {
                    //logic to do on cancel
                });
                //end modal
            }; //end AddNewOrg

            //adding a new organization to this project (need to check if a new ORGANIZATION_SYSTEM needs to be posted first
            $scope.AddOrgToProj = function () {
                if ($scope.selectedOrgID === "") {
                    //modal for enter all required fields
                    var modalInstance = $uibModal.open({
                        template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                                    '<div class="modal-body"><p>You must choose an Organization Name to add.</p></div>' +
                                    '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button></div>',
                        controller: function ($scope, $uibModalInstance) {
                            $scope.ok = function () {
                                $uibModalInstance.close('org');
                            };
                        },
                        size: 'sm'
                    });
                    modalInstance.result.then(function (fieldFocus) {
                        if (fieldFocus == "org") {
                            $("#OrgName").focus();
                        }
                    });
                } else {
                    var secId = $scope.selectedSecID !== "" ? $scope.selectedSecID : "0";
                    var divId = $scope.selectedDivID !== "" ? $scope.selectedDivID : "0";
                    var orgId = $scope.selectedOrgID !== "" ? $scope.selectedOrgID : "0";
                    var alreadyExist = $scope.ProjOrgs.filter(function (po) { return po.org_id == orgId && po.div_id == divId && po.sec_id == secId; })[0];
                    if (alreadyExist !== undefined) {
                        alert("This Organization is already a part of this Project.");
                    } //end this project doesn't already have this org
                    else {
                        PROJECT.addProjOrg({ id: thisProject.project_id, orgId: orgId, divId: divId, secId: secId }, function success(response) {
                            //array of all the ORGANIZATION_RESOURCES for this project
                            var postedORG = response.filter(function (postedO) { return postedO.org_id == orgId && postedO.div_id == divId && postedO.sec_id == secId; })[0];
                            $scope.ProjOrgs.push(postedORG);
                            ProjParts_Service.setAllProjectOrgs($scope.ProjOrgs);
                            //get the project here so we can update the lastEditedStamp
                            PROJECT.query({ id: thisProject.project_id }).$promise.then(function (response) {
                                ProjParts_Service.setLastEditedStamp(response.last_edited_stamp);
                            });                            
                            //$scope.ProjOrgs = response;
                            $scope.coopCount.total = $scope.coopCount.total + 1;
                            $scope.alldivs = {}; $scope.allsecs = {}; $scope.selectedOrgID = ""; $scope.selectedDivID = ""; $scope.selectedSecID = "";
                            $scope.projectForm.Coop.$setPristine(true);
                            toastr.success("Organization Added");
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        });
                    }
                }
            };//end AddOrg (projectCooperator)

            $scope.RemoveOrgFromProj = function (org) {
                //modal
                var modalInstance = $uibModal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        keyToRemove: function () {
                            return org;
                        },
                        what: function () {
                            return "Organization";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    //yes, remove this keyword
                    var index = $scope.ProjOrgs.indexOf(org);
                    //DELETE it
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    PROJECT.deleteProjOrg({ id: thisProject.project_id, OrgSystemId: org.organization_system_id }, function success(response) {
                        $scope.ProjOrgs.splice(index, 1);
                        ProjParts_Service.setAllProjectOrgs($scope.ProjOrgs);
                        //get the project here so we can update the lastEditedStamp
                        PROJECT.query({ id: thisProject.project_id }).$promise.then(function (response) {
                            ProjParts_Service.setLastEditedStamp(response.last_edited_stamp);
                        });
                        $scope.coopCount.total = $scope.coopCount.total - 1;
                        toastr.success("Organization Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });
                //end modal
            };
        }]);
})();
