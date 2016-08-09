(function () {
    "use strict";

    //look up common service module, and register the new factory with that module
    var laMPResource = angular.module('laMPResource', ['ngResource']);
    var rootURL = "https://sigldev.wim.usgs.gov/SiGLServices";
   // var rootURL = "https://localhost/SiGLServices";


    //#region CONTACT
    laMPResource.factory('CONTACT', ['$resource', function ($resource) {
        return $resource(rootURL + '/Contacts/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of Contact
    //#endregion
    //#region DATA_HOST
    laMPResource.factory('DATA_HOST', ['$resource', function ($resource) {
        return $resource(rootURL + '/DataHosts/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', isArray: true, cache: false},
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion
    //#region DATA_MANAGER
    laMPResource.factory('DATA_MANAGER', ['$resource', function ($resource) {
        return $resource(rootURL + '/dataManagers/:id.json',
            {}, {
                query: {},
                addDataManager: { method: 'POST', cache: false, isArray: false, url: rootURL + '/dataManagers/:pass/addDataManager' },
                getDMProject: { method: 'GET', isArray: true, url: rootURL + '/projects/IndexProjects.json' }, //?DataManager={dmID}
                getAll: { method: 'GET', isArray: true },
                getDMListModel: {method: 'GET', isArray: true, url: rootURL + '/dataManagers/DMList.json'},
                changePW: {method:'GET', isArray:false, url: rootURL + '/dataManagers.json'},
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of media
    //#endregion
    //#region DIVISION
    laMPResource.factory('DIVISION', ['$resource', function ($resource) {
        return $resource(rootURL + '/Divisions/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of DIVISION
    //#endregion
    //#region FREQUENCY_TYPE
    laMPResource.factory('FREQUENCY_TYPE', ['$resource', function ($resource) {
        return $resource(rootURL + '/frequencies/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                getFreqProj: {method:'GET', isArray: true, cache:false, url: rootURL + '/frequencies/:id/projects.json'},
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of frequencies
    //#endregion
    //#region LAKE
    laMPResource.factory('LAKE_TYPE', ['$resource', function ($resource) {
        return $resource(rootURL + '/lakes/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                getLakeProj: { method: 'GET', isArray: true, cache: false, url: rootURL + '/lakes/:id/projects.json' },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of Lake
    //#endregion
    //#region MEDIA_TYPE
    laMPResource.factory('MEDIA_TYPE', ['$resource', function ($resource) {
        return $resource(rootURL + '/media/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                getMediaProj: { method: 'GET', isArray: true, cache: false, url: rootURL + '/media/:id/projects.json' },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of media
    //#endregion
    //#region OBJECTIVE_TYPE
    laMPResource.factory('OBJECTIVE_TYPE', ['$resource', function ($resource) {
        return $resource(rootURL + '/Objectives/:id.json',
            {},{
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                getObjProj: { method: 'GET', isArray: true, cache: false, url: rootURL + '/objectives/:id/projects.json'},
                save: { method: 'POST', cache: false, isArray: false },
                update: { method: 'PUT', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of OBJECTIVE_TYPE
    //#endregion
    //#region ORGANIZATION
    laMPResource.factory('ORGANIZATION', ['$resource', function ($resource) {
        return $resource(rootURL + '/Organizations/:id.json',
            {}, {
                query: { isArray: true },
                getAll: {method: 'GET', isArray: true},
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of ORGANIZATION
    //#endregion
    //#region ORGANIZATION_SYSTEM
    laMPResource.factory('ORGANIZATION_SYSTEM', ['$resource', function ($resource) {
        return $resource(rootURL + '/OrganizationSystems/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                getOrgProjects: { method: 'GET', isArray: true, url: rootURL + '/OrganizationSystems/:id/projects' },
                getOrgResources: { method: 'GET', isArray: true, url: rootURL + '/OrganizationSystems/OrgResources.json' }, // used to be 'lampservices/OrgResources'
                queryResources: { isArray: true, url: rootURL + '/OrganizationSystems/OrgResources/:orgSystemId' },// used to be 'lampservices/OrgResources/{resourceId}' NOT USED ANYWHERE YET
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of ORGANIZATION_SYSTEM
    //#endregion
    //#region PARAMETER_TYPE
    laMPResource.factory('PARAMETER_TYPE', ['$resource', function ($resource) {
        return $resource(rootURL + '/parameters/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                getParamProj: { method: 'GET', isArray: true, cache: false, url: rootURL + '/parameters/:id/projects.json' },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of parameters
    //#endregion
    //#region PROJECT
    laMPResource.factory('PROJECT', ['$resource', function ($resource) {
        return $resource(rootURL + '/projects/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                getIndexProjects: { method: 'GET', isArray: true, url: rootURL + '/projects/IndexProjects.json' },
                getProjDuration: { isArray: false, url: rootURL + '/projects/:id/projDuration.json' },
                getProjStatus: { isArray: false, url: rootURL + '/projects/:id/projStatus.json' },
                getProjKeywords: { isArray: true, url: rootURL + '/projects/:id/Keywords.json' },
                addProjKeyword: { method: 'POST', cache: false, isArray: true, params: { id: '@id', Word: '@term' }, url: rootURL + '/projects/:id/addKeyword' },//?Word={term}
                deleteProjKeyword: { method: 'DELETE', cache: false, isArray: false, params: {id: '@id', KeywordId:'@keyId'}, url: rootURL + '/projects/:id/removeKeyword' },
                getProjObjectives: { isArray: true, url: rootURL + '/projects/:id/objectives.json' },
                addProjObjective: { method: 'POST', cache: false, isArray: true, params: { id: '@id', ObjectiveTypeId: '@objectiveTypeId' }, url: rootURL + '/projects/:id/addObjective' },//?ObjectiveTypeId={objectiveTypeId}
                deleteProjObjective: { method: 'DELETE', cache: false, isArray: false, params: {id:'@id', ObjectiveTypeId: 'objectiveTypeId'}, url: rootURL + '/projects/:id/removeObjective'},//:objId' },
                getProjOrganizations: { isArray: true, url: rootURL + '/projects/:id/OrganizationResources.json' },
                addProjOrg: { method: 'POST', cache: false, isArray: true, params: { id: '@id', OrganizationId: '@orgId',DivisionId: '@divId',SectionId:'@secId' }, url: rootURL + '/projects/:id/AddOrganization?OrganizationId=:orgId&DivisionId=:divId&SectionId=:secId' },
                deleteProjOrg: { method: 'DELETE', cache: false, isArray: false, params: {id: '@id', OrgSystemId: '@orgSystemId'}, url: rootURL + '/projects/:id/removeOrganization' },//?OrgSystemId={orgSysId}
                getProjData: { isArray: true, url: rootURL + '/projects/:id/datahosts.json' },
                updateProjData: { method: 'POST', cache: false, isArray: false, url: rootURL + '/datahosts'},
                getProjContacts: { isArray: true, url: rootURL + '/projects/:id/contacts.json' },
                addProjContact: { method: 'POST', cache: false, isArray: true, url: rootURL + '/projects/:id/addContact'}, //attach contact in body
                deleteProjContact: { method: 'DELETE', cache: false, isArray: false, params: {id:'@id', ContactId:'@contactId'}, url: rootURL + '/projects/:id/removeContact'}, // ?ContactId={contactId} },
                getProjPublications: { isArray: true, url: rootURL + '/projects/:id/publications.json' },
                addProjPublication: { method: 'POST', cache: false, isArray: true, url: rootURL + '/projects/:id/addPublication'},//?Title=:title&Url=:url&Description=:description'},
                deleteProjPublication: { method: 'DELETE', cache: false, isArray: false, url: rootURL + '/projects/:id/RemovePublication'}, //?PublicationId={publicationId}
                getProjSites: { isArray: true, url: rootURL + '/projects/:id/sites.json' },
                //getFullSiteList: { isArray: true, url: rootURL + '/Sites/FullSiteInfo/:projId.json' },
                getFullSiteList: { isArray: true, url: rootURL + '/projects/:projId/ProjectFullSites' },
               // updateDM: {isArray: false, cache: false, url: rootURL + '/projects/:id/ReassignProject'}, // ?DataManager={dataManagerId} now regular put
                update: {method:'PUT', cache: false, isArray: false},
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false },
            });
    }]);
    //#endregion
    //#region PROJ_DURATION
    laMPResource.factory('PROJ_DURATION', ['$resource', function ($resource) {
        return $resource(rootURL + '/ProjectDuration/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true }, 
                getProjDurProj: { method: 'GET', isArray: true, cache: false, url: rootURL + '/ProjectDuration/:id/projects.json'},
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion
    //#region PROJ_STATUS
    laMPResource.factory('PROJ_STATUS', ['$resource', function ($resource) {
        return $resource(rootURL + '/ProjectStatus/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                getProjStatProj: { method: 'GET', isArray: true, cache: false, url: rootURL + '/ProjectStatus/:id/projects.json' },
                save: { method: 'POST', cache: false, isArray: false },
                update: { method: 'PUT', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion
    //#region PUBLICATION
    laMPResource.factory('PUBLICATION', ['$resource', function ($resource) {
        return $resource(rootURL + '/publications/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion
    //#region RESOURCE_TYPE
    laMPResource.factory('RESOURCE_TYPE', ['$resource', function ($resource) {
        return $resource(rootURL + '/resourcetypes/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                getResourceProj: { method: 'GET', isArray: true, cache: false, url: rootURL + '/resourcetypes/:id/projects.json' },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of resources
    //#endregion
    //#region ROLE
    laMPResource.factory('ROLE', ['$resource', function ($resource) {
        return $resource(rootURL + '/roles/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of role
    //#endregion
    //#region SECTION
    laMPResource.factory('SECTION', ['$resource', function ($resource) {
        return $resource(rootURL + '/Sections/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of SECTION
    //#endregion
    //#region SITE
    laMPResource.factory('SITE', ['$resource', function ($resource) {
        return $resource(rootURL + '/sites/:id.json',
            {}, {
                query: {},
                getSiteParameters: { isArray: true, url: rootURL + '/sites/:id/parameters.json' },
                addSiteParameter: { method: 'POST', cache: false, isArray: true, params: { id: '@id', ParameterTypeId: '@parameterTypeId' }, url: rootURL + '/sites/:id/addParameter' },//?ParameterTypeId=:parameterTypeId'},
                deleteSiteParameter: { method: 'DELETE', cache: false, isArray: false, url: rootURL + '/sites/:id/removeParameterType' }, //?ParameterTypeId={parameterTypeId}' },
                getSiteFrequencies: { isArray: true, url: rootURL + '/sites/:id/frequencies.json' },
                addSiteFrequency: { method: 'POST', cache: false, isArray: true, params: { id: '@id', FrequencyTypeId: '@frequencyTypeId' }, url: rootURL + '/sites/:id/addFrequency' },//?FrequencyTypeId=:frequencyTypeId' },//'/sites/:id/addFrequency' },
                deleteSiteFrequency: { method: 'DELETE', cache: false, isArray: false, url: rootURL + '/sites/:id/removeFrequencyType'}, //?FrequencyTypeId={frequencyTypeId}' },
                getSiteMedia: { isArray: true, url: rootURL + '/sites/:id/media.json' },
                addSiteMedia: { method: 'POST', cache: false, isArray: true, params: { id: '@id', MediaTypeId: '@mediaTypeId' }, url: rootURL + '/sites/:id/addMedia' },//?MediaTypeId=:mediaTypeId' },
                deleteSiteMedia: { method: 'DELETE', cache: false, isArray: false, url: rootURL + '/sites/:id/removeMediaType'}, //?MediaTypeId:mediaId' },
                getSiteResources: { isArray: true, url: rootURL + '/sites/:id/resourcetypes.json' },
                addSiteResource: { method: 'POST', cache: false, isArray: true, params: { id: '@id', ResourceTypeId: '@resourceTypeId' }, url: rootURL + '/sites/:id/addResource'},//?ResourceTypeId=:resourceTypeId'},
                deleteSiteResource: { method: 'DELETE', cache: false, isArray: false, url: rootURL + '/sites/:id/removeResource' }, //?ResourceTypeId={resourceTypeId}
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion   
    //#region STATUS_TYPE
    laMPResource.factory('STATUS_TYPE', ['$resource', function ($resource) {
        return $resource(rootURL + '/status/:id.json',
            {}, {
                query: { isArray: true },
                getAll: { method: 'GET', isArray: true },
                getSiteStatusProj: {method: 'GET', isArray:true, cache:false, url: rootURL + '/status/:id/projects.json'},
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);//end of statuses
    //#endregion
    //#region login
    laMPResource.factory('LOGIN', ['$resource', function ($resource) {
        return $resource(rootURL + '/login',
            {}, {
                login: { method: 'GET', cache: false, isArray: false }
            });
    }]);//end of Login
    //#endregion
})();
