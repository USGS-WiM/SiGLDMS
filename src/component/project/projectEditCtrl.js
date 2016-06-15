(function () {
    'use strict';

    var siGLControllers = angular.module('siGLControllers');
    siGLControllers.controller('projectEditCtrl', ['$scope', '$rootScope', '$cookies', '$location', '$state', '$http', '$filter', '$uibModal', 'thisProject', 'projOrgs',
        'projDatum', 'projContacts', 'projPubs', 'projSites', 'projObjectives', 'projKeywords', 'PROJECT', 'SITE', 'allDurationList', 'allStatsList', 'allObjList',
        function ($scope, $rootScope, $cookies, $location, $state, $http, $filter, $uibModal, thisProject, projOrgs, projDatum, projContacts, projPubs, projSites,
    projObjectives, projKeywords, PROJECT, SITE, allDurationList, allStatsList, allObjList) {
            //model needed for ProjectEdit Info tab: ( Counts for Cooperators, Datum, Contacts, Publications and Sites) 1. thisProject, 2. parsed urls, 3. project Keywords, 4. all objectives, 5. all statuses, 6. all durations
        if ($cookies.get('siGLCreds') === undefined || $cookies.get('siGLCreds') === "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            $scope.DurationList = allDurationList;
            $scope.StatusList = allStatsList;
            $scope.projectForm = {}; //holder for all the forms
            $scope.readyFlagModel = false;
            $scope.uncheckable = true;
          //#region changing tabs handler /////////////////////
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            //var formNameModified = false;

            var formNamePristine = true;
            switch (fromState.url) {
                case '/info':
                    formNamePristine = true;
                    break;
                case '/cooperator':
                    formNamePristine = $scope.projectForm.Coop !== undefined ? $scope.projectForm.Coop.$pristine : true;
                    break;
                case '/data':
                    formNamePristine = $scope.projectForm.Data !== undefined ? $scope.projectForm.Data.$pristine : true;
                    break;
                case '/contact':
                    formNamePristine = $scope.projectForm.Contact !== undefined ? $scope.projectForm.Contact.$pristine : true;
                    break;
                case '/publication':
                    formNamePristine = $scope.projectForm.Pubs !== undefined ? $scope.projectForm.Pubs.$pristine : true;
                    break;
                case '/siteInfo/:siteId':
                    formNamePristine = true;
                    break;
            }
            if (!formNamePristine) {
                if (confirm("Are you sure you want to change tabs? Any unsaved information will be lost.")) {
                    console.log('go to: ' + toState.name);
                } else {
                    console.log('stay at state: ' + fromState.name);
                    $rootScope.stateIsLoading.showLoading = false; //loading... 
                    event.preventDefault();
                }
            }
        });
        //#endregion changing tabs handler //////////////////////

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

            //#region GLOBALS
            $scope.aProject = {}; //holder for project (either coming in for edit, or being created on POST )
            $scope.urls = []; //holder for urls for future parsing back together ( | separated string)

            //#endregion GLOBALS

            //open modal to edit or create a project
            $scope.openProjectCreate = function () {
                var dropdownParts = [allDurationList, allStatsList, allObjList];
                //modal
                var modalInstance = $uibModal.open({
                    templateUrl: 'PROJECTmodal.html',
                    controller: 'projectModalCtrl',
                    size: 'lg',
                    backdrop: 'static',
                    keyboard: false,
                    windowClass: 'rep-dialog',
                    resolve: {
                        allDropDownParts: function () {
                            return dropdownParts;
                        },
                        thisProjectStuff: function () {
                            if ($scope.aProject.PROJECT_ID !== undefined) {
                                var projObjectives = $scope.ProjectObjectives;
                                var projKeywords = $scope.ProjectKeywords;
                                var projectRelatedStuff = [$scope.aProject, projObjectives, projKeywords];
                                return projectRelatedStuff;
                            }
                        }
                    }
                });
                modalInstance.result.then(function (r) {
                    //$scope.aProject, projObjectives, projKeywords
                    $rootScope.stateIsLoading.showLoading = false; //loading...  
                    $scope.aProject = r[0];
                    if ($scope.aProject.URL) {
                        //split string into an array
                        if (($scope.aProject.URL).indexOf('|') > -1) $scope.urls = ($scope.aProject.URL).split("|");
                        else $scope.urls[0] = $scope.aProject.URL;
                    }
                    $scope.ProjectObjectives = r[1];
                    $scope.ProjectKeywords = r[2];
                });
            };

            if (thisProject !== undefined) {
                //this is an existing project = build for details view
                $scope.aProject = thisProject;
                $scope.readyFlagModel = $scope.aProject.READY_FLAG > 0 ? true : false;
                $scope.coopCount = { total: projOrgs.length };
                $scope.datumCount = { total: projDatum.length };
                $scope.contactCount = { total: projContacts.length };
                $scope.pubCount = { total: projPubs.length };
                $scope.sitesCount = { total: projSites.length };
                $scope.title = "Project: " + $scope.aProject.NAME;
                $scope.ProjectKeywords = projKeywords;
                $scope.ProjectObjectives = projObjectives;

                //#region deal with project SITES url formatting here
                var neededUpdating = false; //if url isn't formatted, flag so know to PUT after fix
                //if any ProjSites, make sure the url (if one) is formatted properly
                for (var psu = 0; psu < projSites.length; psu++) {
                    var ind = psu;
                    if (projSites[ind].URL !== null && !projSites[ind].URL.startsWith('http')) {
                        //there is a url and it's not formatted
                        neededUpdating = true;
                        projSites[ind].URL = 'http://' + projSites[ind].URL;
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        $http.defaults.headers.common.Accept = 'application/json';
                        SITE.update({ id: projSites[ind].SITE_ID }, projSites[ind]).$promise;
                    }
                }
                //#endregion loop to put each site's url in proper way (http://)

                //put string ProjURLs into array by '|' and then ensure proper url format
                if ($scope.aProject.URL) {
                    //split string into an array
                    if (($scope.aProject.URL).indexOf('|') > -1) {
                        $scope.urls = ($scope.aProject.URL).split("|");
                    } else {
                        $scope.urls[0] = $scope.aProject.URL;
                    }
                    //make sure they are formatted.. if not, format and PUT
                    var neededUpdating1 = false;
                    for (var u = 0; u < $scope.urls.length; u++) {
                        if (!$scope.urls[u].startsWith('http')) {
                            neededUpdating1 = true;
                            $scope.urls[u] = 'http://' + $scope.urls[u];
                        }
                    }
                    //if they needed updating, PUT the project
                    if (neededUpdating1) {
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        $http.defaults.headers.common.Accept = 'application/json';
                        $scope.aProject.URL = ($scope.urls).join('|');
                        PROJECT.update({ id: $scope.aProject.PROJECT_ID }, $scope.aProject).$promise.then(function (response) {
                            $scope.aProject = response;
                            //split string into an array
                            if (($scope.aProject.URL).indexOf('|') > -1) {
                                $scope.urls = ($scope.aProject.URL).split("|");
                            } else {
                                $scope.urls[0] = $scope.aProject.URL;
                            }
                        });
                    }
                } //end there's a url

            } //end existing project
            else {
                $scope.title = "Project";
                $scope.openProjectCreate();
            }

            //flag radio clicked
            $scope.Flagged = function (p,flag) {
                //if flag is false, they are unpublishing it, if true they are publishing it
                
                    //modal
                    var changeFlagModal = $uibModal.open({
                        template: '<div class="modal-header"><h3 class="modal-title">Publish Project</h3></div>' +
                                    '<div class="modal-body"><p>{{message}}</p></div>' +
                                    '<div class="modal-footer"><button class="sigl-btn btn-orange" ng-click="cancel()">Cancel</button><button class="sigl-btn" ng-click="ok()">OK</button></div>',
                        controller: function ($scope, $uibModalInstance) {
                            //don't let them uncheck.. either click yes or no .. can't unYes or unNo
                            $scope.message = flag ? "Are you sure this project is ready to publish on the SiGL Mapper?" : "Are you sure you want to remove this project from being published on the SiGL Mapper?";
                            $scope.ok = function () {
                                //$scope.aProject.READY_FLAG = data == "Yes" ? 1 : 0;
                                p.READY_FLAG = flag ? 1 : 0;
                                $uibModalInstance.close(p);
                            };
                            $scope.cancel = function () {
                                //undo.. if flag == true, means it was unpublished..
                                $uibModalInstance.close(flag);
                                //$scope.readyFlagModel = flag ? false: true;
                                //$uibModalInstance.dismiss();
                            };
                        },
                        size: 'sm'
                    });
                    changeFlagModal.result.then(function (pr) {
                        if (pr.PROJECT_ID !== undefined) {
                            //yes, PUT the project with the updated flag set
                            $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                            $http.defaults.headers.common.Accept = 'application/json';
                            PROJECT.update({ id: pr.PROJECT_ID }, pr, function success(response) {
                                $scope.aProject = response;
                                $scope.readyFlagModel = $scope.aProject.READY_FLAG > 0 ? true : false;
                                toastr.success("Project Updated");
                            }, function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            });
                        } else {
                            //they cancelled.. reset it
                            $scope.readyFlagModel = pr ? false : true;
                            
                        }
                    });
                    //end modal
                
            };

            $scope.cancel = function () {
                //navigate to a different state
                $state.go('projectList');
            };//end cancel
        }//end else (checkCreds == true)
    }]);
})();

