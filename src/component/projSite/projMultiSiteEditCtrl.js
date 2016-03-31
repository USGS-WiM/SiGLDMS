(function () {
    'use strict';

    var siGLControllers = angular.module('siGLControllers');

    siGLControllers.controller('projMultiSiteEditCtrl', ['$scope', '$cookies', '$location', '$http', '$state', 'thisProject', 'SITE', 'projSites', 'lakeList',
        'CountryList', 'stateList', 'siteStatList', 'resourceList', 'mediaList', 'frequencyList', 'parameterList',
        function ($scope, $cookies, $location, $http, $state, thisProject, SITE, projSites, lakeList, CountryList, stateList, siteStatList, resourceList,
            mediaList, frequencyList, parameterList) {
        //    //need id/value format for ui-grid
        //    $scope.formatArray = function (o) {
        //        var newlyFormatted = [];
        //        for (var x = 0; x < o.length; x++) {
        //            var thisone = {
        //                'id': x + 1, 'value': o[x]
        //            };
        //            newlyFormatted.push(thisone);
        //        }
        //        return newlyFormatted;
        //    };

        //    //dropdowns and multiselects
        //    $scope.countryArray = $scope.formatArray(CountryList);
        //    $scope.stateArray = $scope.formatArray(stateList);
        //    $scope.lakeArray = lakeList;
        //    $scope.statusArray = siteStatList;
        //    $scope.resourceArray = resourceList;//  $scope.convertToArray(resourceList);
        //    $scope.mediaArray = mediaList;// $scope.convertToArray(mediaList);
        //    $scope.frequencyArray = frequencyList;// $scope.convertToArray(frequencyList);
        //    $scope.paramsArray = parameterList;// $scope.convertToArray(parameterList);


        //    //http://stackoverflow.com/questions/26245495/using-an-ng-option-dropdown-in-a-ui-grid-editablecelltemplate-ng-grid-3-x  //
        //    $scope.gridOptions = {
        //        enableSorting: true,
        //        columnDefs: [
        //{
        //    name: 'NAME', enableCellEdit: true, enableCellEditOnFocus: true, width: 200
        //},
        //        {
        //            name: 'LATITUDE', type: 'string', enableCellEdit: true, enableCellEditOnFocus: true, width: 100
        //        },
        //    {
        //        name: 'LONGITUDE', type: 'string', enableCellEdit: true, enableCellEditOnFocus: true, width: 100,
        //    },
        //        {
        //            name: 'COUNTRY', editType: 'dropdown', width: 200,
        //            editableCellTemplate: 'ui-grid/dropdownEditor', enableCellEdit: true, enableCellEditOnFocus: true,
        //            editDropdownOptionsArray: $scope.countryArray, editDropdownValueLabel: 'value', editDropdownIdLabel: 'value',
        //            cellFilter: 'mapCountries'
        //        },
        //                {
        //                    name: 'STATE_PROVINCE', displayName: 'State', editType: 'dropdown', width: 100,
        //                    editableCellTemplate: 'ui-grid/dropdownEditor', enableCellEdit: true, enableCellEditOnFocus: true,
        //                    editDropdownOptionsArray: $scope.stateArray, editDropdownValueLabel: 'value', editDropdownIdLabel: 'value',
        //                    cellFilter: 'mapStates'
        //                },
        //                    {
        //                        name: 'LAKE_TYPE_ID', displayName: 'Lake', editType: 'dropdown', width: 100,
        //                        editableCellTemplate: 'ui-grid/dropdownEditor', enableCellEdit: true, enableCellEditOnFocus: true,
        //                        editDropdownOptionsArray: $scope.lakeArray, editDropdownIdLabel: 'LAKE_TYPE_ID',
        //                        editDropdownValueLabel: 'LAKE', cellFilter: 'mapLakes'
        //                    },
        //    {
        //        name: 'WATERBODY', width: 200,
        //        enableCellEdit: true, enableCellEditOnFocus: true
        //    },
        //    {
        //        name: 'WATERSHED_HUC8', displayName: 'Watershed (HUC8)', width: 100,
        //        enableCellEdit: true, enableCellEditOnFocus: true
        //    },
        //    {
        //        name: 'DESCRIPTION', width: 200,
        //        enableCellEdit: true, enableCellEditOnFocus: true
        //    },
        //    {
        //        name: 'STATUS_TYPE_ID', displayName: 'Status', editType: 'dropdown', width: 100, editableCellTemplate: 'ui-grid/dropdownEditor',
        //        enableCellEdit: true, enableCellEditOnFocus: true, editDropdownOptionsArray: $scope.statusArray, editDropdownIdLabel: 'STATUS_ID',
        //        editDropdownValueLabel: 'STATUS', cellFilter: 'mapSiteStats'
        //    },
        //    {
        //        name: 'RESOURCE_TYPE', displayName: 'Resource Component', multiselect: true, editType: 'dropdown', width: 200, editableCellTemplate: 'ui-grid/dropdownEditor',
        //        enableCellEdit: true, enableCellEditOnFocus: true, editDropdownOptionsArray: $scope.resourceArray, editDropdownIdLabel: 'RESOURCE_TYPE_ID',
        //        editDropdownValueLabel: 'RESOURCE_NAME', cellFilter: 'mapSiteResources'
        //    }
        //        ]
        //    };

        //    $scope.gridOptions.data = projSites;

        }]);
})();