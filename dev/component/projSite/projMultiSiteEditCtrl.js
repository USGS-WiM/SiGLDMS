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
                    ps[$scope.parameters[para].parameter] = "n";
                }
                return ps;
            }
            //convert each array objects to array of strings for handsontable dropdown
            angular.forEach($scope.lakes, function (l) { $scope.lakeArray.push(l.lake); });
            angular.forEach($scope.siteStatuses, function (s) { $scope.statusArray.push(s.status); });
            //angular.forEach($scope.resources, function (r) { $scope.resourceArray.push(r.resource_name); }); //angular.forEach($scope.medias, function (m) { $scope.mediaArray.push(m.media) });//angular.forEach($scope.frequencies, function (f) { $scope.frequencyArray.push(f.frequency) });
           
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
                        psite[p.parameter] = "y";
                    });
                }
                //#endregion
                $scope.projSites.push(psite);
            });
            
            //they want to add/remove resources 
            var getResourcesModal = function (col, row, prevValues) {
                //Resources modal to pick from
                var resModal = $uibModal.open({
                    template: '<div class="modal-header"><h3 class="modal-title">Resources</h3></div>' +
                        '<div class="modal-body"><p>Choose Resources:</p><p><ul><li style="list-style:none;" ng-repeat="r in resourceList">' +
                        '<input type="checkbox" name="resources" ng-model="r.selected" ng-click="addRes(r)"/><span>{{ r.resource_name }}</span></li></ul></p></div>' +
                        '<div class="modal-footer"><button class="btn btn-primary" ng-enter="ok()" ng-click="ok()">OK</button></div>',
                    backdrop: 'static',
                    keyboard: false,
                    resolve: {
                        allResources: function () { return $scope.resources; },
                        chosenValues: function () { return prevValues; }
                    },
                    controller: function ($scope, $uibModalInstance, allResources, chosenValues) {
                        //add selected prop to each resource
                        $scope.resourceList = angular.copy(allResources);
                        $scope.chosenResStringArray = [];
                        if (chosenValues != null) {
                            $scope.resourceString = angular.copy(chosenValues.split(","));
                            angular.forEach($scope.resourceString, function (crs) {
                                $scope.chosenResStringArray.push(crs.trim());
                            });
                        }
                        //add selected and select if in chosenResStringArray
                        for (var i = 0; i < $scope.resourceList.length; i++) {
                            for (var y = 0; y < $scope.chosenResStringArray.length; y++) {
                                if ($scope.chosenResStringArray[y] == $scope.resourceList[i].resource_name) {
                                    $scope.resourceList[i].selected = true;
                                    y = $scope.chosenResStringArray.length;
                                }
                                else $scope.resourceList[i].selected = false;
                            }
                            if ($scope.chosenResStringArray.length === 0) $scope.resourceList[i].selected = false;
                        }//end foreach resource

                        //selected or not selected ..add or remove from chosen ones to pass back
                        $scope.addRes = function (res) {
                            if (res.selected) {
                                $scope.chosenResStringArray.push(res.resource_name);
                            } else {
                                var resInd = $scope.chosenResStringArray.map(function (r) { return r; }).indexOf(res.resource_name);
                                if (resInd >= 0) $scope.chosenResStringArray.splice(resInd, 1);
                            }
                        }
                        $scope.ok = function () {
                            $uibModalInstance.close($scope.chosenResStringArray.join(", "));
                        };
                    },
                    size: 'md'
                });
                resModal.result.then(function (newVal) {
                    hotRegisterer.getInstance('tableinstance').setDataAtCell(row, col, newVal);
                });
            }

            //they want to add/remove media 
            var getMediaModal = function (col, row, prevValues) {
                //Resources modal to pick from
                var medModal = $uibModal.open({
                    template: '<div class="modal-header"><h3 class="modal-title">Media</h3></div>' +
                        '<div class="modal-body"><p>Choose Media:</p><p><ul><li style="list-style:none;" ng-repeat="m in mediaList">' +
                        '<input type="checkbox" name="media" ng-model="m.selected" ng-click="addMed(m)"/><span>{{ m.media }}</span></li></ul></p></div>' +
                        '<div class="modal-footer"><button class="btn btn-primary" ng-enter="ok()" ng-click="ok()">OK</button></div>',
                    backdrop: 'static',
                    keyboard: false,
                    resolve: {
                        allMedia: function () { return $scope.medias; },
                        chosenValues: function () { return prevValues; }
                    },
                    controller: function ($scope, $uibModalInstance, allMedia, chosenValues) {
                        //add selected prop to each resource
                        $scope.mediaList = angular.copy(allMedia);
                        $scope.chosenMedStringArray = [];
                        if (chosenValues != null) {
                            $scope.medString = angular.copy(chosenValues.split(","));
                            angular.forEach($scope.medString, function (crs) {
                                $scope.chosenMedStringArray.push(crs.trim());
                            });
                        }
                        //add selected and select if in chosenResStringArray
                        for (var i = 0; i < $scope.mediaList.length; i++) {
                            for (var y = 0; y < $scope.chosenMedStringArray.length; y++) {
                                if ($scope.chosenMedStringArray[y] == $scope.mediaList[i].media) {
                                    $scope.mediaList[i].selected = true;
                                    y = $scope.chosenMedStringArray.length;
                                }
                                else $scope.mediaList[i].selected = false;
                            }
                            if ($scope.chosenMedStringArray.length === 0) $scope.mediaList[i].selected = false;
                        }//end foreach resource

                        //selected or not selected ..add or remove from chosen ones to pass back
                        $scope.addMed = function (med) {
                            if (med.selected) {
                                $scope.chosenMedStringArray.push(med.media);
                            } else {
                                var mInd = $scope.chosenMedStringArray.map(function (m) { return m; }).indexOf(med.media);
                                if (mInd >= 0) $scope.chosenMedStringArray.splice(mInd, 1);
                            }
                        }
                        $scope.ok = function () {
                            $uibModalInstance.close($scope.chosenMedStringArray.join(", "));
                        };
                    },
                    size: 'md'
                });
                medModal.result.then(function (newVal) {
                    hotRegisterer.getInstance('tableinstance').setDataAtCell(row, col, newVal);
                });
            }

            //they want to add/remove freq 
            var getFrequencyModal = function (col, row, prevValues) {
                //Resources modal to pick from
                var freqModal = $uibModal.open({
                    template: '<div class="modal-header"><h3 class="modal-title">Frequency</h3></div>' +
                        '<div class="modal-body"><p>Choose Resources:</p><p><ul><li style="list-style:none;" ng-repeat="f in frequencyList">' +
                        '<input type="checkbox" name="freq" ng-model="f.selected" ng-click="addFreq(f)"/><span>{{ f.frequency }}</span></li></ul></p></div>' +
                        '<div class="modal-footer"><button class="btn btn-primary" ng-enter="ok()" ng-click="ok()">OK</button></div>',
                    backdrop: 'static',
                    keyboard: false,
                    resolve: {
                        allFrequencies: function () { return $scope.frequencies; },
                        chosenValues: function () { return prevValues; }
                    },
                    controller: function ($scope, $uibModalInstance, allFrequencies, chosenValues) {
                        $scope.frequencyList = angular.copy(allFrequencies);
                        $scope.chosenFreqStringArray = [];
                        if (chosenValues != null) {
                            $scope.frequencyString = angular.copy(chosenValues.split(","));
                            angular.forEach($scope.frequencyString, function (crs) {
                                $scope.chosenFreqStringArray.push(crs.trim());
                            });
                        }
                        //add selected and select if in chosenResStringArray
                        for (var i = 0; i < $scope.frequencyList.length; i++) {
                            for (var y = 0; y < $scope.chosenFreqStringArray.length; y++) {
                                if ($scope.chosenFreqStringArray[y] == $scope.frequencyList[i].frequency) {
                                    $scope.frequencyList[i].selected = true;
                                    y = $scope.chosenFreqStringArray.length;
                                }
                                else $scope.frequencyList[i].selected = false;
                            }
                            if ($scope.chosenFreqStringArray.length === 0) $scope.frequencyList[i].selected = false;
                        }//end foreach resource

                        //selected or not selected ..add or remove from chosen ones to pass back
                        $scope.addFreq = function (freq) {
                            if (freq.selected) {
                                $scope.chosenFreqStringArray.push(freq.frequency);
                            } else {
                                var resInd = $scope.chosenFreqStringArray.map(function (r) { return r; }).indexOf(freq.frequency);
                                if (resInd >= 0) $scope.chosenFreqStringArray.splice(resInd, 1);
                            }
                        }
                        $scope.ok = function () {
                            $uibModalInstance.close($scope.chosenFreqStringArray.join(", "));
                        };
                    },
                    size: 'md'
                });
                freqModal.result.then(function (newVal) {
                    hotRegisterer.getInstance('tableinstance').setDataAtCell(row, col, newVal);
                });
            }

            var colorRenderer = function (instance, td, row, col, prop, value, cellProperties) {
                Handsontable.renderers.TextRenderer.apply(this, arguments);
                td.style.background = '#EEE';
                return td;
            };

            //handsontable settings
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
                colWidths: [130, 80, 84, 98, 92, 88, 98, 92, 120, 90, 120, 120, 120, 100, 100, 120, 120, 100,
                    20, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, //phys
                    20, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80,  //chem
                    20, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, //bio
                    20, 80, 80, 80, 80, //micro
                    20, 80, 80, 80,80],
                cells: function (row, col, prop) {
                    //physical, chemical,biological, microbio, tox
                    if (col == 18 || col == 45 || col == 64 || col == 81 || col == 86) {
                        var cellprops = {}; cellprops.renderer = colorRenderer;
                    }
                    return cellprops;
                },
                afterOnCellMouseDown: function (event,coords,td){
                    if (coords.col == 10 && event.realTarget.className == "htAutocompleteArrow") {
                        var c = coords.col; var r = coords.row;
                        var values = hotRegisterer.getInstance('tableinstance').getDataAtCell(r, c);
                        getResourcesModal(c, r, values);
                    };
                    if (coords.col == 11 && event.realTarget.className == "htAutocompleteArrow") {
                        var c = coords.col; var r = coords.row;
                        var values = hotRegisterer.getInstance('tableinstance').getDataAtCell(r, c);
                        getMediaModal(c, r, values);
                    };
                    if (coords.col == 12 && event.realTarget.className == "htAutocompleteArrow") {
                        var c = coords.col; var r = coords.row;
                        var values = hotRegisterer.getInstance('tableinstance').getDataAtCell(r, c);
                        getFrequencyModal(c, r, values);
                    };
                }//afterOnCellMouseDown
            };
        

        }]);
})();