/* controllers.js*/
'use strict';

var siGLControllers = angular.module('siGLControllers', []);

siGLControllers.controller('mainCtrl', ['$scope', 'Projects', '$location', '$state', 'checkCreds', 'getUsername', mainCtrl]);
function mainCtrl($scope, Projects, $location, $state, checkCreds, getUsername) {
    if (!checkCreds()) {
        $location.path('/login');
    } else {
        $scope.username = getUsername();
        $state.go('projectList')
    }

}
//ProjectListCtrl
siGLControllers.controller('projectListCtrl', ['$scope', 'Projects', '$location', '$http', 'checkCreds', 'getCreds', 'getUser', projectListCtrl]);
function projectListCtrl($scope, Projects, $location, $http, checkCreds, getCreds, getUser) { //, setProjectLookups) {
    if (!checkCreds()) {
        $location.path('/login');
    }
    //array of projects    
    $http.defaults.headers.common['Authorization'] = 'Basic ' + getCreds();
    Projects.getDMProjects(function (data) {
        $scope.projects = data;
    });
    $scope.User = getUser();
    //setProjectLookups();
}
//end projectListCtrl

//projectDetailsCtrl
siGLControllers.controller('ProjectDetailCtrl', ['$scope', 'project', 'Projects', '$state', ProjectDetailCtrl]);
function ProjectDetailCtrl($scope, project, Projects, $state) {
    $scope.Title = "Project Detail: " + project.NAME;

    //Required Model properties: 
    //1. aProject, 2. ProjDurationName, 3. ProjStatusName, 4. ProjObjectives, 5. ProjKeywords, 6. parsed URLs 

    //1. aProject
    $scope.aProject = project;
    //2. ProjDurationName
    Projects.getProjDuration({ id: project.PROJECT_ID },
        function success(response) {
            $scope.projDurationName = response.DURATION_VALUE;
        },
        function error(errorResponse) {
            $scope.projDurationName = errorResponse;
        }
    );
    //3. ProjStatusName
    Projects.getProjStatus({ id: project.PROJECT_ID },
        function success(response) {
            $scope.projStatusName = response.STATUS_VALUE;
        },
        function error(errorResponse) {
            $scope.projStatusName = errorResponse;
        }
    );
    //4. ProjObjectives
    Projects.getProjObjectives({ id: project.PROJECT_ID },
        function success(response) {
            $scope.ProjectObjectives = response;
        },
        function error(errorResponse) {
            $scope.ProjectObjectives = errorResponse;
        }
    );
    //5. ProjKeywords
    Projects.getProjKeywords({ id: project.PROJECT_ID },
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

//ProjectEditCtrl  'ProjDurations''allDurations',
siGLControllers.controller('projectEditCtrl', ['$scope', 'ProjDurations', 'project', 'Projects', 'getProjectLookups', 'ProjStats', 'ObjectiveTypes', '$state', projectEditCtrl]);
function projectEditCtrl($scope, ProjDurations, project, Projects, getProjectLookups, ProjStats, ObjectiveTypes, $state) {
    //model needed for ProjectEdit Info tab: 
    //1. aProject, 2. all durations, 3. all statuses, 4. all objectives, 5. project Keywords, 6. parsed urls
    $scope.aProject = project;
   // setProjectLookups();
    $scope.urls = [];
    if ($scope.aProject.PROJECT_ID) {
        $scope.title = "Edit: " + $scope.aProject.NAME;

        //6. parsed URLs by '|'
        if ($scope.aProject.URL) {
            if (($scope.aProject.URL).indexOf('|') > -1) {
                $scope.urls = ($scope.aProject.URL).split("|");
            } else {
                $scope.urls[0] = $scope.aProject.URL;
            }
        }
    }
    else {
        $scope.title = "New Project";
    }

    //2. all durations
    ProjDurations.getAll(function (data) {
        $scope.DurationList = data; //getProjectLookups()[0];
    });
    //3. all status
    ProjStats.getAll(function (data) {
        $scope.StatusList = data;
    });

    var projObjs = [];
    Projects.getProjObjectives({ id: project.PROJECT_ID }, function (data) {
        projObjs = data;
    });
    var allObjList = [];
    ObjectiveTypes.getAll(function (data) {
        allObjList = data;
    })
    //http://isteven.github.io/angular-multi-select/#/demo-minimum
    //go through allObjList and add selected Property.
    for (var i = 0; i < allObjList.length; i++) {
        //for each one, if projObjectives has this id, add 'selected:true' else add 'selected:false'
        for (var y = 0; y < projObjs.length; y++) {
            if (projObjs[y].OBJECTIVE_TYPE_ID == allObjList[i].OBJECTIVE_TYPE_ID) {
                allObjList[i].selected = true;
                y = projObjs.length;
            }
            else {
                allObjList[i].selected = false;
            }
        }
    }

    //4. all objectives
    $scope.ObjectivesList = allObjList;

    //5. aProj keywords
    Projects.getProjKeywords({ id: project.PROJECT_ID }, function (data) {
        $scope.ProjectKeywords = data;
    });

    $scope.cancel = function () {
        //navigate to a different state
        $state.go('projectList');
    };

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
}
//end projectEditCtrl

//ProjectEditCoopCtrl
siGLControllers.controller('projectEditCoopCtrl', ['$scope', 'projOrganizations', 'allOrgList', projectEditCoopCtrl]);
function projectEditCoopCtrl($scope, projOrganizations, allOrgList) {
    $scope.ProjOrgs = projOrganizations;
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
siGLControllers.controller('LoginCtrl', ['$scope', '$state', '$http', 'Login', 'setCreds', 'setUser', LoginCtrl]);
function LoginCtrl($scope, $state, $http, Login, setCreds, setUser) {
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
                    setCreds($scope.username, $scope.password);
                    setUser(user);
                    $state.go('projectList');
                }
                else {
                    $scope.error = "Login Failed";
                }
            },
            function error(errorResponse) {
                console.log("Error:" + errorResponse);
            }
        );
    };
}