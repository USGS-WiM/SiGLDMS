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
                getIndexProjects: { method: 'GET', isArray: true, url: rootURL + '/projects/IndexProjects.json' },
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
                addProjContact: { method: 'POST', cache: false, isArray: true, url: rootURL + '/projects/:id/addContact'},
                deleteProjContact: { method: 'POST', cache: false, isArray: false, url: rootURL + '/projects/:id/RemoveProjectContact' },
                getProjPublications: { isArray: true, url: rootURL + '/projects/:id/publications.json' },
                addProjPublication: { method: 'POST', cache: false, isArray: true, url: rootURL + '/projects/:id/addPublication.json' },
                deleteProjPublication: { method: 'POST', cache: false, isArray: false, url: rootURL + '/projects/:id/RemoveProjectPublication' },
                getProjSites: { isArray: true, url: rootURL + '/projects/:id/sites.json' },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false },
            });
    }]);
    
    //data manager
    laMPResource.factory('DataManager', ['$resource', function ($resource) {
        return $resource(rootURL + '/dataManagers/:id.json',
            {}, {
                query: { },
                getDMProject: { method: 'GET', isArray: true, url: rootURL + '/dataManagers/:id/projects.json' },     
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of media

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

    //Contact
    laMPResource.factory('Contact', ['$resource', function ($resource) {
        return $resource(rootURL + '/Contacts/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of Contact

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

    //sites
    laMPResource.factory('Site', ['$resource', function ($resource) {
        return $resource(rootURL + '/sites/:id.json',
            {}, {
                query: {},
                getSiteParameters: { isArray: true, url: rootURL + '/sites/:id/parameters.json' },
                addSiteParameter: { method: 'POST', cache: false, isArray: true, url: rootURL + '/sites/:id/addParameter' },
                deleteSiteParameter: { method: 'POST', cache: false, isArray: false, url: rootURL + '/sites/:id/removeParameter' },
                getSiteFrequencies: { isArray: true, url: rootURL + '/sites/:id/frequencies.json' },
                addSiteFrequency: { method: 'POST', cache: false, isArray: true, url: rootURL + '/sites/:id/addFrequency' },
                deleteSiteFrequency: { method: 'POST', cache: false, isArray: false, url: rootURL + '/sites/:id/removeFrequency' },
                getSiteMedia: { isArray: true, url: rootURL + '/sites/:id/media.json' },
                addSiteMedia: { method: 'POST', cache: false, isArray: true, url: rootURL + '/sites/:id/addMedium' },
                deleteSiteMedia: { method: 'POST', cache: false, isArray: false, url: rootURL + '/sites/:id/removeMedium' },
                getSiteResources: { isArray: true, url: rootURL + '/sites/:id/resourcetypes.json' },
                addSiteResource: { method: 'POST', cache: false, isArray: true, url: rootURL + '/sites/:id/addResourcetype' },
                deleteSiteResource: { method: 'POST', cache: false, isArray: false, url: rootURL + '/sites/:id/removeResourcetype' },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);

    //States
    laMPResource.factory('States', ['$resource', function ($resource) {
        return $resource(rootURL + '/states.json',
            {}, {
                getAll: { method: 'GET', isArray: true }
            });
    }]);

    //Lake
    laMPResource.factory('Lake', ['$resource', function ($resource) {
        return $resource(rootURL + '/lakes/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of Lake
        
    //statuses
    laMPResource.factory('SiteStatus', ['$resource', function ($resource) {
        return $resource(rootURL + '/status/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of statuses

    //resources
    laMPResource.factory('ResourceType', ['$resource', function ($resource) {
        return $resource(rootURL + '/resourcetypes/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of resources

    //media
    laMPResource.factory('MediaType', ['$resource', function ($resource) {
        return $resource(rootURL + '/media/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of media

    //frequencies
    laMPResource.factory('FrequencyType', ['$resource', function ($resource) {
        return $resource(rootURL + '/frequencies/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of frequencies

    //parameters
    laMPResource.factory('parameterType', ['$resource', function ($resource) {
        return $resource(rootURL + '/parameters/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of parameters

    laMPResource.factory('Login', ['$resource', function ($resource) {
        return $resource(rootURL + '/login',
            {}, {
                login: { method: 'GET', cache: false, isArray: false }
            });
    }]);//end of Login

})();