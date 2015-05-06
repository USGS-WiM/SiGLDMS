(function () {
    "use strict";

    //look up common service module, and register the new factory with that module 
    var laMPResource = angular.module('laMPResource', ['ngResource']);
    var rootURL = "/LaMPServices";

    
    //projects
    laMPResource.factory('Projects', ['$resource', function ($resource) {
        return $resource(rootURL + '/projects/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                getDMProjects: { method: 'GET', isArray: true, url: rootURL + '/projects/IndexProjects.json' },
                getProjDuration: { isArray: false, url: rootURL + '/projects/:id/projDuration.json' },
                getProjStatus: { isArray: false, url: rootURL + '/projects/:id/projStatus.json' },
                getProjKeywords: { isArray: true, url: rootURL + '/projects/:id/Keywords.json' },
                addProjKeyword: { method: 'POST', cache: false, isArray: true, url: rootURL + '/projects/:id/addKeyword'},
                deleteProjKeyword: { method: 'POST', cache: false, isArray: false, url: rootURL + '/projects/:id/removeKeyword' },
                getProjObjectives: { isArray: true, url: rootURL + '/projects/:id/objectives.json' },
                addProjObjective: {method: 'POST', cache: false, isArray: true, url: rootURL + '/projects/:id/addObjective'},
                deleteProjObjective: { method: 'POST', cache: false, isArray: false, url: rootURL + '/projects/:id/removeObjective' },
                getProjOrganizations: { isArray: true, url: rootURL + '/projects/:id/organizations.json' },
                getProjData: { isArray: true, url: rootURL + '/projects/:id/datahosts.json' },
                getProjContacts: { isArray: true, url: rootURL + '/projects/:id/contacts.json' },
                getProjPublications: { isArray: true, url: rootURL + '/projects/:id/publications.json' },
                getProjSites: { isArray: true, url: rootURL + '/projects/:id/sites.json' },
                save: { method: 'POST', cache: false, isArray: false, url: rootURL + '/projects' },
                delete: { method: 'DELETE', cache: false, isArray: false },
            });
    }]);

    //sites
    laMPResource.factory('Sites', ['$resource', function ($resource) {
        return $resource(rootURL + '/sites/:siteId.json',
            {}, {
                get: { method: 'GET', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                update: { method: 'PUT', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);

    ////Durations
    laMPResource.factory('ProjDurations', ['$resource', function ($resource) {
        return $resource(rootURL + '/ProjectDuration/:id.json',
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
        return $resource(rootURL + '/ProjectStatus/:id.json',
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
        return $resource(rootURL + '/Organizations/:id.json',
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
        return $resource(rootURL + '/Objectives/:id.json',
            {},{
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                update: { method: 'PUT', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of ObjectiveTypes

    laMPResource.factory('Login', ['$resource', function ($resource) {
        return $resource(rootURL + '/login',
            {}, {
                login: { method: 'GET', cache: false, isArray: false }
            });
    }]);//end of Login

})();