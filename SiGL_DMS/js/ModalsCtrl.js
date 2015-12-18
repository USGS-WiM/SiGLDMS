(function () {
    "use strict"; 
    var ModalControllers = angular.module('ModalControllers',  []);

    //popup new Site name
    ModalControllers.controller('NewSiteNameModalCtrl', ['$scope', '$uibModalInstance', 'thisSiteID', NewSiteNameModalCtrl]);
    function NewSiteNameModalCtrl($scope, $uibModalInstance, thisSiteID) {
        var nameToSendBack = {
        };
        $scope.newSite = {};
        $scope.ok = function () {
            nameToSendBack.name = $scope.newSite.NAME;
            nameToSendBack.id = thisSiteID;
            $uibModalInstance.close(nameToSendBack);
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }

    //popup confirm box
    ModalControllers.controller('ConfirmModalCtrl', ['$scope', '$uibModalInstance', 'keyToRemove', 'what', ConfirmModalCtrl]);
    function ConfirmModalCtrl($scope, $uibModalInstance, keyToRemove, what) {

        //todo: figure out how removing url is handled.. "URL"
        switch (what) {
            case "URL":
                $scope.keyToRmv = keyToRemove;
                break;
            case "Keyword":
                //keyword
                $scope.keyToRmv = keyToRemove.TERM;
                break;
            case "Organization":
                $scope.keyToRmv = keyToRemove.OrganizationName;
                break;
            case "Data":
                var DstringToUse = keyToRemove.DESCRIPTION != null ? keyToRemove.DESCRIPTION : keyToRemove.HOST_NAME;
                DstringToUse = DstringToUse != null ? DstringToUse : keyToRemove.PORTAL_URL;
                $scope.keyToRmv = DstringToUse;
                break;
            case "Contact":
                $scope.keyToRmv = keyToRemove.NAME;
                break;
            case "Publication":
                var stringToUse = keyToRemove.TITLE != null ? keyToRemove.TITLE : keyToRemove.DESCRIPTION;
                stringToUse = stringToUse != null ? stringToUse : keyToRemove.URL;
                $scope.keyToRmv = stringToUse;
                break;
            case "Frequency Type":
                $scope.keyToRmv = keyToRemove.FREQUENCY;
                break;
            case "Lake Type":
                $scope.keyToRmv = keyToRemove.LAKE;
                break;
            case "Media Type":
                $scope.keyToRmv = keyToRemove.MEDIA;
                break;
            case "Objective Type":
                $scope.keyToRmv = keyToRemove.OBJECTIVE;
                break;
            case "Parameter Type":
                $scope.keyToRmv = keyToRemove.PARAMETER;
                break;
            case "Resource Type":
                $scope.keyToRmv = keyToRemove.RESOURCE_NAME;
                break;
            case "Project Duration":
                $scope.keyToRmv = keyToRemove.DURATION_VALUE;
                break;
            case "Project Status Type":
                $scope.keyToRmv = keyToRemove.STATUS_VALUE;
                break;
            case "Status Type":
                $scope.keyToRmv = keyToRemove.STATUS;
                break;
            case "Project":
                $scope.keyToRmv = keyToRemove.Name;
                break;
            case "Site":
                $scope.keyToRmv = keyToRemove.Name;
                break;
            default:
                $scope.keyToRmv = "error";
        }

        $scope.what = what;

        $scope.ok = function () {
            $uibModalInstance.close(keyToRemove);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }

    //org popup to add to org db
    ModalControllers.controller('AddOrgModalCtrl', ['$scope', '$cookies', '$uibModalInstance', '$http', 'chosenParts', 'allOrgs', 'allDivs', 'allSecs', 'ORGANIZATION', 'DIVISION', 'SECTION', AddOrgModalCtrl]);
    function AddOrgModalCtrl($scope, $cookies, $uibModalInstance, $http, chosenParts, allOrgs, allDivs, allSecs, ORGANIZATION, DIVISION, SECTION) {
        //globals
        $scope.OrgName = {}; //new org name input ng-model
        $scope.divisionName = {}; //new div name input ng-model
        $scope.sectionName = {}; //new sec name input ng-model
        $scope.orgList = allOrgs;
        $scope.allDivList = allDivs;
        $scope.allSecList = allSecs;
        $scope.orgsBeenChosen = false; //flag for showing 'Add new Division' button
        $scope.divsBeenChosen = false; //flag for showing 'Add new Section' button
        $scope.showAddNAMEinput = false; //flag for ng-show on new org name input area
        $scope.showAddDIVISIONinput = false; //flag for ng-show on new div name input area
        $scope.showAddSECTIONinput = false; //flag for ng-show on new sec name input area
        $scope.disableOrgSelect = false; //disable the select dropdown while they are created a new one
        $scope.disableDivSelect = false; //disable the select dropdown while they are created a new one
        $scope.disableSecSelect = false; //disable the select dropdown while they are created a new one
        $scope.originalOrgId = chosenParts[0] != "" ? Number(chosenParts[0]) : 0;
        $scope.originalDivId = chosenParts[1] != "" ? Number(chosenParts[1]) : 0;
        $scope.originalSecId = chosenParts[2] != "" ? Number(chosenParts[2]) : 0;

        //set selected parts based on what they choose from main page before hitting button to open modal
        $scope.selectedOrgID = {};
        $scope.selectedOrgID.id = chosenParts[0] != "" ? Number(chosenParts[0]) : "";
        $scope.divList = []; //what the select uses, based on org chosen
        $scope.secList = []; //what the select uses, based on div chosen

        //if they did choose an org before opening modal, go get the divs for this org
        if ($scope.selectedOrgID.id != "") {
            $scope.orgsBeenChosen = true;
            $scope.divList = $scope.allDivList.filter(function (d) { return d.ORG_ID == $scope.selectedOrgID.id; });
        }
        $scope.selectedDivID = {};
        $scope.selectedDivID.id = chosenParts[1] != "" ? Number(chosenParts[1]) : "";
        //if they did choose an div before opening modal, go get the sec for this div
        if ($scope.selectedDivID.id != "") {
            $scope.divsBeenChosen = true;
            $scope.secList = $scope.allSecList.filter(function (s) { return s.DIV_ID == $scope.selectedDivID.id; });
        }

        $scope.selectedSecID = {}; //not going to preset this because if they are in the modal, they will at the least be created a new section
        $scope.selectedSecID.id = chosenParts[2] != "" ? Number(chosenParts[2]) : "";

        //ng-change event on org select: they selected an org name, get those divs
        $scope.getDivs = function (orgID) {
            $scope.selectedOrgID.id = orgID;
            $scope.selectedDivID.id = ""; $scope.selectedSecID.id = "";
            $scope.divList = [];
            $scope.divList = $scope.allDivList.filter(function (d) { return d.ORG_ID == orgID; });

            $scope.secList = [];
            $scope.orgsBeenChosen = true;
            $scope.divsBeenChosen = false;
        };
        //ng-change event on div select: they selected an div, get those secs
        $scope.getSecs = function (divID) {
            $scope.selectedDivID.id = divID;
            $scope.selectedSecID.id = "";
            $scope.secList = $scope.allSecList.filter(function (s) { return s.DIV_ID == divID; });
            $scope.divsBeenChosen = true;
        };

        //they clicked 'Add Organization' 
        $scope.addOrgName = function () {
            $scope.showAddNAMEinput = true;
            $scope.selectedOrgID.id = ""; $scope.selectedDivID.id = ""; $scope.selectedSecID.id = "";
            $scope.disableOrgSelect = true;

        };
        //this is the one they want to add
        $scope.addThisName = function (nameToAdd) {
            //make sure they typed something in to add
            if (nameToAdd != "") {
                var orgToPost = {
                    ORGANIZATION_NAME: nameToAdd
                };
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                ORGANIZATION.save(orgToPost, function success(response) {
                    //add this new one to the lists
                    $scope.orgList.push(response);
                    //Make just added one selected
                    $scope.selectedOrgID.id = response.ORGANIZATION_ID;
                    //they added it, so update the originalOrgID too 
                    $scope.originalOrgId = response.ORGANIZATION_ID;
                    $scope.orgsBeenChosen = true;

                    //clear input, hide input
                    $scope.OrgName.value = "";
                    $scope.showAddNAMEinput = false;
                    $scope.disableOrgSelect = false;
                });
            } else {
                alert("Type in the new Organization first.");
            }
        };

        //they clicked 'Add Division' 
        $scope.addDivName = function () {
            $scope.showAddDIVISIONinput = true;
            $scope.selectedDivID.id = ""; $scope.selectedSecID.id = "";
            $scope.disableDivSelect = true;
        };
        //this is the one they want to add
        $scope.addThisDivision = function (divToAdd, orgID) {
            if (divToAdd != "" && orgID != "") {
                var divToPost = { DIVISION_NAME: divToAdd, ORG_ID: orgID };
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                DIVISION.save(divToPost, function success(response) {
                    $scope.allDivList.push(response);
                    $scope.divList.push(response); //push to the dropdown (these divs for this org)
                    //Make just added one selected
                    $scope.selectedDivID.id = response.DIVISION_ID;
                    //they added it, so update the originalDivID with it
                    $scope.originalDivId = response.DIVISION_ID;
                    $scope.divsBeenChosen = true; //show "add section" button text

                    //clear input, hide input
                    $scope.divisionName.value = "";
                    $scope.showAddDIVISIONinput = false;
                    $scope.disableDivSelect = false;
                });
            } else {
                alert("Choose an Organization and type in the new Division first.");
            }
        };

        //they clicked 'Add Section' 
        $scope.addSecName = function () {
            $scope.showAddSECTIONinput = true;
            $scope.selectedSecID.id = "";
            $scope.disableSecSelect = true;
        };
        //this is the one they want to add
        $scope.addThisSection = function (secToAdd, divID) {
            if (secToAdd != "" && divID != "") {
                var secToPost = { SECTION_NAME: secToAdd, DIV_ID: divID };
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                SECTION.save(secToPost, function success(response) {
                    $scope.allSecList.push(response); //push to all sections 
                    $scope.secList.push(response); //push to the dropdown (these secs for this div)
                    //Make just added one selected
                    $scope.selectedSecID.id = response.SECTION_ID;
                    //they added it, so update the originalDivID with it
                    $scope.originalSecId = response.SECTION_ID;

                    //clear input, hide input
                    $scope.sectionName.value = "";
                    $scope.showAddSECTIONinput = false;
                    $scope.disableSecSelect = false;
                });
            } else {
                alert("Choose an Organization, Division and type in the new Section first.");
            }
        };
        //make sure the selectedSecID gets stored to pass back to the page that called this modal so it will be preselected there upon closing the modal

        $scope.setSecs = function (secID) {
            $scope.selectedSecID.id = secID;
        };

        //want to close input for adding new part
        $scope.neverMind = function (which) {
            //clear 'which' input and hide all input divs
            if (which == "org") {
                $scope.OrgName.value = ""; $scope.showAddNAMEinput = false;
                $scope.disableOrgSelect = false;
                $scope.selectedOrgID.id = $scope.originalOrgId;
            }
            if (which == "div") {
                $scope.divisionName.value = ""; $scope.showAddDIVISIONinput = false;
                $scope.disableDivSelect = false;
                $scope.selectedDivID.id = $scope.originalDivId;
            }
            if (which == "sec") {
                $scope.sectionName.value = ""; $scope.showAddSECTIONinput = false;
                $scope.disableSecSelect = false;
                $scope.selectedSecID.id = $scope.originalSecId;
            }
        };

        $scope.ok = function () {
            var allLists = [];
            allLists.push($scope.orgList); allLists.push($scope.allDivList); allLists.push($scope.allSecList);
            allLists.push($scope.selectedOrgID.id); allLists.push($scope.selectedDivID.id); allLists.push($scope.selectedSecID.id);
            $uibModalInstance.close(allLists);
        };
    }
    
    //create/edit a project
    ModalControllers.controller('PROJECTmodalCtrl', ['$scope', '$cookies', '$location', '$state', '$http', '$timeout', '$uibModal', '$uibModalInstance', '$filter', 'allDropDownParts', 'thisProjectStuff', 'PROJECT', PROJECTmodalCtrl]);
    function PROJECTmodalCtrl($scope, $cookies, $location, $state, $http, $timeout, $uibModal, $uibModalInstance, $filter, allDropDownParts, thisProjectStuff, PROJECT) {
        //dropdowns allDurationList, allStatsList, allObjList
        $scope.DurationList = allDropDownParts[0];
        $scope.StatusList = allDropDownParts[1];
        $scope.objectiveTypeList = allDropDownParts[2];
        $scope.undetermined = false; //ng-disabled on end date boolean..set to true if status = end date undefined
        $scope.ObjectivesToAdd = []; //holder for objective types added
        $scope.ObjectivesToRemove = []; //holder for objective types removed on existing projects (edit)
        $scope.ProjectKeywords = []; //add each new one to this to show on page
        $scope.KeywordsToAdd = []; //holder for keywords added
        $scope.KeywordsToRemove = []; //holder for keywords to removed on existing projects (edit)

        $scope.aProject = {};
        $scope.urls = []; //holder for urls for future parsing back together ( | separated string)
        $scope.newURL = {}; //model binding to return newUrl.value to ADD/REMOVE functions   
        $scope.newKey = {}; //model binding to return keys to ADD/REMOVE functions
        
        //#region Datepicker
        $scope.datepickrs = {
            projStDate: false,
            projEndDate: false
        };
        $scope.open = function ($event, which) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.datepickrs[which] = true;
        };
        $scope.format = 'MMM dd, yyyy';
        //#endregion Datepicker


        if (thisProjectStuff != undefined) {
            //#region existing project (edit)
            //$scope.aProject = angular.copy(thisProjectStuff[0]);
           
            ////put string ProjURLs into array by '|' and then ensure proper url format
            //if ($scope.aProject.URL) {
            //    //split string into an array
            //    if (($scope.aProject.URL).indexOf('|') > -1) {
            //        $scope.urls = ($scope.aProject.URL).split("|");
            //    } else {
            //        $scope.urls[0] = $scope.aProject.URL;
            //    }
            //    //make sure they are formatted.. if not, format and PUT 
            //    var neededUpdating1 = false;
            //    for (var u = 0; u < $scope.urls.length; u++) {
            //        if (!$scope.urls[u].startsWith('http')) {
            //            neededUpdating1 = true;
            //            $scope.urls[u] = 'http://' + $scope.urls[u];
            //        }
            //    }
            //    //if they needed updating, PUT the project
            //    if (neededUpdating1) {
            //        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
            //        $http.defaults.headers.common.Accept = 'application/json';
            //        $http.defaults.headers.common['X-HTTP-Method-Override'] = 'PUT';
            //        $scope.aProject.URL = ($scope.urls).join('|');
            //        PROJECT.save({ id: $scope.aProject.PROJECT_ID }, $scope.aProject).$promise.then(function (response) {
            //            $scope.aProject = response;
            //            //split string into an array
            //            if (($scope.aProject.URL).indexOf('|') > -1) {
            //                $scope.urls = ($scope.aProject.URL).split("|");
            //            } else {
            //                $scope.urls[0] = $scope.aProject.URL;
            //            }
            //            delete $http.defaults.headers.common['X-HTTP-Method-Override'];
            //        });                        
            //    }
            //} //end there's a url*-/-

            ////check status for disabling of end date
            //if ($scope.aProject.PROJ_STATUS_ID == 1) {
            //    $scope.undetermined = true;
            //}

            ////apply any project objectives for EDIT projObjectives, projKeywords]
            //if (thisProjectStuff[1].length > 0) {
                
            //    //go through objectiveTypeList and add selected Property.
            //    //get projObjectives to use in making new prop in all objectives for multi select ('selected: true')
            //    $scope.projObjs = thisProjectStuff[1];

            //    ////http://isteven.github.io/angular-multi-select/#/demo-minimum
            //    ////go through allObjList and add selected Property.
            //    for (var i = 0; i < $scope.objectiveTypeList.length; i++) {
            //        //for each one, if projObjectives has this id, add 'selected:true' else add 'selected:false'
            //        for (var y = 0; y < $scope.projObjs.length; y++) {
            //            if ($scope.projObjs[y].OBJECTIVE_TYPE_ID == $scope.objectiveTypeList[i].OBJECTIVE_TYPE_ID) {
            //                $scope.objectiveTypeList[i].selected = true;
            //                y = $scope.projObjs.length; //ensures it doesn't set it as false after setting it as true
            //            }
            //            else {
            //                $scope.objectiveTypeList[i].selected = false;
            //            }
            //        }
            //        if ($scope.projObjs.length == 0) {
            //            $scope.objectiveTypeList[i].selected = false;
            //        }
            //    }

            //    //all objectives (with new selected property)
            //    $scope.Objectivesdata = $scope.objectiveTypeList;
            //#endregion existing project (edit)
        } else {
            // objective types - set all to not selected
            var objTypes = angular.copy($scope.objectiveTypeList);
            for (var a = objTypes.length; a--;) {
                objTypes[a].selected = false;
            }
            $scope.Objectivesdata = objTypes;
        }//end else (thisProjectStuff == undefined)

        //start or end date was changed -- compare to ensure end date comes after start date
        $scope.compareDates = function (d) {
            if ($scope.aProject.END_DATE != undefined) {
                if (new Date($scope.aProject.END_DATE) < new Date($scope.aProject.START_DATE)) {
                    var dateModal = $uibModal.open({
                        template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                                    '<div class="modal-body"><p>Completion date must come after Start date.</p></div>' +
                                    '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button></div>',
                        controller: function ($scope, $uibModalInstance) {
                            $scope.ok = function () {
                                $uibModalInstance.close(d);
                            };
                        },
                        size: 'sm'
                    });
                    dateModal.result.then(function (wrongDate) {
                        if (wrongDate == "start") {
                            $scope.aProject.START_DATE = "";
                            angular.element("#START_DATE").focus();
                        } else {
                            $scope.aProject.END_DATE = "";
                            angular.element("#END_DATE").focus();
                        }
                    });
                }
            }
        };

        //an OBJECTIVE_TYPE was clicked 
        $scope.ObjClick = function (data) {
           //store this to handle in PUT or POST
            if (data.selected == true) {
                $scope.ObjectivesToAdd.push(data);
            } else {
                if ($scope.aProject.PROJECT_ID != undefined)
                    $scope.ObjectivesToRemove.push(data);
            }
        };//end ObjClick

        //add url
        $scope.addProjURL = function (form) {
            if ($scope.newURL.value != undefined && form.inputURL.$valid) {
                //push to array of urls to show on view and store in model
                $scope.urls.push($scope.newURL.value);                
                $scope.newURL = {};
            } else {
                //modal for entering a url first
                var modalInstance = $uibModal.open({
                    template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                               '<div class="modal-body"><p>Please type a url in first.</p></div>' +
                               '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button></div>',
                    controller: function ($scope, $uibModalInstance) {
                        $scope.ok = function () {
                            $uibModalInstance.close('url');
                        };
                    },
                    size: 'sm'
                });
                modalInstance.result.then(function (fieldFocus) {
                    if (fieldFocus == "url") {
                        $("#inputURL").focus();
                    }
                });
            }
        };

        //remove url
        $scope.removeUrl = function (key) {
            //modal
            var modalInstance = $uibModal.open({
                templateUrl: 'removemodal.html',
                controller: 'ConfirmModalCtrl',
                size: 'sm',
                resolve: {
                    keyToRemove: function () {
                        return key;
                    },
                    what: function () {
                        return "URL";
                    }
                }
            });
            modalInstance.result.then(function (keyToRemove) {
                //yes, remove this url
                var index = $scope.urls.indexOf(key);
                $scope.urls.splice(index, 1);                
            }, function () {
                //logic to do on cancel
            });
            //end modal
        };

        //add keyword
        $scope.addThisKeyword = function () {
            if ($scope.newKey.value != undefined) {
                $scope.KeywordsToAdd.push({ TERM: $scope.newKey.value });
                $scope.ProjectKeywords.push({ TERM: $scope.newKey.value });
                $scope.newKey = {};
            } else {
                // the value is empty
                //modal for entering a keyword first
                var modalInstance = $uibModal.open({
                    template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                                '<div class="modal-body"><p>Please type a keyword in first.</p></div>' +
                                '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button></div>',
                    controller: function ($scope, $uibModalInstance) {
                        $scope.ok = function () {
                            $uibModalInstance.close('keyword');
                        };
                    },
                    size: 'sm'
                });
                modalInstance.result.then(function (fieldFocus) {
                    if (fieldFocus == "keyword") {
                        $("#inputKEYWORD").focus();
                    }
                });
            }
        };

        //remove keyword click (passed confirm)
        $scope.removeKey = function (key, index) {
            //modal
            var modalInstance = $uibModal.open({
                templateUrl: 'removemodal.html',
                controller: 'ConfirmModalCtrl',
                size: 'sm',
                resolve: {
                    keyToRemove: function () {
                        return key;
                    },
                    what: function () {
                        return "Keyword";
                    }
                }
            });
            modalInstance.result.then(function (keyToRemove) {
                //yes, remove this keyword
                var index1 = $scope.ProjectKeywords.indexOf(key);

                if ($scope.aProject.PROJECT_ID != undefined) 
                    $scope.KeywordsToRemove.push(key);
                else 
                    $scope.KeywordsToAdd.splice(index, 1);
                    
                $scope.ProjectKeywords.splice(index1, 1);
                
            }, function () {
                //logic for cancel
            });
            //end modal
        };

        //disable end date if status has 'end date undetermined'
        $scope.statusChanged = function (id) {
            if (id == 1) {
                if ($scope.aProject != undefined && $scope.aProject.END_DATE != null) {
                    $scope.aProject.END_DATE = "";
                }
                $scope.undetermined = true;
            }
            else {
                $scope.undetermined = false;
            }
        };

        //project POST
        $scope.create = function (valid) {
            if (valid == true) {
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                $scope.aProject.URL = ($scope.urls).join('|');
                var projID;
                $(".page-loading").removeClass("hidden");
                //PROJECT.save({}, $scope.aProject, function success(response) {
                //    toastr.success("Project Created");
                //    projID = response.PROJECT_ID;
                //    //post objectives added
                //    for (var o = $scope.ObjectivesToAdd.length; o--;) {
                //        PROJECT.addProjObjective({ id: projID }, $scope.ObjectivesToAdd[o], function success(response) {
                //            toastr.success("Project Objectives added");
                //        }, function error(errorResponse) {
                //              toastr.error("Error: " + errorResponse.statusText);
                //        });
                //    }
                //    //post keywords
                //    for (var k = $scope.KeywordsToAdd.length; k--;) {
                //        PROJECT.addProjKeyword({ id: projID }, $scope.KeywordsToAdd[k], function success(response) {
                //            toastr.success("Keyword Added");
                //        }, function error(errorResponse) {
                //              toastr.error("Error: " + errorResponse.statusText);
                //        });
                //    }
                //}, function error(errorResponse) {
                //        toastr.success("Error: " + errorResponse.statusText);
                //}).$promise.then(function () {
                //    $(".page-loading").addClass("hidden");
                //    $uibModalInstance.close($scope.aProject);
                //    $location.path('/project/edit/' + projID + '/info').replace();//.notify(false);
                //    $scope.apply;
                //});
            }
        };

        //project PUT
        $scope.save = function (valid) {
            if (valid == true) {
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                var putIt;
            }
        };//end save

        //cancel modal
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

    } //end PROJECTmodalCtrl()


}());