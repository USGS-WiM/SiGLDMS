(function () {
    /* controllers.js*/
    'use strict';

    var siGLControllers = angular.module('siGLControllers', []);

    siGLControllers.directive('ngConfirmClick', [
            function () {
                return {
                    link: function (scope, element, attr) {
                        var msg = attr.ngConfirmClick || "Are you sure?";
                        var clickAction = attr.confirmedClick;
                        element.bind('click', function (event) {
                            if (window.confirm(msg)) {
                                scope.$apply(clickAction)
                            }
                        });
                    }
                };
            }]);


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
        }
        //array of projects    
        $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
        Projects.getDMProjects(function success (data) {
            $scope.projects = data;
            }, function error(errorResponse) {
                toastr.error("Error: " + errorResponse.statusText);
            }
        );
        $scope.User = getUsersNAME();
        //setProjectLookups();
    }
    //end projectListCtrl

    //projectDetailsCtrl
    siGLControllers.controller('ProjectDetailCtrl', ['$scope', 'thisPproject', 'Projects', '$state', ProjectDetailCtrl]);
    function ProjectDetailCtrl($scope, thisProject, Projects, $state) {
        $scope.Title = "Project Detail: " + thisProject.NAME;

        //Required Model properties: 
        //1. aProject, 2. ProjDurationName, 3. ProjStatusName, 4. ProjObjectives, 5. ProjKeywords, 6. parsed URLs 

        //1. aProject
        $scope.aProject = thisProject;
        //2. ProjDurationName
        Projects.getProjDuration({ id: thisProject.PROJECT_ID },
            function success(response) {
                $scope.projDurationName = response.DURATION_VALUE;
            },
            function error(errorResponse) {
                $scope.projDurationName = errorResponse;
            }
        );
        //3. ProjStatusName
        Projects.getProjStatus({ id: thisProject.PROJECT_ID },
            function success(response) {
                $scope.projStatusName = response.STATUS_VALUE;
            },
            function error(errorResponse) {
                $scope.projStatusName = errorResponse;
            }
        );
        //4. ProjObjectives
        Projects.getProjObjectives({ id: thisProject.PROJECT_ID },
            function success(response) {
                $scope.ProjectObjectives = response;
            },
            function error(errorResponse) {
                $scope.ProjectObjectives = errorResponse;
            }
        );
        //5. ProjKeywords
        Projects.getProjKeywords({ id: thisProject.PROJECT_ID },
            function success(response) {
                $scope.ProjectKeywords = response;
            },
            function error(errorResponse) {
                $scope.ProjectKeywords = errorResponse;
            }
        );
        //6. parsed URLs by '|'
        $scope.urls = [];
        if ($scope.aProject.URL) {
            if (($scope.aProject.URL).indexOf('|') > -1) {
                $scope.urls = ($scope.aProject.URL).split("|");
            } else {
                $scope.urls[0] = $scope.aProject.URL;
            }
        }

        //back button
        $scope.cancel = function () {
            //navigate to a different state
            $state.go('projectList');
        }
    }
    //end projectDetailsCtrl

    //ProjectEditCtrl
    siGLControllers.controller('projectEditCtrl',
        ['$scope', '$location', '$state', '$http', 'checkCreds', 'getCreds',
            'thisProject', 'projOrgs', 'projDatum', 'projContacts', 'projPubs', 'projSites', 'projObjectives', 'projKeywords',
            'Projects', 'allDurationList', 'allStatsList', 'allObjList', projectEditCtrl
        ]);
    function projectEditCtrl($scope, $location, $state, $http, checkCreds, getCreds,
        thisProject, projOrgs, projDatum, projContacts, projPubs, projSites, projObjectives, projKeywords,
        Projects, allDurationList, allStatsList, allObjList) {
        //model needed for ProjectEdit Info tab: ( Counts for Cooperators, Datum, Contacts, Publications and Sites) 1. thisProject, 2. parsed urls, 3. project Keywords, 4. all objectives, 5. all statuses, 6. all durations 
      
        if (!checkCreds()) {
            //not creds, go log in        
            $location.path('/login');
        } else {
            //TODO:check that this project belongs to them if they are not admin
            $scope.aProject = {}; //holder for project (either coming in for edit, or being created on POST )
            $scope.Objectivesmodel = {}; //holder for new ProjObjs if they make any to multiselect
            $scope.urls = []; //holder for urls for future parsing back together ( | separated string)
            $scope.undetermined = false; //ng-disabled on end date boolean..set to true if status = end date undefined
            $scope.ObjectivesToAdd = []; //holder for create Project page and user adds Objective Types
            $scope.ProjectKeywords = []; //add projKeywords if edit page, instantiate for create page to allow keys to be added
            $scope.KeywordsToAdd = []; //holder for create Project page and user adds Keywords
            
            
            if (thisProject != undefined) {
                //this is an edit view
                $scope.coopCount = projOrgs.length;
                $scope.datumCount = projDatum.length;
                $scope.contactCount = projContacts.length;
                $scope.pubCount = projPubs.length;
                $scope.sitesCount = projSites.length;

                //1. aProject
                $scope.aProject = thisProject;
                $scope.title = "Edit: " + $scope.aProject.NAME;

                //check status for disabling of end date
                if ($scope.aProject.PROJ_STATUS_ID == 1) {
                    $scope.undetermined = true;
                };

                //2. parsed URLs by '|'
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

                //4. all objectives (with new selected property)
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

            //5. all project statuses 
            $scope.StatusList = allStatsList;
       
            //6. all durations
            $scope.DurationList = allDurationList;
        
            //an OBJECTIVE_TYPE was clicked - if added POST, if removed DELETE - for edit view : store for create view
            $scope.fClick = function (data) {
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

            $scope.newURL = {}; //model binding to return url to ADD/REMOVE functions                

            //#region ADD/REMOVE URLS
            $scope.addProjURL = function () {
                if ($scope.newURL.value != undefined) {
                    $scope.urls.push($scope.newURL.value);
                    $scope.newURL = {};
                } else {
                    alert("Please type a URL in first.");
                }
            }
            //remove url click (passed confirm)
            $scope.removeUrl = function (key) {
                var index = $scope.urls.indexOf(key);
                $scope.urls.splice(index, 1);
            }
            //#endregion ADD/REMOVE URLS

            $scope.newKey = {}; //model binding to return keys to ADD/REMOVE functions
            var globalKeyHolder;
            //#region ADD/REMOVE KEYWORDS
            //add keyword click
            $scope.addThisKeyword = function () {
                if ($scope.newKey.value != undefined) {
                    var newKEY = { TERM: $scope.newKey.value };
                    globalKeyHolder = $scope.newKey.value;
                    if ($scope.aProject.PROJECT_ID != undefined) {
                        //this is an edit, go ahead and post
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
            $scope.removeKey = function(key){
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
                        toastr.error("Something went wrong: " + errorResponse.statusText);
                    });
                } else {
                    //just remove it from the list (this is a create page)
                    $scope.ProjectKeywords.splice(index, 1);
                }
                
            }
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

            //#region SAVE this project info
            $scope.save = function () {
                //if this is an edit, need to do PUT
                $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
                $http.defaults.headers.common['Accept'] = 'application/json';
                $scope.aProject.URL = ($scope.urls).join('|');

                if ($scope.aProject.PROJECT_ID != undefined) {
                    //#region PUT
                    $http.defaults.headers.common['X-HTTP-Method-Override'] = 'PUT';
                    Projects.save({id:$scope.aProject.PROJECT_ID}, $scope.aProject, function success(response) {
                        toastr.success("Project Updated");
                    }, function error(errorResponse) {
                        toastr.error("Something went wrong");
                    });
                }//#endregion PUT
                else {
                    //#region POST
                    Projects.save({}, $scope.aProject, function success(response) {
                        toastr.success("Project Created");
                        var projID = response.PROJECT_ID;
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
                    });
                    //#endregion POST
                }
            }
            //#endregion SAVE this project info

            $scope.cancel = function () {
                //navigate to a different state
                $state.go('projectList');
            };//end cancel
        }//end else (checkCreds == true)
    }//end projectEditCtrl

    //ProjectEditCoopCtrl
    siGLControllers.controller('projectEditCoopCtrl', ['$scope', 'projOrgs', 'allOrgList', projectEditCoopCtrl]);
    function projectEditCoopCtrl($scope, projOrgs, allOrgList) {
        $scope.ProjOrgs = projOrgs;
        $scope.allOrganizations = allOrgList;
        //$scope.addOrgs = function (orgs) {
        //    if (orgs) {
        //        var array = orgs.split(',');
        //        $scope.Project.orgs = $scope.Project.orgs ? $scope.Project.orgs.concat(array) : array;
        //        $scope.newOrgs = "";
        //    }
        //    else {
        //        alert("please enter one or more orgs separated by comma.. not really");
        //    }
        //};
        //$scope.removeOrgs = function (idx) {
        //    $scope.aProject.orgs.splice(idx, 1);
        //};
        $scope.submit = function (isValid) {
            if (isValid) {
                $scope.Project.$save(function (data) {
                    //  toastr.success("Save successful");
                });
            }
            else {
                alert("Please correct the validation errors first");
            }
        };
        $scope.cancel = function () {
            //navigate to a different state
            $state.go('projectList');
        };
    }

    //ProjectEditDataCtrl
    siGLControllers.controller('projectEditDataCtrl', ['$scope', 'projData', projectEditDataCtrl]);
    function projectEditDataCtrl($scope, projData) {
        $scope.ProjData = projData;
    

        $scope.submit = function (isValid) {
            if (isValid) {
                $scope.Project.$save(function (data) {
                    //  toastr.success("Save successful");
                });
            }
            else {
                alert("Please correct the validation errors first");
            }
        };
        $scope.cancel = function () {
            //navigate to a different state
            $state.go('projectList');
        };
    }

    //projectEditContactCtrl
    siGLControllers.controller('projectEditContactCtrl', ['$scope', 'projContacts', 'allOrgList', projectEditContactCtrl]);
    function projectEditContactCtrl($scope, projContacts, allOrgList) {
        $scope.ProjContacts = projContacts;
        $scope.allOrganizations = allOrgList;

        $scope.submit = function (isValid) {
            if (isValid) {
                $scope.Project.$save(function (data) {
                    //  toastr.success("Save successful");
                });
            }
            else {
                alert("Please correct the validation errors first");
            }
        };
        $scope.cancel = function () {
            //navigate to a different state
            $state.go('projectList');
        };
    }

    //projectEditPubCtrl
    siGLControllers.controller('projectEditPubCtrl', ['$scope', 'projPubs', projectEditPubCtrl]);
    function projectEditPubCtrl($scope, projPubs) {
        $scope.ProjPublications = projPubs;
    
        $scope.submit = function (isValid) {
            if (isValid) {
                $scope.Project.$save(function (data) {
                    //  toastr.success("Save successful");
                });
            }
            else {
                alert("Please correct the validation errors first");
            }
        };
        $scope.cancel = function () {
            //navigate to a different state
            $state.go('projectList');
        };
    }

    //login
    siGLControllers.controller('LoginCtrl', ['$scope', '$state', '$http', 'Login', 'setCreds', LoginCtrl]);
    function LoginCtrl($scope, $state, $http, Login, setCreds) {
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