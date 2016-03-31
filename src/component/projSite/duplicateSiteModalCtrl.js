(function () {
    'use strict';

    var ModalControllers = angular.module('ModalControllers', []);

    ModalControllers.controller('duplicateSiteModalCtrl', ['$scope', '$uibModalInstance', 'thisSiteID',
        function ($scope, $uibModalInstance, thisSiteID) {
            var nameToSendBack = {};
            $scope.newSite = {};
            $scope.ok = function () {
                nameToSendBack.name = $scope.newSite.NAME;
                nameToSendBack.id = thisSiteID;
                $uibModalInstance.close(nameToSendBack);
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
        }]);
})();
