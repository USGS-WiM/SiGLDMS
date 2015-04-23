(function () {
    'use strict';

    var siGLBusinessServices = angular.module('siGLBusinessServices', ['ngCookies']);

    //check the status of user's credentials. if return false = redirect to login 
    siGLBusinessServices.factory('checkCreds', ['$cookies', function ($cookies) {
        return function () {
            var returnVal = false;
            var siGLCreds = $cookies.siGLCreds;

            if (siGLCreds !== undefined && siGLCreds !== "") {
                return true;
            }
            return returnVal;
        };
    }]);

    //retrieve user's 'token' from cookie
    siGLBusinessServices.factory('getCreds', ['$cookies', function ($cookies) {
        return function () {
            var returnVal = "";
            var siGLCreds = $cookies.siGLCreds;

            if (siGLCreds !== undefined && siGLCreds !== "") {
                returnVal = btoa(siGLCreds);
            }
            return returnVal;
        };
    }]);

    //get the username to use throughout the application
    siGLBusinessServices.factory('getUsername', ['$cookies', function ($cookies) {
        return function () {
            var returnVal = "";
            var siGLUsername = $cookies.siGLUsername;

            if (siGLUsername !== undefined && siGLUsername !== "") {
                returnVal = siGLUsername;
            }
            return returnVal;
        };
    }]);

    //set the credentials when user logs in
    siGLBusinessServices.factory('setCreds', ['$cookies', function ($cookies) {
        return function (un, pw) {
            var token = un.concat(":", pw);
            $cookies.siGLCreds = token;
            $cookies.siGLUsername = un;
        };
    }]);

    //delete the credentials
    siGLBusinessServices.factory('deleteCreds', ['$cookies', function ($cookies) {
        return function () {
            $cookies.siGLCreds = "";
            $cookies.siGLUsername = "";
        };
    }]);

    //set the USER when user logs in
    siGLBusinessServices.factory('setUser', ['$cookies', function ($cookies) {
        return function (user) {        
            $cookies.user = {
                "name": user.FNAME + " " + user.LNAME,
                "userID": user.DATA_MANAGER_ID,
                "roleID": user.ROLE_ID
            };
        };
    }]);

    //retrieve user from cookie
    siGLBusinessServices.factory('getUser', ['$cookies', function ($cookies) {
        return function () {
            var returnVal = "";
            var user = $cookies.user;

            if (user !== undefined && user !== "") {
                returnVal = user;
            }
            return returnVal;
        };
    }]);

    //get lookups from cookie
    siGLBusinessServices.factory('getProjectLookups', ['$cookies', function ($cookies) {
        return function () {
            var returnVal = [];
            var PDurationList = $cookies.PDurationList;
            var PStatusList = $cookies.PStatusList;
            var PObjectiveList = $cookies.PObjectiveList;

            if (PDurationList !== undefined && PDurationList !== "") {
                returnVal[0] = PDurationList;
                returnVal[0] = PStatusList;
                returnVal[0] = PObjectiveList;
            }
            return returnVal;
        };
    }]);

    //set lookups to cookie
    siGLBusinessServices.factory('setProjectLookups', ['$cookies', '$http', function ($cookies, $http) {
        return function () {
            $http.get('/LaMPServices/ProjectDuration.json').success(function (response) {
                $cookies.PDurationList = response;
            });

            $http.get('/LaMPServices/ProjectStatus.json').success(function (response) {
                $cookies.PStatusList = response;
            });

            $http.get('/LaMPServices/Objectives.json').success(function (response) {
                $cookies.PObjectiveList = response;
            });
        };
    }]);

})();