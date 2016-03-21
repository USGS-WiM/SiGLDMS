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
    ModalControllers.controller('PROJECTmodalCtrl', ['$scope', '$cookies', '$q', '$location', '$state', '$http', '$timeout', '$uibModal', '$uibModalInstance', '$filter', 'allDropDownParts', 'thisProjectStuff', 'PROJECT', PROJECTmodalCtrl]);
    function PROJECTmodalCtrl($scope, $cookies, $q, $location, $state, $http, $timeout, $uibModal, $uibModalInstance, $filter, allDropDownParts, thisProjectStuff, PROJECT) {
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

        //called a few times to format just the date (no time)
        var makeAdate = function (d) {
            var aDate = new Date();
            if (d != "") {
                //provided date
                aDate = new Date(d);
            }

            var year = aDate.getFullYear();
            var month = aDate.getMonth();
            var day = ('0' + aDate.getDate()).slice(-2);
            var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            var dateWOtime = new Date(monthNames[month] + " " + day + ", " + year);
            return dateWOtime;
        };

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
            $scope.aProject = angular.copy(thisProjectStuff[0]);
            $scope.aProject.START_DATE = $scope.aProject.START_DATE != null ? makeAdate($scope.aProject.START_DATE) : null;
            $scope.aProject.END_DATE = $scope.aProject.END_DATE != null ? makeAdate($scope.aProject.END_DATE) : null;

            ////put string ProjURLs into array by '|' and then ensure proper url format
            if ($scope.aProject.URL) {
                //split string into an array
                if (($scope.aProject.URL).indexOf('|') > -1) {
                    $scope.urls = ($scope.aProject.URL).split("|");
                } else {
                    $scope.urls[0] = $scope.aProject.URL;
                }
            } //end there's a url*-/-

            //check status for disabling of end date
            if ($scope.aProject.PROJ_STATUS_ID == 1) {
                $scope.undetermined = true;
            }

            //apply any project objectives for EDIT projObjectives, projKeywords]
            if (thisProjectStuff[1].length > 0) {

                //go through objectiveTypeList and add selected Property.
                //get projObjectives to use in making new prop in all objectives for multi select ('selected: true')
                $scope.projObjs = angular.copy(thisProjectStuff[1]);

                ////http://isteven.github.io/angular-multi-select/#/demo-minimum
                ////go through allObjList and add selected Property.
                for (var i = 0; i < $scope.objectiveTypeList.length; i++) {
                    //for each one, if projObjectives has this id, add 'selected:true' else add 'selected:false'
                    for (var y = 0; y < $scope.projObjs.length; y++) {
                        if ($scope.projObjs[y].OBJECTIVE_TYPE_ID == $scope.objectiveTypeList[i].OBJECTIVE_TYPE_ID) {
                            $scope.objectiveTypeList[i].selected = true;
                            y = $scope.projObjs.length; //ensures it doesn't set it as false after setting it as true
                        }
                        else {
                            $scope.objectiveTypeList[i].selected = false;
                        }
                    }
                    if ($scope.projObjs.length == 0) {
                        $scope.objectiveTypeList[i].selected = false;
                    }
                }
                //all objectives (with new selected property)
                $scope.Objectivesdata = $scope.objectiveTypeList;
            } else {
                angular.forEach($scope.objectiveTypeList, function (ot) {
                    ot.selected = false;
                });
                $scope.Objectivesdata = $scope.objectiveTypeList;
            };
            $scope.ProjectKeywords = thisProjectStuff[2];
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
            if (data.selected == true) { //selected
                $scope.ObjectivesToAdd.push(data); //add to ObjectivesToAdd
                if ($scope.aProject.PROJECT_ID != undefined) { //if this is edit
                    //editing (remove from remove list if there)
                    var i = $scope.ObjectivesToRemove.map(function (e) { return e.OBJECTIVE_TYPE_ID; }).indexOf(data.OBJECTIVE_TYPE_ID);
                    if (i >= 0) $scope.ObjectivesToRemove.splice(i,1); //remove from removeList ..in case they removed and then added it back
                }
            } else {
                //data.selected == false
                var i = $scope.ObjectivesToAdd.map(function (e) { return e.OBJECTIVE_TYPE_ID; }).indexOf(data.OBJECTIVE_TYPE_ID);
                if (i >= 0) $scope.ObjectivesToAdd.splice(i, 1); //remove it from addList if they added then removed

                if ($scope.aProject.PROJECT_ID != undefined) { //edit
                    $scope.ObjectivesToRemove.push(data); //add it to removeList
                    
                }
            }
        };//end ObjClick

        //add url TODO:check if this url is already in the urls array..if so don't add it again
        $scope.addProjURL = function (form) {
            if ($scope.newURL.value != undefined) {
                //push to array of urls to show on view and store in model
                var ind = $scope.urls.indexOf($scope.newURL.value);
                if (ind < 0) {
                    $scope.urls.push($scope.newURL.value);
                    $scope.newURL = {};
                } else {
                    //modal for repeated url
                    var repeatedModal = $uibModal.open({
                        template: '<div class="modal-header"><h3 class="modal-title">Repeated URL</h3></div>' +
                                   '<div class="modal-body"><p>This URL is already included.</p></div>' +
                                   '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button></div>',
                        controller: function ($scope, $uibModalInstance) {
                            $scope.ok = function () {
                                $uibModalInstance.close('url');
                            };
                        },
                        size: 'sm'
                    });
                    repeatedModal.result.then(function (fieldFocus) {
                        if (fieldFocus == "url") {
                            $("#URL").focus();
                        }
                    });
                }
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
                        $("#URL").focus();
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
        $scope.statusChanged = function () {
            if ($scope.aProject.PROJ_STATUS_ID == 1) {
                if ($scope.aProject != undefined && $scope.aProject.END_DATE != null) {
                    $scope.aProject.END_DATE = "";
                }
            //    $scope.undetermined = true;
            }
            //else {
            //    $scope.undetermined = false;
            //}
        };

        //project POST
        $scope.create = function (valid) {
            if (valid == true) {
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                $scope.aProject.URL = ($scope.urls).join('|');
                var projID;
                $(".page-loading").removeClass("hidden");
                PROJECT.save({}, $scope.aProject, function success(response) {
                    toastr.success("Project Created");
                    $scope.aProject = response;
                    projID = response.PROJECT_ID;
                    //post objectives added
                    for (var o = $scope.ObjectivesToAdd.length; o--;) {
                        PROJECT.addProjObjective({ id: projID }, $scope.ObjectivesToAdd[o], function success(response) {
                            $scope.Objectivesdata = response;
                            toastr.success("Project Objectives added");
                        }, function error(errorResponse) {
                              toastr.error("Error: " + errorResponse.statusText);
                        });
                    }
                    //post keywords
                    for (var k = $scope.KeywordsToAdd.length; k--;) {
                        PROJECT.addProjKeyword({ id: projID }, $scope.KeywordsToAdd[k], function success(response) {
                            $scope.ProjectKeywords = response;
                            toastr.success("Keyword Added");
                        }, function error(errorResponse) {
                              toastr.error("Error: " + errorResponse.statusText);
                        });
                    }
                }, function error(errorResponse) {
                        toastr.success("Error: " + errorResponse.statusText);
                }).$promise.then(function () {
                    $(".page-loading").addClass("hidden");
                    var prjectParts = [$scope.aProject, $scope.Objectivesdata, $scope.ProjectKeywords];
                    $uibModalInstance.close(prjectParts);
                    $location.path('/project/edit/' + projID + '/info').replace();//.notify(false);
                    $scope.apply;
                });
            }
        };

        //project PUT
        $scope.save = function (valid) {
            if (valid == true) {
                $(".page-loading").removeClass("hidden");
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                $scope.aProject.URL = $scope.urls.join("|");
                $http.defaults.headers.common['X-HTTP-Method-Override'] = 'PUT';
                PROJECT.save({ id: $scope.aProject.PROJECT_ID }, $scope.aProject, function success(ProjResponse) {                    
                    delete $http.defaults.headers.common['X-HTTP-Method-Override']; //remove 'PUT' override
                    //use $q for async call to delete and add objectives and keywords
                    var defer = $q.defer();
                    var RemovePromises = [];
                    var AddPromises = [];
                    //remove objectives
                    angular.forEach($scope.ObjectivesToRemove, function (Ovalue) {
                        $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';
                        var delObjProm = PROJECT.deleteProjObjective({ id: $scope.aProject.PROJECT_ID }, Ovalue).$promise;
                        RemovePromises.push(delObjProm);
                        delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                    });
                    //remove keywords
                    angular.forEach($scope.KeywordsToRemove, function (Kvalue) {
                        $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';
                        var delKeyProm = PROJECT.deleteProjKeyword({ id: $scope.aProject.PROJECT_ID }, Kvalue).$promise;
                        RemovePromises.push(delKeyProm);
                        delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                    });
                    //add objectives
                    angular.forEach($scope.ObjectivesToAdd, function (OaddValue) {
                        var objProm = PROJECT.addProjObjective({ id: $scope.aProject.PROJECT_ID }, OaddValue).$promise;
                        AddPromises.push(objProm);
                    });
                    //add keywords
                    angular.forEach($scope.KeywordsToAdd, function (KaddValue) {
                        var keyProm = PROJECT.addProjKeyword({ id: $scope.aProject.PROJECT_ID }, KaddValue).$promise;
                        AddPromises.push(keyProm);
                    });
                    //ok now run the removes, then the adds and then pass the stuff back out of here.
                    $q.all(RemovePromises).then(function () {
                        $scope.ObjectivesToRemove = []; $scope.KeywordsToRemove = []; //clear remove arrays
                        $q.all(AddPromises).then(function (response) {
                            $scope.ObjectivesToAdd = []; $scope.KeywordsToAdd = [];
                            var prjectParts = [$scope.aProject, $scope.Objectivesmodel.value, $scope.ProjectKeywords];
                            toastr.success("Project Updated");
                            $uibModalInstance.close(prjectParts);
                        }).catch(function error(msg) {
                            console.error(msg);
                        });
                    }).catch(function error(msg) {
                        console.error(msg);
                    });
                });
            }//end valid
        };//end save

        //cancel modal
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

    } //end PROJECTmodalCtrl()

    //projectEditSiteInfoCtrl ( CREATE / EDIT page)    siteFrequencies, siteMedium, siteParameters, siteResources,
    ModalControllers.controller('SITEmodalCtrl', ['$scope', '$q', '$location', '$cookies', '$http', '$uibModal', '$uibModalInstance', '$state', 'thisProject', 'allDropDownParts', 'thisSite',
        'siteFreq', 'siteMed', 'siteRes', 'siteParams', 'SITE', SITEmodalCtrl]);
    function SITEmodalCtrl($scope, $q, $location, $cookies, $http, $uibModal, $uibModalInstance, $state, thisProject, allDropDownParts, thisSite, siteFreq, siteMed, siteRes, siteParams, SITE) {
        if ($cookies.get('siGLCreds') == undefined || $cookies.get('siGLCreds') == "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            angular.element('a#siteTab').addClass('active'); //make sure that tab still stays active
            $scope.status = {
                phyOpen: false, chemOpen: false, bioOpen: false, microOpen: false, toxOpen: false
            };
            $(".page-loading").addClass("hidden");
            $scope.thisSite = {}; //holder for project (either coming in for edit, or being created on POST )
            $scope.freqDirty = false; $scope.freqToRemove = [];
            $scope.medDirty = false; $scope.medToRemove = [];
            $scope.resDirty = false; $scope.resToRemove = [];
            $scope.paramDirty = false; $scope.paramToRemove = [];
            $scope.freqCommaSep = []; $scope.medCommaSep = []; $scope.resCommaSep = []; $scope.paramCommaSep = [];
            $scope.showParams = false;// div containing all parameters (toggles show/hide)
            $scope.showHide = "Show"; //button text for show/hide parameters

            //all the dropdowns [siteStatList0, lakeList1, stateList2, CountryList3, resourceList4, mediaList5, frequencyList6, parameterList7];
            $scope.allCountries = angular.copy(allDropDownParts[3]); // CountryList;
            $scope.allStates = angular.copy(allDropDownParts[2]); //stateList;
            $scope.allLakes = angular.copy(allDropDownParts[1]);// lakeList;
            $scope.allStats = angular.copy(allDropDownParts[0]);// siteStatList;
            $scope.allResources = angular.copy(allDropDownParts[4]);// resourceList;
            $scope.allParametes = angular.copy(allDropDownParts[7]);// parameterList;
            $scope.allFrequencies = angular.copy(allDropDownParts[6]);
            $scope.allMedia = angular.copy(allDropDownParts[5]);

            //date without time
            var makeAdateString = function (d) {
                var aDate = new Date();
                if (d != "") {
                    //provided date
                    aDate = new Date(d);
                }

                var year = aDate.getFullYear();
                var month = aDate.getMonth();
                var day = ('0' + aDate.getDate()).slice(-2);
                var monthNames = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
                var dateWOtime = monthNames[month] + "/" + day + "/" + year;
                return dateWOtime;
            };
            var formatSITE = function (s) {
                var site = {
                    SITE_ID: s.SiteId,
                    START_DATE: s.StartDate != undefined && s.StartDate != "" ? new Date(s.StartDate): null,
                    END_DATE: s.EndDate != undefined && s.EndDate != "" ? new Date(s.EndDate) : null,
                    PROJECT_ID: thisProject.PROJECT_ID,
                    SAMPLE_PLATFORM: s.SamplePlatform,
                    ADDITIONAL_INFO: s.AdditionalInfo,
                    NAME: s.Name,
                    DESCRIPTION: s.Description,
                    LATITUDE: s.latitude,
                    LONGITUDE: s.longitude,
                    WATERBODY: s.Waterbody,
                    STATUS_TYPE_ID: s.Status != "" && s.Status != undefined ? $scope.allStats.filter(function (st) { return st.STATUS == s.Status; })[0].STATUS_ID : 0,
                    LAKE_TYPE_ID: $scope.allLakes.filter(function (l) { return l.LAKE == s.GreatLake; })[0].LAKE_TYPE_ID,
                    COUNTRY: s.Country,
                    STATE_PROVINCE: s.State,
                    WATERSHED_HUC8: s.WatershedHUC8,
                    URL: s.URL
                };
                return site;
            }

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
            
            //make sure lat/long are right number range
            $scope.checkValue = function () {
                if ($scope.thisSite.LATITUDE < 0 || $scope.thisSite.LATITUDE > 73) {
                    openLatModal();
                }
                if ($scope.thisSite.LONGITUDE < -175 || $scope.thisSite.LONGITUDE > -60) {
                    openLongModal();
                }
            };

            //start or end date was changed -- compare to ensure end date comes after start date
            $scope.compareSiteDates = function (d) {
                if ($scope.thisSite.END_DATE != undefined) {
                    if (new Date($scope.thisSite.END_DATE) < new Date($scope.thisSite.START_DATE)) {
                        var dateModal = $uibModal.open({
                            template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                                        '<div class="modal-body"><p>Sampling end date must come after start date.</p></div>' +
                                        '<div class="modal-footer"><button class="btn btn-primary" ng-enter="ok()" ng-click="ok()">OK</button></div>',
                            controller: function ($scope, $uibModalInstance) {
                                $scope.ok = function () {
                                    $uibModalInstance.close(d);
                                };
                            },
                            size: 'sm'
                        });
                        dateModal.result.then(function (wrongDate) {
                            if (wrongDate == "start") {
                                $scope.thisSite.START_DATE = "";
                                angular.element("#START_DATE").focus();
                            } else {
                                $scope.thisSite.END_DATE = "";
                                angular.element("#END_DATE").focus();
                            }
                        });
                    }
                }
            };

            //are we in edit or create?
            if (thisSite != undefined) {
               //#region edit view

                //1. this site
                var siteModel = angular.copy(thisSite);
                $scope.thisSite = formatSITE(siteModel);
                                
               // $scope.title = "Site: " + $scope.thisSite.NAME;

               //convert the multiSelects for isteven (add new property for checked flag
               //#region siteFrequencies
               //pull these from dropdownsToSend filter frequencies var siteFreqs = siteFrequencies;
               
               //go through allFrequencies and add selected property
               for (var i = 0; i < $scope.allFrequencies.length; i++) {
                   //for each one, if siteFreq has this id, add 'selected:true' else add 'selected:false'
                   for (var y = 0; y < siteFreq.length; y++) {
                       if (siteFreq[y].FREQUENCY_TYPE_ID == $scope.allFrequencies[i].FREQUENCY_TYPE_ID) {
                             $scope.allFrequencies[i].selected = true;
                             y = siteFreq.length;
                        }
                        else {
                            $scope.allFrequencies[i].selected = false;
                        }
                    }
                   if (siteFreq.length == 0) {
                        $scope.allFrequencies[i].selected = false;
                    }
               }
               $scope.Frequencydata = $scope.allFrequencies;
               //#endregion siteFrequencies

               //#region siteMedia              
               //go through allMeds and add selected property
               for (var mi = 0; mi < $scope.allMedia.length; mi++) {
                    //for each one, if siteMeds has this id, add 'selected:true' else add 'selected:false'
                   for (var sm = 0; sm < siteMed.length; sm++) {
                       if (siteMed[sm].MEDIA_TYPE_ID == $scope.allMedia[mi].MEDIA_TYPE_ID) {
                            $scope.allMedia[mi].selected = true;
                            sm = siteMed.length;
                        }
                        else {
                            $scope.allMedia[mi].selected = false;
                        }
                    }
                   if (siteMed.length == 0) {
                        $scope.allMedia[mi].selected = false;
                    }
                }
               $scope.Mediadata = $scope.allMedia;
               //#endregion siteMedia

               //#region siteParameters
               //go through siteParams and add selected property
               for (var pi = 0; pi < $scope.allParametes.length; pi++) {
                    //for each one, if siteParams has this id, add 'selected:true' else add 'selected:false'
                   for (var sp = 0; sp < siteParams.length; sp++) {
                       if (siteParams[sp].PARAMETER_TYPE_ID == $scope.allParametes[pi].PARAMETER_TYPE_ID) {
                            $scope.allParametes[pi].selected = true;
                            sp = siteParams.length;
                        }
                        else {
                            $scope.allParametes[pi].selected = false;
                        }
                    }
                   if (siteParams.length == 0) {
                        $scope.allParametes[pi].selected = false;
                    }
                }
                $scope.physParams = []; $scope.bioParams = []; $scope.chemParams = []; $scope.microBioParams = []; $scope.toxiParams = [];
                $scope.physParams.push($scope.allParametes.filter(function (p) {
                    return p.PARAMETER_GROUP == "Physical";
                }));
                $scope.bioParams.push($scope.allParametes.filter(function (p) {
                    return p.PARAMETER_GROUP == "Biological";
                }));
                $scope.chemParams.push($scope.allParametes.filter(function (p) {
                    return p.PARAMETER_GROUP == "Chemical";
                }));
                $scope.microBioParams.push($scope.allParametes.filter(function (p) {
                    return p.PARAMETER_GROUP == "Microbiological";
                }));
                $scope.toxiParams.push($scope.allParametes.filter(function (p) {
                    return p.PARAMETER_GROUP == "Toxicological";
                }));

               //$scope.Parameterdata = allParams;

               //#endregion siteParameters

               //#region siteResources
               //go through allRes and add selected property
                for (var ri = 0; ri < $scope.allResources.length; ri++) {
                    //for each one, if siteRes has this id, add 'selected:true' else add 'selected:false'
                    for (var sr = 0; sr < siteRes.length; sr++) {
                        if (siteRes[sr].RESOURCE_TYPE_ID == $scope.allResources[ri].RESOURCE_TYPE_ID) {
                            $scope.allResources[ri].selected = true;
                            sr = siteRes.length;
                        }
                        else {
                            $scope.allResources[ri].selected = false;
                        }
                    }
                    if (siteRes.length == 0) {
                        $scope.allResources[ri].selected = false;
                    }
                }
                $scope.Resourcedata = $scope.allResources;
               //#endregion siteResources
               //#endregion
            }//end edit view
            else {
                $scope.title = "New Site";
            }//end create view

            //requirements for both create and edit views

            //show/hide the parameters
            $scope.showParamDiv = function ($event) {
                if ($scope.showHide == "Hide") {
                    $scope.showHide = "Show";
                    $scope.showParams = false;
                } else {
                    $scope.showHide = "Hide";
                    $scope.showParams = true;
                }
                $event.preventDefault();
                $event.stopPropagation();
            };

            if (thisSite == undefined) {

                //#region add selected property to all multiselects (need to set these if new site)
                //frequencies
                for (var a = $scope.allFrequencies.length; a--;) {
                    $scope.allFrequencies[a].selected = false;
                }
                $scope.Frequencydata = $scope.allFrequencies;
                //media
                for (var ma = $scope.allMedia.length; ma--;) {
                    $scope.allMedia[ma].selected = false;
                }
                $scope.Mediadata = $scope.allMedia;
                //parameters
                for (var pa = $scope.allParametes.length; pa--;) {
                    $scope.allParametes[pa].selected = false;
                }
                $scope.physParams = []; $scope.bioParams = []; $scope.chemParams = []; $scope.microBioParams = []; $scope.toxiParams = [];
                $scope.physParams.push($scope.allParametes.filter(function (p) {
                    return p.PARAMETER_GROUP == "Physical";
                }));
                $scope.bioParams.push($scope.allParametes.filter(function (p) {
                    return p.PARAMETER_GROUP == "Biological";
                }));
                $scope.chemParams.push($scope.allParametes.filter(function (p) { return p.PARAMETER_GROUP == "Chemical"; }));
                $scope.microBioParams.push($scope.allParametes.filter(function (p) {
                    return p.PARAMETER_GROUP == "Microbiological";
                }));
                $scope.toxiParams.push($scope.allParametes.filter(function (p) {
                    return p.PARAMETER_GROUP == "Toxicological";
                }));
                // $scope.Parameterdata = parameterList;
                //resources
                for (var ra = $scope.allResources.length; ra--;) {
                    $scope.allResources[ra].selected = false;
                }
                $scope.Resourcedata = $scope.allResources;
                //#endregion add selected property to all multiselects (need to set these if new site)

            }// thisSite == undefined

            //#region a FREQUENCY was clicked
            $scope.FreqClick = function (data) {
                $scope.freqDirty = true;
                if (data.selected == true) {
                    if ($scope.thisSite.SITE_ID != undefined) { //editing
                        //see if it needs to be taken out of removeList
                        var i = $scope.freqToRemove.map(function (f) { return f.FREQUENCY_TYPE_ID; }).indexOf(data.FREQUENCY_TYPE_ID);
                        if (i >= 0) $scope.freqToRemove.splice(i, 1); //remove from removeList (in case they removed and then added it back)
                    }
                } else {
                    //data.selected == false
                    if ($scope.thisSite.SITE_ID != undefined) { //edit
                        $scope.freqToRemove.push(data); //add it to removeList
                    }
                }
            };//end FreqClick
            //#endregion FREQUENCY 

            //#region a MEDIA was clicked 
            $scope.MedClick = function (data) {
                $scope.medDirty = true;
                if (data.selected == true) {
                    if ($scope.thisSite.SITE_ID != undefined) { //editing
                        //see if it needs to be taken out of removeList
                        var i = $scope.medToRemove.map(function (m) { return m.MEDIA_TYPE_ID; }).indexOf(data.MEDIA_TYPE_ID);
                        if (i >= 0) $scope.medToRemove.splice(i, 1); //remove from removeList (in case they removed and then added it back)
                    }
                } else {
                    //data.selected == false
                    if ($scope.thisSite.SITE_ID != undefined) { //edit
                        $scope.medToRemove.push(data); //add it to removeList
                    }
                }
            };//end MedClick
            //#endregion MEDIA

            //#region a RESOURCE was clicked 
            $scope.ResClick = function (data) {
                $scope.resDirty = true;
                if (data.selected == true)  {
                  //  $scope.resToAdd.push(data);
                    if ($scope.thisSite.SITE_ID != undefined) { //editing
                        //see if it needs to be taken out of removeList
                        var i = $scope.resToRemove.map(function (r) { return r.RESOURCE_TYPE_ID; }).indexOf(data.RESOURCE_TYPE_ID);
                        if (i >= 0) $scope.resToRemove.splice(i, 1); //remove from removeList (in case they removed and then added it back)
                    }
                } else {
                    //data.selected == false
                    if ($scope.thisSite.SITE_ID != undefined) { //edit
                        $scope.resToRemove.push(data); //add it to removeList                      
                    }
                }
            };//end ResClick
            //#endregion RESOURCE 

            //#region a PARAMETER was clicked 
            $scope.ParamClick = function (data) {
                $scope.paramDirty = true;
                if (data.selected == true) {
                    if ($scope.thisSite.SITE_ID != undefined) { //editing
                        //see if it needs to be taken out of removeList
                        var i = $scope.paramToRemove.map(function (p) { return p.PARAMETER_TYPE_ID; }).indexOf(data.PARAMETER_TYPE_ID);
                        if (i >= 0) $scope.paramToRemove.splice(i, 1); //remove from removeList (in case they removed and then added it back)
                    }
                } else {
                    //data.selected == false
                    if ($scope.thisSite.SITE_ID != undefined) { //edit
                        $scope.paramToRemove.push(data); //add it to removeList                    
                    }
                }
            };//end ParamClick
            //#endregion PARAMETER

            $scope.isNum = function (evt) {
                var theEvent = evt || window.event;
                var key = theEvent.keyCode || theEvent.which;
                //key = String.fromCharCode(key);
                //var regex = /[0-9]|\./;
                if (key != 46 && key != 45 && key > 31 && (key < 48 || key > 57)) {
                    theEvent.returnValue = false;
                    if (theEvent.preventDefault) theEvent.preventDefault();
                }
            };

            //lat modal 
            var openLatModal = function () {
                var latModal = $uibModal.open({
                    template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                        '<div class="modal-body"><p>The Latitude must be between 0 and 73.0</p></div>' +
                        '<div class="modal-footer"><button class="btn btn-primary" ng-enter="ok()" ng-click="ok()">OK</button></div>',
                    controller: function ($scope, $uibModalInstance) {
                        $scope.ok = function () {
                            $uibModalInstance.close('lat');
                        };
                    },
                    size: 'sm'
                });
                latModal.result.then(function (fieldFocus) {
                    if (fieldFocus == "lat")
                        $("#LATITUDE").focus();
                });
            };

            //long modal
            var openLongModal = function () {
                var longModal = $uibModal.open({
                    template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                        '<div class="modal-body"><p>The Longitude must be between -175.0 and -60.0</p></div>' +
                        '<div class="modal-footer"><button class="btn btn-primary" ng-enter="ok()" ng-click="ok()">OK</button></div>',
                    controller: function ($scope, $uibModalInstance) {
                        $scope.ok = function () {
                            $uibModalInstance.close('long');
                        };
                    },
                    size: 'sm'
                });
                longModal.result.then(function (fieldFocus) {
                    if (fieldFocus == "long")
                        $("#LONGITUDE").focus();
                });
            };

            //PUT
            $scope.save = function (valid) {
                //check if they filled in all required fields
                if (valid == true){
                    $(".page-loading").removeClass("hidden");
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    $http.defaults.headers.common['X-HTTP-Method-Override'] = 'PUT';
                    $scope.thisSite.PROJECT_ID = thisProject.PROJECT_ID;                    
                    SITE.save({ id: $scope.thisSite.SITE_ID }, $scope.thisSite, function success(siteResponse) {
                        delete $http.defaults.headers.common['X-HTTP-Method-Override']; //remove 'PUT' override
                        //use $q for async call to delete and add objectives and keywords
                        var defer = $q.defer();
                        var RemovePromises = [];
                        var AddPromises = [];
                        //#region REMOVES
                        //remove frequencies (freqToRemove contains those to remove ->DELETE)
                        angular.forEach($scope.freqToRemove, function (Fvalue) {
                            $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';
                            var delFreqProm = SITE.deleteSiteFrequency({ id: $scope.thisSite.SITE_ID }, Fvalue).$promise;
                            RemovePromises.push(delFreqProm);
                            delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                        });

                        //remove media (medToRemove contains those to remove ->DELETE)
                        angular.forEach($scope.medToRemove, function (Mvalue) {
                            $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';
                            var delMedProm = SITE.deleteSiteMedia({ id: $scope.thisSite.SITE_ID }, Mvalue).$promise;
                            RemovePromises.push(delMedProm);
                            delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                        });

                        //remove resources (resToRemove contains those to remove ->DELETE)
                        angular.forEach($scope.resToRemove, function (Rvalue) {
                            $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';
                            var delResProm = SITE.deleteSiteResource({ id: $scope.thisSite.SITE_ID }, Rvalue).$promise;
                            RemovePromises.push(delResProm);
                            delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                        });

                        //remove Paramters (paramToRemove contains those to remove ->DELETE)
                        angular.forEach($scope.paramToRemove, function (Pvalue) {
                            $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';
                            var delParamProm = SITE.deleteSiteParameter({ id: $scope.thisSite.SITE_ID }, Pvalue).$promise;
                            RemovePromises.push(delParamProm);
                            delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                        });
                        //#endregion
                        //#region ADDS
                        //add Frequencies only if $scope.freqDirty = true;
                        if ($scope.freqDirty == true) {
                            angular.forEach($scope.Frequencymodel.value, function (FaddValue) {
                                $scope.freqCommaSep.push(FaddValue.FREQUENCY);
                                var freqProm = SITE.addSiteFrequency({ id: $scope.thisSite.SITE_ID }, FaddValue).$promise;
                                AddPromises.push(freqProm);
                            });
                        }
                        //add Media only if $scope.medDirty = true;
                        if ($scope.medDirty == true) {
                            angular.forEach($scope.Mediamodel.value, function (MaddValue) {
                                $scope.medCommaSep.push(MaddValue.MEDIA);
                                var medProm = SITE.addSiteMedia({ id: $scope.thisSite.SITE_ID }, MaddValue).$promise;
                                AddPromises.push(medProm);
                            });
                        }
                        //add Resources only if $scope.resDirty = true;
                        if ($scope.resDirty == true) {
                            angular.forEach($scope.Resourcemodel.value, function (RaddValue) {
                                $scope.resCommaSep.push(RaddValue.RESOURCE_NAME);
                                var resProm = SITE.addSiteResource({ id: $scope.thisSite.SITE_ID }, RaddValue).$promise;
                                AddPromises.push(resProm);
                            });
                        }
                        //add Parameters only if $scope.paramDirty = true;
                        $scope.pParams =[]; $scope.bParams =[]; $scope.cParams =[]; $scope.mBioParams =[]; $scope.tParams =[];
                        
                        angular.forEach($scope.allParametes, function (p) {
                            if (p.selected == true) {
                                $scope.paramCommaSep.push(p);
                                if (p.PARAMETER_GROUP == 'Physical') $scope.pParams.push(p.PARAMETER);
                                if (p.PARAMETER_GROUP == 'Biological') $scope.bParams.push(p.PARAMETER);
                                if (p.PARAMETER_GROUP == 'Chemical') $scope.cParams.push(p.PARAMETER);
                                if (p.PARAMETER_GROUP == 'Microbiological') $scope.mBioParams.push(p.PARAMETER);
                                if (p.PARAMETER_GROUP == 'Toxicological') $scope.tParams.push(p.PARAMETER);
                                if ($scope.resDirty == true) {
                                    var paramProm = SITE.addSiteParameter({ id: $scope.thisSite.SITE_ID }, p).$promise;
                                    AddPromises.push(paramProm);
                                }
                            }
                        });
                        
                        //#endregion
                        //ok now run the removes, then the adds and then pass the stuff back out of here.
                        $q.all(RemovePromises).then(function () {
                            //clear remove arrays
                            $scope.freqToRemove = []; $scope.medToRemove = []; $scope.resToRemove = []; $scope.paramToRemove = [];
                            $q.all(AddPromises).then(function (response) {
                                var newSiteFormatted = {
                                    'SiteId': $scope.thisSite.SITE_ID,
                                    'Name': $scope.thisSite.NAME,
                                    'latitude': $scope.thisSite.LATITUDE,
                                    'longitude': $scope.thisSite.LONGITUDE,
                                    'StartDate': $scope.thisSite.START_DATE != undefined ? makeAdateString($scope.thisSite.START_DATE): '',
                                    'EndDate': $scope.thisSite.END_DATE != undefined ? makeAdateString($scope.thisSite.END_DATE) : '',
                                    'SamplePlatform': $scope.thisSite.SAMPLE_PLATFORM,
                                    'AdditionalInfo': $scope.thisSite.ADDITIONAL_INFO,
                                    'Description': $scope.thisSite.DESCRIPTION,
                                    'Waterbody': $scope.thisSite.WATERBODY,
                                    'GreatLake': $scope.allLakes.filter(function (l) { return l.LAKE_TYPE_ID == $scope.thisSite.LAKE_TYPE_ID; })[0].LAKE,
                                    'Status': $scope.thisSite.STATUS_TYPE_ID > 0 ? $scope.allStats.filter(function (s) { return s.STATUS_ID == $scope.thisSite.STATUS_TYPE_ID; })[0].STATUS : "",
                                    'Country': $scope.thisSite.COUNTRY,
                                    'State': $scope.thisSite.STATE_PROVINCE,
                                    'WatershedHUC8': $scope.thisSite.WATERSHED_HUC8,
                                    'URL': $scope.thisSite.URL,
                                    'Media': $scope.medCommaSep.join(", "),
                                    'Resources': $scope.resCommaSep.join(", "),
                                    'Frequency': $scope.freqCommaSep.join(", "),
                                    'Parameters': $scope.paramCommaSep,
                                    'ParameterStrings': {
                                        'Biological': $scope.bParams.join(", "),
                                        'Chemical': $scope.cParams.join(", "),
                                        'Microbiological': $scope.mBioParams.join(", "),
                                        'Physical': $scope.pParams.join(", "),
                                        'Toxicological': $scope.tParams.join(", ")
                                    }
                                };
                                var siteParts = [newSiteFormatted, 'update'];
                                toastr.success("Site Updated");
                                $uibModalInstance.close(siteParts);
                            }).catch(function error(msg) {
                                console.error(msg);
                            });
                        }).catch(function error(msg) {
                            console.error(msg);
                        });
                    }, function error(errorResponse) {
                        toastr.error("Site did not update");
                    });
                } //end else valid
            };//end save

            //save NEW SITE and then frequencies, media, parameters, and resources
            $scope.create = function (valid) {
                if ($scope.thisSite.SITE_ID != undefined) {
                    $scope.save(valid);
                } else {
                    if (valid == true) {
                        $scope.thisSite.PROJECT_ID = thisProject.PROJECT_ID;
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        $http.defaults.headers.common.Accept = 'application/json';
                        //post site
                        SITE.save({}, $scope.thisSite, function success(response) {
                            var newSite = response;
                            var defer = $q.defer();
                            var postPromises = [];
                            //post frequencies
                            angular.forEach($scope.Frequencymodel.value, function (fValue) {
                                if (fValue.selected == true) {
                                    $scope.freqCommaSep.push(fValue.FREQUENCY);
                                    var freqProm = SITE.addSiteFrequency({ id: newSite.SITE_ID }, fValue).$promise;
                                    postPromises.push(freqProm);
                                }
                            });
                            //post media
                            angular.forEach($scope.Mediamodel.value, function (mValue) {
                                if (mValue.selected == true) {
                                    $scope.medCommaSep.push(mValue.MEDIA);
                                    var medProm = SITE.addSiteMedia({ id: newSite.SITE_ID }, mValue).$promise;
                                    postPromises.push(medProm);
                                }
                            });
                            //post resources
                            angular.forEach($scope.Resourcemodel.value, function (rValue) {
                                if (rValue.selected == true) {
                                    $scope.resCommaSep.push(rValue.RESOURCE_NAME);
                                    var resProm = SITE.addSiteResource({ id: newSite.SITE_ID }, rValue).$promise;
                                    postPromises.push(resProm);
                                }
                            });
                            $scope.pParams = []; $scope.bParams = []; $scope.cParams = []; $scope.mBioParams = []; $scope.tParams = [];
                            //post parameters
                            angular.forEach($scope.allParametes, function (pValue) {
                                if (pValue.selected == true) {
                                    $scope.paramCommaSep.push(pValue);
                                    if (pValue.PARAMETER_GROUP == 'Physical') $scope.pParams.push(pValue.PARAMETER);
                                    if (pValue.PARAMETER_GROUP == 'Biological') $scope.bParams.push(pValue.PARAMETER);
                                    if (pValue.PARAMETER_GROUP == 'Chemical') $scope.cParams.push(pValue.PARAMETER);
                                    if (pValue.PARAMETER_GROUP == 'Microbiological') $scope.mBioParams.push(pValue.PARAMETER);
                                    if (pValue.PARAMETER_GROUP == 'Toxicological') $scope.tParams.push(pValue.PARAMETER);

                                    var parProm = SITE.addSiteParameter({ id: newSite.SITE_ID }, pValue).$promise;
                                    postPromises.push(parProm);
                                }
                            });
                            $q.all(postPromises).then(function (response) {
                                var newSiteFormatted = {
                                    'SiteId': newSite.SITE_ID,
                                    'Name': newSite.NAME,
                                    'latitude': newSite.LATITUDE,
                                    'longitude': newSite.LONGITUDE,
                                    'StartDate': newSite.START_DATE != undefined ? makeAdateString(newSite.START_DATE) : '',
                                    'EndDate': newSite.END_DATE != undefined ? makeAdateString(newSite.END_DATE) : '',
                                    'SamplePlatform': newSite.SAMPLE_PLATFORM,
                                    'AdditionalInfo': newSite.ADDITIONAL_INFO,
                                    'Description': newSite.DESCRIPTION,
                                    'Waterbody': newSite.WATERBODY,
                                    'GreatLake': $scope.allLakes.filter(function (l) { return l.LAKE_TYPE_ID == newSite.LAKE_TYPE_ID; })[0].LAKE,
                                    'Status': newSite.STATUS_TYPE_ID > 0 && newSite.STATUS_TYPE_ID != null ? $scope.allStats.filter(function (s) { return s.STATUS_ID == newSite.STATUS_TYPE_ID; })[0].STATUS : "",
                                    'Country': newSite.COUNTRY,
                                    'State': newSite.STATE_PROVINCE,
                                    'WatershedHUC8': newSite.WATERSHED_HUC8,
                                    'URL': newSite.URL,
                                    'Resources': $scope.resCommaSep.join(", "),
                                    'Media': $scope.medCommaSep.join(", "),
                                    'Frequency': $scope.freqCommaSep.join(", "),
                                    'Parameters': $scope.paramCommaSep,
                                    'ParameterStrings': {
                                        'Biological': $scope.bParams.join(", "),
                                        'Chemical': $scope.cParams.join(", "),
                                        'Microbiological': $scope.mBioParams.join(", "),
                                        'Physical': $scope.pParams.join(", "),
                                        'Toxicological': $scope.tParams.join(", ")
                                    }
                                };

                                var siteParts = [newSiteFormatted, 'create'];

                                toastr.success("Site Created");
                                $uibModalInstance.close(siteParts);
                            }).catch(function error(msg) {
                                console.error(msg);
                            });
                        });//end SITE.save()
                    }//end valid == true
                } //really is create and not just a save that got triggered by hitting enter in a field
            }//end create()

            //cancel modal
            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };

        }//end CheckCreds() passed
    }//end projectEditSiteInfoCtrl

    }());