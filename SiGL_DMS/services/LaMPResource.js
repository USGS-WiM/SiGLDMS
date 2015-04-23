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
                getDMProjects: { method: 'GET', isArray: true, url:'/LaMPServices/projects/IndexProjects.json' },
                getProjDuration: { isArray: false, url: '/LaMPServices/projects/:id/projDuration.json' },
                getProjStatus: { isArray: false, url: '/LaMPServices/projects/:id/projStatus.json' },
                getProjKeywords: { isArray: true, url: '/LaMPServices/projects/:id/Keywords.json' },
                getProjObjectives: { isArray: true, url: '/LaMPServices/projects/:id/objectives.json' },
                getProjOrganizations: { isArray: true, url: '/LaMPServices/projects/:id/organizations.json' },
                getProjData: { isArray: true, url: '/LaMPServices/projects/:id/datahosts.json' },
                getProjContacts: { isArray: true, url: '/LaMPServices/projects/:id/contacts.json' },                
                getProjPublications: { isArray: true, url: '/LaMPServices/projects/:id/publications.json' },
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

    ////Durations
    laMPResource.factory('ProjDurations', ['$resource', function ($resource) {
        return $resource("/LaMPServices/ProjectDuration/:id.json",
            {}, {
                query: { isArray: true },                
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                update: { method: 'PUT', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);

    //Status
    laMPResource.factory('ProjStats', ['$resource', function ($resource) {
        return $resource("/LaMPServices/ProjectStatus/:id.json",
            {}, {
                query: { isArray: true },                
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                update: { method: 'PUT', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);

    //Organizations
    laMPResource.factory('Organizations', ['$resource', function ($resource) {
        return $resource("/LaMPServices/Organizations/:id.json",
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                update: { method: 'PUT', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of Organizations

    //ObjectiveTypes
    laMPResource.factory('ObjectiveTypes', ['$resource', function ($resource) {
        return $resource("/LaMPServices/Objectives/:id.json",
            {},{
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                update: { method: 'PUT', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of ObjectiveTypes

    laMPResource.factory('Login', ['$resource', function ($resource) {
        return $resource('/LaMPServices/login',
            {}, {
                login: { method: 'GET', cache: false, isArray: false }
            });
    }]);//end of Login

})();