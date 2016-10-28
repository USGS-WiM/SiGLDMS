(function () {
    "use strict"; 
    var ModalControllers = angular.module('ModalControllers');

   
    //popup confirm box
    ModalControllers.controller('ConfirmModalCtrl', ['$scope', '$uibModalInstance', 'keyToRemove', 'what',
        function ($scope, $uibModalInstance, keyToRemove, what) {
            //todo: figure out how removing url is handled.. "URL"
            switch (what) {
                case "url":
                    $scope.keyToRmv = keyToRemove;
                    break;
                case "Keyword":
                    //keyword
                    $scope.keyToRmv = keyToRemove.term;
                    break;
                case "Organization":
                    $scope.keyToRmv = keyToRemove.OrganizationName;
                    break;
                case "Data":
                    var DstringToUse = keyToRemove.description !== null ? keyToRemove.description : keyToRemove.host_name;
                    DstringToUse = DstringToUse !== null ? DstringToUse : keyToRemove.portal_url;
                    $scope.keyToRmv = DstringToUse;
                    break;
                case "Contact":
                    $scope.keyToRmv = keyToRemove.name;
                    break;
                case "Publication":
                    var stringToUse = keyToRemove.title !== null ? keyToRemove.title : keyToRemove.description;
                    stringToUse = stringToUse !== null ? stringToUse : keyToRemove.url;
                    $scope.keyToRmv = stringToUse;
                    break;
                case "Frequency Type":
                    $scope.keyToRmv = keyToRemove.frequency;
                    break;
                case "Lake Type":
                    $scope.keyToRmv = keyToRemove.lake;
                    break;
                case "Media Type":
                    $scope.keyToRmv = keyToRemove.media;
                    break;
                case "Monitoring Coordination":
                    $scope.keyToRmv = keyToRemove.effort;
                    break;
                case "Objective Type":
                    $scope.keyToRmv = keyToRemove.objective;
                    break;
                case "Parameter Type":
                    $scope.keyToRmv = keyToRemove.parameter;
                    break;
                case "Resource Type":
                    $scope.keyToRmv = keyToRemove.resource_name;
                    break;
                case "Project Duration":
                    $scope.keyToRmv = keyToRemove.duration_value;
                    break;
                case "Project Status Type":
                    $scope.keyToRmv = keyToRemove.status_value;
                    break;
                case "Status Type":
                    $scope.keyToRmv = keyToRemove.status;
                    break;
                case "Project":
                    $scope.keyToRmv = keyToRemove.Name;
                    break;
                case "Site":
                    $scope.keyToRmv = keyToRemove.Name;
                    break;
                default:
                    $scope.keyToRmv = "error";
            }

            $scope.what = what;

            $scope.ok = function () {
                $uibModalInstance.close(keyToRemove);
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
        }]);
}());