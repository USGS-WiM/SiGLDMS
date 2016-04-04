(function () {
    'use strict';

    var siGLControllers = angular.module('siGLControllers');

    siGLControllers.controller('resourcesCtrl', ['$scope', '$cookies', '$q', '$location', '$state', '$http', '$filter', '$uibModal', 'FREQUENCY_TYPE', 'LAKE_TYPE', 'MEDIA_TYPE', 'OBJECTIVE_TYPE', 'PARAMETER_TYPE',
        'RESOURCE_TYPE', 'PROJ_DURATION', 'PROJ_STATUS', 'STATUS_TYPE', 'allFreqs', 'allLakes', 'allMedias', 'allObjectives', 'allParams', 'allResources', 'allProjDurations', 'allProjStats', 'allSiteStats',
        function ($scope, $cookies, $q, $location, $state, $http, $filter, $uibModal, FREQUENCY_TYPE, LAKE_TYPE, MEDIA_TYPE, OBJECTIVE_TYPE, PARAMETER_TYPE, RESOURCE_TYPE,
        PROJ_DURATION, PROJ_STATUS, STATUS_TYPE, allFreqs, allLakes, allMedias, allObjectives, allParams, allResources, allProjDurations, allProjStats, allSiteStats) {
            if ($cookies.get('siGLCreds') === undefined || $cookies.get('siGLCreds') === "") {
                $scope.auth = false;
                $location.path('/login');
            } else {
                $scope.accountRole = $cookies.get('usersRole');
                // change sorting order
                //$scope.sortingOrder = ''; // TODO :: SET THIS
                //$scope.sort_by = function (newSortingOrder) {
                //    if ($scope.sortingOrder == newSortingOrder) {
                //        $scope.reverse = !$scope.reverse;
                //    }
                //    $scope.sortingOrder = newSortingOrder;
                //    // icon setup
                //    $('th i').each(function () {
                //        // icon reset
                //        $(this).removeClass().addClass('glyphicon glyphicon-sort');
                //    });
                //    if ($scope.reverse) {
                //        $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-up');
                //    } else {
                //        $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-down');
                //    }
                //};
                $scope.lookupForm = {};

                //#region ALL LOOKUPS (add/update/delete)

                //#region Frequency Types Add/Update/Delete
                $scope.FsortingOrder = 'FREQUENCY';
                $scope.Freverse = false;
                $scope.Fsort_by = function (newSortingOrder) {
                    if ($scope.FsortingOrder == newSortingOrder) {
                        $scope.Freverse = !$scope.Freverse;
                    }
                    $scope.FsortingOrder = newSortingOrder;
                    // icon setup
                    $('th i').each(function () {
                        // icon reset
                        $(this).removeClass().addClass('glyphicon glyphicon-sort');
                    });
                    if ($scope.Freverse) {
                        $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-up');
                    } else {
                        $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-down');
                    }
                };

                $scope.freqTypeList = allFreqs; //ft
                $scope.freqCntLoading = true;// show/hide loading next to proj cnt
                var Fpromises = [];
                //get all projects that use each of these frequencies
                $http.defaults.headers.common.Accept = 'application/json';
                angular.forEach($scope.freqTypeList, function (f) {
                    var Fdeferred = $q.defer();
                    FREQUENCY_TYPE.getFreqProj({ id: f.FREQUENCY_TYPE_ID }, function success(response) {
                        f.Projects = response;
                        //defer so can capture when all done here
                        Fdeferred.resolve(response); 
                    });
                    Fpromises.push(Fdeferred.promise);
                });
                $q.all(Fpromises).then(function () {
                    //now turn off loading
                    $scope.freqCntLoading = false;
                });

                $scope.showAddFTForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
                $scope.addFTButtonShowing = true; //start it at true..when clicked, show form, hide button
                $scope.newFT = {};

                //show Add New .... clicked, hide the button and show the form
                $scope.showAddFTClicked = function () {
                    $scope.showAddFTForm = true; //show the form
                    $scope.addFTButtonShowing = false; //hide button
                };
                $scope.NeverMindFT = function () {
                    $scope.newFT = {};
                    $scope.showAddFTForm = false; //hide the form
                    $scope.addFTButtonShowing = true; //show button

                };

                $scope.AddFrequencyType = function (valid) {
                    if (valid) {
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        $http.defaults.headers.common.Accept = 'application/json';
                        FREQUENCY_TYPE.save($scope.newFT, function success(response) {
                            $scope.freqTypeList.push(response);
                            $scope.newFT = {};
                            $scope.showAddFTForm = false; //hide the form
                            $scope.addFTButtonShowing = true; //show the button again
                            toastr.success("Frequency Type Added");
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        });
                    }
                };

                $scope.saveFrequencyType = function (data, id) {
                    var retur = false;
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    FREQUENCY_TYPE.update({ id: id }, data, function success(response) {
                        retur = response;
                        toastr.success("Frequency Type Updated");
                    }, function error(errorResponse) {
                        retur = false;
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                    return retur;
                };

                $scope.deleteFrequencyType = function (ft) {
                    //modal
                    var modalInstance = $uibModal.open({
                        templateUrl: 'removemodal.html',
                        controller: 'ConfirmModalCtrl',
                        size: 'sm',
                        resolve: {
                            keyToRemove: function () {
                                return ft;
                            },
                            what: function () {
                                return "Frequency Type";
                            }
                        }
                    });
                    modalInstance.result.then(function (keyToRemove) {
                        //yes, remove this keyword
                        var index = $scope.freqTypeList.indexOf(ft);
                        //DELETE it
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        FREQUENCY_TYPE.delete({ id: ft.FREQUENCY_TYPE_ID }, function success(response) {
                            $scope.freqTypeList.splice(index, 1);
                            toastr.success("Frequency Type Removed");
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        });
                    }, function () {
                        //logic for cancel
                    });//end modal
                };
                //#endregion Frequency Types Add/Update/Delete

                //#region Lake Type Add/Update/Delete
                $scope.LsortingOrder = 'LAKE';
                $scope.Lreverse = false;
                $scope.Lsort_by = function (newSortingOrder) {
                    if ($scope.LsortingOrder == newSortingOrder) {
                        $scope.Lreverse = !$scope.Lreverse;
                    }
                    $scope.LsortingOrder = newSortingOrder;
                    // icon setup
                    $('th i').each(function () {
                        // icon reset
                        $(this).removeClass().addClass('glyphicon glyphicon-sort');
                    });
                    if ($scope.Lreverse) {
                        $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-up');
                    } else {
                        $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-down');
                    }
                };

                $scope.lakeTypeList = allLakes; //lt
                $scope.lakeCntLoading = true; // show/hide loading next to proj cnt
                var Lpromises = [];
                $http.defaults.headers.common.Accept = 'application/json';
                //get all the projects at these lakes
                angular.forEach($scope.lakeTypeList, function (l) {
                    var Ldeferred = $q.defer();
                    LAKE_TYPE.getLakeProj({ id: l.LAKE_TYPE_ID }, function success(response) {
                        l.Projects = response;
                        Ldeferred.resolve(response);
                    });
                    Lpromises.push(Ldeferred.promise);
                });
                $q.all(Lpromises).then(function () {
                    //now turn off loading
                    $scope.lakeCntLoading = false;
                });
                $scope.showAddLTForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
                $scope.addLTButtonShowing = true; //start it at true..when clicked, show form, hide button
                $scope.newLT = {};

                //show Add New .... clicked, hide the button and show the form
                $scope.showAddLTClicked = function () {
                    $scope.showAddLTForm = true; //show the form
                    $scope.addLTButtonShowing = false; //hide button
                };
                $scope.NeverMindLT = function () {
                    $scope.newLT = {};
                    $scope.showAddLTForm = false; //hide the form
                    $scope.addLTButtonShowing = true; //show button

                };
                $scope.AddLakeType = function (valid) {
                    if (valid) {
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        $http.defaults.headers.common.Accept = 'application/json';
                        LAKE_TYPE.save($scope.newLT, function success(response) {
                            $scope.lakeTypeList.push(response);
                            $scope.newLT = {};
                            $scope.showAddLTForm = false; //hide the form
                            $scope.addLTButtonShowing = true; //show the button again
                            toastr.success("Lake Type Added");
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        });
                    }
                };
                $scope.saveLakeType = function (data, id) {
                    var retur = false;
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    LAKE_TYPE.update({ id: id }, data, function success(response) {
                        retur = response;
                        toastr.success("Lake Type Updated");
                    }, function error(errorResponse) {
                        retur = false;
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                    return retur;
                };
                $scope.deleteLakeType = function (lt) {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'removemodal.html',
                        controller: 'ConfirmModalCtrl',
                        size: 'sm',
                        resolve: {
                            keyToRemove: function () {
                                return lt;
                            },
                            what: function () {
                                return "Lake Type";
                            }
                        }
                    });
                    modalInstance.result.then(function (keyToRemove) {
                        var index = $scope.lakeTypeList.indexOf(lt);
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        LAKE_TYPE.delete({ id: lt.LAKE_TYPE_ID }, function success(response) {
                            $scope.lakeTypeList.splice(index, 1);
                            toastr.success("Lake Type Removed");
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        });
                    }, function () {
                        //logic for cancel
                    });//end modal
                };
                //#endregion Lake Type Add/Update/Delete

                //#region Media Type Add/Update/Delete
                $scope.MsortingOrder = 'MEDIA';
                $scope.Mreverse = false;
                $scope.Msort_by = function (newSortingOrder) {
                    if ($scope.MsortingOrder == newSortingOrder) {
                        $scope.Mreverse = !$scope.Mreverse;
                    }
                    $scope.MsortingOrder = newSortingOrder;
                    // icon setup
                    $('th i').each(function () {
                        // icon reset
                        $(this).removeClass().addClass('glyphicon glyphicon-sort');
                    });
                    if ($scope.Mreverse) {
                        $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-up');
                    } else {
                        $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-down');
                    }
                };
                $scope.mediaTypeList = allMedias; //mt
                $scope.medCntLoading = true;
                var Mpromises = [];
                //get all projects that use each of these media
                $http.defaults.headers.common.Accept = 'application/json';
                angular.forEach($scope.mediaTypeList, function (m) {
                    var Mdeferred = $q.defer();
                    MEDIA_TYPE.getMediaProj({ id: m.MEDIA_TYPE_ID }, function success(response) {
                        m.Projects = response;
                        Mdeferred.resolve(response);
                    });
                    Mpromises.push(Mdeferred.promise);
                });
                $q.all(Mpromises).then(function () {
                    //now turn off loading
                    $scope.medCntLoading = false;
                });
                $scope.showAddMTForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
                $scope.addMTButtonShowing = true; //start it at true..when clicked, show form, hide button
                $scope.newMT = {};

                //show Add New .... clicked, hide the button and show the form
                $scope.showAddMTClicked = function () {
                    $scope.showAddMTForm = true; //show the form
                    $scope.addMTButtonShowing = false; //hide button
                };
                $scope.NeverMindMT = function () {
                    $scope.newMT = {};
                    $scope.showAddMTForm = false; //hide the form
                    $scope.addMTButtonShowing = true; //show button

                };
                $scope.AddMediaType = function (valid) {
                    if (valid) {
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        $http.defaults.headers.common.Accept = 'application/json';
                        MEDIA_TYPE.save($scope.newMT, function success(response) {
                            $scope.mediaTypeList.push(response);
                            $scope.newMT = {};
                            $scope.showAddMTForm = false; //hide the form
                            $scope.addMTButtonShowing = true; //show the button again
                            toastr.success("Media Type Added");
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        });
                    }
                };
                $scope.saveMediaType = function (data, id) {
                    var retur = false;
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    MEDIA_TYPE.update({ id: id }, data, function success(response) {
                        retur = response;
                        toastr.success("Media Type Updated");
                    }, function error(errorResponse) {
                        retur = false;
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                    return retur;
                };
                $scope.deleteMediaType = function (mt) {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'removemodal.html',
                        controller: 'ConfirmModalCtrl',
                        size: 'sm',
                        resolve: {
                            keyToRemove: function () {
                                return mt;
                            },
                            what: function () {
                                return "Media Type";
                            }
                        }
                    });
                    modalInstance.result.then(function (keyToRemove) {
                        var index = $scope.mediaTypeList.indexOf(mt);
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        MEDIA_TYPE.delete({ id: mt.MEDIA_TYPE_ID },function success(response) {
                            $scope.mediaTypeList.splice(index, 1);
                            toastr.success("Media Type Removed");
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        });
                    }, function () {
                        //logic for cancel
                    });//end modal
                };
                //#endregion Media Type Add/Update/Delete

                //#region Objective Type Add/Update/Delete
                $scope.OsortingOrder = 'OBJECTIVE';
                $scope.Oreverse = false;
                $scope.Osort_by = function (newSortingOrder) {
                    if ($scope.OsortingOrder == newSortingOrder) {
                        $scope.Oreverse = !$scope.Oreverse;
                    }
                    $scope.OsortingOrder = newSortingOrder;
                    // icon setup
                    $('th i').each(function () {
                        // icon reset
                        $(this).removeClass().addClass('glyphicon glyphicon-sort');
                    });
                    if ($scope.Oreverse) {
                        $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-up');
                    } else {
                        $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-down');
                    }
                };
                $scope.objTypeList = allObjectives; //ot
                $scope.objCntLoading = true;
                var Opromises = [];
                //get all projects that use each of these objectives
                $http.defaults.headers.common.Accept = 'application/json';
                angular.forEach($scope.objTypeList, function (o) {
                    var Odeferred = $q.defer();
                    OBJECTIVE_TYPE.getObjProj({ id: o.OBJECTIVE_TYPE_ID }, function success(response) {
                        o.Projects = response;
                        Odeferred.resolve(response);
                    });
                    Opromises.push(Odeferred.promise);
                });
                $q.all(Opromises).then(function () {
                    //now turn off loading
                    $scope.objCntLoading = false;
                });
                $scope.showAddOTForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
                $scope.addOTButtonShowing = true; //start it at true..when clicked, show form, hide button
                $scope.newOT = {};

                //show Add New .... clicked, hide the button and show the form
                $scope.showAddOTClicked = function () {
                    $scope.showAddOTForm = true; //show the form
                    $scope.addOTButtonShowing = false; //hide button
                };
                $scope.NeverMindOT = function () {
                    $scope.newOT = {};
                    $scope.showAddOTForm = false; //hide the form
                    $scope.addOTButtonShowing = true; //show button

                };

                $scope.AddObjectiveType = function (valid) {
                    if (valid) {
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        $http.defaults.headers.common.Accept = 'application/json';
                        OBJECTIVE_TYPE.save($scope.newOT, function success(response) {
                            $scope.objTypeList.push(response);
                            $scope.newOT = {};
                            $scope.showAddOTForm = false; //hide the form
                            $scope.addOTButtonShowing = true; //show the button again
                            toastr.success("Objective Type Added");
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        });
                    }
                };

                $scope.saveObjectiveType = function (data, id) {
                    var retur = false;
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    OBJECTIVE_TYPE.update({ id: id }, data, function success(response) {
                        retur = response;
                        toastr.success("Objective Type Updated");
                    }, function error(errorResponse) {
                        retur = false;
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                    return retur;
                };

                $scope.deleteObjectiveType = function (ot) {
                    //modal
                    var modalInstance = $uibModal.open({
                        templateUrl: 'removemodal.html',
                        controller: 'ConfirmModalCtrl',
                        size: 'sm',
                        resolve: {
                            keyToRemove: function () {
                                return ot;
                            },
                            what: function () {
                                return "Objective Type";
                            }
                        }
                    });
                    modalInstance.result.then(function (keyToRemove) {
                        //yes, remove this keyword
                        var index = $scope.objTypeList.indexOf(ot);
                        //DELETE it
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        OBJECTIVE_TYPE.delete({ id: ot.OBJECTIVE_TYPE_ID }, function success(response) {
                            $scope.objTypeList.splice(index, 1);
                            toastr.success("Objective Type Removed");
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        });
                    }, function () {
                        //logic for cancel
                    });//end modal
                };
                //#endregion Objective Type Add/Update/Delete

                //#region Parameter Type Add/Update/Delete
                 $scope.PsortingOrder = 'PARAMETER';
                $scope.Preverse = false;

                $scope.Psort_by = function (newSortingOrder) {                   
                    if ($scope.PsortingOrder == newSortingOrder) {
                        $scope.Preverse = !$scope.Preverse;                        
                    }
                    $scope.PsortingOrder = newSortingOrder;
                    // icon setup
                    $('th i').each(function () {
                        // icon reset
                        $(this).removeClass().addClass('glyphicon glyphicon-sort');
                    });
                    if ($scope.Preverse) {
                        $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-up');
                    } else {
                        $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-down');
                    }
                };
                $scope.paramTypeList = allParams; //pt
                $scope.paramGroupTypes = [
                     { value: 1, text: 'Biological' },
                     { value: 2, text: 'Chemical' },
                     { value: 3, text: 'Microbiological' },
                     { value: 4, text: 'Physical' },
                     { value: 5, text: 'Toxicological' }
                ];
                $scope.paramCntLoading = true;
                var Ppromises = [];
                //get all projects that use each of these parameters
                $http.defaults.headers.common.Accept = 'application/json';
                angular.forEach($scope.paramTypeList, function (p) {
                    var Pdeferred = $q.defer();
                    PARAMETER_TYPE.getParamProj({ id: p.PARAMETER_TYPE_ID }, function success(response) {
                        p.Projects = response;
                        Pdeferred.resolve(response);
                    });
                    Ppromises.push(Pdeferred.promise);
                });
                $q.all(Ppromises).then(function () {
                    //now turn off loading
                    $scope.paramCntLoading = false;
                });
               
                $scope.showAddPTForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
                $scope.addPTButtonShowing = true; //start it at true..when clicked, show form, hide button
                $scope.newPT = {};

                //show Add New .... clicked, hide the button and show the form
                $scope.showAddPTClicked = function () {
                    $scope.showAddPTForm = true; //show the form
                    $scope.addPTButtonShowing = false; //hide button
                };
                $scope.NeverMindPT = function () {
                    $scope.newPT = {};
                    $scope.showAddPTForm = false; //hide the form
                    $scope.addPTButtonShowing = true; //show button

                };
                $scope.AddParameterType = function (valid) {
                    if (valid) {
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        $http.defaults.headers.common.Accept = 'application/json';
                        PARAMETER_TYPE.save($scope.newPT, function success(response) {
                            $scope.paramTypeList.push(response);
                            $scope.newPT = {};
                            $scope.showAddPTForm = false; //hide the form
                            $scope.addPTButtonShowing = true; //show the button again
                            toastr.success("Parameter Type Added");
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        });
                    }
                };
                $scope.saveParameterType = function (data, id) {
                    var retur = false;
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    PARAMETER_TYPE.update({ id: id }, data, function success(response) {
                        retur = response;
                        toastr.success("Parameter Type Updated");
                    }, function error(errorResponse) {
                        retur = false;
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                    return retur;
                };
                $scope.deleteParameterType = function (pt) {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'removemodal.html',
                        controller: 'ConfirmModalCtrl',
                        size: 'sm',
                        resolve: {
                            keyToRemove: function () {
                                return pt;
                            },
                            what: function () {
                                return "Parameter Type";
                            }
                        }
                    });
                    modalInstance.result.then(function (keyToRemove) {
                        var index = $scope.paramTypeList.indexOf(pt);
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        PARAMETER_TYPE.delete({ id: pt.PARAMETER_TYPE_ID }, function success(response) {
                            $scope.paramTypeList.splice(index, 1);
                            toastr.success("Parameter Type Removed");
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        });
                    }, function () {
                        //logic for cancel
                    });//end modal
                };
                //#endregion Parameter Type Add/Update/Delete

                //#region Resource Type Add/Update/Delete
                $scope.RsortingOrder = 'RESOURCE_NAME';
                $scope.Rreverse = false;
                $scope.Rsort_by = function (newSortingOrder) {
                    if ($scope.RsortingOrder == newSortingOrder) {
                        $scope.Rreverse = !$scope.Rreverse;
                    }
                    $scope.RsortingOrder = newSortingOrder;
                    // icon setup
                    $('th i').each(function () {
                        // icon reset
                        $(this).removeClass().addClass('glyphicon glyphicon-sort');
                    });
                    if ($scope.Rreverse) {
                        $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-up');
                    } else {
                        $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-down');
                    }
                };
                $scope.resourceTypeList = allResources; //rt  
                $scope.ResCntLoading = true;
                var Rpromises = [];
                //get all projects that use each of these proj Durations
                $http.defaults.headers.common.Accept = 'application/json';
                angular.forEach($scope.resourceTypeList, function (rt) {
                    var Rdeferred = $q.defer();
                    RESOURCE_TYPE.getResourceProj({ id: rt.RESOURCE_TYPE_ID }, function success(response) {
                        rt.Projects = response;
                        Rdeferred.resolve(response);
                    });
                    Rpromises.push(Rdeferred.promise);
                });
                $q.all(Rpromises).then(function () {
                    //now turn off loading
                    $scope.ResCntLoading = false;
                });
                $scope.showAddRTForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
                $scope.addRTButtonShowing = true; //start it at true..when clicked, show form, hide button
                $scope.newRT = {};

                //show Add New .... clicked, hide the button and show the form
                $scope.showAddRTClicked = function () {
                    $scope.showAddRTForm = true; //show the form
                    $scope.addRTButtonShowing = false; //hide button
                };
                $scope.NeverMindRT = function () {
                    $scope.newRT = {};
                    $scope.showAddRTForm = false; //hide the form
                    $scope.addRTButtonShowing = true; //show button

                };
                $scope.AddResourceType = function (valid) {
                    if (valid) {
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        $http.defaults.headers.common.Accept = 'application/json';
                        RESOURCE_TYPE.save($scope.newRT, function success(response) {
                            $scope.resourceTypeList.push(response);
                            $scope.newRT = {};
                            $scope.showAddRTForm = false; //hide the form
                            $scope.addRTButtonShowing = true; //show the button again
                            toastr.success("Resource Type Added");
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        });
                    }
                };
                $scope.saveResourceType = function (data, id) {
                    var retur = false;
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    RESOURCE_TYPE.update({ id: id }, data, function success(response) {
                        retur = response;
                        toastr.success("Resource Type Updated");
                    }, function error(errorResponse) {
                        retur = false;
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                    return retur;
                };
                $scope.deleteResourceType = function (rt) {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'removemodal.html',
                        controller: 'ConfirmModalCtrl',
                        size: 'sm',
                        resolve: {
                            keyToRemove: function () {
                                return rt;
                            },
                            what: function () {
                                return "Resource Type";
                            }
                        }
                    });
                    modalInstance.result.then(function (keyToRemove) {
                        var index = $scope.resourceTypeList.indexOf(rt);
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        RESOURCE_TYPE.delete({ id: rt.RESOURCE_TYPE_ID }, function success(response) {
                            $scope.resourceTypeList.splice(index, 1);
                            toastr.success("Resource Type Removed");
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        });
                    }, function () {
                        //logic for cancel
                    });//end modal
                };
                //#endregion Resource Type Add/Update/Delete

                //#region Proj Duration Add/Update/Delete
                $scope.PDsortingOrder = 'DURATION_VALUE';
                $scope.PDreverse = false;
                $scope.PDsort_by = function (newSortingOrder) {
                    if ($scope.PDsortingOrder == newSortingOrder) {
                        $scope.PDreverse = !$scope.PDreverse;
                    }
                    $scope.PDsortingOrder = newSortingOrder;
                    // icon setup
                    $('th i').each(function () {
                        // icon reset
                        $(this).removeClass().addClass('glyphicon glyphicon-sort');
                    });
                    if ($scope.PDreverse) {
                        $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-up');
                    } else {
                        $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-down');
                    }
                };
                $scope.projDurationList = allProjDurations; //pd
                $scope.projDCntLoading = true;
                var PDpromises = [];
                //get all projects that use each of these proj Durations
                $http.defaults.headers.common.Accept = 'application/json';
                angular.forEach($scope.projDurationList, function (pd) {
                    var PDdeferred = $q.defer();
                    PROJ_DURATION.getProjDurProj({ id: pd.PROJ_DURATION_ID }, function success(response) {
                        pd.Projects = response;
                        PDdeferred.resolve(response);
                    });
                    PDpromises.push(PDdeferred.promise);
                });
                $q.all(PDpromises).then(function () {
                    //now turn off loading
                    $scope.projDCntLoading = false;
                });
                $scope.showAddPDForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
                $scope.addPDButtonShowing = true; //start it at true..when clicked, show form, hide button
                $scope.newPD = {};

                //show Add New .... clicked, hide the button and show the form
                $scope.showAddPDClicked = function () {
                    $scope.showAddPDForm = true; //show the form
                    $scope.addPDButtonShowing = false; //hide button
                };
                $scope.NeverMindPD = function () {
                    $scope.newPD = {};
                    $scope.showAddPDForm = false; //hide the form
                    $scope.addPDButtonShowing = true; //show button

                };

                $scope.AddProjDuration = function (valid) {
                    if (valid) {
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        $http.defaults.headers.common.Accept = 'application/json';
                        PROJ_DURATION.save($scope.newPD, function success(response) {
                            $scope.projDurationList.push(response);
                            $scope.newPD = {};
                            $scope.showAddPDForm = false; //hide the form
                            $scope.addPDButtonShowing = true; //show the button again
                            toastr.success("Project Duration Added");
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        });
                    }
                };

                $scope.saveProjDuration = function (data, id) {
                    var retur = false;
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    PROJ_DURATION.update({ id: id }, data, function success(response) {
                        retur = response;
                        toastr.success("Project Duration Updated");
                    }, function error(errorResponse) {
                        retur = false;
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                    return retur;
                };

                $scope.deleteProjDuration = function (pd) {
                    //modal
                    var modalInstance = $uibModal.open({
                        templateUrl: 'removemodal.html',
                        controller: 'ConfirmModalCtrl',
                        size: 'sm',
                        resolve: {
                            keyToRemove: function () {
                                return pd;
                            },
                            what: function () {
                                return "Project Duration";
                            }
                        }
                    });
                    modalInstance.result.then(function (keyToRemove) {
                        //yes, remove this keyword
                        var index = $scope.projDurationList.indexOf(pd);
                        //DELETE it
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        PROJ_DURATION.delete({ id: pd.PROJ_DURATION_ID }, function success(response) {
                            $scope.projDurationList.splice(index, 1);
                            toastr.success("Project Duration Removed");
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        });
                    }, function () {
                        //logic for cancel
                    });//end modal
                };
                //#endregion Proj Duration Add/Update/Delete

                //#region Proj Status Add/Update/Delete
                $scope.PSsortingOrder = 'STATUS_VALUE';
                $scope.PSreverse = false;
                $scope.PSsort_by = function (newSortingOrder) {
                    if ($scope.PSsortingOrder == newSortingOrder) {
                        $scope.PSreverse = !$scope.PSreverse;
                    }
                    $scope.PSsortingOrder = newSortingOrder;
                    // icon setup
                    $('th i').each(function () {
                        // icon reset
                        $(this).removeClass().addClass('glyphicon glyphicon-sort');
                    });
                    if ($scope.PSreverse) {
                        $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-up');
                    } else {
                        $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-down');
                    }
                };
                $scope.projStatusList = allProjStats; //ps 
                $scope.projStatCntLoading = true;
                var PSpromises = [];
                //get all projects that use each of these proj stat
                $http.defaults.headers.common.Accept = 'application/json';
                angular.forEach($scope.projStatusList, function (ps) {
                    var PSdeferred = $q.defer();
                    PROJ_STATUS.getProjStatProj({ id: ps.PROJ_STATUS_ID }, function success(response) {
                        ps.Projects = response;
                        PSdeferred.resolve(response);
                    });
                    PSpromises.push(PSdeferred.promise);
                });
                $q.all(PSpromises).then(function () {
                    //now turn off loading
                    $scope.projStatCntLoading = false;
                });
                $scope.showAddPSForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
                $scope.addPSButtonShowing = true; //start it at true..when clicked, show form, hide button
                $scope.newPS = {};

                //show Add New .... clicked, hide the button and show the form
                $scope.showAddPSClicked = function () {
                    $scope.showAddPSForm = true; //show the form
                    $scope.addPSButtonShowing = false; //hide button
                };
                $scope.NeverMindPS = function () {
                    $scope.newPS = {};
                    $scope.showAddPSForm = false; //hide the form
                    $scope.addPSButtonShowing = true; //show button

                };
                $scope.AddProjStatus = function (valid) {
                    if (valid) {
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        $http.defaults.headers.common.Accept = 'application/json';
                        PROJ_STATUS.save($scope.newPS, function success(response) {
                            $scope.projStatusList.push(response);
                            $scope.newPS = {};
                            $scope.showAddPSForm = false; //hide the form
                            $scope.addPSButtonShowing = true; //show the button again
                            toastr.success("Project Status Added");
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        });
                    }
                };
                $scope.saveProjStatus = function (data, id) {
                    var retur = false;
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    PROJ_STATUS.update({ id: id }, data, function success(response) {
                        retur = response;
                        toastr.success("Project Status Updated");
                    }, function error(errorResponse) {
                        retur = false;
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                    return retur;
                };
                $scope.deleteProjStatus = function (ps) {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'removemodal.html',
                        controller: 'ConfirmModalCtrl',
                        size: 'sm',
                        resolve: {
                            keyToRemove: function () {
                                return ps;
                            },
                            what: function () {
                                return "Project Status Type";
                            }
                        }
                    });
                    modalInstance.result.then(function (keyToRemove) {
                        var index = $scope.projStatusList.indexOf(ps);
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        PROJ_STATUS.delete({ id: ps.PROJ_STATUS_ID }, function success(response) {
                            $scope.projStatusList.splice(index, 1);
                            toastr.success("Project Status Removed");
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        });
                    }, function () {
                        //logic for cancel
                    });//end modal
                };
                //#endregion Proj Status Add/Update/Delete

                //#region Site Status Add/Update/Delete
                $scope.SSsortingOrder = 'STATUS';
                $scope.SSreverse = false;
                $scope.SSsort_by = function (newSortingOrder) {
                    if ($scope.SSsortingOrder == newSortingOrder) {
                        $scope.SSreverse = !$scope.SSreverse;
                    }
                    $scope.SSsortingOrder = newSortingOrder;
                    // icon setup
                    $('th i').each(function () {
                        // icon reset
                        $(this).removeClass().addClass('glyphicon glyphicon-sort');
                    });
                    if ($scope.SSreverse) {
                        $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-up');
                    } else {
                        $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-down');
                    }
                };
                $scope.siteStatusList = allSiteStats; //ss
                $scope.siteStatCntLoading = true;
                var SSpromises = [];
                //get all projects that use each of these proj stat
                $http.defaults.headers.common.Accept = 'application/json';
                angular.forEach($scope.siteStatusList, function (ss) {
                    var SSdeferred = $q.defer();
                    STATUS_TYPE.getSiteStatusProj({ id: ss.STATUS_ID }, function success(response) {
                        ss.Projects = response;
                        SSdeferred.resolve(response);
                    });
                    SSpromises.push(SSdeferred.promise);
                });
                $q.all(SSpromises).then(function () {
                    //now turn off loading
                    $scope.siteStatCntLoading = false;
                });
                $scope.showAddSSForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
                $scope.addSSButtonShowing = true; //start it at true..when clicked, show form, hide button
                $scope.newSS = {};

                //show Add New .... clicked, hide the button and show the form
                $scope.showAddSSClicked = function () {
                    $scope.showAddSSForm = true; //show the form
                    $scope.addSSButtonShowing = false; //hide button
                };
                $scope.NeverMindSS = function () {
                    $scope.newSS = {};
                    $scope.showAddSSForm = false; //hide the form
                    $scope.addSSButtonShowing = true; //show button

                };
                $scope.AddSiteStatus = function (valid) {
                    if (valid) {
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        $http.defaults.headers.common.Accept = 'application/json';
                        STATUS_TYPE.save($scope.newSS, function success(response) {
                            $scope.siteStatusList.push(response);
                            $scope.newSS = {};
                            $scope.showAddSSForm = false; //hide the form
                            $scope.addSSButtonShowing = true; //show the button again
                            toastr.success("Site Status Type Added");
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        });
                    }
                };
                $scope.saveSiteStatus = function (data, id) {
                    var retur = false;
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    STATUS_TYPE.update({ id: id }, data, function success(response) {
                        retur = response;
                        toastr.success("Site Status Type Updated");
                    }, function error(errorResponse) {
                        retur = false;
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                    return retur;
                };
                $scope.deleteSiteStatus = function (ss) {
                    var modalInstance = $uibModal.open({
                        templateUrl: 'removemodal.html',
                        controller: 'ConfirmModalCtrl',
                        size: 'sm',
                        resolve: {
                            keyToRemove: function () {
                                return ss;
                            },
                            what: function () {
                                return "Status Type";
                            }
                        }
                    });
                    modalInstance.result.then(function (keyToRemove) {
                        var index = $scope.siteStatusList.indexOf(ss);
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        STATUS_TYPE.delete({ id: ss.STATUS_ID }, function success(response) {
                            $scope.siteStatusList.splice(index, 1);
                            toastr.success("Site Status Type Removed");
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        });
                    }, function () {
                        //logic for cancel
                    });//end modal
                };
                //#endregion Site Status Add/Update/Delete

                //#endregion ALL LOOKUPS (add/update/delete)
            }//end else auth
        }]);
})();
