(function () {
    "use strict"; 
    var app = angular.module('app', ['ngResource', 'ui.router', 'ui.mask', 'ui.bootstrap', 'laMPResource', 'siGLControllers']);

    //app.config(function that defines the config code. 
    app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
        function ($stateProvider, $urlRouterProvider, $locationProvider) {
            //if no active state, display state associated with this fragment identifier
            $urlRouterProvider.otherwise("/");

            $stateProvider
                //home
                .state("home", {
                    url: "/",
                    templateUrl: "app/welcomeView.html"
                })

                //projects lists page
                .state("projectList", {
                    url: "/project",
                    templateUrl: "app/project/projectListView.html",
                    controller: "projectListCtrl as vm"
                })

                //prject details page
                .state("projectDetail", {
                    url: "/project/:id",
                    templateUrl: "app/project/projectDetailView.html",
                    controller: "ProjectDetailCtrl as vm",
                    resolve: {
                        laMPResource: 'Projects', //dependency
                        project: function (laMPResource, $stateParams) {
                            var projectId = $stateParams.id;
                            return laMPResource.query(
                                { id: projectId }).$promise;
                        }
                    }
                })

                // project edit/create page
                .state("projectEdit", {
                    abstract: true, //can't be directly activated, only nested states
                    url: "/project/edit/:id",
                    templateUrl: "app/project/projectEditView.html",
                    controller: "projectEditCtrl as vm",
                    resolve: {
                        laMPResource: "Projects",
                        project: function (laMPResource, $stateParams) {
                            var projectId = $stateParams.id;
                            if (projectId > 0) {
                                return laMPResource.query(
                                    { id: projectId }).$promise;
                            }
                        }
                    }
                })

                // project edit/create page nested state for ProjectDetails
                .state("projectEdit.info", {
                    url: "/info",
                    templateUrl: "app/project/projectEditInfoView.html"
                })
                // project edit/create page nested state for ProjectData
                .state("projectEdit.cooperator", {
                    url: "/cooperator",
                    templateUrl: "app/project/projectEditCooperatorView.html"
                })
                // project edit/create page nested state for ProjectData
                .state("projectEdit.data", {
                    url: "/data",
                    templateUrl: "app/project/projectEditDataView.html"
                })
                // project edit/create page  nested state for ProjectContacts
                .state("projectEdit.contact", {
                    url: "/contact",
                    templateUrl: "app/project/projectEditContactView.html"
                })
                // project edit/create page  nested state for Projectpublications
                .state("projectEdit.publication", {
                    url: "/publication",
                    templateUrl: "app/project/projectEditPublicationView.html"
                })
                // project edit/create page  nested state for projectSites
                .state("projectEdit.site", {
                    url: "/site",
                    templateUrl: "app/project/projectEditSiteView.html"
                });
            //not sure about this.. "HTML5 mode can provide pretty URLs, but it does require config changes 
            //on web server in most cases"
            $locationProvider.html5Mode(false).hashPrefix('!');
        }
    ]);

}());
