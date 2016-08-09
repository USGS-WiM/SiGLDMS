(function () {
    'use strict';

    var siGLControllers = angular.module('siGLControllers'); 
    
    siGLControllers.controller('projDataCtrl', ['$scope', '$cookies', '$http', '$uibModal', 'PROJECT', 'DATA_HOST', 'thisProject', 'projDatum',
        function ($scope, $cookies, $http, $uibModal, PROJECT, DATA_HOST, thisProject, projDatum) {
            $scope.ProjData = projDatum;
            var neededUpdating = false; //if the url isn't formatted, flag so know to PUT it after fixing
            $scope.isEditing = false; //disables form inputs while user is editing existing data up top
            $scope.newData = {}; //holder
            var thisProjID = thisProject.project_id; //projectID

            //if any ProjDatum, make sure the url (if one) is formatted properly
            for (var pdu = 0; pdu < $scope.ProjData.length; pdu++) {
                var ind = pdu;
                if ($scope.ProjData[ind].portal_url !== undefined && !$scope.ProjData[ind].portal_url.startsWith('http')) {
                    //there is a url and it's not formatted
                    neededUpdating = true;
                    $scope.ProjData[ind].portal_url = 'http://' + $scope.ProjData[ind].portal_url;
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    DATA_HOST.update({ id: $scope.ProjData[ind].data_host_id }, $scope.ProjData[ind]).$promise;
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
                        $("#description").focus();
                    }
                });
            };

            //POST Data click
            $scope.AddData = function (valid, d) {
                if (valid) {
                    //add it
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    d.project_id = thisProjID;
                    DATA_HOST.save(d, function success(response) {                    
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
                    var Dindex = $scope.ProjData.indexOf(dataH);
                    //DELETE it
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    DATA_HOST.delete({ id: dataH.data_host_id }, function success(response) {
                        $scope.ProjData.splice(Dindex, 1);
                        $scope.datumCount.total = $scope.datumCount.total - 1;
                        toastr.success("Data Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                });
                //end modal
            };

            //validate that at least 1 field is populated before saving edit
            $scope.ValidateAtLeastOne = function (d) {
                if ((d.description === "" || d.description === null) && (d.host_name === "" || d.host_name === null) && (d.portal_url === "" || d.portal_url === null)) {
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
                    DATA_HOST.update({ id: id }, data, function success(response) {
                        retur = response; //maybe need to update the projData that this controller gets from resolve, for returning to this tab later
                        $scope.projectForm.Data.$setPristine(true);
                        toastr.success("Data Updated");
                    }, function error(errorResponse) {
                        retur = false;
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                    return retur;
                }
            };//end saveData
    }]);
})();