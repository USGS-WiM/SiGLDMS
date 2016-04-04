(function () {
    'use strict';

    var siGLControllers = angular.module('siGLControllers');

    siGLControllers.controller('resourcesCtrl', ['$scope', '$cookies', '$location', '$state', '$http', '$filter', '$uibModal', 'FREQUENCY_TYPE', 'LAKE_TYPE', 'MEDIA_TYPE', 'OBJECTIVE_TYPE', 'PARAMETER_TYPE',
        'RESOURCE_TYPE', 'PROJ_DURATION', 'PROJ_STATUS', 'STATUS_TYPE', 'allFreqs', 'allLakes', 'allMedias', 'allObjectives', 'allParams', 'allResources', 'allProjDurations', 'allProjStats', 'allSiteStats',
        function ($scope, $cookies, $location, $state, $http, $filter, $uibModal, FREQUENCY_TYPE, LAKE_TYPE, MEDIA_TYPE, OBJECTIVE_TYPE, PARAMETER_TYPE, RESOURCE_TYPE,
        PROJ_DURATION, PROJ_STATUS, STATUS_TYPE, allFreqs, allLakes, allMedias, allObjectives, allParams, allResources, allProjDurations, allProjStats, allSiteStats) {
            if ($cookies.get('siGLCreds') === undefined || $cookies.get('siGLCreds') === "") {
                $scope.auth = false;
                $location.path('/login');
            } else {
                $scope.accountRole = $cookies.get('usersRole');
                // change sorting order
                $scope.sortingOrder = ''; // TODO :: SET THIS
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
                $scope.lookupForm = {};

                //#region ALL LOOKUPS (add/update/delete)

                //#region Frequency Types Add/Update/Delete
                $scope.freqTypeList = allFreqs; //ft
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
                $scope.lakeTypeList = allLakes; //lt
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
                $scope.mediaTypeList = allMedias; //mt
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
                $scope.objTypeList = allObjectives; //ot
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
                $scope.paramTypeList = allParams; //pt
                $scope.paramGroupTypes = [
                     { value: 1, text: 'Biological' },
                     { value: 2, text: 'Chemical' },
                     { value: 3, text: 'Microbiological' },
                     { value: 4, text: 'Physical' },
                     { value: 5, text: 'Toxicological' }
                ];
                $scope.sortingOrder = 'PARAMETER';
                $scope.reverse = false;

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
                $scope.resourceTypeList = allResources; //rt
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
                $scope.projDurationList = allProjDurations; //pd
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
                $scope.projStatusList = allProjStats; //ps
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
                $scope.siteStatusList = allSiteStats; //ss
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
