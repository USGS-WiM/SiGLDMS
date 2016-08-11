(function () {
    'use strict';

    var siGLControllers = angular.module('siGLControllers');
    siGLControllers.controller('projSiteListCtrl', ['$scope', '$rootScope', '$location', '$cookies', '$uibModal', '$http', '$q', 'projS', 'thisProject', 'siteStatList', 'lakeList', 'stateList', 'CountryList', 'resourceList', 'mediaList', 'frequencyList', 'parameterList', 'SITE', 'PROJECT',
        function ($scope, $rootScope, $location, $cookies, $uibModal, $http, $q, projS, thisProject, siteStatList, lakeList, stateList, CountryList, resourceList, mediaList, frequencyList, parameterList, SITE, PROJECT) {
            $scope.projectSites = projS; //this looks different now TODO //////////

            for (var psu = 0; psu < $scope.projectSites.length; psu++) {
                //fix urls
                var ind = psu;
                if ($scope.projectSites[ind].url !== undefined && !$scope.projectSites[ind].url.startsWith('http')) {
                    $scope.projectSites[ind].url = 'http://' + $scope.projectSites[ind].url;
                }
                if ($scope.projectSites[ind].StartDate !== "") {
                    var spaceSIndex = $scope.projectSites[ind].StartDate.indexOf(" ");
                    $scope.projectSites[ind].StartDate = $scope.projectSites[ind].StartDate.substring(0, spaceSIndex);
                }
                if ($scope.projectSites[ind].EndDate !== "") {
                    var spaceEIndex = $scope.projectSites[ind].EndDate.indexOf(" ");
                    $scope.projectSites[ind].EndDate = $scope.projectSites[ind].EndDate.substring(0, spaceEIndex);
                }
            }
                        
            $scope.thisProject = thisProject;
            $scope.LakeList = lakeList;
            $scope.StatusList = siteStatList;
            $scope.ResourceList = resourceList;
            $scope.MediaList = mediaList;
            $scope.FreqList = frequencyList;
            $scope.ParamList = parameterList;

            $scope.FrequenciesToAdd = [];
            $scope.MediaToAdd = [];
            $scope.ParameterToAdd = [];
            $scope.ResourceToAdd = [];

            // change sorting order
            $scope.sortingOrder = $cookies.get('siteListSortOrder') !== undefined ? $cookies.get('siteListSortOrder') : 'Name';
            $scope.reverse = $cookies.get('sl_reverse') !== undefined ? Boolean($cookies.get('sl_reverse')) : false;
            $scope.sort_by = function (newSortingOrder) {
                $cookies.put('siteListSortOrder', newSortingOrder);
                if ($scope.sortingOrder == newSortingOrder) {
                    $scope.reverse = !$scope.reverse;
                    $cookies.put('sl_reverse', $scope.reverse);
                }
                $scope.sortingOrder = newSortingOrder;
                // icon setup
                $('th i').each(function () {
                    // icon reset
                    $(this).removeClass().addClass('glyphicon glyphicon-sort');
                });
                if ($scope.reverse) {
                    $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-up');
                } else {
                    $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-down');
                }
            };

            //used in CopyToNew for formatting the new Site
            var formatSite = function (aSite) {
                //format it properly
                var aSITE = {};
                aSITE.start_date = aSite.StartDate !== undefined ? aSite.StartDate : "";
                aSITE.end_date = aSite.EndDate !== undefined ? aSite.EndDate : "";
                aSITE.project_id = aSite.ProjID;
                aSITE.sample_platform = aSite.SamplePlatform !== undefined ? aSite.SamplePlatform : "";
                aSITE.additional_info = aSite.AdditionalInfo;
                aSITE.name = aSite.Name;
                aSITE.description = aSite.Description !== undefined ? aSite.Description : "";
                aSITE.latitude = aSite.latitude;
                aSITE.longitude = aSite.longitude;
                aSITE.waterbody = aSite.Waterbody !== undefined ? aSite.Waterbody : "";
                aSITE.status_type_id = aSite.StatType !== undefined ? aSite.StatType.status_id : "0";
                aSITE.lake_type_id = aSite.LakeType.lake_type_id;
                aSITE.country = aSite.Country;
                aSITE.state_province = aSite.State;
                aSITE.watershed_huc8 = aSite.WatershedHUC8 !== undefined ? aSite.WatershedHUC8 : "";
                aSITE.url = aSite.url !== undefined ? aSite.url : "";

                return aSITE;
            };

            //copy to new site using this site's info
            $scope.CopyToNew = function (siteId) {
                //ask for new name: (modal)
                var modalInstance = $uibModal.open({
                    templateUrl: 'duplicateSiteMdlView.html',
                    controller: 'duplicateSiteModalCtrl',
                    size: 'sm',
                    resolve: {
                        thisSiteID: function () {
                            return siteId;
                        }
                    }
                });
                modalInstance.result.then(function (newSiteName) {
                    //go use this (newSiteName.name and newSiteName.id) (new with this new name and duplicate everything and then direct to it
                    var thisSite = angular.copy($scope.projectSites.filter(function (s) { return s.SiteId == newSiteName.id; })[0]);
                    thisSite.ProjID = $scope.thisProject.project_id;
                    thisSite.Name = newSiteName.name;
                    thisSite.StatType = $scope.StatusList.filter(function (st) { return st.status == thisSite.Status; })[0];
                    thisSite.LakeType = $scope.LakeList.filter(function (st) { return st.lake == thisSite.Lake; })[0];
                    
                    //properly form the site
                    var aSITE = formatSite(thisSite);
                    $scope.FrequenciesToAdd = thisSite.Frequencies;
                    $scope.MediaToAdd = thisSite.Media;                   
                    $scope.ResourceToAdd = thisSite.Resources;
                    $scope.ParameterToAdd = thisSite.Parameters;
                    
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    var siteId = "";
                    SITE.save(aSITE, function success(response) {
                        $rootScope.stateIsLoading.showLoading = true; //loading... 
                        thisSite.SiteId = response.site_id;
                        $scope.projectSites.push(thisSite);
                        toastr.success("Site Created");
                        siteId = response.site_id;
                        //projSites.push(response);
                        $scope.sitesCount.total = $scope.sitesCount.total + 1;
                        //use $q for async call to add frequencies, media, parameters, resources
                        var defer = $q.defer();
                        var AddPromises = [];
                        //post frequencies added
                        angular.forEach($scope.FrequenciesToAdd, function (freq) {
                            var addFreqPromise = SITE.addSiteFrequency({ id: siteId, frequencyTypeId: freq.frequency_type_id }).$promise;
                            AddPromises.push(addFreqPromise);
                        });
                        //post media
                        angular.forEach($scope.MediaToAdd, function (med) {
                            var addMedPromise = SITE.addSiteMedia({ id: siteId, mediaTypeId: med.media_type_id }).$promise;
                            AddPromises.push(addMedPromise);
                        });
                        //post parameters
                        angular.forEach($scope.ParameterToAdd, function (par) {
                            var addParamPromise = SITE.addSiteParameter({ id: siteId, parameterTypeId: par.parameter_type_id }).$promise;
                            AddPromises.push(addParamPromise);
                        });
                        //post resources
                        angular.forEach($scope.ResourceToAdd, function (res) {
                            var addResPromise = SITE.addSiteResource({ id: siteId, resourceTypeId: res.resource_type_id }).$promise;
                            AddPromises.push(addResPromise);
                        });
                        $q.all(AddPromises).then(function () {
                            // $scope.openSiteCreate(thisSite);
                            $rootScope.stateIsLoading.showLoading = false; //Loading...
                        }).catch(function error(msg) {
                            toastr.error(msg);
                        });
                    }, function error(errorResponse) {
                        toastr.success("Error: " + errorResponse.statusText);
                    }).$promise;
                });
            };//end CopyToNew

            //DELETE Site
            $scope.DeleteSite = function (site) {
                //modal
                var modalInstance = $uibModal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        keyToRemove: function () {
                            return site;
                        },
                        what: function () {
                            return "Site";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    //yes, remove this keyword
                    var index = $scope.projectSites.indexOf(site);
                    //DELETE it

                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    SITE.delete({ id: site.SiteId }, function success(response) {
                        $scope.projectSites.splice(index, 1);
                        $scope.sitesCount.total = $scope.sitesCount.total - 1;
                        toastr.success("Site Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });
                //end modal
            };

            //open modal to edit or create a project
            $scope.openSiteCreate = function (site) {
                $rootScope.stateIsLoading.showLoading = true; //Loading...
                var dropdownParts = [siteStatList, lakeList, stateList, CountryList, resourceList, mediaList, frequencyList, parameterList];
                var indexClicked = $scope.projectSites.indexOf(site);

                //modal
                var modalInstance = $uibModal.open({
                    templateUrl: 'SITEmodal.html',
                    controller: 'siteModalCtrl',
                    size: 'lg',
                    backdrop: 'static',
                    keyboard: false,
                    windowClass: 'rep-dialog',
                    resolve: {
                        allDropDownParts: function () {
                            return dropdownParts;
                        },
                        thisProject: function () {
                            return thisProject;
                        },
                        thisSite: function () {
                            if (site !== 0) {
                                return site;
                            }
                        }//,
                        //siteFreq: function () {
                        //    if (site !== 0) {
                        //        return site.Frequencies;//SITE.getSiteFrequencies({ id: site.SiteId }).$promise;
                        //    }
                        //},
                        //siteMed: function () {
                        //    if (site !== 0) {
                        //        return SITE.getSiteMedia({ id: site.SiteId }).$promise;
                        //    }
                        //},
                        //siteRes: function () {
                        //    if (site !== 0) {
                        //        return SITE.getSiteResources({ id: site.SiteId }).$promise;
                        //    }
                        //},
                        //siteParams: function () {
                        //    if (site !== 0) {
                        //        return SITE.getSiteParameters({ id: site.SiteId }).$promise;
                        //    }
                        //}
                    }
                });
                modalInstance.result.then(function (r) {
                    //$scope.aProject, projObjectives, projKeywords
                    $rootScope.stateIsLoading.showLoading = false; //loading... 
                    if (r[1] == 'create') {
                        $scope.projectSites.push(r[0]);
                        $scope.sitesCount.total = $scope.projectSites.length;
                    }
                    if (r[1] == 'update') {
                        //this is from edit -- refresh page?
                        $scope.projectSites[indexClicked] = r[0];
                    }
                });
            };

            //multi edit
            $scope.openMultiSiteModal = function (pid) {
                $rootScope.stateIsLoading.showLoading = true; //Loading...
                var dropdownParts = [siteStatList, lakeList, stateList, CountryList, resourceList, mediaList, frequencyList, parameterList];
               
                //modal
                var modalInstance = $uibModal.open({
                    templateUrl: 'component/projSite/projMultiSiteEditView.html',
                    controller: 'projMultiSiteEditCtrl',
                    size: 'lg',
                    backdrop: 'static',
                    keyboard: false,
                    windowClass: 'rep-dialog',
                    resolve: {
                        allDropDownParts: function () {
                            return dropdownParts;
                        },
                        thisProject: function () {
                            return thisProject;
                        },
                        allProjSites: function () {
                            return PROJECT.getFullSiteList({ projId: pid }).$promise;
                        }
                    }
                });
                modalInstance.result.then(function (r) {
                    //$scope.aProject, projObjectives, projKeywords
                    $rootScope.stateIsLoading.showLoading = false; //loading... 
                    if (r[1] == 'create') {
                        $scope.projectSites.push(r[0]);
                        $scope.sitesCount.total = $scope.projectSites.length;
                    }
                    if (r[1] == 'update') {
                        //this is from edit -- refresh page?
                        $scope.projectSites[indexClicked] = r[0];
                    }
                });
            };
        }]);
})();
