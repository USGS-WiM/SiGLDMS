/* controllers.js*/
'use strict';

var siGLControllers = angular.module('siGLControllers', []);

//ProjectListCtrl
siGLControllers.controller('projectListCtrl', ['$scope', 'Projects', projectListCtrl]);
function projectListCtrl($scope, Projects) {
    
    //array of projects            
    Projects.getAll(function (data) {
        $scope.projects = data;
    });
}
//end projectListCtrl

//projectDetailsCtrl
siGLControllers.controller('ProjectDetailCtrl', ['$scope', 'project', 'projObjectives', 'projKeywords', 'ProjDurations', 'ProjStats', '$state', ProjectDetailCtrl]);
function ProjectDetailCtrl($scope, project, projObjectives, projKeywords, ProjDurations, ProjStats, $state) {
    $scope.Project = project;
    //split Project.URL by '|'
    if (($scope.Project.URL).indexOf('|') > -1) {
        $scope.urls = ($scope.Project.URL).split("|");
    } else {
        $scope.urls = $scope.Project.URL;
    }

    //need to get Duration Name
    ProjDurations.query({ id: project.PROJ_DURATION_ID }, function (data) {
        $scope.ProjDuration = data.DURATION_VALUE;
    });
    //need to get Status Name
    ProjStats.query({ id: project.PROJ_STATUS_ID }, function (data) {
        $scope.ProjStat = data.STATUS_VALUE;
    });
    //need to get Objectives
    $scope.ProjectObjectives = projObjectives;
    //need to get keywords
    $scope.ProjectKeywords = projKeywords;

    $scope.Title = "Project Detail: " + $scope.Project.NAME;

    //back button
    //submit the project info data
       
    $scope.cancel = function () {
        //navigate to a different state
        $state.go('projectList');
    }
}
//end projectDetailsCtrl

//ProjectEditCtrl
siGLControllers.controller('projectEditCtrl', ['$scope', 'project', '$state', projectEditCtrl]);
function projectEditCtrl($scope, project, $state, Projects) {
    //store project
    $scope.Project = project;
    if (project && $scope.Project.PROJECT_ID) {
        $scope.title = "Edit: " + $scope.Project.NAME;
    }
    else {
        $scope.title = "New Project";
    }
    //get project objectives
    //Projects.getProjObjectives({ id: project.PROJECT_ID }, function (data) {
    //    $scope.ProjObjectives = data;
    //});

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
    $scope.addOrgs = function (orgs) {
        if (orgs) {
            var array = orgs.split(',');
            $scope.Project.orgs = $scope.Project.orgs ? $scope.Project.orgs.concat(array) : array;
            $scope.newOrgs = "";
        }
        else {
            alert("please enter one or more orgs separated by comma.. not really");
        }
    };
    $scope.removeOrgs = function (idx) {
        $scope.Project.orgs.splice(idx, 1);
    };
}
//end projectEditCtrl

//ProjDurationCtrl
siGLControllers.controller('ProjDurationCtrl', ['$scope', 'ProjDurations', ProjDurationCtrl]);
function ProjDurationCtrl($scope, ProjDurations) {
    //store dropdowns
    ProjDurations.getAll(function (data) {
        $scope.Durations = data
    });

}
//end ProjDurationCtrl

//ProjStatusCtrl
siGLControllers.controller('ProjStatusCtrl', ['$scope', 'ProjStats', ProjStatusCtrl]);
function ProjStatusCtrl($scope, ProjStats) {
    //store dropdowns
    ProjStats.getAll(function (data) {
        $scope.Stats = data
    });

}
//end ProjDurationCtrl
