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
                //home (login page OR projList page depending on checkCreds() call
                .state("home", {
                    url: "/",
                    templateUrl: "partials/homeView.html",
                    controller: "mainCtrl"
                })

                //projects lists page
                .state("projectList", {
                    url: "/projects",
                    templateUrl: "partials/projectListView.html",
                    controller: "projectListCtrl"//,
                    //resolve: {
                    //    Proj: 'Projects',
                    //    IndexProjects: function (Proj) {
                    //        return Proj.getDMProjects().$promise;
                    //    }
                    //}
                })

                //prject details page
                .state("projectDetail", {
                    url: "/project/:id",
                    templateUrl: "partials/projectDetailView.html",
                    controller: "ProjectDetailCtrl",
                    resolve: {
                        Proj: 'Projects', //dependency for the project
                        thisProject: function (Proj, $stateParams) {
                            var projectId = $stateParams.id;
                            return Proj.query(
                                { id: projectId }).$promise;
                        }
                    }
                })

                // project edit/create page
                .state("projectEdit", {
                    abstract: true, //can't be directly activated, only nested states
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
                                return Proj.getProjPublications(
                                    { id: projectId }).$promise;
                            }
                        },
                        prDurations: 'ProjDurations',
                        allDurationList: function (prDurations) {
                            return prDurations.getAll().$promise;
                        },
                        prStats: 'ProjStats',
                        allStatsList: function (prStats) {
                            return prStats.getAll().$promise;
                        },
                        allOrgs: 'Organizations',
                        allOrgList: function (allOrgs) {
                            return allOrgs.getAll().$promise;
                        },
                        allObjs: 'ObjectiveTypes',
                        allObjList: function (allObjs) {
                            return allObjs.getAll().$promise;
                        }  
                    }
                })

                // project edit/create page nested state for ProjectDetails
                .state("projectEdit.info", {
                    url: "/info",
                    templateUrl: "partials/projectEditInfoView.html"
                })

                // project edit/create page nested state for ProjectData
                .state("projectEdit.cooperator", {
                    url: "/cooperator",
                    templateUrl: "partials/projectEditCooperatorView.html",
                    controller: "projectEditCoopCtrl"                    
                })

                // project edit/create page nested state for ProjectData
                .state("projectEdit.data", {
                    url: "/data",
                    templateUrl: "partials/projectEditDataView.html",
                    controller: "projectEditDataCtrl"                    
                })

                // project edit/create page  nested state for ProjectContacts
                .state("projectEdit.contact", {
                    url: "/contact",
                    templateUrl: "partials/projectEditContactView.html",
                    controller: "projectEditContactCtrl"                   
                })

                // project edit/create page  nested state for Projectpublications
                .state("projectEdit.publication", {
                    url: "/publication",
                    templateUrl: "partials/projectEditPublicationView.html",
                    controller: "projectEditPubCtrl"
                })

                // project edit/create page  nested state for projectSites
                .state("projectEdit.site", {
                    url: "/site",
                    templateUrl: "partials/projectEditSiteView.html"
                });
            $locationProvider.html5Mode(false).hashPrefix('!');
            //$locationProvider.html5Mode({ enabled: true, requireBase: false });
        }
    ]);

}());
