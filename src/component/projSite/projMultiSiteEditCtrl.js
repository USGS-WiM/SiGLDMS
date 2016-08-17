(function () {
    'use strict';

    var siGLControllers = angular.module('siGLControllers');

    siGLControllers.controller('projMultiSiteEditCtrl', ['$scope', '$rootScope', '$http', '$state', '$uibModal', 'hotRegisterer', 'allProjSites', 'thisProject', 'CountryList', 'stateList', 'lakeList', 'siteStatList', 'resourceList', 'mediaList', 'frequencyList', 'parameterList', 'SITE',
        function ($scope, $rootScope, $http, $state,$uibModal, hotRegisterer, allProjSites, thisProject, CountryList, stateList, lakeList, siteStatList, resourceList, mediaList, frequencyList, parameterList , SITE) {
            //dropdowns and multiselects [siteStatList, lakeList, stateList, CountryList, resourceList, mediaList, frequencyList, parameterList]
            $scope.siteStatuses = siteStatList;
            $scope.lakes = lakeList;
            $scope.stateArray = stateList;
            $scope.countryArray = CountryList;
            $scope.resources = resourceList;
            $scope.medias = mediaList;
            $scope.frequencies = frequencyList;
            $scope.parameters = parameterList;
            $scope.somethingChanged = true; // set to false and if they change the table, switch
            $scope.hotInstance;
            $scope.projSiteObjects = angular.copy(allProjSites);
            $scope.columnWidths = [5, 130, 80, 84, 98, 92, 88, 98, 92, 120, 90, 120, 120, 120, 100, 100, 120, 120, 100,
                    20, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, //phys
                    20, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80,  //chem
                    20, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, //bio
                    20, 80, 80, 80, 80, //micro
                    20, 80, 80, 80, 80];//tox
            $scope.lakeArray = []; $scope.statusArray = []; $scope.resourceArray = []; $scope.mediaArray = []; $scope.frequencyArray = []; 

            var addParametersToPsite = function (ps) {
                for (var para = 0; para < $scope.parameters.length; para++) {
                    ps[$scope.parameters[para].parameter] = null;
                }
                return ps;
            };
            //convert each array objects to array of strings for handsontable dropdown
            angular.forEach($scope.lakes, function (l) { $scope.lakeArray.push(l.lake); });
            angular.forEach($scope.siteStatuses, function (s) { $scope.statusArray.push(s.status); });
            //angular.forEach($scope.resources, function (r) { $scope.resourceArray.push(r.resource_name); }); //angular.forEach($scope.medias, function (m) { $scope.mediaArray.push(m.media) });//angular.forEach($scope.frequencies, function (f) { $scope.frequencyArray.push(f.frequency) });
           
            //format data object for handsontable
            $scope.setUpDataForTable = function () {
                $scope.projSites = [];
                var originalPrSi = angular.copy(allProjSites);
                angular.forEach(originalPrSi, function (psite) {
                    //add all parameters as columns to later loop through to apply checked if present
                    psite = addParametersToPsite(psite);
                    //#region start and end date - remove time part of date string
                    if (psite.StartDate !== "") {
                        //cut off time
                        var sIndex = psite.StartDate.indexOf(" ");
                        psite.StartDate = psite.StartDate.substring(0, sIndex);
                        //add leading zero for month and day
                        var sMIndex = psite.StartDate.indexOf("/");
                        if (sMIndex <= 1) psite.StartDate = "0" + psite.StartDate;

                        var sDIndex = psite.StartDate.lastIndexOf("/");
                        if (sDIndex <= 4) psite.StartDate = psite.StartDate.slice(0, sDIndex - 1) + "0" + psite.StartDate.slice(sDIndex - 1);
                    }
                    if (psite.EndDate !== "") {
                        var eIndex = psite.EndDate.indexOf(" ");
                        psite.EndDate = psite.EndDate.substring(0, eIndex);
                        //add leading zero for month and day
                        var eMIndex = psite.EndDate.indexOf("/");
                        if (eMIndex <= 1) psite.EndDate = "0" + psite.EndDate;

                        var eDIndex = psite.EndDate.lastIndexOf("/");
                        if (eDIndex <= 4) psite.EndDate = psite.EndDate.slice(0, eDIndex - 1) + "0" + psite.EndDate.slice(eDIndex - 1);
                    }
                    //#endregion
                    //#region make a comma separated string for each thing if more than 1
                    if (psite.Resources.length > 0) {
                        var resString = "";
                        for (var r = 0; r < psite.Resources.length; r++) {
                            resString += psite.Resources[r].resource_name;
                            if (r < psite.Resources.length - 1) resString += ", ";
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
                            psite[p.parameter] = "x";
                        });
                    }
                    //#endregion
                    $scope.projSites.push(psite);
                });
            };
            $scope.setUpDataForTable(); //call it after creating it to run, called again in 'reset'
            
            //they want to add/remove resources 
            var getMultiModal = function (col, row, whichOne) {
                var prevValues = $scope.hotInstance.getDataAtCell(row, col);
                var aModal = $uibModal.open({
                    template: '<div class="modal-header"><h3 class="modal-title">{{which}}</h3></div>' +
                        '<div class="modal-body"><p>Choose {{which}}:</p><p><ul><li style="list-style:none;" ng-repeat="r in resourceList">' +
                        '<input type="checkbox" name="resources" ng-model="r.selected" ng-click="addRes(r)"/><span>{{ r.resource_name || r.media || r.frequency }}</span></li></ul></p></div>' +
                        '<div class="modal-footer"><button class="btn btn-primary" ng-enter="ok()" ng-click="ok()">OK</button></div>',
                    backdrop: 'static',
                    keyboard: false,
                    resolve: {
                        allResources: function () {
                            if (whichOne == "Resources") {
                                return $scope.resources;
                            } else if (whichOne == "Media") {
                                return $scope.medias;
                            } else {
                                return $scope.frequencies;
                            }
                        },
                        chosenValues: function () { return prevValues; },
                        whichEntities: function () { return whichOne; }
                    },
                    controller: function ($scope, $uibModalInstance, allResources, chosenValues, whichEntities) {
                        //add selected prop to each resource
                        $scope.which = whichEntities;
                        $scope.resourceList = angular.copy(allResources);
                        $scope.chosenResStringArray = [];
                        if (chosenValues !== null) {
                            $scope.resourceString = angular.copy(chosenValues.split(","));
                            angular.forEach($scope.resourceString, function (crs) {
                                $scope.chosenResStringArray.push(crs.trim());
                            });
                        }
                        //add selected and select if in chosenResStringArray
                        for (var i = 0; i < $scope.resourceList.length; i++) {
                            for (var y = 0; y < $scope.chosenResStringArray.length; y++) {
                                if ($scope.chosenResStringArray[y] == $scope.resourceList[i].resource_name || $scope.chosenResStringArray[y] == $scope.resourceList[i].media || $scope.chosenResStringArray[y] == $scope.resourceList[i].frequency) {
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
                                switch(whichEntities){
                                    case "Resources":
                                        $scope.chosenResStringArray.push(res.resource_name);
                                        break;
                                    case "Media":
                                        $scope.chosenResStringArray.push(res.media);
                                        break;
                                    case "Frequencies":
                                        $scope.chosenResStringArray.push(res.frequency);
                                        break;
                                }
                            } else {
                                var resInd = $scope.chosenResStringArray.map(function (r) { return r; }).indexOf(res.resource_name);
                                var mInd = $scope.chosenResStringArray.map(function (r) { return r; }).indexOf(res.media);
                                var fInd = $scope.chosenResStringArray.map(function (r) { return r; }).indexOf(res.frequency);
                                if (resInd >= 0) $scope.chosenResStringArray.splice(resInd, 1);
                                if (mInd >= 0) $scope.chosenResStringArray.splice(mInd, 1);
                                if (fInd >= 0) $scope.chosenResStringArray.splice(fInd, 1);
                            }
                        };
                        $scope.ok = function () {
                            $uibModalInstance.close($scope.chosenResStringArray.join(", "));
                        };
                    },
                    size: 'md'
                });
                aModal.result.then(function (newVal) {
                    $scope.hotInstance.setDataAtCell(row, col, newVal);
                });
            };

            $scope.requiredField = function (value, callback) {
                var t = value;
            };
            //go back to siteList (no changes)
            $scope.cancel = function () {
                $state.go("site.siteList");
            };

            $scope.reset = function () {
                $scope.setUpDataForTable();
                $scope.hotInstance.loadData($scope.projSites);
            };
            //all done making changes, save it and go back to siteList
            $scope.save = function () {
                var newData = $scope.hotInstance.getCellMeta();
//                var newData = $scope.hotInstance.getData();
                // drop the last 3 since they are empty
                for (var i = newData.length; i--;) {
                    if (newData[i][0] === null && newData[i][1] === null && newData[i][2] === null) {
                        newData.splice(i, 1);
                    }
                }
                //put back into objects
                for (var n = 0; n < newData.length; n++) {

                }
                $rootScope.stateIsLoading = { showLoading: false }; //Loading...
                

                //go through and 
               // $state.go("site.siteList");
            };

            //make the parameter divider columns gray
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
                afterInit: function () {
                    $scope.hotInstance = this;
                },               
                fixedColumnsLeft: 2,
                manualColumnResize: true,
                manualRowResize: true,
                wordWrap: false,
                viewportColumnRenderingOffsetNumber: 1,
                colWidths: $scope.columnWidths,
                cells: function (row, col, prop) {
                    //physical, chemical,biological, microbio, tox
                    if (col === 0 || col === 19 || col === 46 || col === 65 || col === 82 || col === 87) {
                        var cellprops = {}; cellprops.renderer = colorRenderer;
                        return cellprops;
                    }
                },
                afterOnCellMouseDown: function (event,coords,td){
                    if (coords.col == 10 && event.realTarget.className == "htAutocompleteArrow") 
                        getMultiModal(coords.col, coords.row, "Resources");
                    if (coords.col == 11 && event.realTarget.className == "htAutocompleteArrow") 
                        getMultiModal(coords.col, coords.row, "Media");
                    if (coords.col == 12 && event.realTarget.className == "htAutocompleteArrow")
                        getMultiModal(coords.col, coords.row, "Frequencies");                    
                },//end afterOnCellMouseDown 
                onAfterChange: function (change, source) {
                    //change is an array containing arrays for each column affected: [0] = row, [1] = dataName, [2] = value it was, [3] = value it is 
                    //source is string : "alter', "empty', "edit', "populateFromArray', "loadData', "autofill', "paste".              
                    if (source != 'loadData') {
                        var h = $scope.projSiteObjects;
                        angular.forEach(change, function (c) {
                            var thisRow = $scope.hotInstance.getDataAtRow(c[0]);
                            if (thisRow[0] !== null) { //there's a SiteId (editing)
                                var thisOne = $scope.projSiteObjects.filter(function (pso) { return pso.SiteId == thisRow[0]; })[0]; //the projSite being edited
                                var thisOneIndex = $scope.projSiteObjects.map(function (s) { return s.SiteId; }).indexOf(thisRow[0]); //index of this projSite being edited

                            } else {
                                //new rows are being created
                            }
                        });//end foreach change
                        var blah = 'stophere';
                        //var dataRow = hot.getSourceDataAtRow(index)
                        // .... saveChanges...                    
                    }
                }
            };
        

        }]);
})();