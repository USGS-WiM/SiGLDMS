(function () {
    "use strict"; 
    var app = angular.module('app',
        ['ngResource', 'ui.router', 'ngCookies', 'ui.mask', 'ui.bootstrap', 'isteven-multi-select',
            'laMPResource', 'siGLControllers', 'ModalControllers', 'LogInOutController']);
    
    app.run(function ($rootScope) {
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {                    
            $("#ui-view").html("");
            $(".page-loading").removeClass("hidden");

            //check to see if they are going to project info
            if (toState.url == "/") {
                //make username focus
                $("#userNameFocus").focus();
            }
        });
        $rootScope.$on('$stateChangeSuccess', function () {
            window.scrollTo(0, 0);
            $(".page-loading").addClass("hidden");
        });
       
    });

    //app.config(function that defines the config code. 'ui.select', 'ngSanitize',
    app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 
        function ($stateProvider, $urlRouterProvider, $locationProvider){
            //if no active state, display state associated with this fragment identifier
            $urlRouterProvider.otherwise("/");

            //http://stackoverflow.com/questions/19721125/resolve-http-request-before-running-app-and-switching-to-a-route-or-state
            //http://stackoverflow.com/questions/22537311/angular-ui-router-login-authentication
            $stateProvider
                //#region region home
                .state("home", {
                    url: "/",
                    templateUrl: "partials/homeView.html",
                    controller: "mainCtrl"
                })
                //#endregion region home

                //#region admin settings
                //#region settings page
                .state("settings", {
                    url: "/settings",
                    templateUrl: "partials/settings.html",
                    controller: "settingsCtrl"    
                })
                //#endregion settings page

                //#region datamanager
                //#region datamanager ABSTRACT
                 .state("dataManagers", {
                     url: "/dataManager",
                     abstract: true,
                     templateUrl: "partials/DM/dmHolderView.html",
                     controller: "dataManagerCtrl",
                     resolve: {                         
                         orgS: 'ORGANIZATION_RESOURCE',
                         allOrgRes: function (orgS) {
                             return orgS.getAll().$promise;
                         },
                         org: 'ORGANIZATION',
                         allOrgs: function (org) {
                             return org.getAll().$promise;
                         },
                         divs: 'DIVISION',
                         allDivs: function (divs) {
                             return divs.getAll().$promise;
                         },
                         secs: 'SECTION',
                         allSecs: function (secs) {
                             return secs.getAll().$promise;
                         },                         
                         //p: 'PROJECT',
                         //allProj: function (p) {
                         //    return p.getAll().$promise;
                         //},
                         r: 'ROLE',
                         allRoles: function (r) {                             
                             return r.getAll().$promise;
                         }
                      }
                 })
                //#endregion datamanager ABSTRACT

                //#region dataManager.dmList
                .state("dataManagers.DMList", {
                    url: "/dataManagerList",
                    templateUrl: "partials/DM/DMList.html"
                })
                //#endregion dataManager.dmList

                //#region dataManager.DMInfo
                .state("dataManagers.DMInfo", {
                    url: "/dataManagerInfo/:id",
                    templateUrl: "partials/DM/dataManagerInfo.html",
                    controller: "dataManagerInfoCtrl",
                    resolve: {
                        dm: 'DATA_MANAGER',
                        thisDM: function (dm, $stateParams, $http, $cookies) {                           
                            var dmId = $stateParams.id;
                            if (dmId > 0) {
                                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                                $http.defaults.headers.common.Accept = 'application/json';
                                return dm.query(
                                    { id: dmId }).$promise;
                            }
                        },
                        dmProjects: function (dm, $stateParams) {
                            if ($stateParams.id > 0) {
                                return dm.getDMProject({ DataManager: $stateParams.id }).$promise;
                            }
                        }
                    }
                })
                //#endregion dataManager.DMInfo

                //#endregion datamanager

                 //#region organizations
                //#region organizations ABSTRACT
                 .state("organizations", {
                     url: "/organizations",
                     abstract: true,
                     templateUrl: "partials/Org/orgHolderView.html",
                     controller: "organizationCtrl",
                     resolve: {
                         
                     }
                 })
                //#endregion organizations ABSTRACT

                //#region organizations.OrgList
                .state("organizations.OrgList", {
                    url: "/organizationList",
                    templateUrl: "partials/Org/OrgList.html"
                })
                //#endregion organizations.OrgList

                //#region organizations.OrgInfo
                .state("organizations.OrgInfo", {
                    url: "/organizations/:id",
                    templateUrl: "partials/Org/OrgInfo.html",
                    controller: "organizationInfoCtrl",
                    resolve: {
                        
                    }
                })
                //#endregion organizations.OrgInfo

                //#endregion organizations

                //#region resources
                .state("resources", {
                    url: "/Resources",
                    abstract: true,
                    templateUrl: "partials/Resources/resourcesHolderView.html",
                    controller: "resourcesCtrl",
                    resolve: {
                        f: 'FREQUENCY_TYPE',
                        allFreqs: function (f) {
                            return f.getAll().$promise;
                        },
                        l: 'LAKE_TYPE',
                        allLakes: function (l) {
                            return l.getAll().$promise;
                        },
                        m: 'MEDIA_TYPE',
                        allMedias: function (m) {
                            return m.getAll().$promise;
                        },
                        o: 'OBJECTIVE_TYPE',
                        allObjectives: function (o) {
                            return o.getAll().$promise;
                        },
                        p: 'PARAMETER_TYPE',
                        allParams: function (p) {
                            return p.getAll().$promise;
                        },
                        r: 'RESOURCE_TYPE',
                        allResources: function (r) {
                            return r.getAll().$promise;
                        },
                        pd: 'PROJ_DURATION',
                        allProjDurations: function (pd) {
                            return pd.getAll().$promise;
                        },
                        ps: 'PROJ_STATUS',
                        allProjStats: function (ps) {
                            return ps.getAll().$promise;
                        },
                        st: 'STATUS_TYPE',
                        allSiteStats: function (st) {
                            return st.getAll().$promise;
                        }
                    }
                })//#endregion resources

                //#region resources.ResourcesList
                .state("resources.ResourcesList", {
                    url: "/ResourcesList",
                    templateUrl: "partials/Resources/resourcesList.html"
                })
                //#endregion resources.ResourcesList

                //#region all lookup htmls

                //#region resources.ResourcesList.frequencyType
                .state("resources.ResourcesList.frequencyType", {
                    url: "/FrequencyTypes",
                    templateUrl: "partials/Resources/PageContent/FrequencyType.html"
                })
                //#endregion resources.ResourcesList.frequencyTypes

                //#region resources.ResourcesList.LakeType
                .state("resources.ResourcesList.LakeType", {
                    url: "/LakeTypes",
                    templateUrl: "partials/Resources/PageContent/LakeType.html"
                })
                //#endregion resources.ResourcesList.LakeType

                //#region resources.ResourcesList.MediaType
                .state("resources.ResourcesList.MediaType", {
                    url: "/MediaTypes",
                    templateUrl: "partials/Resources/PageContent/MediaType.html"
                })
                //#endregion resources.ResourcesList.MediaType

                //#region resources.ResourcesList.ObjectiveType
                .state("resources.ResourcesList.ObjectiveType", {
                    url: "/ObjectiveTypes",
                    templateUrl: "partials/Resources/PageContent/ObjectiveType.html"
                })
                //#endregion resources.ResourcesList.ObjectiveType

                //#region resources.ResourcesList.ParameterType
                .state("resources.ResourcesList.ParameterType", {
                    url: "/ParameterTypes",
                    templateUrl: "partials/Resources/PageContent/ParameterType.html"
                })
                //#endregion resources.ResourcesList.ParameterType

                //#region resources.ResourcesList.ResourceType
                .state("resources.ResourcesList.ResourceType", {
                    url: "/ResourceTypes",
                    templateUrl: "partials/Resources/PageContent/ResourceType.html"
                })
                //#endregion resources.ResourcesList.ResourceType

                //#region resources.ResourcesList.ProjectDuration
                .state("resources.ResourcesList.ProjectDuration", {
                    url: "/ProjectDurations",
                    templateUrl: "partials/Resources/PageContent/ProjectDuration.html"
                })
                //#endregion resources.ResourcesList.ProjectDuration

                //#region resources.ResourcesList.ProjectStatus
                .state("resources.ResourcesList.ProjectStatus", {
                    url: "/ProjectStatuses",
                    templateUrl: "partials/Resources/PageContent/ProjectStatus.html"
                })
                //#endregion resources.ResourcesList.ProjectStatus

                //#region resources.ResourcesList.SiteStatus
                .state("resources.ResourcesList.SiteStatus", {
                    url: "/SiteStatuses",
                    templateUrl: "partials/Resources/PageContent/SiteStatus.html"
                })
                //#endregion resources.ResourcesList.SiteStatus

                //#endregion all lookup htmls

                //#endregion admin settings

                //#region region help
                 .state("help", {
                     url: "/help",
                     templateUrl: "partials/helpView.html",
                     controller: "helpCtrl"
                 })
                //#endregion region help

                //#region region projectList
                .state("projectList", {
                    url: "/projects",
                    templateUrl: "partials/project/projectListView.html",
                    controller: "projectListCtrl"
                })
                //#endregion region projectList

                //#region region projectEdit
                .state("projectEdit", {
                    abstract: true, //can't be directly activated, only nested states
                    url: "/project/edit/:id",
                    templateUrl: "partials/project/projectEditView.html",
                    controller: "projectEditCtrl",
                    resolve: {
                        //check to see if they are going to project info
                        validate: function ($q, $timeout, $http, $location, $stateParams, $cookies, DATA_MANAGER) {
                            if ($stateParams.id > 0) {
                                var defer = $q.defer();
                                var roleID = $cookies.get('usersRole');
                                if (roleID == "Manager") {
                                    //make sure they can come here
                                    var useID = $cookies.get('dmID');
                                    var dmProjs = [];
                                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                                    $http.defaults.headers.common.Accept = 'application/json';
                                    DATA_MANAGER.getDMProject({ id: useID }, function sucess(response) {
                                        dmProjs = response.filter(function (p) { return p.ProjId == $stateParams.id; });
                                        if (dmProjs.length > 0) {
                                            defer.resolve();
                                        } else {
                                            $timeout(function () {
                                                // anything you want can go here and will safely be run on the next digest.
                                                defer.reject("Access blocked");
                                                alert("Not authorized to view this project.");
                                                $location.path('/');
                                            });
                                        }
                                    });
                                }
                            }
                        },
                        Proj: 'PROJECT', //dependency for the project
                        thisProject: function (Proj, $stateParams) {
                            var projectId = $stateParams.id;
                            if (projectId > 0) {
                                return Proj.query(
                                    { id: projectId }).$promise;
                            }
                        },
                        projObjectives: function (Proj, $stateParams) {
                            var projectId = $stateParams.id;
                            if (projectId > 0) {
                                return Proj.getProjObjectives(
                                    { id: projectId }).$promise;
                            }
                        },
                        projKeywords: function (Proj, $stateParams) {
                            var projectId = $stateParams.id;
                            if (projectId > 0) {
                                return Proj.getProjKeywords(
                                    { id: projectId }).$promise;
                            }
                        },
                        projOrgs: function (Proj, $stateParams) {
                            var projectId = $stateParams.id;
                            if (projectId > 0) {
                                return Proj.getProjOrganizations(
                                    { id: projectId }).$promise;
                            }
                        },
                        projDatum: function (Proj, $stateParams) {
                            var projectId = $stateParams.id;
                            if (projectId > 0) {
                                return Proj.getProjData(
                                    { id: projectId }).$promise;
                            }
                        },
                        projContacts: function (Proj, $stateParams) {
                            var projectId = $stateParams.id;
                            if (projectId > 0) {
                                return Proj.getProjContacts(
                                    { id: projectId }).$promise;
                            }
                        },
                        projPubs: function (Proj, $stateParams) {
                            var projectId = $stateParams.id;
                            if (projectId > 0) {
                                return Proj.getProjPublications(
                                    { id: projectId }).$promise;
                            }
                        },
                        projSites: function (Proj, $stateParams) {
                            var projectId = $stateParams.id;
                            if (projectId > 0) {
                                return Proj.getProjSites(
                                    { id: projectId }).$promise;
                            }
                        },
                        prDurations: 'PROJ_DURATION',
                        allDurationList: function (prDurations) {
                            return prDurations.getAll().$promise;
                        },
                        prStats: 'PROJ_STATUS',
                        allStatsList: function (prStats) {
                            return prStats.getAll().$promise;
                        },                       
                        allOrgs: 'ORGANIZATION',
                        allOrgList: function (allOrgs) {
                            return allOrgs.getAll().$promise;
                        },
                        allDivs: 'DIVISION',
                        allDivisionList: function (allDivs) {
                            return allDivs.getAll().$promise;
                        },
                        allSecs: 'SECTION',
                        allSectionList: function (allSecs) {
                            return allSecs.getAll().$promise;
                        },
                        allObjs: 'OBJECTIVE_TYPE',
                        allObjList: function (allObjs) {
                            return allObjs.getAll().$promise;
                        }

                    }
                })
                //#endregion region projectEdit

                //#region region projectEdit.info
                .state("projectEdit.info", {
                    url: "/info",
                    templateUrl: "partials/project/projectEditInfoView.html"
                })
                //#endregion region projectEdit.info

                //#region region projectEdit.cooperator
                .state("projectEdit.cooperator", {
                    url: "/cooperator",
                    templateUrl: "partials/project/projectEditCooperatorView.html",
                    controller: "projectEditCoopCtrl"
                })
                //#endregion region projectEdit.cooperator

                //#region region projectEdit.data
                .state("projectEdit.data", {
                    url: "/data",
                    templateUrl: "partials/project/projectEditDataView.html",
                    controller: "projectEditDataCtrl"
                })
                //#endregion region projectEdit.data

                //#region region projectEdit.contact
                .state("projectEdit.contact", {
                    url: "/contact",
                    templateUrl: "partials/project/projectEditContactView.html",
                    controller: "projectEditContactCtrl",
                    resolve: {
                        Proj: 'PROJECT',
                        projContacts: function (Proj, $stateParams) {
                            var projectId = $stateParams.id;
                            if (projectId > 0) {
                                return Proj.getProjContacts(
                                    { id: projectId }).$promise;
                            }
                        },
                        orgRes: 'ORGANIZATION_RESOURCE',
                        orgResources: function (orgRes) {
                            return orgRes.getAll().$promise;
                        }
                    }
                })
                //#endregion region projectEdit.contact

                //#region region projectEdit.publication
                .state("projectEdit.publication", {
                    url: "/publication",
                    templateUrl: "partials/project/projectEditPublicationView.html",
                    controller: "projectEditPubCtrl"
                })
                //#endregion region projectEdit.publication

                //#region region projectEdit.site
                .state("projectEdit.site", {
                    template: '<div class="panel panel-primary"><div ui-view=""></div></div>',
                    url: "/site",
                    abstract: true,
                    resolve: {                        
                        //countries
                        CountryList: function () {
                            var c = [];
                            c.push("Canada"); c.push("United States Of America");
                            return c;
                        },
                        //states
                        //theStates: 'States',
                        stateList: function () {
                            var s = [];
                            s.push("Illinois"); s.push("Indiana"); s.push("Michigan"); s.push("Minnesota"); s.push("New York");
                            s.push("Ohio"); s.push("Pennsylvania"); s.push("Wisconsin"); s.push("Ontario"); 
                            return s;
                            //return theStates.getAll().$promise;
                        },
                        //lakes
                        theLakes: 'LAKE_TYPE',
                        lakeList: function (theLakes) {
                            return theLakes.getAll().$promise;
                        },
                        //statuses
                        theSiteStats: 'STATUS_TYPE',
                        siteStatList: function (theSiteStats) {
                            return theSiteStats.getAll().$promise;
                        },
                        //resources
                        theRes: 'RESOURCE_TYPE',
                        resourceList: function (theRes) {
                            return theRes.getAll().$promise;
                        },
                        //media
                        theMedia: 'MEDIA_TYPE',
                        mediaList: function (theMedia) {
                            return theMedia.getAll().$promise;
                        },
                        //frequencies
                        theFreq: 'FREQUENCY_TYPE',
                        frequencyList: function (theFreq) {
                            return theFreq.getAll().$promise;
                        },
                        //parameters
                        theParams: 'PARAMETER_TYPE',
                        parameterList: function (theParams) {
                            return theParams.getAll().$promise;
                        }
                    }
                })
                //#endregion region projectEdit.site

                //#region region projectEdit.site.siteList
                .state("projectEdit.site.siteList", {
                    url: "/siteList",
                    templateUrl: "partials/project/projectEditSiteList.html",
                    resolve: {
                        Proj: 'PROJECT',
                        projS: function (Proj, $stateParams) {
                            var projectId = $stateParams.id;
                            if (projectId > 0) {
                                return Proj.getFullSiteList({ projId: projectId }).$promise;
                            }
                        }
                    },
                    controller: 'projectEditSiteListCtrl'
                })
                //#endregion region projectEdit.site.siteList

                //#region region projectEdit.site.siteInfo
                //.state("projectEdit.site.siteInfo", {
                //    url: "/siteInfo/:siteId",
                //    templateUrl: "partials/project/projectEditSiteInfoView.html",
                //    controller: "projectEditSiteInfoCtrl",
                //    resolve: {
                //        aSite: 'SITE', //dependency for the project
                //        thisSite: function (aSite, $stateParams) {
                //            var siteId = $stateParams.siteId;
                //            if (siteId > 0) {
                //                return aSite.query(
                //                    { id: siteId }).$promise;
                //            }
                //        },
                //        siteFrequencies: function (aSite, $stateParams) {
                //            var siteId = $stateParams.siteId;
                //            if (siteId > 0) {
                //                return aSite.getSiteFrequencies(
                //                    { id: siteId }).$promise;
                //            }
                //        },
                //        siteMedium: function (aSite, $stateParams) {
                //            var siteId = $stateParams.siteId;
                //            if (siteId > 0) {
                //                return aSite.getSiteMedia(
                //                    { id: siteId }).$promise;
                //            }
                //        },
                //        siteParameters: function (aSite, $stateParams) {
                //            var siteId = $stateParams.siteId;
                //            if (siteId > 0) {
                //                return aSite.getSiteParameters(
                //                    { id: siteId }).$promise;
                //            }
                //        },
                //        siteResources: function (aSite, $stateParams) {
                //            var siteId = $stateParams.siteId;
                //            if (siteId > 0) {
                //                return aSite.getSiteResources(
                //                    { id: siteId }).$promise;
                //            }
                //        }
                //    }
                //})
                //#endregion region projectEdit.site.siteInfo

                .state("projectEdit.site.siteEditAll", {
                    url: "/siteEditAll",
                    templateUrl: "partials/project/projectEditSiteEditAll.html",
                    controller: "projectEditAllSitesCtrl"
                });

              
           // $locationProvider.html5Mode(false).hashPrefix('!');
            $locationProvider.html5Mode(false);
        }
    ]);

}());
