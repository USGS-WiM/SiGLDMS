/* controllers.js*/
'use strict';

var siGLControllers = angular.module('siGLControllers', []);

//ProjectListCtrl
siGLControllers.controller('projectListCtrl', ['$scope', 'Projects', projectListCtrl]);
function projectListCtrl($scope, Projects) {
    
    //array of projects            
    Projects.query(function (data) {
        $scope.projects = data;
    });
}
//end projectListCtrl

//projectDetailsCtrl
siGLControllers.controller('ProjectDetailCtr', ['$scope', 'project', '$state', ProjectDetailCtr]);
function ProjectDetailCtr(project, $scope, $state) {
    $scope.project = project;
    $scope.title = "Project Detail: " + vm.project.NAME;

    //back button
    //submit the project info data
        
    $scope.cancel = function () {
        //navigate to a different state
        $state.go('projectList');
    }
}
//end projectDetailsCtrl

//ProjectEditCtrl
siGLControllers.controller('projectEditCtrl', ['project', '$state', projectEditCtrl]);
function projectEditCtrl(project, $state) {
    var vm = this;
    vm.project = project;
    if (this.project && vm.project.PROJECT_ID) {
        vm.title = "Edit: " + vm.project.NAME;
    }
    else {
        vm.title = "New Project";
    }
    vm.submit = function (isValid) {
        if (isValid) {
            vm.product.$save(function (data) {
                //  toastr.success("Save successful");
            });
        }
        else {
            alert("Please correct the validation errors first");
        }
    };
    vm.cancel = function () {
        //navigate to a different state
        $state.go('projectList');
    };
    vm.addOrgs = function (orgs) {
        if (orgs) {
            var array = orgs.split(',');
            vm.project.orgs = vm.project.orgs ? vm.project.orgs.concat(array) : array;
            vm.newOrgs = "";
        }
        else {
            alert("please enter one or more orgs separated by comma.. not really");
        }
    };
    vm.removeOrgs = function (idx) {
        vm.project.orgs.splice(idx, 1);
    };
}
//end projectEditCtrl
