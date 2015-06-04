(function () {
    /* controllers.js*/
    'use strict';

    var siGLControllers = angular.module('siGLControllers',
        ['ngInputModified', 'ngHandsontable', 'ui.unique', 'angular.filter', 'xeditable']);

    //#region DIRECTIVES
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

    siGLControllers.directive('tooltip', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                $(element).hover(function () {
                    // on mouseenter
                    $(element).tooltip('show');
                }, function () {
                    // on mouseleave
                    $(element).tooltip('hide');
                });
            }
        };
    });

    siGLControllers.directive('myInputMask', function() {
        return {
            restrict: 'AC',
            link: function (scope, el, attrs) {
                el.inputmask(scope.$eval(attrs.myInputMask));
                el.on('change', function() {
                    scope.$eval(attrs.ngModel + "='" + el.val() + "'");
                    // or scope[attrs.ngModel] = el.val() if your expression doesn't contain dot.
                });
            }
        }
    });
    //#endregion DIRECTIVES

    siGLControllers.controller('mainCtrl', ['$scope', '$rootScope', '$location', '$state', 'Projects', 'checkCreds', 'getUsersNAME', 'deleteCreds', mainCtrl]);
    function mainCtrl($scope, $rootScope, $location, $state, Projects, checkCreds, getUsersNAME, deleteCreds) {
        $scope.logo = 'images/usgsLogo.png';
        $rootScope.isAuth = {};

        if (!checkCreds()) {
            $rootScope.isAuth.val = false;
            $location.path('/login');
        } else {
            $rootScope.isAuth.val = true;
            $rootScope.usersName = getUsersNAME();
            $state.go('projectList');

        }
    }

    siGLControllers.controller('accountCtrl', ['$scope', '$location', '$state', 'Projects', 'checkCreds', 'getUsersNAME', accountCtrl]);
    function accountCtrl($scope, $location, $state, Projects, checkCreds, getUsersNAME) {
        $scope.accountUser = {};
        $scope.accountUser.Name = getUsersNAME();
    }

    siGLControllers.controller('helpCtrl', ['$scope', helpCtrl]);
    function helpCtrl($scope) {
        $scope.helpInfo = {};
        $scope.helpInfo.fact = "Some really interesting help will be here.";
    }

    siGLControllers.controller('navCtrl', ['$scope', '$location', '$rootScope', 'checkCreds', 'deleteCreds', navCtrl]);
    function navCtrl($scope, $location, $rootScope, checkCreds, deleteCreds) {        
        $scope.logout = function () {
            deleteCreds();
            $rootScope.isAuth.val = false;
            $location.path('/login');
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
                        formNameModified = false;
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
                    case '/siteInfo/:siteId':
                        formNameModified = false; //$scope.projectForm.SiteInfo.modified;
                        //if (fromState.url == '/siteInfo/:siteId' && toState.url == '/siteList') {
                        //    //just creating a site ..no need to flag
                        //    formNameModified = false;
                        //}
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
            $scope.isProjDescChanged = {}; //trigger to show/hide save button for description change
            $scope.isProjAddInfoChanged = {}; //trigger to show/hide save button for additional info change
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
                $scope.readyFlagModel = thisProject.READY_FLAG > 0 ? "Yes" : "No";

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
                            y = projObjs.length; //ensures it doesn't set it as false after setting it as true
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
            }//end ObjClick

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
            $scope.save = function (valid) {
                //check if they filled in all required fields
                if (valid) {
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
            }
            
            //change to the aProject made, put it .. fired on each blur after change made to field
            $scope.SaveOnBlur = function(id){
                if ($scope.aProject.PROJECT_ID != undefined) {
                    //ensure they don't delete required field values
                    if ($scope.aProject.NAME != null) {
                        $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                        $http.defaults.headers.common['Accept'] = 'application/json';
                        $http.defaults.headers.common['X-HTTP-Method-Override'] = 'PUT';
                        Projects.save({ id: $scope.aProject.PROJECT_ID }, $scope.aProject, function success(response) {
                            toastr.success("Project Updated");
                            $scope.isProjDescChanged.bool = false;
                            $scope.isProjAddInfoChanged.bool = false;
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        });
                        
                        delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                    }                    
                    //else {alert("Project Name is required.")}
                }
                if (id > 0) {
                    $scope.selectedStat(id);
                }
            }//end SaveOnBlur

            $scope.cancel = function () {
                //navigate to a different state
                $state.go('projectList');
            };//end cancel

        }//end else (checkCreds == true)
    }//end projectEditCtrl

    //ProjectEditCoopCtrl
    siGLControllers.controller('projectEditCoopCtrl', ['$scope', '$http', '$filter', '$modal', 'orgService', 'thisProject', 'projOrgs', 'Projects', 'allOrgList', 'Organization', 'getCreds', projectEditCoopCtrl]);
    function projectEditCoopCtrl($scope, $http, $filter, $modal, orgService, thisProject, projOrgs, Projects, allOrgList, Organization, getCreds) {
        $scope.ProjOrgs = projOrgs;
//        $scope.allOrganizations = allOrgList;
        var OrgArrays = orgService(allOrgList);
        $scope.OrgNameArray = OrgArrays.ONames;
        $scope.OrgDivArray = OrgArrays.ODivs;
        $scope.OrgSecArray = OrgArrays.OSecs;

        $scope.newOrg = {};
        var thisProjID = thisProject.PROJECT_ID;
        $scope.filteredDivs = [];
        $scope.filteredSecs = [];
        $scope.showAddSecButton = false;

        //#region POST ProjOrg click
        $scope.AddOrg = function (valid, o) {
            if (valid) {
                //TODO: make sure they can't add the same one twice........
                //add it
                var thisOrg = {};
                //if SECTION.hasValue ==use that ID else if DIVISION.hasValue ==use that ID else use NAME.ID, THEN GET THIS ORG for POST
                if ($scope.selectedOrgSec.value > 0) {
                    thisOrg = $scope.OrgSecArray.filter(function (org) { return org.ORGANIZATION_ID == $scope.selectedOrgSec.value });// allOrgList.filter(function (org) { return org.ORGANIZATION_ID == o.SECTION });
                } else if ($scope.selectedOrgDiv.value > 0) {//(o.DIVISION > 0) {
                    thisOrg = $scope.OrgDivArray.filter(function (org) { return org.ORGANIZATION_ID == $scope.selectedOrgDiv.value});// allOrgList.filter(function (org) { return org.ORGANIZATION_ID == o.DIVISION });
                } else {
                    thisOrg = $scope.OrgNameArray.filter(function (org) { return org.ORGANIZATION_ID == $scope.selectedOrgName.value });// allOrgList.filter(function (org) { return org.ORGANIZATION_ID == o.NAME });
                }
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                $http.defaults.headers.common['Accept'] = 'application/json';
                Projects.addProjOrg({ id: thisProjID }, thisOrg[0], function success(response) {
                    $scope.ProjOrgs.push(thisOrg[0]);
                    $scope.coopCount.total = $scope.coopCount.total + 1;
                    $scope.selectedOrgName.value = "";
                    $scope.filteredDivs = [];
                    $scope.filteredSecs = [];
                    $scope.projectForm.Coop.$setPristine(true);
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
        $scope.selectedOrgName = {};
        $scope.selectedOrgDiv = {};
        $scope.selectedOrgSec = {};
        $scope.filterDivs = function () {            
            if ($scope.selectedOrgName.value != undefined) {//if ($scope.newOrg.NAME != undefined) {
                $scope.showAddSecButton = false;
                $scope.filteredDivs = [];
                $scope.filteredSecs = [];
                var orgID = $scope.selectedOrgName.value;// $scope.newOrg.NAME; //ORG_ID
                var org = ($scope.OrgNameArray).filter(function (o) { return o.ORGANIZATION_ID == orgID });
                var sele = ($scope.OrgDivArray).filter(function (o) { return o.NAME == org[0].NAME });//($scope.allOrganizations).filter(function (o) { return o.ORGANIZATION_ID == orgID }); //give me just this org
                if (sele.length > 0) {
                    for (var i = 0; i < $scope.OrgDivArray.length; i++) {
                        if ($scope.OrgDivArray[i].NAME == sele[0].NAME) {
                            $scope.filteredDivs.push($scope.OrgDivArray[i]);
                        }
                    }
                }
                //for (var i = 0; i < $scope.allOrganizations.length; i++) {
                //    if ($scope.allOrganizations[i].NAME == sele[0].NAME) {
                //        $scope.filteredDivs.push($scope.allOrganizations[i]);
                //    };
                //};
            } else {
                //it is undefined.. clear filteredDivs in case they populated anything
                $scope.projectForm.Coop.$setPristine(true);
                $scope.filteredDivs = [];
                $scope.selectedOrgDiv.value = "";
                $scope.filteredSecs = [];
                $scope.selectedOrgSec.value = "";
            }
        };

        //division was chosen, get the sections
        $scope.filterSecs = function () {
            $scope.filteredSecs = [];
            if ($scope.selectedOrgDiv.value != null) {//if ($scope.newOrg.DIVISION != undefined) {
                var orgID = $scope.selectedOrgDiv.value;// $scope.newOrg.DIVISION; //ORGID
                var org = ($scope.OrgDivArray).filter(function (o) { return o.ORGANIZATION_ID == orgID });
                var sele = ($scope.OrgSecArray).filter(function (o) { return o.DIVISION == org[0].DIVISION }); // ($scope.allOrganizations).filter(function (o) { return o.ORGANIZATION_ID == orgID }); //give me just this org
                if (sele.length > 0) {
                    if (sele[0].DIVISION != null) { $scope.showAddSecButton = true; } else { $scope.showAddSecButton = false; }
                    for (var i = 0; i < $scope.OrgSecArray.length; i++) {
                        if ($scope.OrgSecArray[i].NAME == sele[0].NAME && $scope.OrgSecArray[i].DIVISION == sele[0].DIVISION) {
                            $scope.filteredSecs.push($scope.OrgSecArray[i]);
                        }
                    }
                }
                //for (var i = 0; i < $scope.allOrganizations.length; i++) {
                //    if ($scope.allOrganizations[i].NAME == sele[0].NAME && $scope.allOrganizations[i].DIVISION == sele[0].DIVISION) {
                //        $scope.filteredSecs.push($scope.allOrganizations[i]);
                //    };
                //};
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
                    $scope.OrgNameArray.push(response);
//                    $scope.allOrganizations.push(response);
                    $scope.selectedOrgName.value = "";//$scope.newOrg = {};
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
            var org = $scope.OrgNameArray.filter(function (o) { return o.ORGANIZATION_ID == $scope.selectedOrgName.value });// ($scope.allOrganizations).filter(function (o) { return o.ORGANIZATION_ID == $scope.newOrg.NAME }); //give me just this org
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
                    $scope.OrgDivArray.push(response);// $scope.allOrganizations.push(response);
                   // $scope.newOrg = {};
                    $scope.filterDivs();
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

            var org = $scope.OrgDivArray.filter(function (o) { return o.ORGANIZATION_ID == $scope.selectedOrgDiv.value });// ($scope.allOrganizations).filter(function (o) { return o.ORGANIZATION_ID == $scope.newOrg.DIVISION }); //give me just this org
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
                    $scope.OrgSecArray.push(response); // $scope.allOrganizations.push(response);
                    $scope.filterSecs();
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
    siGLControllers.controller('projectEditContactCtrl', ['$scope', '$http', '$filter', '$modal', 'orgService', 'Projects', 'Contact', 'projContacts', 'thisProject', 'allOrgList', 'Organization', 'getCreds', projectEditContactCtrl]);
    function projectEditContactCtrl($scope, $http, $filter, $modal, orgService, Projects, Contact, projContacts, thisProject, allOrgList, Organization,  getCreds) {
        $scope.ProjContacts = [];
        $scope.allOrganizations = allOrgList;
        var OrgArrays = orgService(allOrgList);
        $scope.OrgNameArray = OrgArrays.ONames;
        $scope.OrgDivArray = OrgArrays.ODivs;
        $scope.OrgSecArray = OrgArrays.OSecs;

        $scope.DivsUnfiltered = true;
        $scope.SecsUnfiltered = false;

        $scope.selectedOrgName = {};
        $scope.selectedOrgDiv = {};
        $scope.selectedOrgSec = {};

        //#region need org name,division,section in contact rather than ID
        for (var i = 0; i < projContacts.length; i++) {
            //for each projContact, get the matching org to use for name,div,sec
            var thisOrg = ($scope.allOrganizations).filter(function (o) { return o.ORGANIZATION_ID == projContacts[i].ORGANIZATION_ID });
            var eachProjCont = {};
            
            eachProjCont.CONTACT_ID = projContacts[i].CONTACT_ID;
            eachProjCont.NAME = projContacts[i].NAME;
            eachProjCont.EMAIL = projContacts[i].EMAIL;
            eachProjCont.PHONE = projContacts[i].PHONE;
            eachProjCont.ORG_ID = projContacts[i].ORGANIZATION_ID;
            eachProjCont.orgName = thisOrg[0].NAME;
            eachProjCont.divName = thisOrg[0].DIVISION;
            eachProjCont.secName = thisOrg[0].SECTION;
            eachProjCont.SCIENCE_BASE_ID = projContacts[i].SCIENCE_BASE_ID;

            $scope.ProjContacts.push(eachProjCont);
        }
        //#endregion need org name, division, section in contact rather than ID

        $scope.newContact = {};
        var thisProjID = thisProject.PROJECT_ID;      
        
        //#region POST Contact click

        //format the contact once it's been posted, so that it gets added up top with the org info instead of unique id
        function formatContactToAdd(newContact, orgID) {
            var formattedContact = {};
            var thisOrg = ($scope.allOrganizations).filter(function (o) { return o.ORGANIZATION_ID == orgID });
            formattedContact.CONTACT_ID = newContact[0].CONTACT_ID;
            formattedContact.NAME = newContact[0].NAME;
            formattedContact.EMAIL = newContact[0].EMAIL;
            formattedContact.PHONE = newContact[0].PHONE;
            formattedContact.ORG_ID = newContact[0].ORGANIZATION_ID;
            formattedContact.orgName = thisOrg[0].NAME;
            formattedContact.divName = thisOrg[0].DIVISION;
            formattedContact.secName = thisOrg[0].SECTION;
            formattedContact.SCIENCE_BASE_ID = newContact[0].SCIENCE_BASE_ID;
            return formattedContact;
        }

        $scope.AddContact = function (valid) {
            if (valid) {
                var newGuy = {};
                newGuy.NAME = $scope.newContact.NAME;
                newGuy.EMAIL = $scope.newContact.EMAIL;
                newGuy.PHONE = $scope.newContact.PHONE;
                //selectedOrgSec == null, "" , or undefined .. or have a value
                var orgID = $scope.selectedOrgSec.value != "" && $scope.selectedOrgSec.value != undefined && $scope.selectedOrgSec.value != null ? $scope.selectedOrgSec.value : $scope.selectedOrgDiv.value;
                orgID = orgID != undefined && orgID != "" && orgID != null ? orgID : $scope.selectedOrgName.value;
                newGuy.ORGANIZATION_ID = orgID;
                //add it
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                $http.defaults.headers.common['Accept'] = 'application/json';
                Projects.addProjContact({ id: thisProjID }, newGuy, function success(response) {
                    var contactJustPosted = response.filter(function (o) {return o.NAME == newGuy.NAME && o.EMAIL == newGuy.EMAIL && o.ORGANIZATION_ID == newGuy.ORGANIZATION_ID})
                    var formattedContact = formatContactToAdd(contactJustPosted, orgID);
                    $scope.ProjContacts.push(formattedContact);
                    $scope.contactCount.total = $scope.contactCount.total + 1;
                    $scope.newContact = {};
                    $scope.selectedOrgName.value = "";
                    $scope.selectedOrgDiv.value = "";
                    $scope.selectedOrgSec.value = "";
                    $scope.projectForm.Contact.$setPristine(true);
                    toastr.success("Contact Added");
                }, function error(errorResponse) {
                    toastr.error("Error: " + errorResponse.statusText);
                });
            }
        }
        //#endregion POST Contact click

        //#region DELETE Contact click

        //unformat the contact for post to remove remove orgName,divName,secName and swap ORG_ID with ORGANIZATION_ID
        function unformatContact(contact) {
            var CONTACT = {};
            CONTACT.CONTACT_ID = contact.CONTACT_ID;
            CONTACT.NAME = contact.NAME;
            CONTACT.EMAIL = contact.EMAIL;
            CONTACT.PHONE = contact.PHONE;
            CONTACT.ORGANIZATION_ID = contact.ORG_ID;
            CONTACT.SCIENCE_BASE_ID = contact.SCIENCE_BASE_ID;
            return CONTACT;
        }

        $scope.RemoveContact = function (con) {
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
                //put it back to a CONTACT
                var CONTACT = unformatContact(con);
                //DELETE it
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                $http.defaults.headers.common['Accept'] = 'application/json';
                $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';

                Projects.deleteProjContact({ id: thisProjID }, CONTACT, function success(response) {
                    $scope.ProjContacts.splice(index, 1);
                    $scope.contactCount.total = $scope.contactCount.total - 1;
                    toastr.success("Contact Removed");
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
        $scope.showDivComma = false; $scope.showSecComma = false;
        $scope.showOrgName = function (contact) {
            var selected =[];
            if (contact.orgName) {
                selected = $filter('filter')($scope.OrgNameArray, {  NAME : contact.orgName});
            }
            return selected.length ? selected[0].NAME: '';
        };  
        $scope.showDivName = function (contact) {
            var selected = [];
           
            if (contact.divName) {
                selected = $filter('filter')($scope.OrgDivArray, { DIVISION: contact.divName });                
                $scope.showDivComma = true;
            }
            else { $scope.showDivComma = false;}
            //push all divisions for this NAME 
            if ($scope.DivsUnfiltered) {
                //if this is called after filterDivs happens..and divs already populated. DONT WANT To clear it again
                $scope.filtEDITdivs =[]; 
                var aName = selected.length > 0 ? selected[0].NAME: contact.orgName;
                var divs = $filter('filter')($scope.OrgDivArray, { NAME: aName });
                for (var i = 0; i < divs.length; i++) {
                    $scope.filtEDITdivs.push(divs[i]);
                }
            }
            return selected.length ? selected[0].DIVISION: '';
        };
        $scope.showSecName = function (contact) {
            var selected = [];
            
            if (contact.secName) {
                selected = $filter('filter')($scope.OrgSecArray, { SECTION: contact.secName });
                $scope.showSecComma = true;
            } else { $scope.showSecComma = false;}
            //push all sections for this DIVISION
            if ($scope.SecsUnfiltered) {
            //if this is called after filterSecs happens..and sections already populated. DONT WANT To clear it again
                $scope.filtEDITSecs =[];
                var aName = selected.length > 0 ? selected[0].DIVISION: contact.divName;
                var secs = $filter('filter') ($scope.OrgSecArray, { DIVISION: aName });
                for (var i = 0; i < secs.length; i++) {
                    $scope.filtEDITSecs.push(secs[i]);
                }
            }
            return selected.length ? selected[0].SECTION: '';
        };

        $scope.saveContact = function (data, id) {
            var test;
            var retur = false;
            $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
            $http.defaults.headers.common['Accept'] = 'application/json';
            $http.defaults.headers.common['X-HTTP-Method-Override'] = 'PUT';

            //see if org was edited
            var orgID = $scope.newOrgSecID > 0 ? $scope.newOrgSecID : $scope.newOrgDivID; //if not section then was div changed?
            orgID = orgID > 0 ? orgID : $scope.newOrgNameID; //if not division, was name changed?
            orgID = orgID > 0 ? orgID : data.ORG_ID; //if not name then it wasn't edited.
            var CONTACT = {};
            CONTACT.NAME = data.NAME;
            CONTACT.ORGANIZATION_ID = orgID;
            CONTACT.EMAIL = data.EMAIL;
            CONTACT.PHONE = data.PHONE;
            CONTACT.SCIENCE_BASE_ID = data.SCIENCE_BASE_ID;

            Contact.save({ id: id }, CONTACT, function success(response) {
                var thisOrg = ($scope.allOrganizations).filter(function (o) { return o.ORGANIZATION_ID == response.ORGANIZATION_ID });
                var projCont = {}; //format it back so can be displayed correctly
                projCont.CONTACT_ID = response.CONTACT_ID;
                projCont.NAME = response.NAME;
                projCont.EMAIL = response.EMAIL;
                projCont.PHONE = response.PHONE;
                projCont.ORG_ID = response.ORGANIZATION_ID;
                projCont.orgName = thisOrg[0].NAME;
                projCont.divName = thisOrg[0].DIVISION;
                projCont.secName = thisOrg[0].SECTION;
                projCont.SCIENCE_BASE_ID = response.SCIENCE_BASE_ID;
                retur = projCont;
                
                
                toastr.success("Contact Updated");
            }, function error(errorResponse) {
                retur = false;
                toastr.error("Error: " + errorResponse.statusText);
            });
            delete $http.defaults.headers.common['X-HTTP-Method-Override'];
            //clear my updated ids
            $scope.newOrgNameID = 0;
            $scope.newOrgDivID = 0;
            $scope.newOrgSecID = 0;
            return retur;
        };


        //#endregion Edit existing Data

        //#region Filter Divisions / Sections based on select change (for Contact Orgs on bottom and Edit of existing contacts on top
        //org was chosen, get the divisions
        $scope.newOrgNameID = 0;
        $scope.newOrgDivID = 0;
        $scope.newOrgSecID = 0;
        $scope.filterDivs = function (d) {
            if ($scope.selectedOrgName.value != undefined) {
                $scope.showAddSecButton = false;
                $scope.filteredDivs = [];
                $scope.filteredSecs = [];
                var orgID = $scope.selectedOrgName.value; //ORG_ID
                var org = ($scope.OrgNameArray).filter(function (o) { return o.ORGANIZATION_ID == orgID });
                var sele = ($scope.OrgDivArray).filter(function (o) { return o.NAME == org[0].NAME }); //give me just this org
                if (sele.length > 0) {
                    for (var i = 0; i < $scope.OrgDivArray.length; i++) {
                        if ($scope.OrgDivArray[i].NAME == sele[0].NAME) {
                            $scope.filteredDivs.push($scope.OrgDivArray[i]);
                        }
                    }
                }
            } else if (d != undefined) {
                //this is filtering the xeditable org divisions up top                
                //$scope.showAddSecButton = false;
                $scope.filtEDITdivs =[];
                $scope.divName = '';
                $scope.filtEDITSecs =[];
                $scope.secName = '';
                
                var orgNAME = d; //NAME
                var sele = $scope.OrgNameArray.filter(function (o) { return o.NAME == orgNAME }); //give me just this org
                $scope.newOrgNameID = sele[0].ORGANIZATION_ID;
                $scope.DivsUnfiltered = false;
                for (var i = 0; i < $scope.OrgDivArray.length; i++) {
                    if ($scope.OrgDivArray[i].NAME == sele[0].NAME) {
                        $scope.filtEDITdivs.push($scope.OrgDivArray[i]);
                    }
                }
            } else {
                // both are undefined..orgName was cleared
                $scope.projectForm.Contact.$setPristine(true);
                $scope.filteredDivs = [];
                $scope.selectedOrgDiv.value = "";
                $scope.filteredSecs = [];
                $scope.selectedOrgSec.value = "";
            }            
        };

        //division was chosen, get the sections
        $scope.filterSecs = function (d) {
            $scope.filteredSecs = [];
            if ($scope.selectedOrgDiv.value != undefined) {                
                var orgID = $scope.selectedOrgDiv.value; //ORGID
                var org = ($scope.OrgDivArray).filter(function (o) { return o.ORGANIZATION_ID == orgID });
                var sele = ($scope.OrgSecArray).filter(function (o) { return o.DIVISION == org[0].DIVISION }); //give me just this org
                //$scope.showAddSecButton = sele[0].DIVISION != null ? true : false;
                if (sele.length > 0) {
                    //now populate the section dropdown that are of this division
                    for (var i = 0; i < $scope.OrgSecArray.length; i++) {
                        if ($scope.OrgSecArray[i].NAME == sele[0].NAME && $scope.OrgSecArray[i].DIVISION == sele[0].DIVISION) {
                            $scope.filteredSecs.push($scope.OrgSecArray[i]);
                        }
                    }
                }
            } else if (d != undefined) {
                //this is filtering the xeditable org section up top
                $scope.filtEDITSecs = [];
                $scope.secName = '';
                var divName = d; //DIVISION
                var sele = ($scope.OrgDivArray).filter(function (o) { return o.DIVISION == divName }); //give me just this org
                $scope.newOrgDivID = sele[0].ORGANIZATION_ID;
                $scope.SecsUnfiltered = false;
               // $scope.showAddSecButton = sele[0].DIVISION != null ? true: false;

                //now populate the section dropdown that are of this division
                for (var i = 0; i < $scope.OrgSecArray.length; i++) {
                if ($scope.OrgSecArray[i].NAME == sele[0].NAME && $scope.OrgSecArray[i].DIVISION == sele[0].DIVISION) {
                        $scope.filtEDITSecs.push($scope.OrgSecArray[i]);
                        }
                }
            }
        };
        //section was chosen in edit area up top
        $scope.secChosen = function (d) {
            var sele = ($scope.OrgSecArray).filter(function (o) {
                return o.SECTION == d
            }); //give me just this org
            $scope.newOrgSecID = sele[0].ORGANIZATION_ID;

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
                    $scope.newContact.OrgName = '';
                    $scope.filteredDivs = [];
                    $scope.filteredSecs = [];
                    //$scope.showAddSecButton = false;
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

            var org = ($scope.allOrganizations).filter(function (o) { return o.ORGANIZATION_ID == $scope.selectedOrgName.value }); //give me just this org
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
                    $scope.filterDivs();
                    $scope.filteredSecs = [];
                    //$scope.showAddSecButton = false;
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

            var org = ($scope.allOrganizations).filter(function (o) { return o.ORGANIZATION_ID == $scope.selectedOrgDiv.value }); //give me just this org
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
                $http.defaults.headers.common['Accept'] = 'application/json';
                //POST it                            
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                Organization.save(newOrgToSend, function success(response) {
                    $scope.allOrganizations.push(response);
                    $scope.filterSecs();
                    toastr.success("Organization Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
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

    //projectEditPubCtrl
    siGLControllers.controller('projectEditPubCtrl', ['$scope', '$http', '$modal', 'Projects', 'thisProject', 'Publication', 'projPubs', 'getCreds', projectEditPubCtrl]);
    function projectEditPubCtrl($scope, $http, $modal, Projects, thisProject, Publication, projPubs, getCreds) {
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
            //modal
            var modalInstance = $modal.open({
            templateUrl: 'removemodal.html',
                controller : 'ConfirmModalCtrl',
                size: 'sm',
                resolve : {
                    keyToRemove: function () {
                        return pub;
                    },
                    what: function() {
                        return "Publication";
                    }
                }
            });
            modalInstance.result.then(function (keyToRemove) {
                //yes, remove this keyword
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
                delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                }, function () {
                    //logic for cancel
            });
            //end modal
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

    //projectEditSiteInfoCtrl ( CREATE / EDIT page)    
    siGLControllers.controller('projectEditSiteInfoCtrl', ['$scope', '$location', '$http', '$modal', '$state', 'checkCreds', 'getCreds',
        'Projects', 'thisProject', 'thisSite', 'Site', 'projSites', 'siteFrequencies', 'siteMedium', 'siteParameters', 'siteResources',
        'CountryList', 'lakeList', 'stateList', 'siteStatList', 'resourceList', 'mediaList', 'frequencyList', 'parameterList', projectEditSiteInfoCtrl]);
    function projectEditSiteInfoCtrl($scope, $location, $http, $modal, $state, checkCreds, getCreds,
        Projects, thisProject, thisSite, Site, projSites, siteFrequencies, siteMedium, siteParameters, siteResources,
        CountryList, lakeList, stateList, siteStatList, resourceList, mediaList, frequencyList, parameterList) {
        if (!checkCreds()) {
            //not creds, go log in        
            $location.path('/login');
        } else {
            $scope.thisSite = {}; //holder for project (either coming in for edit, or being created on POST )
            $scope.Frequencymodel = {}; //holder for new siteFrequencies if they make any change to multiselect
            $scope.Mediamodel = {}; //holder for new siteMedia if they make any change to multiselect
           // $scope.Parametermodel = {}; //holder for new siteParameters if they make any change to multiselect
            $scope.Resourcemodel = {}; //holder for new siteResource if they make any change to multiselect
            $scope.FrequenciesToAdd = []; //holder for create Site page and user adds Frequency Types
            $scope.MediaToAdd = []; //holder for create Site page and user adds Media Types
            $scope.ParameterToAdd = []; //holder for create Site page and user adds Parameters Types
            $scope.ResourceToAdd = []; //holder for create Site page and user adds Resources Types
            $scope.isSiteDescChanged = {}; //trigger to show/hide save button for description change
            $scope.isSiteAddInfoChanged = {}; //trigger to show/hide save button for additional info change
            $scope.showParams = false;// div containing all parameters (toggles show/hide)
            $scope.showHide = "Show"; //button text for show/hide parameters

            //all the dropdowns
            $scope.allCountries = CountryList;
            $scope.allStates = stateList;
            $scope.allLakes = lakeList;
            $scope.allStats = siteStatList;
            $scope.allResources = resourceList;
            $scope.allParametes = parameterList;

            
            //are we in edit or create?
            if (thisSite != undefined) {
                //edit view

                //1. this site
                $scope.thisSite = thisSite;
                $scope.title = "Site: " + $scope.thisSite.NAME;

                //convert the multiSelects for isteven (add new property for checked flag
                //#region siteFrequencies
                var siteFreqs = siteFrequencies;
                var allFrequencies = frequencyList;
                //go through allFrequencies and add selected property
                for (var i = 0; i < allFrequencies.length; i++) {
                    //for each one, if siteFreqs has this id, add 'selected:true' else add 'selected:false'
                    for (var y = 0; y < siteFreqs.length; y++) {
                        if (siteFreqs[y].FREQUENCY_TYPE_ID == allFrequencies[i].FREQUENCY_TYPE_ID) {
                            allFrequencies[i].selected = true;
                            y = siteFreqs.length;
                        }
                        else {
                            allFrequencies[i].selected = false;
                        }
                    }
                    if (siteFreqs.length == 0) {
                        allFrequencies[i].selected = false;
                    }
                }
                $scope.Frequencydata = allFrequencies;
                //#endregion siteFrequencies

                //#region siteMedia
                var siteMeds = siteMedium;
                var allMeds = mediaList;
                //go through allMeds and add selected property
                for (var i = 0; i < allMeds.length; i++) {
                    //for each one, if siteMeds has this id, add 'selected:true' else add 'selected:false'
                    for (var y = 0; y < siteMeds.length; y++) {
                        if (siteMeds[y].MEDIA_TYPE_ID == allMeds[i].MEDIA_TYPE_ID) {
                            allMeds[i].selected = true;
                            y = siteMeds.length;
                        }
                        else {
                            allMeds[i].selected = false;
                        }
                    }
                    if (siteMeds.length == 0) {
                        allMeds[i].selected = false;
                    }
                }
                $scope.Mediadata = allMeds;
                //#endregion siteMedia

                //#region siteParameters
                var siteParams = siteParameters;
                var allParams = parameterList;
                //go through siteParams and add selected property
                for (var i = 0; i < allParams.length; i++) {
                    //for each one, if siteParams has this id, add 'selected:true' else add 'selected:false'
                    for (var y = 0; y < siteParams.length; y++) {
                        if (siteParams[y].PARAMETER_TYPE_ID == allParams[i].PARAMETER_TYPE_ID) {
                            allParams[i].selected = true;
                            y = siteParams.length;
                        }
                        else {
                            allParams[i].selected = false;
                        }
                    }
                    if (siteParams.length == 0) {
                        allParams[i].selected = false;
                    }
                }
                $scope.physParams = []; $scope.bioParams = []; $scope.chemParams = []; $scope.microBioParams = []; $scope.toxiParams = [];
                $scope.physParams.push(allParams.filter(function (p) { return p.PARAMETER_GROUP == "Physical" }));
                $scope.bioParams.push(allParams.filter(function (p) { return p.PARAMETER_GROUP == "Biological" }));
                $scope.chemParams.push(allParams.filter(function (p) { return p.PARAMETER_GROUP == "Chemical" }));
                $scope.microBioParams.push(allParams.filter(function (p) { return p.PARAMETER_GROUP == "Microbiological" }));
                $scope.toxiParams.push(allParams.filter(function (p) { return p.PARAMETER_GROUP == "Toxicological" }));


                //$scope.Parameterdata = allParams;

                //#endregion siteParameters

                //#region siteResources
                var siteRes = siteResources;
                var allRes = resourceList;
                //go through allRes and add selected property
                for (var i = 0; i < allRes.length; i++) {
                    //for each one, if siteRes has this id, add 'selected:true' else add 'selected:false'
                    for (var y = 0; y < siteRes.length; y++) {
                        if (siteRes[y].RESOURCE_TYPE_ID == allRes[i].RESOURCE_TYPE_ID) {
                            allRes[i].selected = true;
                            y = siteRes.length;
                        }
                        else {
                            allRes[i].selected = false;
                        }
                    }
                    if (siteRes.length == 0) {
                        allRes[i].selected = false;
                    }
                }
                $scope.Resourcedata = allRes;
                //#endregion siteResources


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
                for (var a = frequencyList.length; a--;) {
                    frequencyList[a].selected = false;
                };
                $scope.Frequencydata = frequencyList;
                //media
                for (var a = mediaList.length; a--;) {
                    mediaList[a].selected = false;
                };
                $scope.Mediadata = mediaList;
                //parameters
                for (var a = parameterList.length; a--;) {
                    parameterList[a].selected = false;
                };
                $scope.physParams = []; $scope.bioParams = []; $scope.chemParams = []; $scope.microBioParams = []; $scope.toxiParams = [];
                $scope.physParams.push(parameterList.filter(function (p) { return p.PARAMETER_GROUP == "Physical" }));
                $scope.bioParams.push(parameterList.filter(function (p) { return p.PARAMETER_GROUP == "Biological" }));
                $scope.chemParams.push(parameterList.filter(function (p) { return p.PARAMETER_GROUP == "Chemical" }));
                $scope.microBioParams.push(parameterList.filter(function (p) { return p.PARAMETER_GROUP == "Microbiological" }));
                $scope.toxiParams.push(parameterList.filter(function (p) { return p.PARAMETER_GROUP == "Toxicological" }));
               // $scope.Parameterdata = parameterList;
                //resources
                for (var a = resourceList.length; a--;) {
                    resourceList[a].selected = false;
                };
                $scope.Resourcedata = resourceList;
                //#endregion add selected property to all multiselects (need to set these if new site)

            }// thisSite == undefined

            //#region a FREQUENCY was clicked - if added POST, if removed DELETE - for edit view or store for create view
            $scope.FreqClick = function (data) {
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                $http.defaults.headers.common['Accept'] = 'application/json';

                if ($scope.thisSite.SITE_ID != undefined) {
                    //this is an edit page and there is a site
                    if (data.selected == true) {
                        //post it
                        delete data['selected']; //need to remove the selected property first
                        Site.addSiteFrequency({ id: $scope.thisSite.SITE_ID }, data,
                            function success(response) {
                                toastr.success("Site Frequency added");
                            },
                            function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }
                        );
                    } else {
                        //delete it
                        delete data['selected']; // remove the selected flag first
                        $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';
                        Site.deleteSiteFrequency({ id: $scope.thisSite.SITE_ID }, data,
                            function success(response) {
                                toastr.success("Site Frequency removed");
                            },
                            function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }
                        );
                    }
                } else {
                    //this is a create Site and need to store this to handle after site is POSTed
                    if (data.selected == true) {
                        delete data['selected'];
                        //only care if true since this is a new site and nothing to delete
                        $scope.FrequenciesToAdd.push(data);
                    }
                }
            }//end FreqClick
            //#endregion a FREQUENCY was clicked - if added POST, if removed DELETE - for edit view or store for create view

            //#region a MEDIA was clicked - if added POST, if removed DELETE - for edit view or store for create view
            $scope.MedClick = function (data) {
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                $http.defaults.headers.common['Accept'] = 'application/json';

                if ($scope.thisSite.SITE_ID != undefined) {
                    //this is an edit page and there is a site
                    if (data.selected == true) {
                        //post it
                        delete data['selected']; //need to remove the selected property first
                        Site.addSiteMedia({ id: $scope.thisSite.SITE_ID }, data,
                            function success(response) {
                                toastr.success("Site Media added");
                            },
                            function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }
                        );
                    } else {
                        //delete it
                        delete data['selected']; // remove the selected flag first
                        $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';
                        Site.deleteSiteMedia({ id: $scope.thisSite.SITE_ID }, data,
                            function success(response) {
                                toastr.success("Site Media removed");
                            },
                            function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }
                        );
                    }
                } else {
                    //this is a create Site and need to store this to handle after site is POSTed
                    if (data.selected == true) {
                        delete data['selected'];
                        //only care if true since this is a new site and nothing to delete
                        $scope.MediaToAdd.push(data);
                    }
                }
            }//end MedClick
            //#endregion a MEDIA was clicked - if added POST, if removed DELETE - for edit view or store for create view

            //#region a PARAMETER was clicked - if added POST, if removed DELETE - for edit view or store for create view
            $scope.ParamClick = function (data) {
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                $http.defaults.headers.common['Accept'] = 'application/json';
                var Param = {};
                Param.PARAMETER_TYPE_ID = data.PARAMETER_TYPE_ID;
                Param.PARAMETER = data.PARAMETER;
                Param.PARAMETER_GROUP = data.PARAMETER_GROUP;

                if ($scope.thisSite.SITE_ID != undefined) {
                    //this is an edit page and there is a site    
                    if (data.selected == true) {
                        //POST                       
                        //delete Param['selected'];//need to remove the selected property first
                        Site.addSiteParameter({ id: $scope.thisSite.SITE_ID }, Param,
                            function success(response) {
                                toastr.success("Site Parameter added");
                            },
                            function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }
                        );
                    } else if (data.selected == false) {
                        //DELETE
                        //delete Param['selected']; // remove the selected flag first
                        $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';
                        Site.deleteSiteParameter({ id: $scope.thisSite.SITE_ID }, Param,
                            function success(response) {
                                toastr.success("Site Parameter removed");
                            },
                            function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }
                        );
                        delete $http.defaults.headers.common['X-HTTP-Method-Override']
                    }
                } else {
                    //this is a create Site and need to store this to handle after site is POSTed
                    if (data.selected == true) {
                        //delete Param['selected'];
                        //only care if true since this is a new site and nothing to delete
                        $scope.ParameterToAdd.push(Param);
                    }
                }
            }//end ParamClick
            //#endregion a PARAMETER was clicked - if added POST, if removed DELETE - for edit view or store for create view

            //#region a RESOURCE was clicked - if added POST, if removed DELETE - for edit view or store for create view
            $scope.ResClick = function (data) {
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                $http.defaults.headers.common['Accept'] = 'application/json';

                if ($scope.thisSite.SITE_ID != undefined) {
                    //this is an edit page and there is a site
                    if (data.selected == true) {
                        //post it
                        delete data['selected']; //need to remove the selected property first
                        Site.addSiteResource({ id: $scope.thisSite.SITE_ID }, data,
                            function success(response) {
                                toastr.success("Site Resource added");
                            },
                            function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }
                        );
                    } else {
                        //delete it
                        delete data['selected']; // remove the selected flag first
                        $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';
                        Site.deleteSiteResource({ id: $scope.thisSite.SITE_ID }, data,
                            function success(response) {
                                toastr.success("Site Resource removed");
                            },
                            function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }
                        );
                    }
                } else {
                    //this is a create Site and need to store this to handle after site is POSTed
                    if (data.selected == true) {
                        delete data['selected'];
                        //only care if true since this is a new site and nothing to delete
                        $scope.ResourceToAdd.push(data);
                    }
                }
            }//end ResClick
            //#endregion a RESOURCE was clicked - if added POST, if removed DELETE - for edit view or store for create view

            
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
            //change to the thisSite made, put it .. fired on each blur after change made to field
            $scope.SaveOnBlur = function (valid, da) {
                if (valid) {
                    if ($scope.thisSite.SITE_ID != undefined) {
                        //ensure they don't delete required field values
                        if (($scope.thisSite.LATITUDE > 0 && $scope.thisSite.LATITUDE < 73.0) && ($scope.thisSite.LONGITUDE > -175 && $scope.thisSite.LONGITUDE < -60)){
                            $http.defaults.headers.common['Authorization']= 'Basic ' +getCreds();
                            $http.defaults.headers.common['Accept']= 'application/json';
                            $http.defaults.headers.common['X-HTTP-Method-Override']= 'PUT';
                            Site.save({
                                id: $scope.thisSite.SITE_ID
                                }, $scope.thisSite, function success(response) {
                                toastr.success("Site Updated");
                                $scope.isSiteDescChanged.bool = false;
                                $scope.isSiteAddInfoChanged.bool = false;
                                }, function error(errorResponse) {
                                    toastr.error("Error: " +errorResponse.statusText);
                                    });
                            delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                        }
                        else if ($scope.thisSite.LATITUDE < 0 || $scope.thisSite.LATITUDE > 73) {
                            alert("The Latitude must be between 0 and 73.0");
                        }
                        else if ($scope.thisSite.LONGITUDE < -175 || $scope.thisSite.LONGITUDE > -60) {
                            alert("The Longitude must be between -175.0 and -60.0");
                        }
                    }
                }
        }//end SaveOnBlur

            //save NEW SITE and then frequencies, media, parameters, and resources
            $scope.save = function (valid) {
                //check if they filled in all required fields
                if (valid && ($scope.thisSite.LATITUDE > 0 && $scope.thisSite.LATITUDE < 73.0) && ($scope.thisSite.LONGITUDE > -175 && $scope.thisSite.LONGITUDE < -60)) {
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                    $http.defaults.headers.common['Accept'] = 'application/json';
                    $scope.thisSite.PROJECT_ID = thisProject.PROJECT_ID;
                    var siteID;
                    Site.save({}, $scope.thisSite, function success(response) {
                        toastr.success("Site Created");
                        siteID = response.SITE_ID;
                        projSites.push(response);
                        $scope.sitesCount.total = $scope.sitesCount.total +1;
                        //post frequencies added
                        for (var o = $scope.FrequenciesToAdd.length; o--;) {
                            Site.addSiteFrequency({ id: siteID }, $scope.FrequenciesToAdd[o],
                                function success(response) {
                                    toastr.success("Site Frequency added");
                                },
                                function error(errorResponse) {
                                    toastr.error("Error: " + errorResponse.statusText);
                                }
                            );
                        };
                        //post media
                        for (var k = $scope.MediaToAdd.length; k--;) {
                            Site.addSiteMedia({ id: siteID }, $scope.MediaToAdd[k],
                                function success(response) {
                                    toastr.success("Site Media Added");
                                },
                                function error(errorResponse) {
                                    toastr.error("Error: " + errorResponse.statusText);
                                }
                            );
                        };
                        //post parameters
                        for (var k = $scope.ParameterToAdd.length; k--;) {
                            Site.addSiteParameter({ id: siteID }, $scope.ParameterToAdd[k],
                                function success(response) {
                                    toastr.success("Site Parameter Added");
                                },
                                function error(errorResponse) {
                                    toastr.error("Error: " + errorResponse.statusText);
                                }
                            );
                        };
                        //post resources
                        for (var k = $scope.ResourceToAdd.length; k--;) {
                            Site.addSiteResource({ id: siteID }, $scope.ResourceToAdd[k],
                                function success(response) {
                                    toastr.success("Site Resource Added");
                                },
                                function error(errorResponse) {
                                    toastr.error("Error: " + errorResponse.statusText);
                                }
                            );
                        };
                    }, function error(errorResponse) {
                        toastr.success("Error: " + errorResponse.statusText);
                    }).$promise.then(function () {
                        $location.path('/project/edit/' + thisProject.PROJECT_ID + '/site/siteList').replace();//.notify(false);
                        $scope.apply;
                    });
                }
                if ($scope.thisSite.LATITUDE < 0 || $scope.thisSite.LATITUDE > 73.0) {
                    alert("The Latitude must be between 0 and 73.0");
                }
                if ($scope.thisSite.LONGITUDE < -175 || $scope.thisSite.LONGITUDE > -60) {
                    alert("The Longitude must be between -175.0 and -60.0");
                }
            }//end save

            //$scope.cancel = function () {
            //    //navigate to a different state
            //    $state.go('projectEdit.site.siteList');
            //};

        }//end CheckCreds() passed
    }//end projectEditSiteInfoCtrl

    //popup confirm box
    siGLControllers.controller('ConfirmModalCtrl', ['$scope', '$modalInstance', 'keyToRemove', 'what', ConfirmModalCtrl]);
    function ConfirmModalCtrl ($scope, $modalInstance, keyToRemove, what) {
        if (keyToRemove['TERM'] != undefined)
        {
            //keyword
            $scope.keyToRmv = keyToRemove.TERM;
        }
        else if (keyToRemove['ORGANIZATION_ID'] != undefined)
        {
            //Organization
            $scope.keyToRmv = keyToRemove.NAME;
        }
        else if (keyToRemove['DATA_HOST_ID'] != undefined)
        {
            //data host
            var stringToUse = keyToRemove.DESCRIPTION != null ? keyToRemove.DESCRIPTION : keyToRemove.HOST_NAME;
            stringToUse = stringToUse != null ? stringToUse : keyToRemove.PORTAL_URL;
            $scope.keyToRmv = stringToUse;
        }
        else if (keyToRemove['CONTACT_ID'] != undefined) {
            //Contact
            $scope.keyToRmv = keyToRemove.NAME;
        }
        else if (keyToRemove['PUBLICATION_ID'] != undefined)
        {
            //Publication
            var stringToUse = keyToRemove.TITLE != null ? keyToRemove.TITLE : keyToRemove.DESCRIPTION;
            stringToUse = stringToUse != null ? stringToUse : keyToRemove.URL;
            $scope.keyToRmv = stringToUse;
        }
        else
        {
            //url
            $scope.keyToRmv = keyToRemove;
        }

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

    //login 'setLoggedIn',
    siGLControllers.controller('LoginCtrl', ['$scope', '$state', '$http', '$rootScope', 'Login', 'setCreds', LoginCtrl]);
    function LoginCtrl($scope, $state, $http, $rootScope, Login, setCreds) {

        //#region CAP lock Check
        $('[type=password]').keypress(function (e) {
            var $password = $(this),
                tooltipVisible = $('.tooltip').is(':visible'),
                s = String.fromCharCode(e.which);
            
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
        //#endregion CAP lock Check
         $scope.submit = function () {
            //$scope.sub = true;
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
                        //setLoggedIn.changeLoggedIn(true);
                        $rootScope.isAuth.val = true;
                        $rootScope.usersName = usersNAME;
                        $state.go('projectList');
                    }
                    else {
                        $scope.error = "Login Failed";
                    }
                },
                function error(errorResponse) {
                    alert("Error: " + errorResponse.statusText);
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
   
    //service to get 3 arrays from the org table
    siGLControllers.factory('orgService', [orgService]);
    function orgService() {
        return function (orgs) {
            //do something with the input 
            var OrgArrays = {};
            //unique DIVS
            var sorter = function (a, b) {
                if (a > b) return +1;
                if (a < b) return -1;
                return 0;
            }

            orgs.sort(function (a, b) {
                return sorter(a.NAME.toUpperCase(), b.NAME.toUpperCase());
            });
            //unique NAMES
            OrgArrays.ONames = [];
            OrgArrays.ONames.push(orgs[0]);
            for (var x = 1; x < orgs.length; x++) {
                if (orgs[x - 1].NAME.toUpperCase() !== orgs[x].NAME.toUpperCase()) {
                    OrgArrays.ONames.push(orgs[x]);
                }
            }
            //unique DIVS
            //remove all those that have div = null
            var divOrgs = orgs.filter(function (el) { return el.DIVISION !== null; })

            divOrgs.sort(function (a, b) {
                return sorter(a.NAME.toUpperCase(), b.NAME.toUpperCase()) || sorter(a.DIVISION.toUpperCase(), b.DIVISION.toUpperCase())
            })
            OrgArrays.ODivs = [];
            OrgArrays.ODivs.push(divOrgs[0]);
            for (var x = 1; x < divOrgs.length; x++) {
                if (divOrgs[x - 1].DIVISION !== divOrgs[x].DIVISION) {
                    OrgArrays.ODivs.push(divOrgs[x]);
                }
            }
            //unique SECS
            //remove all those that have Sec = null
            var secOrgs = divOrgs.filter(function (el) { return el.SECTION !== null; })

            secOrgs.sort(function (a, b) {
                return sorter(a.DIVISION.toUpperCase(), b.DIVISION.toUpperCase()) || sorter(a.SECTION.toUpperCase(), b.SECTION.toUpperCase())
            })
            OrgArrays.OSecs = [];
            OrgArrays.OSecs.push(secOrgs[0]);
            for (var x = 1; x < secOrgs.length; x++) {
                if (secOrgs[x - 1].SECTION !== secOrgs[x].SECTION) {
                    OrgArrays.OSecs.push(secOrgs[x]);
                }
            }
            return OrgArrays;
        }
    };

})();