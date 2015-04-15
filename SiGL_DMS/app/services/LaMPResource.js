(function () {
    "use strict";

    //look up common service module, and register the new factory with that module 
    var laMPResource = angular.module('laMPResource', ['ngResource']);

    //projects
    laMPResource.factory('Projects', ['$resource', function ($resource) {
        return $resource("/LaMPServices/projects/:id.json",
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                update: { method: 'PUT', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);

    //projectsObjectives
    laMPResource.factory('ProjObjectives', ['$resource', function ($resource) {
        return $resource("/LaMPServices/projects/:id/objectives.json",
            {}, {
                query: {isArray: true},
                save: { method: 'POST', cache: false, isArray: false },
                update: { method: 'PUT', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);

    //sites
    laMPResource.factory('Sites', ['$resource', function ($resource) {
        return $resource("/LaMPServices/sites/:siteId.json",
            {}, {
                get: { method: 'GET', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                update: { method: 'PUT', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);

    //project Durations
    laMPResource.factory('ProjDurations', ['$resource', function ($resource) {
        return $resource("/LaMPServices/ProjectDuration/:id.json",
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                update: { method: 'PUT', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);

    //project Status
    laMPResource.factory('ProjStats', ['$resource', function ($resource) {
        return $resource("/LaMPServices/ProjectStatus/:id.json",
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                update: { method: 'PUT', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);

    //project Durations
    laMPResource.factory('ProjKeywords', ['$resource', function ($resource) {
        return $resource("/LaMPServices/Projects/:id/Keywords.json",
            {}, {
                query: {isArray:true},
                save: { method: 'POST', cache: false, isArray: false },
                update: { method: 'PUT', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
})();