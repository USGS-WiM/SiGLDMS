(function () {
    "use strict";

    //look up common service module, and register the new factory with that module 
    var laMPResource = angular.module('laMPResource', ['ngResource']);

    //projects
    laMPResource.factory('Projects', ['$resource', function ($resource) {
        return $resource("/LaMPServices/projects/:projectId.json",
            {}, {
                'query': {method:'GET', isArray: true},
                save: {method: 'POST', cache: false, isArray: false},
                update: {method: 'PUT', cache: false, isArray: false},
                delete: {method: 'DELETE', cache: false, isArray: false}
            });
    }]);

    //sites
    laMPResource.factory("sites", ["$resource", function ($resource) {
        return $resource("/LaMPServices/sites/:siteId.json",
            {}, {
                get: { method: 'GET', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                update: { method: 'PUT', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);

//    function laMPResource($resource, $location) {
//        var services = {s
//            getProject: getProject,
//            getProjectOrgs: getProjectOrgs,
//            getDurations: getDurationList,
//            getProjStats: getProjStatList
//        }
//        return services;
////        return $resource("/LaMPServices/projects/:projectId.json")
//    };

//    function getProject() {
//        return $resource("/LaMPServices/projects/:projectId.json")
//            .then(getProjectComplete)
//            .catch(function (message) {
//                //exception.catcher('XHR Failed for project')(message);
//                $location.url('/');
//                alert(message)
//            });
//        function getProjectComplete(data, status, headers, config) {
//            return data.data[0].data.results;
//        }
//    }

//    function getProjectOrgs() {
//        return $resource("/LaMPServices/projects/:projectId/organizations.json")
//            .then(getProjectOrgComplete)
//            .catch(function (message) {
//                //exception.catcher('XHR Failed for project')(message);
//                $location.url('/');
//                alert(message)
//            });
//        function getProjectOrgComplete(data, status, headers, config) {
//            return data.data[0].data.results;
//        }
//    }

//    function getDurationList() {
//        return $resource("/LaMPServices/projects/:projectId/ProjectDuration.json")
//            .then(getDurationComplete)
//            .catch(function (message) {
//                //exception.catcher('XHR Failed for project')(message);
//                $location.url('/');
//                alert(message)
//            });
//        function getDurationComplete(data, status, headers, config) {
//            return data.data[0].data.results;
//        }
//    }
//    function getProjStatList() {
//        return $resource("/LaMPServices/projects/:projectId/ProjectStatus.json")
//            .then(getProjStatComplete)
//            .catch(function (message) {
//                //exception.catcher('XHR Failed for project')(message);
//                $location.url('/');
//                alert(message)
//            });
//        function getProjStatComplete(data, status, headers, config) {
//            return data.data[0].data.results;
//        }
//    }
}());

//, //headers: { 'Authorization': 'Basic bGFtcGFkbWluOmNhZk9SNF95Ug==', 'Content-Type': 'application/json' }

/*
*
*  Base64 encode / decode
//  http://www.webtoolkit.info/


var Base64 = {

    // private property
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode: function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },

    // public method for decoding
    decode: function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = Base64._utf8_decode(output);

        return output;

    },

    // private method for UTF-8 encoding
    _utf8_encode: function (string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode: function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while (i < utftext.length) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }

}*/