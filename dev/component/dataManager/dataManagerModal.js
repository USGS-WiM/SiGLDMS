(function () {
    'use strict';

    var siGLControllers = angular.module('siGLControllers');


    siGLControllers.controller('dataManagerModal', ['$scope', '$rootScope', '$cookies', '$location', '$http', '$uibModal', '$uibModalInstance', '$stateParams', '$filter', 'ORGANIZATION_SYSTEM', 'PROJECT', 'DATA_MANAGER', 'ROLE', 'allRoles', 'allOrgList', 'allDivList', 'allSecList', 'allOrgResList', 'thisDM', 'allDMList','dmProjects',
    function ($scope, $rootScope, $cookies, $location, $http, $uibModal, $uibModalInstance, $stateParams, $filter, ORGANIZATION_SYSTEM, PROJECT, DATA_MANAGER, ROLE, allRoles, allOrgList, allDivList, allSecList, allOrgResList, thisDM, allDMList, dmProjects) {
        if ($cookies.get('siGLCreds') === undefined || $cookies.get('siGLCreds') === "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            $scope.DM = {}; //holder for member (either coming in for edit, or being created for post
            $scope.RoleList = allRoles;
            $scope.allDMs = allDMList;
            $scope.pass = {
                newP: '',
                confirmP: ''
            };
            //populate roles based on who's logged in
            $scope.loggedInUser = {};
            $scope.loggedInUser.Name = $cookies.get('usersName'); //User's NAME
            $scope.loggedInUser.ID = $cookies.get('dmID');
            $scope.loggedInUser.Role = $cookies.get('usersRole');
            $scope.matchingUsers = false;
            //#region Org stuff for dropdowns, filtering, change org click, update org action
            $scope.allOrglist = allOrgList;
            $scope.allDivlist = allDivList;
            $scope.allSeclist = allSecList;
            $scope.allOrgRes = allOrgResList;
            $scope.selectedOrgID = "";
            $scope.selectedDivID = "";
            $scope.selectedSecID = "";

            $scope.DMProjects = dmProjects; //All their Projects
            

            //see if sorting order has already been set, preserve if so, otherwise set to 'Name'
            $scope.sortingOrder = $cookies.get('DMprojectsSortOrder') !== undefined ? $cookies.get('DMprojectsSortOrder') : 'Name';
            $scope.reverse = $cookies.get('dmpl_reverse') !== undefined ? Boolean($cookies.get('dmpl_reverse')) : true;
            $scope.sort_by = function (newSortingOrder) {
                $cookies.put('DMprojectsSortOrder', newSortingOrder);
                if ($scope.sortingOrder == newSortingOrder) {
                    $scope.reverse = !$scope.reverse;
                    $cookies.put('dmpl_reverse', $scope.reverse);
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

            
            //needed for new and existing dms
            //#region Filter Divisions / Sections based on select change
            $scope.getDivs = function (orgID) {
                $scope.alldivs = {}; $scope.selectedDivID = ""; $scope.selectedSecID = "";
                $scope.alldivs = $scope.allDivlist.filter(function (d) { return d.org_id == orgID; });
                $scope.allsecs = {};
            };

            $scope.getSecs = function (divID) {
                $scope.selectedSecID = "";
                $scope.allsecs = $scope.allSeclist.filter(function (s) { return s.div_id == divID; });
            };
            //#endregion Filter Divisions / Sections based on select change

            //ADD ORG MODAL CONTENT (Add New ORG NAME, DIVISION, OR SECTION)
            $scope.AddNewOrg = function () {
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
                        allOrgs: function () { return $scope.allOrglist; },
                        allDivs: function () { return $scope.allDivlist; },
                        allSecs: function () { return $scope.allSeclist; }
                    }
                });
                modalInstance.result.then(function (updatedOrgDivSec) {
                    //make sure parent. are all updated
                    $scope.allOrglist = updatedOrgDivSec[0]; //allOrgs updated
                    $scope.allDivlist = updatedOrgDivSec[1]; //allDivs updated
                    $scope.allSeclist = updatedOrgDivSec[2]; //allSecs updated
                    //set selected choices
                    $scope.selectedOrgID = updatedOrgDivSec[3];
                    //need to populate all divs before making one selected
                    if ($scope.selectedOrgID !== "")
                        $scope.alldivs = $scope.allDivlist.filter(function (d) { return d.org_id == $scope.selectedOrgID; });

                    $scope.selectedDivID = updatedOrgDivSec[4];

                    //need to populate all secs before making one selected
                    if ($scope.selectedDivID !== "")
                        $scope.allsecs = $scope.allSeclist.filter(function (s) { return s.div_id == $scope.selectedDivID; });

                    $scope.selectedSecID = updatedOrgDivSec[5];
                }, function () {
                    //logic to do on cancel
                });
                //end modal
            }; //end AddNewOrg
            //#endregion Org stuff for dropdowns, filtering, change org click, update org action

            //is this creating new member or editing existing?
            if (thisDM !== "empty") {
                //check to see if the acct User is the same as the user they are looking at
                $scope.matchingUsers = thisDM.data_manager_id == $scope.loggedInUser.ID ? true : false;

                $scope.DM = angular.copy(thisDM);
                $scope.DM.role_name = $scope.RoleList.filter(function (rl) { return rl.role_id == $scope.DM.role_id; })[0].role_name;

                $scope.dmOrg = $scope.allOrgRes.filter(function (o) { return o.organization_system_id == $scope.DM.organization_system_id; })[0];

                $scope.changePass = false;
                $scope.changeOrg = false;
                $scope.newPass = "";
                
                //#region all DMs for dropdown in case they want to change the dm on the project (WHEN THE CLICK TO EDIT Project)
                setTimeout(function () {
                    //    for (var x = 0; x < $scope.$parent.allDMs.length; x++) {
                    //        $scope.$parent.allDMs[x].fullname = $scope.$parent.allDMs[x].fname + " " + $scope.$parent.allDMs[x].lname;
                    //    };
                   // $scope.allDMs = $scope.$parent.allDMs;
                  //  $scope.$apply;
                    //used in xeditable to show dm for project in dropdown
                    $scope.showDMs = function (project) {
                        var selected = [];
                        if (project.data_manager_id) {
                            selected = $filter('filter')($scope.allDMs, { data_manager_id: project.data_manager_id });
                        }
                        var fullName = "";
                        return selected.length ? selected[0].fullname : '';
                    }; //end showDMs
                }, 3000);
            }//end thisDM !== empty
            else {
                //this is a new dm being created
                $scope.DM = {};
                $scope.changeOrg = true; //flag to true so that org drop downs show without clicking "change my organization" button                
            } //end else  - new dm

            $scope.cancel = function () {
                $uibModalInstance.close();
            };

            $scope.create = function (valid) {
                    if (valid) {
                        $rootScope.stateIsLoading.showLoading = true; //loading...
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        $http.defaults.headers.common.Accept = 'application/json';
                        //see if they created an org or just chose an existing one
                        if ($scope.selectedOrgID !== "") {
                            var divID = $scope.selectedDivID === "" ? 0 : $scope.selectedDivID;
                            var secID = $scope.selectedSecID === "" ? 0 : $scope.selectedSecID;
                            var existingOrgRes = $scope.allOrgRes.filter(function (or) { return or.org_id == $scope.selectedOrgID && or.div_id == divID && or.sec_id == secID; })[0];
                            if (existingOrgRes !== undefined) {
                                //they didn't create a new one so we don't have to. just add the orgsysId to the dm and post
                                $scope.DM.organization_system_id = existingOrgRes.organization_system_id;
                                $scope.postNewDM();
                            } else {
                                //they created a new orgsys, post that first then post the new dm
                                var newOrgSys = { org_id: $scope.selectedOrgID, div_id: divID, sec_id: secID };
                                ORGANIZATION_SYSTEM.save(newOrgSys, function success(response) {
                                    $scope.DM.organization_system_id = response.organization_system_id;
                                    $scope.postNewDM();
                                }, function error(errorResponse) {
                                    $rootScope.stateIsLoading.showLoading = false; //loading... 
                                    toastr.error("Error: " + errorResponse.statusText);
                                });
                            }//end else (new Orgsys)
                        } else {
                            //they didn't choose an org
                            $scope.postNewDM();
                        }

                    }//end if valid
                    else {
                        alert("Please provide all required information.");
                    } //end else (not valid)
                };//end save

            //called from within save of new dm
            $scope.postNewDM = function () {
                $scope.DM.password = btoa($scope.pass.confirmP);
                var createdDM = {};
                DATA_MANAGER.save($scope.DM, function success(response) {
                    toastr.success("Data Manager Created");
                    //push this new dm into the dmList
                    createdDM = response;
                    var org = $scope.allOrgRes.filter(function (or) { return or.organization_system_id == createdDM.organization_system_id; })[0];
                    createdDM.OrgName = org !== undefined ? org.OrganizationName : "";
                    createdDM.fullname = response.fname + " " + response.lname;
                    createdDM.role_name = $scope.RoleList.filter(function (r) { return r.role_id == createdDM.role_id; })[0].role_name;
                    createdDM.project_count = 0;
                }, function error(errorResponse) {
                    $rootScope.stateIsLoading.showLoading = false; //loading... 
                    toastr.error("Error: " + errorResponse.statusText);
                }).$promise.then(function () {
                    var sendBack = [createdDM, 'created'];
                    $uibModalInstance.close(sendBack);
//                    $rootScope.stateIsLoading.showLoading = false; //loading...                        
  //                  $location.path('/dataManager/dataManagerList').replace();
                });
            };

            //user wants to change his organization
            $scope.changeMyOrgBtn = function () {
                $scope.changeOrg === false ? $scope.changeOrg = true : $scope.changeOrg = false;
                //preset selects with org they  currently have
                $scope.selectedOrgID = $scope.dmOrg.org_id;
                $scope.alldivs = $scope.allDivlist.filter(function (d) { return d.org_id == $scope.selectedOrgID; });
                $scope.selectedDivID = $scope.dmOrg.div_id;
                $scope.allsecs = $scope.allSeclist.filter(function (s) { return s.div_id == $scope.selectedDivID; });
                $scope.selectedSecID = $scope.dmOrg.sec_id;
            }; //end changeMyOrgBtn click

            //new org chosen (or created), now save
            $scope.UpdateMyOrg = function () {
                //update user's org with PUT
                var secID = $scope.selectedSecID !== "" ? $scope.selectedSecID : "0";
                var divID = $scope.selectedDivID !== "" ? $scope.selectedDivID : "0";
                var orgID = $scope.selectedOrgID !== "" ? $scope.selectedOrgID : "0";
                var chosenOrg = $scope.allOrgRes.filter(function (orgS) { return orgS.sec_id == secID && orgS.div_id == divID && orgS.org_id == orgID; })[0];
                if (chosenOrg !== undefined) {
                    $scope.DM.organization_system_id = chosenOrg.organization_system_id;
                    $scope.dmOrg = chosenOrg;
                    $scope.saveDMNewOrg();
                } else {
                    //is undefined, so they created a new one, so post the ORGANIZATION_SYSTEM then update the DM
                    var newORG_SYS = { org_id: orgID, div_id: divID, sec_id: secID };
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    ORGANIZATION_SYSTEM.save(newORG_SYS, function success(response) {
                        $scope.DM.organization_system_id = response.organization_system_id;
                        //need to update $scope.dmOrg 
                        var orgResource = {};
                        orgResource.organization_system_id = response.organization_system_id;
                        orgResource.org_id = orgID; orgResource.OrganizationName = $scope.allOrglist.filter(function (o) { return o.organization_id == orgID; })[0].organization_name;
                        if (divID > 0) {
                            orgResource.div_id = divID; orgResource.DivisionName = $scope.allDivlist.filter(function (d) { return d.division_id == divID; })[0].division_name;
                        }
                        if (secID > 0) {
                            orgResource.sec_id = secID; orgResource.SectionName = $scope.allSeclist.filter(function (s) { return s.section_id == secID; })[0].section_name;
                        }
                        $scope.allOrgRes.push(orgResource);
                        $scope.dmOrg = orgResource;
                        $scope.saveDMNewOrg();
                    });
                }
            }; //end UpdateMyOrg

            //nevermind
            $scope.DontUpdateOrg = function () {
                $scope.selectedOrgID = "";
                $scope.alldivs = {}; $scope.selectedDivID = "";
                $scope.allsecs = {}; $scope.selectedSecID = [];
                $scope.changeOrg = false;
            }; //end DontUpdateOrg

            //#endregion all DMs for dropdown in case they want to change the dm on the project (WHEN THE CLICK TO EDIT Project)

            //reassign this project to a different data manager
            $scope.updateDMonProj = function (data, project_id) {
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                var retur = false;
                PROJECT.query({ id: project_id }).$promise.then(function (response) {
                    response.data_manager_id = data.data_manager_id;
                    PROJECT.update({ id: project_id }, response, function success(response) {
                        toastr.success("Project Updated");
                        retur = response;
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                        retur = false;
                    }); //end PROJECT.save
                }); //end get the project
                return retur;
            }; //end updateDMonProj

            //delete this project and related stuff
            $scope.RemoveProject = function (proj) {
                //modal
                var modalInstance = $uibModal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        keyToRemove: function () {
                            return proj;
                        },
                        what: function () {
                            return "Project";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    //yes, remove this keyword
                    var index = $scope.DMProjects.indexOf(proj);
                    //DELETE it
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    PROJECT.delete({ id: proj.project_id }, function success(response) {
                        $scope.DMProjects.splice(index, 1);
                        toastr.success("Project Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };

            //password update section
            $scope.changeMyPassBtn = function (evt) {
                $scope.changePass === false ? $scope.changePass = true : $scope.changePass = false;
            }; //end changeMyPassBtn

            Date.prototype.addHours = function (h) {
                this.setHours(this.getHours() + h);
                return this;
            };            

            $scope.DontChangePass = function () {
                //nevermind, clear input
                $scope.changePass = false;
                $scope.pass.newP = '';
                $scope.pass.confirmP = '';
            }; //end DontChangePass
     
        }//end else - logged in

        $scope.saveDMNewOrg = function () {
            if ($scope.DM) {
                //ensure they don't delete required field values
                if ($scope.DM.fname !== null) {
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    var DM_PUT = {};
                    DM_PUT.data_manager_id = $scope.DM.data_manager_id;
                    DM_PUT.email = $scope.DM.email;
                    DM_PUT.fname = $scope.DM.fname;
                    DM_PUT.lname = $scope.DM.lname;
                    DM_PUT.organization_system_id = $scope.DM.organization_system_id;
                    DM_PUT.phone = $scope.DM.phone;
                    DM_PUT.role_id = $scope.DM.role_id;
                    DM_PUT.username = $scope.DM.username;
                    DATA_MANAGER.update({ id: $scope.DM.data_manager_id }, DM_PUT, function success(response) {
                        //update view back to label and close org/div/sec dropdowns
                        $scope.dmOrg = $scope.allOrgRes.filter(function (o) { return o.organization_system_id == $scope.DM.organization_system_id; })[0];
                        $scope.changeOrg === false ? $scope.changeOrg = true : $scope.changeOrg = false;
                        toastr.success("User Updated");
                    }, function error(errorResponse) {
                        toastr.error("Error updating Data Manager");
                    });
                } else { toastr.error("Please populate required fields before updating Organization"); }
            }
        }; //end saveDMNewOrg()

        $scope.save = function (valid) {
            if (valid) {            
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';                           
                var DM_PUT = {}; var updatedDM = {};
                DM_PUT.data_manager_id = $scope.DM.data_manager_id;
                if ($scope.pass.newP !== undefined) DM_PUT.password = btoa($scope.pass.newP);
                DM_PUT.email = $scope.DM.email;
                DM_PUT.fname = $scope.DM.fname;
                DM_PUT.lname = $scope.DM.lname;
                DM_PUT.organization_system_id = $scope.DM.organization_system_id;
                DM_PUT.phone = $scope.DM.phone;
                DM_PUT.role_id = $scope.DM.role_id;
                DM_PUT.username = $scope.DM.username;
                DATA_MANAGER.update({ id: $scope.DM.data_manager_id }, DM_PUT, function success(response) {
                    updatedDM = response;
                    var org = $scope.allOrgRes.filter(function (or) { return or.organization_system_id == updatedDM.organization_system_id; })[0];
                    updatedDM.OrgName = org !== undefined ? org.OrganizationName : "";
                    updatedDM.fullname = response.fname + " " + response.lname;
                    updatedDM.role_name = $scope.RoleList.filter(function (r) { return r.role_id == updatedDM.role_id; })[0].role_name;
                    updatedDM.project_count = $scope.DM.project_count;
                    //check if this is the member logged in and update the cookies if so
                    if ($scope.loggedInUser.ID == response.data_manager_id) {
                        if ($scope.pass.newP !== "") {
                            var enc = btoa(updatedDM.username.concat(":", $scope.pass.newP));
                            $cookies.put('siGLCreds', enc);
                        }
                        $cookies.put('siGLUsername', updatedDM.username);
                        var usersNAME = updatedDM.fname + " " + updatedDM.lname;
                        $cookies.put('usersName', usersNAME);
                    }
                    toastr.success("User Updated");
                    $scope.selectedOrgID = "";
                    $scope.alldivs = {}; $scope.selectedDivID = "";
                    $scope.allsecs = {}; $scope.selectedSecID = [];
                    $scope.changeOrg = false;
                }, function error(errorResponse) {
                    $rootScope.stateIsLoading.showLoading = false; //loading... 
                    toastr.error("Error: " + errorResponse.statusText);
                }).$promise.then(function () {
                    var sendBack = [updatedDM, 'updated'];
                    $uibModalInstance.close(sendBack);
                }); //end DATA_MANAGER.save                
            }
        };//end save
    }]);

})();