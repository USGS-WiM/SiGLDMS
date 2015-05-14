(function () {
    /* controllers.js*/
    'use strict';

    var siGLControllers = angular.module('siGLControllers', ['ngInputModified', 'ui.unique', 'xeditable']);

    //disable tabs if there is no project (create page instead of edit page)
    siGLControllers.directive('aDisabled', function () {
        return {
            compile: function (tElement, tAttrs, transclude) {
                //Disable ngClick
                tAttrs["ngClick"] = "!(" + tAttrs["aDisabled"] + ") && (" + tAttrs["ngClick"] + ")";

                //Toggle "disabled" to class when aDisabled becomes true
                return function (scope, iElement, iAttrs) {
                    scope.$watch(iAttrs["aDisabled"], function (newValue) {
                        if (newValue !== undefined) {
                            iElement.toggleClass("disabled", newValue);
                        }
                    });

                    //Disable href on click
                    iElement.on("click", function (e) {
                        if (scope.$eval(iAttrs["aDisabled"])) {
                            e.preventDefault();
                        }
                    });
                };
            }
        };
    });

    siGLControllers.controller('mainCtrl', ['$scope', 'Projects', '$location', '$state', 'checkCreds', 'getUsername', mainCtrl]);
    function mainCtrl($scope, Projects, $location, $state, checkCreds, getUsername) {
        $scope.logo = 'images/usgsLogo.png';
        if (!checkCreds()) {
            //$scope.auth;
            $location.path('/login');
        } else {
            //$scope.auth = true;
            $scope.username = getUsername();
            $state.go('projectList');
            //setProjectLookups();
        }
    }

    //ProjectListCtrl
    siGLControllers.controller('projectListCtrl', ['$scope', 'Projects', '$location', '$http', 'checkCreds', 'getCreds', 'getUsersNAME', projectListCtrl]);
    function projectListCtrl($scope, Projects, $location, $http, checkCreds, getCreds, getUsersNAME) {
        if (!checkCreds()) {
            $scope.auth = false;
            $location.path('/login');
        } else {
            //array of projects 
            $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
            $(".page-loading").removeClass("hidden");
            Projects.getDMProjects(function success(data) {
                data.sort(function (a, b) {
                    var nameA = a.Name.toLowerCase(), nameB = b.Name.toLowerCase();
                    if (nameA < nameB)
                        return -1;
                    if (nameA > nameB)
                        return 1;
                    return 0;
                });
                $scope.projects = data;
                $scope.ProjCnt = data.length;
                $scope.MoreThan20 = data.length >= 20 ? true : false;
                                
                $(".page-loading").addClass("hidden");
            }, function error(errorResponse) {
                $(".page-loading").addClass("hidden");
                toastr.error("Error: " + errorResponse.statusText);
            }
            ).$promise;
            
            // change sorting order
            $scope.sort_by = function (newSortingOrder) {
                if ($scope.sortingOrder == newSortingOrder) {
                    $scope.reverse = !$scope.reverse;
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

            $scope.User = getUsersNAME();
            //setProjectLookups();
        }
    }
    //end projectListCtrl    

    //ProjectEditCtrl
    siGLControllers.controller('projectEditCtrl',
        ['$scope', '$rootScope', '$location', '$state', '$http', '$modal', 'checkCreds', 'getCreds',
            'thisProject', 'projOrgs', 'projDatum', 'projContacts', 'projPubs', 'projSites', 'projObjectives', 'projKeywords',
            'Projects', 'allDurationList', 'allStatsList', 'allObjList', projectEditCtrl
        ]);
    function projectEditCtrl($scope, $rootScope, $location, $state, $http, $modal, checkCreds, getCreds,
        thisProject, projOrgs, projDatum, projContacts, projPubs, projSites, projObjectives, projKeywords,
        Projects, allDurationList, allStatsList, allObjList) {
        //model needed for ProjectEdit Info tab: ( Counts for Cooperators, Datum, Contacts, Publications and Sites) 1. thisProject, 2. parsed urls, 3. project Keywords, 4. all objectives, 5. all statuses, 6. all durations 
      
        if (!checkCreds()) {
            //not creds, go log in        
            $location.path('/login');
        } else {
            $scope.projectForm = {};


            //#region Datepicker
            $scope.datepickrs = {
                projStDate: false,
                projEndDate: false
            }
            $scope.open = function ($event, which) {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.datepickrs[which] = true;
            };
            $scope.format = 'MMM dd, yyyy';
            //#endregion Datepicker

            //#region changing tabs handler /////////////////////
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                var formNameModified = false;
                switch (fromState.url) {
                    case '/info':
                        formNameModified = $scope.projectForm.Info.modified;;
                        break;
                    case '/cooperator':
                        formNameModified = $scope.projectForm.Coop.modified;
                        break;
                    case '/data':
                        formNameModified = $scope.projectForm.Data.modified;
                        break;
                    case '/contact':
                        formNameModified = $scope.projectForm.Contact.modified;
                        break;
                    case '/publication':
                        formNameModified = $scope.projectForm.Pubs.modified;
                        break;
                    default:
                        formNameModified = $scope.projectForm.Site.modified;
                        break;
                }
                if (formNameModified) {
                    console.log('toState.name: ' + toState.name);
                    console.log('fromState.name: ' + fromState.name);


                    if (confirm("Are you sure you want to change tabs? Any unsaved information will be lost.")) {
                        console.log('go to: ' + toState.name);
                    } else {
                        console.log('stay at state: ' + fromState.name);
                        $(".page-loading").addClass("hidden");
                        event.preventDefault();
                        //event.stopPropagation;
                    }
                }
			});
            //#endregion changing tabs handler //////////////////////

            //TODO:check that this project belongs to them if they are not admin
            //#region GLOBALS
            $scope.aProject = {}; //holder for project (either coming in for edit, or being created on POST )
            $scope.Objectivesmodel = {}; //holder for new ProjObjs if they make any to multiselect
            $scope.urls = []; //holder for urls for future parsing back together ( | separated string)
            $scope.undetermined = false; //ng-disabled on end date boolean..set to true if status = end date undefined
            $scope.ObjectivesToAdd = []; //holder for create Project page and user adds Objective Types
            $scope.ProjectKeywords = []; //add projKeywords if edit page, instantiate for create page to allow keys to be added
            var globalKeyHolder; //store key passed so that once success from post comes back still have access to it
            $scope.KeywordsToAdd = []; //holder for create Project page and user adds Keywords
            $scope.isDescChanged = {}; //trigger to show/hide save button for description change
            $scope.isAddInfoChanged = {}; //trigger to show/hide save button for additional info change
            //#endregion GLOBALS

            if (thisProject != undefined) {
                //this is an edit view
                $scope.coopCount = { total: projOrgs.length };
                $scope.datumCount = { total: projDatum.length };
                $scope.contactCount = { total: projContacts.length};
                $scope.pubCount = { total: projPubs.length};
                $scope.sitesCount = { total: projSites.length};

                //1. aProject
                $scope.aProject = thisProject;
                $scope.title = "Project: " + $scope.aProject.NAME;

                //check status for disabling of end date
                if ($scope.aProject.PROJ_STATUS_ID == 1) {
                    $scope.undetermined = true;
                };

                //put string ProjURLs into array by '|'
                if ($scope.aProject.URL) {
                    if (($scope.aProject.URL).indexOf('|') > -1) {
                        $scope.urls = ($scope.aProject.URL).split("|");
                    } else {
                        $scope.urls[0] = $scope.aProject.URL;
                    }
                }
                
                $scope.ProjectKeywords = projKeywords;
                
                //#region add new property to OBJECTIVE_TYPES (selected:true/false)
                //get projObjectives to use in making new prop in all objectives for multi select ('selected: true')
                var projObjs = projObjectives;
               
                var allObjectiveList = allObjList;

                ////http://isteven.github.io/angular-multi-select/#/demo-minimum
                ////go through allObjList and add selected Property.
                for (var i = 0; i < allObjectiveList.length; i++) {
                    //for each one, if projObjectives has this id, add 'selected:true' else add 'selected:false'
                    for (var y = 0; y < projObjs.length; y++) {
                        if (projObjs[y].OBJECTIVE_TYPE_ID == allObjectiveList[i].OBJECTIVE_TYPE_ID) {
                            allObjectiveList[i].selected = true;
                            y = projObjs.length;
                        }
                        else {
                            allObjectiveList[i].selected = false;
                        }
                    }
                    if (projObjs.length == 0) {
                        allObjectiveList[i].selected = false;
                    }
                }
                //#endregion add new property to OBJECTIVE_TYPES (selected:true/false)

                //all objectives (with new selected property)
                $scope.Objectivesdata = allObjectiveList;
            } else {
                $scope.title = "New Project";
            }

            //get the objective types (need to set these if new project as well as existing project)
            if (thisProject == undefined) {
                for (var a = allObjList.length; a--;) {
                    allObjList[a].selected = false;
                };
                $scope.Objectivesdata = allObjList;
            }

            //all project statuses 
            $scope.StatusList = allStatsList;
       
            //all durations
            $scope.DurationList = allDurationList;
        
            //an OBJECTIVE_TYPE was clicked - if added POST, if removed DELETE - for edit view or store for create view
            $scope.ObjClick = function (data) {
                $http.defaults.headers.common['Authorization']= 'Basic ' + getCreds();
                $http.defaults.headers.common['Accept']= 'application/json';

                if ($scope.aProject.PROJECT_ID != undefined) {
                    //this is an edit page and there is a project
                    if (data.selected == true) {                    
                        //post it
                        delete data['selected'];
                        Projects.addProjObjective({ id: $scope.aProject.PROJECT_ID }, data,
                            function success(response) {
                                toastr.success("Project Objectives added");
                            },
                            function error(errorResponse) {
                                toastr.error("Error: " +errorResponse.statusText);
                            }
                        );
                    } else {
                        //delete it
                        delete data['selected']; // remove the selected flag first
                        $http.defaults.headers.common['X-HTTP-Method-Override']= 'DELETE';
                        Projects.deleteProjObjective({ id: $scope.aProject.PROJECT_ID }, data,
                            function success(response) {
                                toastr.success("Project Objectives removed");
                            },
                            function error(errorResponse) {
                                toastr.error("Error: " +errorResponse.statusText);
                            }
                        );
                    }
                } else {
                    //this is a create project and need to store this to handle after project is POSTed
                    if (data.selected == true) {
                        delete data['selected'];
                        //only care if true since this is a new project and nothing to delete
                        $scope.ObjectivesToAdd.push(data);
                    }
                }
            }//end fClick

            $scope.newURL = {}; //model binding to return newUrl.value to ADD/REMOVE functions                

            //#region ADD/REMOVE URLS
            $scope.removeUrl = function (key) {
                //modal
                var modalInstance = $modal.open({
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
                        if ($scope.aProject.PROJECT_ID != undefined) {
                            //PUT the Project
                            $scope.aProject.URL = ($scope.urls).join('|');
                            $scope.SaveOnBlur(); //send to PUT
                            }
                            }, function () {
                //logic to do on cancel
                });
                //end modal
            };

            $scope.addProjURL = function () {
                if ($scope.newURL.value != undefined) {
                    //push to array of urls to show on view and store in model
                    $scope.urls.push($scope.newURL.value);
                    if ($scope.aProject.PROJECT_ID != undefined) {
                        //PUT the Project
                        $scope.aProject.URL = ($scope.urls).join('|');
                        $scope.SaveOnBlur(); //send to PUT
                    }
                    $scope.newURL = {};
                } else {
                    alert("Please type a URL in first.");
                }
            }
            //#endregion ADD/REMOVE URLS

            $scope.newKey = {}; //model binding to return keys to ADD/REMOVE functions
            
            //#region ADD/REMOVE KEYWORDS
            //add keyword click
            $scope.addThisKeyword = function () {
                if ($scope.newKey.value != undefined) {
                    var newKEY = { TERM: $scope.newKey.value }; //store object of KEYWORD
                    globalKeyHolder = $scope.newKey.value;  //store value of key
                    if ($scope.aProject.PROJECT_ID != undefined) {
                        //this is an edit, go ahead and post PROJ_KEYWORD
                        $http.defaults.headers.common['Accept'] = 'application/json';
                        //POST it                            
                        $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                        Projects.addProjKeyword({ id: $scope.aProject.PROJECT_ID }, newKEY, function success(response) {
                            $scope.ProjectKeywords.push({ TERM: globalKeyHolder });
                            toastr.success("Keyword Added");
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        });
                    } else {
                        //this is a create, no projectid yet, store it
                        $scope.KeywordsToAdd.push(newKEY);
                        $scope.ProjectKeywords.push({ TERM: globalKeyHolder });
                    }

                    $scope.newKey = {};
                } else {
                    // the value is empty
                    alert("Please type a keyword in first.");
                }                
            }

            //remove keyword click (passed confirm)
            $scope.removeKey = function (key) {
                //modal
                var modalInstance = $modal.open({
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
                    var index = $scope.ProjectKeywords.indexOf(key);
                    if ($scope.aProject.PROJECT_ID != undefined) {
                        //DELETE it
                        $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                        $http.defaults.headers.common['Accept'] = 'application/json';
                        $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';

                        Projects.deleteProjKeyword({ id: $scope.aProject.PROJECT_ID }, key, function success(response) {
                            $scope.ProjectKeywords.splice(index, 1);
                            toastr.success("Keyword Removed");
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        });
                        delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                    } else {
                        //just remove it from the list (this is a create page)
                        $scope.ProjectKeywords.splice(index, 1);
                    }
                }, function () {
                    //logic for cancel
                });
                //end modal
            };
            
            //#endregion ADD/REMOVE KEYWORDS

            //disable end date if status has 'end date undetermined'
            $scope.selectedStat = function (id) {
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

            //save NEW PROJECT and then Keywords and Objectives
            $scope.save = function () {
                //if this is an edit, need to do PUT
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                $http.defaults.headers.common['Accept'] = 'application/json';
                $scope.aProject.URL = ($scope.urls).join('|');
                var projID;
                Projects.save({}, $scope.aProject, function success(response) {
                    toastr.success("Project Created");
                    projID = response.PROJECT_ID;
                    //post objectives added
                    for (var o = $scope.ObjectivesToAdd.length; o--;) {
                        Projects.addProjObjective({ id: projID }, $scope.ObjectivesToAdd[o],
                            function success(response) {
                                toastr.success("Project Objectives added");
                            },
                            function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }
                        );
                    };
                    //post keywords
                    for (var k = $scope.KeywordsToAdd.length; k--;) {
                        Projects.addProjKeyword({ id: projID }, $scope.KeywordsToAdd[k],
                            function success(response) {
                                toastr.success("Keyword Added");
                            },
                            function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }
                        );
                    }
                }, function error(errorResponse) {
                    toastr.success("Error: " + errorResponse.statusText);
                }).$promise.then(function () {
                    $location.path('/project/edit/' + projID + '/info').replace();//.notify(false);
                    $scope.apply;
                });
                
            }
            
            //change to the aProject made, put it .. fired on each blur after change made to field
            $scope.SaveOnBlur = function(id){
                if ($scope.aProject.PROJECT_ID != undefined) {
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    $http.defaults.headers.common['X-HTTP-Method-Override'] = 'PUT';
                    Projects.save({ id: $scope.aProject.PROJECT_ID }, $scope.aProject, function success(response) {
                        toastr.success("Project Updated");
                        $scope.isDescChanged.bool = false;
                        $scope.isAddInfoChanged.bool = false;
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                    if (id > 0) {
                        $scope.selectedStat(id);
                    }
                    delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                }
            }//end SaveOnBlur

            $scope.cancel = function () {
                //navigate to a different state
                $state.go('projectList');
            };//end cancel

        }//end else (checkCreds == true)
    }//end projectEditCtrl

    //ProjectEditCoopCtrl $modal
    siGLControllers.controller('projectEditCoopCtrl', ['$scope', '$http', '$filter', '$modal', 'thisProject', 'projOrgs', 'Projects', 'allOrgList', 'Organization', 'getCreds', projectEditCoopCtrl]);
    function projectEditCoopCtrl($scope, $http, $filter, $modal, thisProject, projOrgs, Projects, allOrgList, Organization, getCreds) {
        $scope.ProjOrgs = projOrgs;
        $scope.allOrganizations = allOrgList;
        $scope.newOrg = {};
        var thisProjID = thisProject.PROJECT_ID;
        $scope.filteredDivs = [];
        $scope.filteredSecs = [];
        $scope.showAddSecButton = false;

        //#region POST ProjOrg click
        $scope.AddOrg = function (valid, o) {
            if (valid) {
                //add it
                var thisOrg = {};
                //if SECTION.hasValue ==use that ID else if DIVISION.hasValue ==use that ID else use NAME.ID, THEN GET THIS ORG for POST
                if (o.SECTION > 0) {
                    thisOrg = allOrgList.filter(function (org) { return org.ORGANIZATION_ID == o.SECTION });
                } else if (o.DIVISION > 0) {
                    thisOrg = allOrgList.filter(function (org) { return org.ORGANIZATION_ID == o.DIVISION });
                } else {
                    thisOrg = allOrgList.filter(function (org) { return org.ORGANIZATION_ID == o.NAME });
                }
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                $http.defaults.headers.common['Accept'] = 'application/json';
                Projects.addProjOrg({ id: thisProjID }, thisOrg[0], function success(response) {
                    $scope.ProjOrgs.push(thisOrg[0]);
                    $scope.coopCount.total = $scope.coopCount.total + 1;
                    $scope.newOrg = {};
                    $scope.filteredDivs = [];
                    $scope.filteredSecs = [];
                    toastr.success("Cooperator Added");
                }, function error(errorResponse) {
                    toastr.error("Error: " + errorResponse.statusText);
                });

            } else {
                alert("You must first choose an Organization name.");
            }
        }
        //#endregion POST ProjOrg click

        //#region DELETE Org click
        $scope.RemoveOrg = function (org) {
            //modal
            var modalInstance = $modal.open({
                templateUrl: 'removemodal.html',
                controller: 'ConfirmModalCtrl',
                size: 'sm',
                resolve: {
                    keyToRemove: function () {
                        return org;
                    },
                    what: function () {
                        return "Cooperator";
                    }
                }
            });
            modalInstance.result.then(function (keyToRemove) {
                //yes, remove this keyword
                var index = $scope.ProjOrgs.indexOf(org);
                //DELETE it
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                $http.defaults.headers.common['Accept'] = 'application/json';
                $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';

                Projects.deleteProjOrg({ id: thisProjID }, org, function success(response) {
                    $scope.ProjOrgs.splice(index, 1);
                    $scope.coopCount.total = $scope.coopCount.total - 1;
                    toastr.success("Cooperator Removed");
                }, function error(errorResponse) {
                    toastr.error("Error: " + errorResponse.statusText);
                });
                delete $http.defaults.headers.common['X-HTTP-Method-Override'];
            }, function () {
                //logic for cancel
            });
            //end modal
        };

        //#endregion DELETE Org click

        //#region Filter Divisions / Sections based on select change
        //org was chosen, get the divisions
        $scope.filterDivs = function () {            
            if ($scope.newOrg.NAME != undefined) {
                $scope.showAddSecButton = false;
                $scope.filteredDivs = [];
                $scope.filteredSecs = [];
                var orgID = $scope.newOrg.NAME; //ORG_ID
                var sele = ($scope.allOrganizations).filter(function (o) { return o.ORGANIZATION_ID == orgID }); //give me just this org
                
                for (var i = 0; i < $scope.allOrganizations.length; i++) {
                    if ($scope.allOrganizations[i].NAME == sele[0].NAME) {
                        $scope.filteredDivs.push($scope.allOrganizations[i]);
                    };
                };
            };
        };

        //division was chosen, get the sections
        $scope.filterSecs = function () {
            if ($scope.newOrg.DIVISION != undefined) {
                $scope.filteredSecs = [];
                var orgID = $scope.newOrg.DIVISION; //ORGID
                var sele = ($scope.allOrganizations).filter(function (o) { return o.ORGANIZATION_ID == orgID }); //give me just this org
                if (sele[0].DIVISION != null) { $scope.showAddSecButton = true; } else { $scope.showAddSecButton = false;}
                for (var i = 0; i < $scope.allOrganizations.length; i++) {
                    if ($scope.allOrganizations[i].NAME == sele[0].NAME && $scope.allOrganizations[i].DIVISION == sele[0].DIVISION) {
                        $scope.filteredSecs.push($scope.allOrganizations[i]);
                    };
                };
            };
        };
        //#endregion Filter Divisions / Sections based on select change

        //#region ADD ORG MODAL CONTENT (Add New ORG NAME, DIVISION, OR SECTION)
        //Add New Organization Name clicked
        $scope.AddOrgName = function () {
            //modal
            var modalInstance = $modal.open({
                templateUrl: 'AddOrgNAME.html',
                controller: 'AddOrgModalCtrl',
                size: 'md',
                resolve: {
                    thisOrg: function () {
                        return "none";
                    },
                    what: function () {
                        return "organization";
                    }
                }
            });
            modalInstance.result.then(function (newOrgToSend) {
                $http.defaults.headers.common['Accept'] = 'application/json';
                //POST it                            
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                Organization.save(newOrgToSend, function success(response) {
                    $scope.allOrganizations.push(response);
                    $scope.newOrg = {};
                    $scope.filteredDivs = [];
                    $scope.filteredSecs = [];
                    $scope.showAddSecButton = false;
                    toastr.success("Organization Added");
                }, function error(errorResponse) {
                    toastr.error("Error: " + errorResponse.statusText);
                });
            }, function () {
                //logic to do on cancel
            });
            //end modal
        };

        //Add New Organization Division clicked
        $scope.AddDivName = function () {
            
            var org = ($scope.allOrganizations).filter(function (o) { return o.ORGANIZATION_ID == $scope.newOrg.NAME }); //give me just this org
            //modal
            var modalInstance = $modal.open({
                templateUrl: 'AddOrgDIV.html',
                controller: 'AddOrgModalCtrl',
                size: 'md',
                resolve: {
                    thisOrg: function () {
                        return org;
                    },
                    what: function () {
                        return "division";
                    }
                }
            });
            modalInstance.result.then(function (newOrgToSend) {
                //yes, add this new org                
                $http.defaults.headers.common['Accept'] = 'application/json';
                //POST it                            
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                Organization.save(newOrgToSend, function success(response) {
                    $scope.allOrganizations.push(response);
                    $scope.newOrg = {};
                    $scope.filteredDivs = [];
                    $scope.filteredSecs = [];
                    $scope.showAddSecButton = false;
                    toastr.success("Organization Added");
                }, function error(errorResponse) {
                    toastr.error("Error: " + errorResponse.statusText);
                });
            }, function () {
                //logic to do on cancel
            });
            //end modal
        };

        //Add New Organization Section clicked
        $scope.AddSecName = function () {

            var org = ($scope.allOrganizations).filter(function (o) { return o.ORGANIZATION_ID == $scope.newOrg.DIVISION }); //give me just this org
            //modal
            var modalInstance = $modal.open({
                templateUrl: 'AddOrgSEC.html',
                    controller: 'AddOrgModalCtrl',
                    size: 'md',
                    resolve: {
                        thisOrg: function () {
                            return org;
                    },
                        what: function () {
                        return "section";
                        }
                }
            });
            modalInstance.result.then(function (newOrgToSend) {
                //yes, add this new org
                $http.defaults.headers.common['Accept']= 'application/json';
                //POST it                            
                $http.defaults.headers.common['Authorization']= 'Basic ' +getCreds();
                Organization.save(newOrgToSend, function success(response) {
                    $scope.allOrganizations.push(response);
                    $scope.newOrg = { };
                    $scope.filteredDivs =[];
                    $scope.filteredSecs =[];
                    toastr.success("Organization Added");
                }, function error(errorResponse) {
                    toastr.error("Error: " +errorResponse.statusText);
                    });
                    }, function () {
                //logic to do on cancel
                });
                //end modal
        };

        //#endregion ADD ORG MODAL CONTENT (Add New ORG NAME, DIVISION, OR SECTION)

        $scope.cancel = function () {
            //navigate to a different state
            $state.go('projectList');
        };

    }

    //ProjectEditDataCtrl
    siGLControllers.controller('projectEditDataCtrl', ['$scope', '$http', '$modal', 'Projects', 'DataHost', 'thisProject', 'projDatum', 'getCreds', projectEditDataCtrl]);
    function projectEditDataCtrl($scope, $http, $modal, Projects, DataHost, thisProject, projDatum, getCreds) {
        $scope.ProjData = projDatum;
        
        $scope.newData = {};
        var thisProjID = thisProject.PROJECT_ID;

        //#region POST Data click
        $scope.AddData = function (valid, d) {
            if (valid) {
                //add it
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                $http.defaults.headers.common['Accept'] = 'application/json';
                Projects.addProjData({ id: thisProjID }, d, function success(response) {
                    $scope.ProjData.push(d);
                    $scope.datumCount.total = $scope.datumCount.total + 1;
                    $scope.newData = {};
                    toastr.success("Data Added");
                }, function error(errorResponse) {
                    toastr.error("Error: " + errorResponse.statusText);
                });

            } else {
                alert("You must populate at least one field before adding the data.");
            }
        }
        //#endregion POST Data click

        //#region DELETE Data click
        $scope.RemoveData = function (dataH) {
            //modal
            var modalInstance = $modal.open({
                templateUrl: 'removemodal.html',
                controller: 'ConfirmModalCtrl',
                size: 'sm',
                resolve: {
                    keyToRemove: function () {
                        return dataH;
                    },
                    what: function () {
                        return "Data";
                    }
                }
            });
            modalInstance.result.then(function (keyToRemove) {
                //yes, remove this keyword
                var index = $scope.ProjData.indexOf(dataH);
                //DELETE it
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                $http.defaults.headers.common['Accept'] = 'application/json';
                $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';

                Projects.deleteProjData({ id: thisProjID }, dataH, function success(response) {
                    $scope.ProjData.splice(index, 1);
                    $scope.datumCount.total = $scope.datumCount.total - 1;
                    toastr.success("Data Removed");
                }, function error(errorResponse) {
                    toastr.error("Error: " + errorResponse.statusText);
                });
                delete $http.defaults.headers.common['X-HTTP-Method-Override'];
            }, function () {
                //logic for cancel
            });
            //end modal
        };
        //#endregion DELETE Data click

        //#region Edit existing Data        
        $scope.saveData = function (data, id) {
            var test;
            var retur = false;
            $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
            $http.defaults.headers.common['Accept'] = 'application/json';
            $http.defaults.headers.common['X-HTTP-Method-Override'] = 'PUT';

            DataHost.save({ id: id }, data, function success(response) {
                retur = response;
                toastr.success("Data Updated");
            }, function error(errorResponse) {
                retur = false;
                toastr.error("Error: " + errorResponse.statusText);
            });
            delete $http.defaults.headers.common['X-HTTP-Method-Override'];
            return retur;
        };


        //#endregion Edit existing Data
        $scope.cancel = function () {
            //navigate to a different state
            $state.go('projectList');
        };
    }

    //projectEditContactCtrl
    siGLControllers.controller('projectEditContactCtrl', ['$scope', '$http', '$modal', 'Projects', 'projContacts', 'thisProject', 'allOrgList', 'getCreds', projectEditContactCtrl]);
    function projectEditContactCtrl($scope, $http, $modal, Projects, projContacts, thisProject, allOrgList, getCreds) {
        $scope.ProjContacts = projContacts;
        $scope.allOrganizations = allOrgList;
        
        $scope.newContact = {};
        var thisProjID = thisProject.PROJECT_ID;

        //#region POST Contact click
        $scope.AddContact = function (valid, c) {
            if (valid) {
                //add it
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                $http.defaults.headers.common['Accept'] = 'application/json';
                Projects.addProjContact({ id: thisProjID }, c, function success(response) {
                    $scope.ProjContacts.push(c);
                    $scope.contactCount.total = $scope.contactCount.total + 1;
                    $scope.newData = {};
                    toastr.success("Contact Added");
                }, function error(errorResponse) {
                    toastr.error("Error: " + errorResponse.statusText);
                });

            } else {
                alert("You must populate at least one field before adding the contact.");
            }
        }
        //#endregion POST Contact click

        //#region DELETE Contact click
        $scope.RemoveData = function (con) {
            //modal
            var modalInstance = $modal.open({
                templateUrl: 'removemodal.html',
                controller: 'ConfirmModalCtrl',
                size: 'sm',
                resolve: {
                    keyToRemove: function () {
                        return con;
                    },
                    what: function () {
                        return "Contact";
                    }
                }
            });
            modalInstance.result.then(function (keyToRemove) {
                //yes, remove this keyword
                var index = $scope.ProjContacts.indexOf(con);
                //DELETE it
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                $http.defaults.headers.common['Accept'] = 'application/json';
                $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';

                Projects.deleteProjData({ id: thisProjID }, con, function success(response) {
                    $scope.ProjContacts.splice(index, 1);
                    $scope.contactCount.total = $scope.contactCount.total - 1;
                    toastr.success("Data Removed");
                }, function error(errorResponse) {
                    toastr.error("Error: " + errorResponse.statusText);
                });
                delete $http.defaults.headers.common['X-HTTP-Method-Override'];
            }, function () {
                //logic for cancel
            });
            //end modal
        };
        //#endregion DELETE Contact click

        //#region Edit existing Contact        
        $scope.saveContact = function (data, id) {
            var test;
            var retur = false;
            $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
            $http.defaults.headers.common['Accept'] = 'application/json';
            $http.defaults.headers.common['X-HTTP-Method-Override'] = 'PUT';

            DataHost.save({ id: id }, data, function success(response) {
                retur = response;
                toastr.success("Data Updated");
            }, function error(errorResponse) {
                retur = false;
                toastr.error("Error: " + errorResponse.statusText);
            });
            delete $http.defaults.headers.common['X-HTTP-Method-Override'];
            return retur;
        };


        //#endregion Edit existing Data
        $scope.cancel = function () {
            //navigate to a different state
            $state.go('projectList');
        };
    }

    //projectEditPubCtrl
    siGLControllers.controller('projectEditPubCtrl', ['$scope', '$http', 'Projects', 'thisProject', 'Publication', 'projPubs', 'getCreds', projectEditPubCtrl]);
    function projectEditPubCtrl($scope, $http, Projects, thisProject, Publication, projPubs, getCreds) {
        $scope.ProjPubs = projPubs;

        $scope.newPub = {};
        var thisProjID = thisProject.PROJECT_ID;

        //#region POST Pub click
        $scope.AddPub = function (valid, p) {
            if (valid) {
                //add it
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                $http.defaults.headers.common['Accept'] = 'application/json';
                Projects.addProjPublication({ id: thisProjID }, p, function success(response) {
                    $scope.ProjPubs.push(p);
                    $scope.pubCount.total = $scope.pubCount.total + 1;
                    $scope.newPub = {};
                    toastr.success("Publication Added");
                }, function error(errorResponse) {
                    toastr.error("Error: " + errorResponse.statusText);
                });

            } else {
                alert("You must populate at least one field before adding the publication.");
            }
        }
        //#endregion POST Pub click

        //#region DELETE Pub click
        $scope.RemovePub = function (pub) {
            var index = $scope.ProjPubs.indexOf(pub);
            //DELETE it
            $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
            $http.defaults.headers.common['Accept'] = 'application/json';
            $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';

            Projects.deleteProjPublication({ id: thisProjID }, pub, function success(response) {
                $scope.ProjPubs.splice(index, 1);
                $scope.pubCount.total = $scope.pubCount.total - 1;
                toastr.success("Publication Removed");
            }, function error(errorResponse) {
                toastr.error("Error: " + errorResponse.statusText);
            });
        }
        //#endregion DELETE Pub click

        //#region Edit existing Data
        $scope.savePub = function (data, id) {
            var test;
            var retur = false;
            $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
            $http.defaults.headers.common['Accept'] = 'application/json';
            $http.defaults.headers.common['X-HTTP-Method-Override'] = 'PUT';

            Publication.save({ id: id }, data, function success(response) {
                retur = response;
                toastr.success("Publication Updated");
            }, function error(errorResponse) {
                retur = false;
                toastr.error("Error: " + errorResponse.statusText);
            });
            delete $http.defaults.headers.common['X-HTTP-Method-Override'];
            return retur;
        };
        //#endregion Edit existing Data

        $scope.cancel = function () {
            //navigate to a different state
            $state.go('projectList');
        };
    }

    //popup confirm box
    siGLControllers.controller('ConfirmModalCtrl', ['$scope', '$modalInstance', 'keyToRemove', 'what', ConfirmModalCtrl]);
    function ConfirmModalCtrl ($scope, $modalInstance, keyToRemove, what) {
        if (keyToRemove['TERM'] != undefined) {
            $scope.keyToRmv = keyToRemove.TERM;
        } else if (keyToRemove['ORGANIZATION_ID'] != undefined)
        {
            $scope.keyToRmv = keyToRemove.NAME;
        } else if (keyToRemove['DATA_HOST_ID'] != undefined) {
            $scope.keyToRmv = keyToRemove.DESCRIPTION;
        }
        else {
            $scope.keyToRmv = keyToRemove;
        };

        $scope.what = what;

        $scope.ok = function () {
            $modalInstance.close(keyToRemove);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    //org popup to add to org db
    siGLControllers.controller('AddOrgModalCtrl', ['$scope', '$modalInstance', 'what', 'thisOrg', AddOrgModalCtrl]);
    function AddOrgModalCtrl($scope, $modalInstance, what, thisOrg) {
        $scope.newOrg = {}; //holder for binding
        $scope.what = what;
        var newOrgToSend = {};

        if (thisOrg != "none") {
            $scope.orgName = thisOrg[0].NAME;
            if (thisOrg[0].DIVISION != null) {
                //there's a division, so adding a section now
                $scope.orgDiv = thisOrg[0].DIVISION;           
           
                $scope.ok = function () {
                    newOrgToSend.NAME = $scope.orgName;
                    newOrgToSend.DIVISION = $scope.orgDiv;
                    newOrgToSend.SECTION = $scope.newOrg.SECTION;
                    $modalInstance.close(newOrgToSend);
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }//thisOrg[0].DIVISION != null
            else {
                //DIVISION is null == adding division
                $scope.ok = function () {
                    newOrgToSend.NAME = $scope.orgName;
                    newOrgToSend.DIVISION = $scope.newOrg.DIVISION;
                    newOrgToSend.SECTION = null;
                    $modalInstance.close(newOrgToSend);
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }
        } //thisOrg != null
        else {
            //this is a new org name            
            $scope.ok = function () {
                newOrgToSend.NAME = $scope.newOrg.NAME;
                newOrgToSend.DIVISION = null;
                newOrgToSend.SECTION = null;
                $modalInstance.close(newOrgToSend);
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        }
    }

    //login
    siGLControllers.controller('LoginCtrl', ['$scope', '$state', '$http', 'Login', 'setCreds', LoginCtrl]);
    function LoginCtrl($scope, $state, $http, Login, setCreds) {
        $('[type=password]').keypress(function (e) {
            var $password = $(this),
                tooltipVisible = $('.tooltip').is(':visible'),
                s = String.fromCharCode(e.which);

            //check if caplock is on. tests if letter is upper case and shift is NOT pressed
            if (s.toUpperCase() === s && s.toLowerCase() !== s && !e.shiftKey) {
                if (!tooltipVisible) 
                    $password.tooltip('show');
            } else {
                if (tooltipVisible)
                    $password.tooltip('hide');
            }
            
            //hide the tooltip when moving away from password field
            $password.blur(function (e) {
                $password.tooltip('hide');
            });
        });

        $scope.submit = function () {
            $scope.sub = true;
            var postData = {
                "username": $scope.username,
                "password": $scope.password
            };
            var up = $scope.username + ":" + $scope.password;
            $http.defaults.headers.common['Authorization'] = 'Basic ' + btoa(up);
            $http.defaults.headers.common['Accept'] = 'application/json';
            Login.login({}, postData,
                function success(response) {
                    var user = response;
                    if (user != undefined) {
                        //set user cookies (cred, username, name, role
                        var usersNAME = user.FNAME + " " + user.LNAME;
                        setCreds($scope.username, $scope.password, usersNAME, user.ROLE_ID);
                        $scope.auth = true;
                        $state.go('projectList');
                    }
                    else {
                        $scope.error = "Login Failed";
                    }
                },
                function error(errorResponse) {
                    alert("Error:" + errorResponse.statusText);
                }
            );
        };
    }

    //logOut
    siGLControllers.controller('LogoutCtrl', ['$scope', '$location', 'deleteCreds', LogoutCtrl]);
    function LogoutCtrl($scope, $location, deleteCreds) {
        $scope.logout = function () {
            deleteCreds();
            $location.path('/login');
        }
    };
   
})();