(function () {
    'use strict';

    var siGLControllers = angular.module('siGLControllers'); 
    
    siGLControllers.controller('projDataCtrl', ['$scope', '$cookies', '$http', '$uibModal', 'PROJECT', 'DATA_HOST', 'thisProject', 'projDatum',
        function ($scope, $cookies, $http, $uibModal, PROJECT, DATA_HOST, thisProject, projDatum) {
            $scope.ProjData = projDatum;
            var neededUpdating = false; //if the url isn't formatted, flag so know to PUT it after fixing
            $scope.isEditing = false; //disables form inputs while user is editing existing data up top
            $scope.newData = {}; //holder
            var thisProjID = thisProject.PROJECT_ID; //projectID

            //if any ProjDatum, make sure the url (if one) is formatted properly
            for (var pdu = 0; pdu < $scope.ProjData.length; pdu++) {
                var ind = pdu;
                if ($scope.ProjData[ind].PORTAL_URL !== null && !$scope.ProjData[ind].PORTAL_URL.startsWith('http')) {
                    //there is a url and it's not formatted
                    neededUpdating = true;
                    $scope.ProjData[ind].PORTAL_URL = 'http://' + $scope.ProjData[ind].PORTAL_URL;
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    $http.defaults.headers.common['X-HTTP-Method-Override'] = 'PUT';

                    DATA_HOST.save({ id: $scope.ProjData[ind].DATA_HOST_ID }, $scope.ProjData[ind]).$promise.then(function () {
                        delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                    });
                }
            }

            //modal for required at least 1 field..
            var openModal = function () {
                var modalInstance = $uibModal.open({
                    template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                        '<div class="modal-body"><p>You must populate at least one field.</p></div>' +
                        '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button></div>',
                    controller: function ($scope, $uibModalInstance) {
                        $scope.ok = function () {
                            $uibModalInstance.close('req');
                        };
                    },
                    size: 'sm'
                });
                modalInstance.result.then(function (fieldFocus) {
                    if (fieldFocus == "req") {
                        $("#DESCRIPTION").focus();
                    }
                });
            };

            //POST Data click
            $scope.AddData = function (valid, d) {
                if (valid) {
                    //add it
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    PROJECT.addProjData({ id: thisProjID }, d, function success(response) {                    
                        $scope.ProjData = response;

                        $scope.datumCount.total = $scope.ProjData.length;
                        $scope.newData = {};
                        $scope.projectForm.Data.$setPristine(true);
                        toastr.success("Data Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                } else {
                    //modal for enter all required fields
                    openModal();
                }
            };//end addData

            //DELETE Data click
            $scope.RemoveData = function (dataH) {
                //modal
                var modalInstance = $uibModal.open({
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
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';

                    PROJECT.deleteProjData({ id: thisProjID }, dataH, function success(response) {
                        $scope.ProjData.splice(index, 1); projDatum.splice(index, 1);
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

            //validate that at least 1 field is populated before saving edit
            $scope.ValidateAtLeastOne = function (d) {
                if ((d.DESCRIPTION === "" || d.DESCRIPTION === null) && (d.HOST_NAME === "" || d.HOST_NAME === null) && (d.PORTAL_URL === "" || d.PORTAL_URL === null)) {
                    toastr.error("Data Source not updated.");
                    openModal();
                    return "You need to populate at least one field."; //way to stop it from closing edit..just return something cuz modal is opening
                }
            };

            //editing, disable create parts
            $scope.EditRowClicked = function () {
                $scope.projectForm.Data.$pristine = false; //make sure form is not pristine in case they change tabs before hitting save/cancel
                $scope.isEditing = true; //disable create new fields until they hit save/cancel
            };

            //cancel edit
            $scope.CancelEditRowClick = function () {
                $scope.projectForm.Data.$setPristine(true);//make sure form is pristine
                $scope.isEditing = false;//enable create new fields
            };

            //Edit existing Data
            $scope.saveData = function (data, id) {
                if (this.rowform.$valid) {
                    var retur = false;
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    $http.defaults.headers.common['X-HTTP-Method-Override'] = 'PUT';
                    DATA_HOST.save({ id: id }, data, function success(response) {
                        retur = response; //maybe need to update the projData that this controller gets from resolve, for returning to this tab later
                        $scope.projectForm.Data.$setPristine(true);
                        toastr.success("Data Updated");
                    }, function error(errorResponse) {
                        retur = false;
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                    delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                    return retur;
                }
            };//end saveData
    }]);
})();