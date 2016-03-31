(function () {
    "use strict"; 
    var ModalControllers = angular.module('ModalControllers',  []);

   
    //popup confirm box
    ModalControllers.controller('ConfirmModalCtrl', ['$scope', '$uibModalInstance', 'keyToRemove', 'what',
        function ($scope, $uibModalInstance, keyToRemove, what) {
            //todo: figure out how removing url is handled.. "URL"
            switch (what) {
                case "URL":
                    $scope.keyToRmv = keyToRemove;
                    break;
                case "Keyword":
                    //keyword
                    $scope.keyToRmv = keyToRemove.TERM;
                    break;
                case "Organization":
                    $scope.keyToRmv = keyToRemove.OrganizationName;
                    break;
                case "Data":
                    var DstringToUse = keyToRemove.DESCRIPTION !== null ? keyToRemove.DESCRIPTION : keyToRemove.HOST_NAME;
                    DstringToUse = DstringToUse !== null ? DstringToUse : keyToRemove.PORTAL_URL;
                    $scope.keyToRmv = DstringToUse;
                    break;
                case "Contact":
                    $scope.keyToRmv = keyToRemove.NAME;
                    break;
                case "Publication":
                    var stringToUse = keyToRemove.TITLE !== null ? keyToRemove.TITLE : keyToRemove.DESCRIPTION;
                    stringToUse = stringToUse !== null ? stringToUse : keyToRemove.URL;
                    $scope.keyToRmv = stringToUse;
                    break;
                case "Frequency Type":
                    $scope.keyToRmv = keyToRemove.FREQUENCY;
                    break;
                case "Lake Type":
                    $scope.keyToRmv = keyToRemove.LAKE;
                    break;
                case "Media Type":
                    $scope.keyToRmv = keyToRemove.MEDIA;
                    break;
                case "Objective Type":
                    $scope.keyToRmv = keyToRemove.OBJECTIVE;
                    break;
                case "Parameter Type":
                    $scope.keyToRmv = keyToRemove.PARAMETER;
                    break;
                case "Resource Type":
                    $scope.keyToRmv = keyToRemove.RESOURCE_NAME;
                    break;
                case "Project Duration":
                    $scope.keyToRmv = keyToRemove.DURATION_VALUE;
                    break;
                case "Project Status Type":
                    $scope.keyToRmv = keyToRemove.STATUS_VALUE;
                    break;
                case "Status Type":
                    $scope.keyToRmv = keyToRemove.STATUS;
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