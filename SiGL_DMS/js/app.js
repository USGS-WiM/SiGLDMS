(function () {
    "use strict"; 
    var app = angular.module('app', ['ngResource', 'ui.router', 'ngCookies', 'ui.mask', 'ui.bootstrap', 'laMPResource', 'siGLControllers', 'siGLBusinessServices', 'isteven-multi-select', ]);
    
    app.run(function ($rootScope) {
        $rootScope
            .$on('$stateChangeStart',
                function (event, toState, toParams, fromState, fromParams) {
                    $("#ui-view").html("");
                    $(".page-loading").removeClass("hidden");
                });

        $rootScope
            .$on('$stateChangeSuccess',
                function (event, toState, toParams, fromState, fromParams) {
                    $(".page-loading").addClass("hidden");
                });
    });

    //app.config(function that defines the config code. 'ui.select', 'ngSanitize',
    app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
        function ($stateProvider, $urlRouterProvider, $locationProvider) {
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

                //#region region account
                 .state("account", {
                     url: "/",
                     templateUrl: "partials/accountView.html",
                     controller: "accountCtrl"
                 })
                //#endregion region account

                //#region region help
                 .state("help", {
                     url: "/",
                     templateUrl: "partials/helpView.html",
                     controller: "helpCtrl"
                 })
                //#endregion region help

                //#region region projectList
                .state("projectList", {
                    url: "/projects",
                    templateUrl: "partials/projectListView.html",
                    controller: "projectListCtrl"
                })
                //#endregion region projectList

                //#region region projectEdit
                .state("projectEdit", {
                    //abstract: true, //can't be directly activated, only nested states
                    url: "/project/edit/:id",
                    templateUrl: "partials/projectEditView.html",
                    controller: "projectEditCtrl",
                    resolve: {
                        Proj: 'Projects', //dependency for the project
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
                        prDurations: 'ProjDuration',
                        allDurationList: function (prDurations) {
                            return prDurations.getAll().$promise;
                        },
                        prStats: 'ProjStat',
                        allStatsList: function (prStats) {
                            return prStats.getAll().$promise;
                        },
                        allOrgs: 'Organization',
                        allOrgList: function (allOrgs) {
                            return allOrgs.getAll().$promise;
                        },
                        allObjs: 'ObjectiveType',
                        allObjList: function (allObjs) {
                            return allObjs.getAll().$promise;
                        }
                    }
                })
                //#endregion region projectEdit

                //#region region projectEdit.info
                .state("projectEdit.info", {
                    url: "/info",
                    templateUrl: "partials/projectEditInfoView.html"
                })
                //#endregion region projectEdit.info

                //#region region projectEdit.cooperator
                .state("projectEdit.cooperator", {
                    url: "/cooperator",
                    templateUrl: "partials/projectEditCooperatorView.html",
                    controller: "projectEditCoopCtrl"
                })
                //#endregion region projectEdit.cooperator

                //#region region projectEdit.data
                .state("projectEdit.data", {
                    url: "/data",
                    templateUrl: "partials/projectEditDataView.html",
                    controller: "projectEditDataCtrl"
                })
                //#endregion region projectEdit.data

                //#region region projectEdit.contact
                .state("projectEdit.contact", {
                    url: "/contact",
                    templateUrl: "partials/projectEditContactView.html",
                    controller: "projectEditContactCtrl"
                })
                //#endregion region projectEdit.contact

                //#region region projectEdit.publication
                .state("projectEdit.publication", {
                    url: "/publication",
                    templateUrl: "partials/projectEditPublicationView.html",
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
                        theLakes: 'Lake',
                        lakeList: function (theLakes) {
                            return theLakes.getAll().$promise;
                        },
                        //statuses
                        theSiteStats: 'SiteStatus',
                        siteStatList: function (theSiteStats) {
                            return theSiteStats.getAll().$promise;
                        },
                        //resources
                        theRes: 'ResourceType',
                        resourceList: function (theRes) {
                            return theRes.getAll().$promise;
                        },
                        //media
                        theMedia: 'MediaType',
                        mediaList: function (theMedia) {
                            return theMedia.getAll().$promise;
                        },
                        //frequencies
                        theFreq: 'FrequencyType',
                        frequencyList: function (theFreq) {
                            return theFreq.getAll().$promise;
                        },
                        //parameters
                        theParams: 'parameterType',
                        parameterList: function (theParams) {
                            return theParams.getAll().$promise;
                        }
                    }
                })
                //#endregion region projectEdit.site

                //#region region projectEdit.site.siteList
                .state("projectEdit.site.siteList", {
                    url: "/siteList",
                    templateUrl: "partials/projectEditSiteList.html",
                    resolve: {
                        Proj: 'Projects',
                        projS: function (Proj, $stateParams) {
                            var projectId = $stateParams.id;
                            if (projectId > 0) {
                                return Proj.getProjSites(
                            { id: projectId }).$promise;
                                    }
                            }
                    },
                    controller: function ($scope, projS, thisProject, siteStatList, lakeList) {
                        var formattedProjSites = [];
                        for (var x = 0; x < projS.length; x++) {
                            var thisOne = {};
                            thisOne.Name = projS[x].NAME; thisOne.Lat = projS[x].LATITUDE; thisOne.SiteID = projS[x].SITE_ID;
                            thisOne.Long = projS[x].LONGITUDE; thisOne.State = projS[x].STATE_PROVINCE;
                            thisOne.Lake = lakeList.filter(function (l) { return l.LAKE_TYPE_ID == projS[x].LAKE_TYPE_ID });
                            thisOne.Waterbody = projS[x].WATERBODY; thisOne.Status = siteStatList.filter(function (s) { return s.STATUS_ID == projS[x].STATUS_TYPE_ID });
                            formattedProjSites.push(thisOne);
                        }
                        $scope.projectSites = formattedProjSites;
                        $scope.thisProject = thisProject;
                        // change sorting order
                        $scope.sort_by = function (newSortingOrder) {
                            if ($scope.sortingOrder == newSortingOrder) {
                                $scope.reverse = !$scope.reverse;
                                }
                                $scope.sortingOrder = newSortingOrder;
                                // icon setup
                            $('th i').each(function () {
                                    // icon reset
                                $(this).removeClass().addClass('glyphicon glyphicon-sort');
                                });
                            if ($scope.reverse) {
                                $('th.' +newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-up');
                                } else {
                                $('th.' +newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-down');
                                }
                            };
                    }
                })
                //#endregion region projectEdit.site.siteList

                //#region region projectEdit.site.siteInfo
                .state("projectEdit.site.siteInfo", {
                    url: "/siteInfo/:siteId",
                    templateUrl: "partials/projectEditSiteInfoView.html",
                    controller: "projectEditSiteInfoCtrl",
                    resolve: {
                        aSite: 'Site', //dependency for the project
                        thisSite: function (aSite, $stateParams) {
                            var siteId = $stateParams.siteId;
                            if (siteId > 0) {
                                return aSite.query(
                                    { id: siteId }).$promise;
                            }
                        },
                        siteFrequencies: function (aSite, $stateParams) {
                            var siteId = $stateParams.siteId;
                            if (siteId > 0) {
                                return aSite.getSiteFrequencies(
                                    { id: siteId }).$promise;
                            }
                        },
                        siteMedium: function (aSite, $stateParams) {
                            var siteId = $stateParams.siteId;
                            if (siteId > 0) {
                                return aSite.getSiteMedia(
                                    { id: siteId }).$promise;
                            }
                        },
                        siteParameters: function (aSite, $stateParams) {
                            var siteId = $stateParams.siteId;
                            if (siteId > 0) {
                                return aSite.getSiteParameters(
                                    { id: siteId }).$promise;
                            }
                        },
                        siteResources: function (aSite, $stateParams) {
                            var siteId = $stateParams.siteId;
                            if (siteId > 0) {
                                return aSite.getSiteResources(
                                    { id: siteId }).$promise;
                            }
                        }
                    }
                })
            //#endregion region projectEdit.site.siteInfo

                //.state("projectEdit.site.siteEditAll", {
                //    url: "/siteEditAll",
                //    templateUrl: "partials/projectEditSiteEditAll.html",
                //    controller: "projectEditSiteCtrl"
                //});

                //    
            $locationProvider.html5Mode(false).hashPrefix('!');
            //$locationProvider.html5Mode({ enabled: true, requireBase: false });
        }
    ]);

}());
