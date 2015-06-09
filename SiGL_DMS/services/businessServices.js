(function () {
    'use strict';

    var siGLBusinessServices = angular.module('siGLBusinessServices', ['ngCookies']);

    //#region SETTERS
    //set the credentials (encodedToken, username, usersName, usersRole)  when user logs in
    siGLBusinessServices.factory('setCreds', ['$cookies', function ($cookies) {
        return function (un, pw, userName, userRole, userID) {
            var token = un.concat(":", pw);
            $cookies.siGLCreds = token;

            $cookies.siGLUsername = un;
            $cookies.usersName = userName;
            $cookies.dmID = userID;
            var roleName;
            switch(userRole) {
                case 1:
                    roleName = "Admin";
                    break;
                case 2:
                    roleName = "Manager";
                    break;
                default:
                    roleName = "Public";
                    break;
            }
            $cookies.usersRole = roleName;
        };
    }]);

    siGLBusinessServices.factory('setLoggedIn', ['$cookies', function ($cookies) {
        var loggedIn = false;
        return {
            isLoggedIn: function () {
                return loggedIn;
            },
            changeLoggedIn: function (YesOrNo) {
                loggedIn = YesOrNo;

            }
        };
    }]);

    //#endregion SETTERS

    //#region GETTERS
    //check the status of user's credentials. if return false = redirect to login 
    siGLBusinessServices.factory('checkCreds', ['$cookies', function ($cookies) {
        return function () {
            var returnVal = false;
            var siGLCreds = $cookies.siGLCreds;

            if (siGLCreds !== undefined && siGLCreds !== "") {
                returnVal = true;
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

    //retrieve user from cookie
    siGLBusinessServices.factory('getUsersNAME', ['$cookies', function ($cookies) {
        return function () {
            var returnVal = "";
            var usesName = $cookies.usersName;

            if (usesName !== undefined && usesName !== "") {
                returnVal = usesName;
            }
            return returnVal;
        };
    }]);

    //retrieve users ID from cookie
    siGLBusinessServices.factory('getUserID', ['$cookies', function ($cookies) {
        return function () {
            var returnVal = "";
            var userID = $cookies.dmID;

            if (userID !== undefined && userID !== "") {
                returnVal = userID;
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

    //get the Role to use throughout the application
    siGLBusinessServices.factory('getUserRole', ['$cookies', function ($cookies) {
        return function () {
            var returnVal = "";
            var userRole = $cookies.usersRole;

            if (userRole !== undefined && userRole !== "") {
                returnVal = userRole;
            }
            return returnVal;
        };
    }]);
    //#endregion GETTERS

    //DELETE////////////////////////
    //delete the credentials
    siGLBusinessServices.factory('deleteCreds', ['$cookies', function ($cookies) {
        return function () {
            $cookies.siGLCreds = "";
            $cookies.siGLUsername = "";
            $cookies.usersName = "";
            $cookies.usersRole = "";
        };
    }]);
})();