(function () {
    'use strict';

    var siGLControllers = angular.module('siGLControllers');

    siGLControllers.controller('projMultiSiteEditCtrl', ['$scope', '$http', '$state', '$uibModal', 'hotRegisterer', 'allProjSites', 'thisProject', 'CountryList', 'stateList', 'lakeList', 'siteStatList', 'resourceList', 'mediaList', 'frequencyList', 'parameterList', 'SITE',
        function ($scope, $http, $state,$uibModal, hotRegisterer, allProjSites, thisProject, CountryList, stateList, lakeList, siteStatList, resourceList, mediaList, frequencyList, parameterList , SITE) {
            //dropdowns and multiselects [siteStatList, lakeList, stateList, CountryList, resourceList, mediaList, frequencyList, parameterList]
            $scope.siteStatuses = siteStatList;
            $scope.lakes = lakeList;
            $scope.stateArray = stateList;
            $scope.countryArray = CountryList;
            $scope.resources = resourceList;
            $scope.medias = mediaList;
            $scope.frequencies = frequencyList;
            $scope.parameters = parameterList;            
            
            $scope.lakeArray = []; $scope.statusArray = []; $scope.resourceArray = []; $scope.mediaArray = []; $scope.frequencyArray = []; $scope.projSites = [];

            var addParametersToPsite = function (ps){
                for (var para = 0; para < $scope.parameters.length; para++) {
                    ps[$scope.parameters[para].parameter] = "no";
                }
                return ps;
            }
            //convert each array objects to array of strings for handsontable dropdown
            angular.forEach($scope.lakes, function (l) { $scope.lakeArray.push(l.lake); });
            angular.forEach($scope.siteStatuses, function (s) { $scope.statusArray.push(s.status); });
            angular.forEach($scope.resources, function (r) { $scope.resourceArray.push(r.resource_name); });
            angular.forEach($scope.medias, function (m) { $scope.mediaArray.push(m.media) });
            angular.forEach($scope.frequencies, function (f) { $scope.frequencyArray.push(f.frequency) });
           
            //format data object for handsontable
            angular.forEach(allProjSites, function (psite) {
                //add all parameters as columns to later loop through to apply checked if present
                psite = addParametersToPsite(psite);
                //#region start and end date - remove time part of date string
                if (psite.StartDate != "") {
                    var dIndex = psite.StartDate.indexOf(" ");
                    psite.StartDate = psite.StartDate.substring(0, dIndex);
                }
                if (psite.EndDate != "") {
                    var edIndex = psite.EndDate.indexOf(" ");
                    psite.EndDate = psite.EndDate.substring(0, edIndex);
                }
                //#endregion
                //#region make a comma separated string for each thing if more than 1
                if (psite.Resources.length > 0){
                    var resString = "";
                    for (var r = 0; r < psite.Resources.length; r++){
                        resString += psite.Resources[r].resource_name;
                        if (r < psite.Resources.length-1) resString += ", ";
                    }
                    psite.ResourceStrings = resString;
                }
                if (psite.Media.length > 0) {
                    var medString = "";
                    for (var m = 0; m < psite.Media.length; m++) {
                        medString += psite.Media[m].media;
                        if (m < psite.Media.length - 1) medString += ", ";
                    }
                    psite.MediaStrings = medString;
                }
                if (psite.Frequencies.length > 0) {
                    var freqString = "";
                    for (var f = 0; f < psite.Frequencies.length; f++) {
                        freqString += psite.Frequencies[f].frequency;
                        if (f < psite.Frequencies.length - 1) freqString += ", ";
                    }
                    psite.FrequencyStrings = freqString;
                }
                //#endregion
                //#region deal with pulling apart parameters for individual checkboxs
                if (psite.Parameters.length > 0) {
                    angular.forEach(psite.Parameters, function (p) {
                        psite[p.parameter] = "yes";
                    });
                }
                //#endregion
                $scope.projSites.push(psite);
            });
            
            $scope.cellClicks = 0;
            $scope.rowCell = [];
            $scope.tableSettings = {
                colHeaders: true,
                rowHeaders: true,
                contextMenu: ['row_above', 'row_below', 'remove_row'],
                minSpareRows: 3,
                //colWidths: [],
                fixedColumnsLeft: 1,
                manualColumnResize: true,
                manualRowResize: true,
                wordWrap: false,
                viewportColumnRenderingOffsetNumber: 1,               
                afterOnCellMouseDown: function (r, p, r2, p2) { //(r: Number, p: Number, r2: Number, p2: Number)
                    $scope.cellClicks++;
                    $scope.rowCell.push({ c: p.col, r: p.row });
                    if ($scope.cellClicks == 2 && ($scope.rowCell[0].c == $scope.rowCell[1].c && $scope.rowCell[0].r == $scope.rowCell[1].r)) {
                        if (p.col == 10) {
                            var values = hotRegisterer.getInstance('tableinstance').getDataAtCell(p.row, p.col);
                            //Resources
                            var resModal = $uibModal.open({
                                template: '<div class="modal-header"><h3 class="modal-title">Resources</h3></div>' +
                                    '<div class="modal-body"><p>Choose Resources:</p><p><ul><li style="list-style:none;" ng-repeat="r in resourceList">' +
                                    '<input type="checkbox" name="resources" ng-click="addRes(r)"/><span>{{ r }}</span></li></ul></p></div>' +
                                    '<div class="modal-footer"><button class="btn btn-primary" ng-enter="ok()" ng-click="ok()">OK</button></div>',
                                backdrop: 'static',
                                keyboard: false,
                                resolve: {
                                    allResources: function () { return $scope.resourceArray; }, chosenValues: function () { return values; }
                                },
                                controller: function ($scope, $uibModalInstance, allResources, chosenValues) {
                                    $scope.resourceList = allResources;
                                    $scope.resourceString = chosenValues;
                                    $scope.addRes = function (res) {
                                        $scope.resourceString += res + ", ";
                                    }
                                    $scope.ok = function () {
                                        $uibModalInstance.close($scope.resourceString);
                                    };
                                },
                                size: 'md'
                            });
                            resModal.result.then(function (r) {
                                //Handsontable.setDataAtCell(p.row, p.col, 'new value');
                                hotRegisterer.getInstance('tableinstance').setDataAtCell(p.row, p.col, r);
                            });
                        }
                        //p.col = 11 == Media, 12 == Frequencies, 10 == Resources
                        //p.row                        
                    } else { if ($scope.cellClicks >= 2) { $scope.cellClicks = 0; $scope.rowCell = []; } }
                }//afterOnCellMouseDown
            };
        

        }]);
})();