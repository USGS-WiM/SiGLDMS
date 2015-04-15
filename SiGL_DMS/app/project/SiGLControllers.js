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
siGLControllers.controller('ProjectDetailCtrl', ['$scope', 'project', '$state', ProjectDetailCtrl]);
function ProjectDetailCtrl($scope, project, $state) {
    $scope.Project = project;
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
function projectEditCtrl($scope, project, $state) {
    $scope.Project = project;
    if (project && $scope.Project.PROJECT_ID) {
        $scope.title = "Edit: " + $scope.Project.NAME;
    }
    else {
        $scope.title = "New Project";
    }
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
