(function () {
    'use strict';

    var siGLControllers = angular.module('siGLControllers');


    siGLControllers.controller('dataManagerInfoCtrl', ['$scope', '$rootScope', '$cookies', '$location', '$http', '$uibModal', '$stateParams', '$filter', 'ORGANIZATION_SYSTEM', 'PROJECT', 'DATA_MANAGER', 'ROLE', 'allRoles', 'thisDM', 'dmProjects',
    function ($scope, $rootScope, $cookies, $location, $http, $uibModal, $stateParams, $filter, ORGANIZATION_SYSTEM, PROJECT, DATA_MANAGER, ROLE, allRoles, thisDM, dmProjects) {
        if ($cookies.get('siGLCreds') === undefined || $cookies.get('siGLCreds') === "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            $scope.DMProjects = dmProjects; //All their Projects
            $scope.RoleList = allRoles;

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

            $scope.pass = {
                newP: '',
                confirmP: ''
            };

            $scope.DM = {};
            //#region Org stuff for dropdowns, filtering, change org click, update org action
            $scope.allOrgs = $scope.$parent.allORGs;
            $scope.selectedOrgID = "";
            $scope.selectedDivID = "";
            $scope.selectedSecID = "";


            //needed for new and existing dms
            //#region Filter Divisions / Sections based on select change
            $scope.getDivs = function (orgID) {
                $scope.alldivs = {}; $scope.selectedDivID = ""; $scope.selectedSecID = "";
                $scope.alldivs = $scope.$parent.allDIVs.filter(function (d) { return d.ORG_ID == orgID; });
                $scope.allsecs = {};
            };

            $scope.getSecs = function (divID) {
                $scope.selectedSecID = "";
                $scope.allsecs = $scope.$parent.allSECs.filter(function (s) { return s.DIV_ID == divID; });
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
                    resolve: {
                        chosenParts: function () { return chosenparts; },
                        allOrgs: function () { return $scope.$parent.allORGs; },
                        allDivs: function () { return $scope.$parent.allDIVs; },
                        allSecs: function () { return $scope.$parent.allSECs; }
                    }
                });
                modalInstance.result.then(function (updatedOrgDivSec) {
                    //make sure parent. are all updated
                    $scope.$parent.allORGs = updatedOrgDivSec[0]; //allOrgs updated
                    $scope.$parent.allDIVs = updatedOrgDivSec[1]; //allDivs updated
                    $scope.$parent.allSECs = updatedOrgDivSec[2]; //allSecs updated
                    //set selected choices
                    $scope.selectedOrgID = updatedOrgDivSec[3];
                    //need to populate all divs before making one selected
                    if ($scope.selectedOrgID !== "")
                        $scope.alldivs = $scope.$parent.allDIVs.filter(function (d) { return d.ORG_ID == $scope.selectedOrgID; });

                    $scope.selectedDivID = updatedOrgDivSec[4];

                    //need to populate all secs before making one selected
                    if ($scope.selectedDivID !== "")
                        $scope.allsecs = $scope.$parent.allSECs.filter(function (s) { return s.DIV_ID == $scope.selectedDivID; });

                    $scope.selectedSecID = updatedOrgDivSec[5];
                }, function () {
                    //logic to do on cancel
                });
                //end modal
            }; //end AddNewOrg
            //#endregion Org stuff for dropdowns, filtering, change org click, update org action

            //is this creating new member or editing existing?
            if (thisDM !== undefined) {
                //check to see if the acct User is the same as the user they are looking at
                $scope.matchingUsers = $stateParams.id == $scope.$parent.loggedInUser.ID ? true : false;

                $scope.DM = thisDM;
                $scope.DM.roleName = $scope.RoleList.filter(function (rl) { return rl.ROLE_ID == $scope.DM.ROLE_ID; })[0].ROLE_NAME;

                $scope.dmOrg = $scope.$parent.allORG_RES.filter(function (o) { return o.OrganizationSystemID == $scope.DM.ORGANIZATION_SYSTEM_ID; })[0];

                $scope.changePass = false;
                $scope.changeOrg = false;
                $scope.newPass = "";

                //user wants to change his organization
                $scope.changeMyOrgBtn = function () {
                    $scope.changeOrg === false ? $scope.changeOrg = true : $scope.changeOrg = false;
                    //preset selects with org they  currently have
                    $scope.selectedOrgID = $scope.dmOrg.OrganizationID;
                    $scope.alldivs = $scope.$parent.allDIVs.filter(function (d) { return d.ORG_ID == $scope.selectedOrgID; });
                    $scope.selectedDivID = $scope.dmOrg.DivisionID;
                    $scope.allsecs = $scope.$parent.allSECs.filter(function (s) { return s.DIV_ID == $scope.selectedDivID; });
                    $scope.selectedSecID = $scope.dmOrg.SectionID;
                }; //end changeMyOrgBtn click

                //new org chosen (or created), now save
                $scope.UpdateMyOrg = function () {
                    //update user's org with PUT
                    var secID = $scope.selectedSecID !== "" ? $scope.selectedSecID : "0";
                    var divID = $scope.selectedDivID !== "" ? $scope.selectedDivID : "0";
                    var orgID = $scope.selectedOrgID !== "" ? $scope.selectedOrgID : "0";
                    var chosenOrg = $scope.allORG_RES.filter(function (orgS) { return orgS.SectionID == secID && orgS.DivisionID == divID && orgS.OrganizationID == orgID; })[0];
                    if (chosenOrg !== undefined) {
                        $scope.DM.ORGANIZATION_SYSTEM_ID = chosenOrg.OrganizationSystemID;
                        $scope.dmOrg = chosenOrg;
                        $scope.SaveOnBlur();
                    } else {
                        //is undefined, so they created a new one, so post the ORGANIZATION_SYSTEM then update the DM
                        var newORG_SYS = { ORG_ID: orgID, DIV_ID: divID, SEC_ID: secID };
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        $http.defaults.headers.common.Accept = 'application/json';
                        ORGANIZATION_SYSTEM.save(newORG_SYS, function success(response) {
                            $scope.DM.ORGANIZATION_SYSTEM_ID = response.ORGANIZATION_SYSTEM_ID;
                            //need to update $scope.dmOrg which is an ORGANIZATION_RESOURCE
                            var orgResource = {};
                            orgResource.OrganizationSystemID = response.ORGANIZATION_SYSTEM_ID;
                            orgResource.OrganizationID = orgID; orgResource.OrganizationName = $scope.allOrgs.filter(function (o) { return o.ORGANIZATION_ID == orgID; })[0].ORGANIZATION_NAME;
                            if (divID > 0) {
                                orgResource.DivisionID = divID; orgResource.DivisionName = $scope.$parent.allDIVs.filter(function (d) { return d.DIVISION_ID == divID; })[0].DIVISION_NAME;
                            }
                            if (secID > 0) {
                                orgResource.SectionID = secID; orgResource.SectionName = $scope.$parent.allSECs.filter(function (s) { return s.SECTION_ID == secID; })[0].SECTION_NAME;
                            }
                            $scope.$parent.allORG_RES.push(orgResource);
                            $scope.dmOrg = orgResource;
                            $scope.SaveOnBlur();
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

                //change to the user made, put it .. fired on each blur after change made to field
                $scope.SaveOnBlur = function () {
                    if ($scope.DM) {
                        //ensure they don't delete required field values
                        if ($scope.DM.FNAME !== null) {
                            $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                            $http.defaults.headers.common.Accept = 'application/json';
                            $http.defaults.headers.common['X-HTTP-Method-Override'] = 'PUT';
                            var DM_PUT = {};
                            DM_PUT.DATA_MANAGER_ID = $scope.DM.DATA_MANAGER_ID; DM_PUT.EMAIL = $scope.DM.EMAIL;
                            DM_PUT.FNAME = $scope.DM.FNAME; DM_PUT.LNAME = $scope.DM.LNAME; DM_PUT.ORGANIZATION_SYSTEM_ID = $scope.DM.ORGANIZATION_SYSTEM_ID;
                            DM_PUT.PHONE = $scope.DM.PHONE; DM_PUT.ROLE_ID = $scope.DM.ROLE_ID; DM_PUT.USERNAME = $scope.DM.USERNAME;
                            DATA_MANAGER.save({ id: $scope.DM.DATA_MANAGER_ID }, DM_PUT, function success(response) {
                                toastr.success("User Updated");
                                $scope.selectedOrgID = "";
                                $scope.alldivs = {}; $scope.selectedDivID = "";
                                $scope.allsecs = {}; $scope.selectedSecID = [];
                                $scope.changeOrg = false;
                                //  $scope.dmOrg = $scope.$parent.allORG_RES.filter(function (o) { return o.OrganizationSystemID == $scope.DM.ORGANIZATION_SYSTEM_ID });
                            }, function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }); //end DATA_MANAGER.save
                            delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                        }
                    }
                };//end SaveOnBlur

                //#region all DMs for dropdown in case they want to change the dm on the project (WHEN THE CLICK TO EDIT Project)
                setTimeout(function () {
                    //    for (var x = 0; x < $scope.$parent.allDMs.length; x++) {
                    //        $scope.$parent.allDMs[x].FULLNAME = $scope.$parent.allDMs[x].FNAME + " " + $scope.$parent.allDMs[x].LNAME;
                    //    };
                    $scope.allDMs = $scope.$parent.allDMs;
                    $scope.$apply;
                    //used in xeditable to show dm for project in dropdown
                    $scope.showDMs = function (project) {
                        var selected = [];
                        if (project.DATA_MANAGER_ID) {
                            selected = $filter('filter')($scope.allDMs, { DATA_MANAGER_ID: project.DATA_MANAGER_ID });
                        }
                        var fullName = "";
                        return selected.length ? selected[0].FULLNAME : '';
                    }; //end showDMs


                }, 3000);
                //#endregion all DMs for dropdown in case they want to change the dm on the project (WHEN THE CLICK TO EDIT Project)

                //reassign this project to a different data manager
                $scope.updateDMonProj = function (data, ProjID) {
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    //$http.defaults.headers.common['X-HTTP-Method-Override'] = 'PUT';

                    var retur = false;
                    PROJECT.updateDM({ id: ProjID, DataManager: data.DataManagerID }, function success(response) {
                        //PROJECT.save({ id: data.PROJECT_ID }, data, function success(response) {
                        toastr.success("Project Updated");
                        retur = response;
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                        retur = false;
                    }); //end PROJECT.save
                    delete $http.defaults.headers.common['X-HTTP-Method-Override'];
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
                        PROJECT.delete({ id: proj.ProjId }, function success(response) {
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

                $scope.ChangePassword = function () {
                    //change User's password
                    if ($scope.pass.newP === "" || $scope.pass.confirmP === "") {
                        //modal for entering a password first
                        var modalInstance = $uibModal.open({
                            template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                                        '<div class="modal-body"><p>You must first enter a new Password.</p></div>' +
                                        '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button></div>',
                            controller: function ($scope, $uibModalInstance) {
                                $scope.ok = function () {
                                    $uibModalInstance.close('password');
                                };
                            },
                            size: 'sm'
                        });
                        modalInstance.result.then(function (fieldFocus) {
                            if (fieldFocus == "password") {
                                $("#inputNPASSWORD").focus();
                            }
                        });
                    } else {
                        DATA_MANAGER.changePW({ username: $scope.DM.USERNAME, newP: $scope.pass.newP },
                            function success(response) {
                                toastr.success("Password Updated");
                                //update creds
                                var enc = btoa($scope.DM.USERNAME.concat(":", $scope.pass.newP));
                                var expireDate = new Date().addHours(8);
                                $cookies.put('siGLCreds', enc, { 'expires': expireDate });
                                $cookies.put('siGLUsername', $scope.aMember.USERNAME);
                                $cookies.put('usersName', $scope.$parent.loggedInUser.Name);
                                $cookies.put('mID', $scope.DM.DATA_MANAGER_ID);
                                var roleName;
                                switch ($scope.DM.ROLE_ID) {
                                    case 1:
                                        roleName = "Admin";
                                        break;
                                    case 2:
                                        roleName = "Manager";
                                        break;
                                    default:
                                        roleName = "Public";
                                        break;
                                }
                                $cookies.put('usersRole', roleName);


                                $scope.changePass = false;
                                $scope.pass.newP = '';
                                $scope.pass.confirmP = '';
                            },
                            function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }
                        );//end DATA_MANAGER.changePW
                    } //end else
                }; //end ChangePassword

                $scope.DontChangePass = function () {
                    //nevermind, clear input
                    $scope.changePass = false;
                    $scope.pass.newP = '';
                    $scope.pass.confirmP = '';
                }; //end DontChangePass

            }//end if thisDM != undefined
            else {
                //this is a new dm being created
                $scope.changeOrg = true; //flag to true so that org drop downs show without clicking "change my organization" button
                $scope.save = function (valid) {
                    if (valid) {
                        $rootScope.stateIsLoading.showLoading = true; //loading...
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        $http.defaults.headers.common.Accept = 'application/json';
                        //see if they created an org or just chose an existing one
                        if ($scope.selectedOrgID !== "") {
                            var divID = $scope.selectedDivID === "" ? 0 : $scope.selectedDivID;
                            var secID = $scope.selectedSecID === "" ? 0 : $scope.selectedSecID;
                            var existingOrgRes = $scope.allORG_RES.filter(function (or) { return or.OrganizationID == $scope.selectedOrgID && or.DivisionID == divID && or.SectionID == secID; })[0];
                            if (existingOrgRes !== undefined) {
                                //they didn't create a new one so we don't have to. just add the orgsysId to the dm and post
                                $scope.DM.ORGANIZATION_SYSTEM_ID = existingOrgRes.OrganizationSystemID;
                                $scope.postNewDM();
                            } else {
                                //they created a new orgsys, post that first then post the new dm
                                var newOrgSys = { ORG_ID: $scope.selectedOrgID, DIV_ID: divID, SEC_ID: secID };
                                ORGANIZATION_SYSTEM.save(newOrgSys, function success(response) {
                                    $scope.DM.ORGANIZATION_SYSTEM_ID = response.ORGANIZATION_SYSTEM_ID;
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
                    DATA_MANAGER.addDataManager({ pass: $scope.pass.confirmP }, $scope.DM, function success(response) {
                        toastr.success("Data Manager Created");
                        //push this new dm into the dmList
                        var nm = response;
                        var org = $scope.allORG_RES.filter(function (or) { return or.OrganizationSystemID == nm.ORGANIZATION_SYSTEM_ID; })[0];
                        nm.OrgName = org !== undefined ? org.OrganizationName : "";
                        nm.FULLNAME = response.FNAME + " " + response.LNAME;
                        nm.roleName = $scope.$parent.allROLEs.filter(function (r) { return r.ROLE_ID == nm.ROLE_ID; })[0].ROLE_NAME;
                        nm.projCont = 0;
                        $scope.allDMs.push(nm); $scope.$parent.allDMs.push(nm);
                    }, function error(errorResponse) {
                        $rootScope.stateIsLoading.showLoading = false; //loading... 
                        toastr.error("Error: " + errorResponse.statusText);
                    }).$promise.then(function () {
                        $rootScope.stateIsLoading.showLoading = false; //loading...                        
                        $location.path('/dataManager/dataManagerList').replace();
                    });
                };
            } //end else  - new dm
        }//end else - logged in
    }]);

})();