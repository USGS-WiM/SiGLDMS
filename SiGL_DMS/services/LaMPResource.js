(function () {
    "use strict";

    //look up common service module, and register the new factory with that module 
    var laMPResource = angular.module('laMPResource', ['ngResource']);
    var rootURL = "/LaMPServices";
   // var rootURL = "/LaMPServicesTest";

    //CONTACT
    laMPResource.factory('CONTACT', ['$resource', function ($resource) {
        return $resource(rootURL + '/Contacts/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of Contact

    //DATA_HOST
    laMPResource.factory('DATA_HOST', ['$resource', function ($resource) {
        return $resource(rootURL + '/DataHosts/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);

    //DATA_MANAGER
    laMPResource.factory('DATA_MANAGER', ['$resource', function ($resource) {
        return $resource(rootURL + '/dataManagers/:id.json',
            {}, {
                query: {},
                addDataManager: { method: 'POST', cache: false, isArray: false, url: rootURL + '/dataManagers/:pass/addDataManager' },
                getDMProject: { method: 'GET', isArray: true, url: rootURL + '/projects/IndexProjects.json' }, //?DataManager={dmID}     
                getAll: { method: 'GET', isArray: true },
                changePW: {method:'GET', isArray:false, url: rootURL + '/dataManagers.json'},
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of media

    //DIVISION
    laMPResource.factory('DIVISION', ['$resource', function ($resource) {
        return $resource(rootURL + '/Divisions/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of DIVISION

    //FREQUENCY_TYPE
    laMPResource.factory('FREQUENCY_TYPE', ['$resource', function ($resource) {
        return $resource(rootURL + '/frequencies/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of frequencies

    //LAKE
    laMPResource.factory('LAKE_TYPE', ['$resource', function ($resource) {
        return $resource(rootURL + '/lakes/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of Lake

    //MEDIA_TYPE
    laMPResource.factory('MEDIA_TYPE', ['$resource', function ($resource) {
        return $resource(rootURL + '/media/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of media

    //OBJECTIVE_TYPE
    laMPResource.factory('OBJECTIVE_TYPE', ['$resource', function ($resource) {
        return $resource(rootURL + '/Objectives/:id.json',
            {},{
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                update: { method: 'PUT', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of OBJECTIVE_TYPE

    //ORGANIZATION
    laMPResource.factory('ORGANIZATION', ['$resource', function ($resource) {
        return $resource(rootURL + '/Organizations/:id.json',
            {}, {
                query: { isArray: true },
                getAll: {method: 'GET', isArray: true},               
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of ORGANIZATION

    //ORGANIZATION_RESOURCE
    laMPResource.factory('ORGANIZATION_RESOURCE', ['$resource', function ($resource) {
        return $resource(rootURL + '/OrgResources/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },                
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of ORGANIZATION_RESOURCE

    //ORGANIZATION_SYSTEM
    laMPResource.factory('ORGANIZATION_SYSTEM', ['$resource', function ($resource) {
        return $resource(rootURL + '/OrganizationSystems/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of ORGANIZATION_SYSTEM

    //PARAMETER_TYPE
    laMPResource.factory('PARAMETER_TYPE', ['$resource', function ($resource) {
        return $resource(rootURL + '/parameters/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of parameters

    //PROJECT
    laMPResource.factory('PROJECT', ['$resource', function ($resource) {
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
                addProjOrg: { method: 'GET', cache: false, isArray: true, url: rootURL + '/projects/:id/AddOrganizationSystem.json' },//?organizationId={orgId}&divisionId={divId}&sectionId={secId}
                deleteProjOrg: { method: 'GET', cache: false, isArray: false, url: rootURL + '/projects/:id/RemoveOrganization' },//?orgId={orgSysId}
                getProjData: { isArray: true, url: rootURL + '/projects/:id/datahosts.json' },
                addProjData: { method: 'POST', cache: false, isArray: true, url: rootURL + '/projects/:id/addDataHost.json' },
                deleteProjData: { method: 'POST', cache: false, isArray: false, url: rootURL + '/projects/:id/removeProjectDataHost' },
                updateProjData: { method: 'POST', cache: false, isArray: false, url: rootURL + '/datahosts'},
                getProjContacts: { isArray: true, url: rootURL + '/projects/:id/contacts.json' },
                addProjContact: { method: 'POST', cache: false, isArray: true, url: rootURL + '/projects/:id/addContact.json'}, //?organizationId={orgId}&divisionId={divId}&sectionId={secId}'},
                deleteProjContact: { method: 'POST', cache: false, isArray: false, url: rootURL + '/projects/:id/RemoveProjectContact' },
                getProjPublications: { isArray: true, url: rootURL + '/projects/:id/publications.json' },
                addProjPublication: { method: 'POST', cache: false, isArray: true, url: rootURL + '/projects/:id/addPublication.json' },
                deleteProjPublication: { method: 'POST', cache: false, isArray: false, url: rootURL + '/projects/:id/RemoveProjectPublication' },
                getProjSites: { isArray: true, url: rootURL + '/projects/:id/sites.json' },
                getFullSiteList: { isArray: true, url: rootURL + '/Sites/FullSiteInfo/:projId.json' },
                updateDM: {isArray: false, cache: false, url: rootURL + '/projects/:id/ReassignProject'}, // ?DataManager={dataManagerId}
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false },
            });
    }]);
    
    //PROJ_DURATION
    laMPResource.factory('PROJ_DURATION', ['$resource', function ($resource) {
        return $resource(rootURL + '/ProjectDuration/:id.json',
            {}, {
                query: { isArray: true },                
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);

    //PROJ_STATUS
    laMPResource.factory('PROJ_STATUS', ['$resource', function ($resource) {
        return $resource(rootURL + '/ProjectStatus/:id.json',
            {}, {
                query: { isArray: true },                
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                update: { method: 'PUT', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
   
    //PUBLICATION
    laMPResource.factory('PUBLICATION', ['$resource', function ($resource) {
        return $resource(rootURL + '/publications/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);

    //RESOURCE_TYPE
    laMPResource.factory('RESOURCE_TYPE', ['$resource', function ($resource) {
        return $resource(rootURL + '/resourcetypes/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of resources

    //ROLE
    laMPResource.factory('ROLE', ['$resource', function ($resource) {
        return $resource(rootURL + '/roles/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of role

    //SECTION
    laMPResource.factory('SECTION', ['$resource', function ($resource) {
        return $resource(rootURL + '/Sections/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of SECTION
 
    //SITE
    laMPResource.factory('SITE', ['$resource', function ($resource) {
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

    //STATES
    laMPResource.factory('STATES', ['$resource', function ($resource) {
        return $resource(rootURL + '/states.json',
            {}, {
                getAll: { method: 'GET', isArray: true }
            });
    }]);
   
    //STATUS_TYPE
    laMPResource.factory('STATUS_TYPE', ['$resource', function ($resource) {
        return $resource(rootURL + '/status/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of statuses

    laMPResource.factory('LOGIN', ['$resource', function ($resource) {
        return $resource(rootURL + '/login',
            {}, {
                login: { method: 'GET', cache: false, isArray: false }
            });
    }]);//end of Login

})();