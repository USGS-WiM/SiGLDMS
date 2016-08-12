(function () {
    'use strict';

    var siGLControllers = angular.module('siGLControllers');

    siGLControllers.controller('projPublicationCtrl', ['$scope', '$cookies', '$http', '$uibModal', 'PROJECT', 'thisProject', 'PUBLICATION', 'ProjParts_Service',
        function ($scope, $cookies, $http, $uibModal, PROJECT, thisProject, PUBLICATION, ProjParts_Service) {
            $scope.ProjPubs = ProjParts_Service.getAllProjectPubs();// projPubs;
            $scope.isEditing = false; //disables form inputs while user is editing existing data up top
            $scope.newPub = {
            };
            var thisProjID = thisProject.project_id;

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
                        $("#title").focus();
                    }
                });
            };

            //#region POST Pub click
            $scope.AddPub = function (valid, p) {
                if (valid) {
                    //add it
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';                    
                    PROJECT.addProjPublication({ id: thisProjID}, p, function success(response) {
                        $scope.ProjPubs = response;
                        ProjParts_Service.setAllProjectPubs($scope.ProjPubs);
                        $scope.pubCount.total = $scope.ProjPubs.length;
                        $scope.newPub = {};
                        $scope.projectForm.Pubs.$setPristine(true);
                        toastr.success("Publication Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                } else {
                    //modal for enter all required fields
                    openModal();
                }
            };
            //#endregion POST Pub click

            //#region DELETE Pub click
            $scope.RemovePub = function (pub) {
                //modal
                var modalInstance = $uibModal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        keyToRemove: function () {
                            return pub;
                        },
                        what: function () {
                            return "Publication";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    //yes, remove this keyword
                    var index = $scope.ProjPubs.indexOf(pub);
                    //DELETE it
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                   // $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';

                    PROJECT.deleteProjPublication({ id: thisProjID, PublicationId: pub.publication_id }, function success(response) {
                        $scope.ProjPubs.splice(index, 1); ProjParts_Service.setAllProjectPubs($scope.ProjPubs);
                        $scope.pubCount.total = $scope.pubCount.total - 1;
                        toastr.success("Publication Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                  //  delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                }, function () {
                    //logic for cancel
                });
                //end modal
            };
            //#endregion DELETE Pub click

            //validate that at least 1 field is populated before saving edit
            $scope.ValidateAtLeastOne = function (d) {
                if ((d.title === "" || d.title === null) && (d.description === "" || d.description === null) && (d.url === "" || d.url === null)) {
                    toastr.error("Publication not updated.");
                    openModal();
                    return "You need to populate at least one field."; //way to stop it from closing edit..just return something cuz modal is opening
                }
            };

            $scope.EditRowClicked = function () {
                //make sure form is not pristine in case they change tabs before hitting save/cancel
                $scope.projectForm.Pubs.$pristine = false;
                //disable create new fields until they hit save/cancel
                $scope.isEditing = true;
            };

            $scope.CancelEditRowClick = function () {
                //make sure form is not pristine in case they change tabs before hitting save/cancel
                $scope.projectForm.Pubs.$setPristine(true);
                //disable create new fields until they hit save/cancel
                $scope.isEditing = false;
            };

            //#region Edit existing Data
            $scope.savePub = function (data, id) {
                var test;
                var retur = false;
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';                

                PUBLICATION.update({ id: id }, data, function success(response) {
                    retur = response;
                    $scope.projectForm.Pubs.$setPristine(true);
                    toastr.success("Publication Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };
            //#endregion Edit existing Data

        }]);
})();