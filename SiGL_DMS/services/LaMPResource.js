(function () {
    "use strict";

    //look up common service module, and register the new factory with that module 
    var laMPResource = angular.module('laMPResource', ['ngResource']);
    var rootURL = "/LaMPServices";
   // var rootURL = "/LaMPServicesTest";
    
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
                addProjOrg: { method: 'POST', cache: false, isArray: true, url: rootURL + '/projects/:id/AddOrganization.json' },
                deleteProjOrg: { method: 'POST', cache: false, isArray: false, url: rootURL + '/projects/:id/RemoveOrganization' },
                getProjData: { isArray: true, url: rootURL + '/projects/:id/datahosts.json' },
                addProjData: { method: 'POST', cache: false, isArray: true, url: rootURL + '/projects/:id/addDataHost.json' },
                deleteProjData: { method: 'POST', cache: false, isArray: false, url: rootURL + '/projects/:id/removeProjectDataHost' },
                updateProjData: { method: 'POST', cache: false, isArray: false, url: rootURL + '/datahosts'},
                getProjContacts: { isArray: true, url: rootURL + '/projects/:id/contacts.json' },
                getProjPublications: { isArray: true, url: rootURL + '/projects/:id/publications.json' },
                addProjPublication: { method: 'POST', cache: false, isArray: true, url: rootURL + '/projects/:id/addPublication.json' },
                deleteProjPublication: { method: 'POST', cache: false, isArray: false, url: rootURL + '/projects/:id/RemoveProjectPublication' },
                getProjSites: { isArray: true, url: rootURL + '/projects/:id/sites.json' },
                save: { method: 'POST', cache: false, isArray: false },
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
    laMPResource.factory('ProjDuration', ['$resource', function ($resource) {
        return $resource(rootURL + '/ProjectDuration/:id.json',
            {}, {
                query: { isArray: true },                
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);

    ////Data Hosts
    laMPResource.factory('DataHost', ['$resource', function ($resource) {
        return $resource(rootURL + '/DataHosts/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);

    ////Publications
    laMPResource.factory('Publication', ['$resource', function ($resource) {
        return $resource(rootURL + '/publications/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);

    //Status
    laMPResource.factory('ProjStat', ['$resource', function ($resource) {
        return $resource(rootURL + '/ProjectStatus/:id.json',
            {}, {
                query: { isArray: true },                
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                update: { method: 'PUT', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);

    //Organization
    laMPResource.factory('Organization', ['$resource', function ($resource) {
        return $resource(rootURL + '/Organizations/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of Organization

    //ObjectiveType
    laMPResource.factory('ObjectiveType', ['$resource', function ($resource) {
        return $resource(rootURL + '/Objectives/:id.json',
            {},{
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                update: { method: 'PUT', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of ObjectiveType

    laMPResource.factory('Login', ['$resource', function ($resource) {
        return $resource(rootURL + '/login',
            {}, {
                login: { method: 'GET', cache: false, isArray: false }
            });
    }]);//end of Login

})();