(function () {
    'use strict';

    var ModalControllers = angular.module('ModalControllers');
    ModalControllers.controller('projectModalCtrl', ['$scope', '$rootScope', '$cookies', '$q', '$location', '$state', '$http', '$timeout', '$uibModal', '$uibModalInstance', '$filter', 'allDropDownParts', 'thisProjectStuff', 'PROJECT',
        function ($scope, $rootScope, $cookies, $q, $location, $state, $http, $timeout, $uibModal, $uibModalInstance, $filter, allDropDownParts, thisProjectStuff, PROJECT) {
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
                if (d !== "") {
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


            if (thisProjectStuff !== undefined) {
                //#region existing project (edit)
                $scope.aProject = angular.copy(thisProjectStuff[0]);
                $scope.aProject.START_DATE = $scope.aProject.START_DATE !== null ? makeAdate($scope.aProject.START_DATE) : null;
                $scope.aProject.END_DATE = $scope.aProject.END_DATE !== null ? makeAdate($scope.aProject.END_DATE) : null;

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
                        if ($scope.projObjs.length === 0) {
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
                }
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
                if ($scope.aProject.END_DATE !== undefined) {
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
                if (data.selected) { //selected
                    $scope.ObjectivesToAdd.push(data); //add to ObjectivesToAdd
                    if ($scope.aProject.PROJECT_ID !== undefined) { //if this is edit
                        //editing (remove from remove list if there)
                        var i = $scope.ObjectivesToRemove.map(function (e) { return e.OBJECTIVE_TYPE_ID; }).indexOf(data.OBJECTIVE_TYPE_ID);
                        if (i >= 0) $scope.ObjectivesToRemove.splice(i, 1); //remove from removeList ..in case they removed and then added it back
                    }
                } else {
                    //data.selected == false
                    var ind = $scope.ObjectivesToAdd.map(function (e) { return e.OBJECTIVE_TYPE_ID; }).indexOf(data.OBJECTIVE_TYPE_ID);
                    if (ind >= 0) $scope.ObjectivesToAdd.splice(ind, 1); //remove it from addList if they added then removed

                    if ($scope.aProject.PROJECT_ID !== undefined) { //edit
                        $scope.ObjectivesToRemove.push(data); //add it to removeList

                    }
                }
            };//end ObjClick

            //add url TODO:check if this url is already in the urls array..if so don't add it again
            $scope.addProjURL = function (form) {
                if ($scope.newURL.value !== undefined) {
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
                if ($scope.newKey.value !== undefined) {
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

                    if ($scope.aProject.PROJECT_ID !== undefined){
                        $scope.KeywordsToRemove.push(key);
                        //check and see if they are adding then removing
                        var isInKeysToAdd = $scope.KeywordsToAdd.map(function (k) { return k.TERM; }).indexOf(key.TERM);
                        if (isInKeysToAdd >= 0) { $scope.KeywordsToAdd.splice(isInKeysToAdd, 1); }
                    }  else
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
                    if ($scope.aProject.END_DATE !== undefined || $scope.aProject.END_DATE !== "") {
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
                if (valid) {
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    $scope.aProject.URL = ($scope.urls).join('|');
                    var projID;
                    // $(".page-loading").removeClass("hidden");
                    $rootScope.stateIsLoading.showLoading = true; //loading...
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
                        $rootScope.stateIsLoading.showLoading = false; //loading...
                        var prjectParts = [$scope.aProject, $scope.Objectivesdata, $scope.ProjectKeywords];
                        $uibModalInstance.close(prjectParts);
                        $location.path('/project/edit/' + projID + '/info').replace();//.notify(false);
                        $scope.apply;
                    });
                }
            };

            //project PUT
            $scope.save = function (valid) {
                if (valid) {
                    $rootScope.stateIsLoading.showLoading = true; //loading... 
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    $scope.aProject.URL = $scope.urls.join("|");
                    PROJECT.update({ id: $scope.aProject.PROJECT_ID }, $scope.aProject, function success(ProjResponse) {                       
                        //use $q for async call to delete and add objectives and keywords
                        var defer = $q.defer();
                        var RemovePromises = [];
                        var AddPromises = [];
                        //remove objectives
                        angular.forEach($scope.ObjectivesToRemove, function (Ovalue) {
                            var delObjProm = PROJECT.deleteProjObjective({ id: $scope.aProject.PROJECT_ID, objId: Ovalue.OBJECTIVE_TYPE_ID }).$promise;
                            RemovePromises.push(delObjProm);                            
                        });
                        //remove keywords
                        angular.forEach($scope.KeywordsToRemove, function (Kvalue) {
                            if (Kvalue.KEYWORD_ID !== undefined) {
                                var delKeyProm = PROJECT.deleteProjKeyword({ id: $scope.aProject.PROJECT_ID, keyId: Kvalue.KEYWORD_ID }).$promise;
                                RemovePromises.push(delKeyProm);
                            }
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

        }]);
})();
