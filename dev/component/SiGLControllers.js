(function () {
    /* controllers.js 'ui.unique',*/
    'use strict';

    var siGLControllers = angular.module('siGLControllers', []);

    var ModalControllers = angular.module('ModalControllers', []);


    //#region FILTERS
    siGLControllers.filter('mapLakes', function () {
        var lakeHash = {
            1: 'Erie',
            2: 'Huron',
            3: 'Michigan',
            4: 'Ontario',
            5: 'Superior'
        };
        return function (input) {
            if (!input) {
                return '';
            } else {
                return lakeHash[input];
            }
        };
    });
    siGLControllers.filter('mapSiteStats', function () {
        var siteStatHash = {
            1: 'Active',
            2: 'Inactive'
        };
        return function (input) {
            if (!input) {
                return '';
            } else {
                return siteStatHash[input];
            }
        };
    });
    siGLControllers.filter('mapStates', function () {
        var stateHash = {
            'Illinois': "Illinois",
            'Indiana': "Indiana",
            'Michigan': "Michigan",
            'Minnesota': "Minnesota",
            'New York': "New York",
            'Ohio': "Ohio",
            'Pennsylvania': "Pennsylvania",
            'Wisconsin': "Wisconsin",
            'Ontario': "Ontario",
            'Quebec' : "Quebec"
        };
        return function (input) {
            if (!input) {
                return '';
            } else {
                return stateHash[input];
            }
        };
    });
    siGLControllers.filter('mapCountries', function () {
        var countryHash = {
            'Canada': 'Canada',
            'United States': 'United States'
        };
        return function (input) {
            if (!input) {
                return '';
            } else {
                return countryHash[input];
            }
        };
    });
    siGLControllers.filter('mapSiteResources', function () {
        var resourceHash = {
            1: 'Atmosphere',
            2: 'Beach',
            3: 'Drowned River Mouth',
            4: 'Embayment',
            5: 'Estuary',
            6: 'Ground Water',
            7: 'Harbors',
            8: 'Inland Lakes',
            9: 'Lake',
            10: 'Lake or Stream Bottom (Benthic Province)',
            11: 'Medium Nearshore',
            12: 'Offshore',
            13: 'River Mouth',
            14: 'River Substrate',
            15: 'Shallow Nearshore',
            16: 'Shoreline',
            17: 'Stormwater Conveyance System',
            18: 'Stream/River',
            19: 'Tributary',
            20: 'Water Column (Variable Depths; Pelagic Province)',
            21: 'Water Treatment Facility Intake',
            22: 'Wetland'
        };
        return function (input) {
            if (!input) {
                return '';
            } else {
                return resourceHash[input];
            }
        };
    });
    //#endregion FILTERS

    //#region CONSTANTS
    //regular expression for a password requirement of at least 8 characters long and at least 3 of 4 character categories used (upper, lower, digit, special
    siGLControllers.constant('RegExp', {
        password: /^(((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[A-Z])(?=.*[!@@?#$%^&_:;-]))|((?=.*[a-z])(?=.*[0-9])(?=.*[!@@?#$%^&_:;-]))|((?=.*[A-Z])(?=.*[0-9])(?=.*[!@@?#$%^&_:;-]))).{8,}$/
    });
    //#endregion CONSTANTS

    //#region $cookie names
    //'siGLCreds', 'siGLUsername', 'usersName', 'dmID', 'projListSortOrder', 'pl_reverse', 'siteListSortOrder', 'sl_reverse', 'DMListSortOrder', 'dml_reverse', 'DMprojectsSortOrder', 'dmpl_reverse'
    //#endregion $cookie names


})();
