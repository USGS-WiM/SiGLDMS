(function () {
    'use strict';

    var siGLControllers = angular.module('siGLControllers');
    siGLControllers.controller('projSiteListCtrl', ['$scope', '$rootScope', '$location', '$cookies', '$uibModal', '$http', '$q', 'projS', 'thisProject', 'siteStatList', 'lakeList', 'stateList', 'CountryList', 'resourceList', 'mediaList', 'frequencyList', 'parameterList', 'SITE',
        function ($scope, $rootScope, $location, $cookies, $uibModal, $http, $q, projS, thisProject, siteStatList, lakeList, stateList, CountryList, resourceList, mediaList, frequencyList, parameterList, SITE) {
            $scope.projectSites = projS;
            for (var psu = 0; psu < $scope.projectSites.length; psu++) {
                var ind = psu;
                if ($scope.projectSites[ind].URL !== undefined && !$scope.projectSites[ind].URL.startsWith('http')) {
                    $scope.projectSites[ind].URL = 'http://' + $scope.projectSites[ind].URL;
                }
            }
            $scope.thisProject = thisProject;
            $scope.LakeList = lakeList; $scope.StatusList = siteStatList; $scope.ResourceList = resourceList; $scope.MediaList = mediaList; $scope.FreqList = frequencyList; $scope.ParamList = parameterList;
            $scope.FrequenciesToAdd = []; $scope.MediaToAdd = []; $scope.ParameterToAdd = []; $scope.ResourceToAdd = [];
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
                aSITE.START_DATE = aSite.StartDate !== undefined ? aSite.StartDate : "";
                aSITE.END_DATE = aSite.EndDate !== undefined ? aSite.EndDate : "";
                aSITE.PROJECT_ID = aSite.ProjID;
                aSITE.SAMPLE_PLATFORM = aSite.SamplePlatform !== undefined ? aSite.SamplePlatform : "";
                aSITE.ADDITIONAL_INFO = aSite.AdditionalInfo;
                aSITE.NAME = aSite.Name;
                aSITE.DESCRIPTION = aSite.Description !== undefined ? aSite.Description : "";
                aSITE.LATITUDE = aSite.latitude;
                aSITE.LONGITUDE = aSite.longitude;
                aSITE.WATERBODY = aSite.Waterbody !== undefined ? aSite.Waterbody : "";
                aSITE.STATUS_TYPE_ID = aSite.StatType !== undefined ? aSite.StatType.STATUS_ID : "0";
                aSITE.LAKE_TYPE_ID = aSite.LakeType.LAKE_TYPE_ID;
                aSITE.COUNTRY = aSite.Country;
                aSITE.STATE_PROVINCE = aSite.State;
                aSITE.WATERSHED_HUC8 = aSite.WatershedHUC8 !== undefined ? aSite.WatershedHUC8 : "";
                aSITE.URL = aSite.URL !== undefined ? aSite.URL : "";

                return aSITE;
            };

            //copy to new site using this site's info, show edit page populated with create button
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
                    thisSite.ProjID = $scope.thisProject.PROJECT_ID;
                    thisSite.Name = newSiteName.name;
                    thisSite.StatType = $scope.StatusList.filter(function (st) { return st.STATUS == thisSite.Status; })[0];
                    thisSite.LakeType = $scope.LakeList.filter(function (st) { return st.LAKE == thisSite.GreatLake; })[0];
                    //properly form the site
                    var aSITE = formatSite(thisSite);
                    var freqSplit = thisSite.Frequency !== undefined ? thisSite.Frequency.split(',') : [];
                    var medSplit = thisSite.Media !== undefined ? thisSite.Media.split(',') : [];
                    var resSplit = thisSite.Resources !== undefined ? thisSite.Resources.split(',') : [];

                    var paramSorted = [];
                    var bioSplit = thisSite.ParameterStrings.Biological.split(';');
                    var chemSplit = thisSite.ParameterStrings.Chemical.split(';');
                    var micSplit = thisSite.ParameterStrings.Microbiological.split(';');
                    var phySplit = thisSite.ParameterStrings.Physical.split(';');
                    var toxSplit = thisSite.ParameterStrings.Toxicological.split(';');

                    for (var b = 0; b < bioSplit.length; b++) {
                        //add biological string
                        paramSorted.push(bioSplit[b]);
                    }
                    for (var c = 0; c < chemSplit.length; c++) {
                        //add chemical string
                        paramSorted.push(chemSplit[c]);
                    }
                    for (var m = 0; m < micSplit.length; m++) {
                        //add microbiological string
                        paramSorted.push(micSplit[m]);
                    }
                    for (var p = 0; p < phySplit.length; p++) {
                        //add physical string
                        paramSorted.push(phySplit[p]);
                    }
                    for (var t = 0; t < toxSplit.length; t++) {
                        //add tox string
                        paramSorted.push(toxSplit[t]);
                    }
                    var paramsSplit = paramSorted;

                    //now that they are all arrays, go get them to add for posting
                    for (var sf = 0; sf < freqSplit.length; sf++) {
                        for (var f = 0; f < $scope.FreqList.length; f++) {
                            //remove spaces for accurate compare with Replace
                            if (freqSplit[sf].replace(/\s/g, '') == $scope.FreqList[f].FREQUENCY.replace(/\s/g, '')) {
                                $scope.FrequenciesToAdd.push($scope.FreqList[f]);
                                f = $scope.FreqList.length;
                            }
                        }
                    }
                    for (var sm = 0; sm < medSplit.length; sm++) {
                        for (var med = 0; med < $scope.MediaList.length; med++) {
                            //remove spaces for accurate compare with Replace
                            if (medSplit[sm].replace(/\s/g, '') == $scope.MediaList[med].MEDIA.replace(/\s/g, '')) {
                                $scope.MediaToAdd.push($scope.MediaList[med]);
                                med = $scope.MediaList.length;
                            }
                        }
                    }
                    for (var sr = 0; sr < resSplit.length; sr++) {
                        for (var r = 0; r < $scope.ResourceList.length; r++) {
                            //remove spaces for accurate compare with Replace
                            if (resSplit[sr].replace(/\s/g, '') == $scope.ResourceList[r].RESOURCE_NAME.replace(/\s/g, '')) {
                                $scope.ResourceToAdd.push($scope.ResourceList[r]);
                                r = $scope.ResourceList.length;
                            }
                        }
                    }
                    for (var sp = 0; sp < paramsSplit.length; sp++) {
                        for (var pa = 0; pa < $scope.ParamList.length; pa++) {
                            //remove spaces for accurate compare with Replace
                            if (paramsSplit[sp].replace(/\s/g, '') == $scope.ParamList[pa].PARAMETER.replace(/\s/g, '')) {
                                $scope.ParameterToAdd.push($scope.ParamList[pa]);
                                pa = $scope.ParamList.length;
                            }
                        }
                    }
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    var siteId = "";
                    SITE.save(aSITE, function success(response) {
                        $rootScope.stateIsLoading.showLoading = true; //loading... 
                        thisSite.SiteId = response.SITE_ID;
                        $scope.projectSites.push(thisSite);
                        toastr.success("Site Created");
                        siteId = response.SITE_ID;
                        //projSites.push(response);
                        $scope.sitesCount.total = $scope.sitesCount.total + 1;
                        //use $q for async call to add frequencies, media, parameters, resources
                        var defer = $q.defer();
                        var AddPromises = [];
                        //post frequencies added
                        angular.forEach($scope.FrequenciesToAdd, function (freq) {
                            var addFreqPromise = SITE.addSiteFrequency({ id: siteId }, freq).$promise;
                            AddPromises.push(addFreqPromise);
                        });
                        //post media
                        angular.forEach($scope.MediaToAdd, function (med) {
                            var addMedPromise = SITE.addSiteMedia({ id: siteId }, med).$promise;
                            AddPromises.push(addMedPromise);
                        });
                        //post parameters
                        angular.forEach($scope.ParameterToAdd, function (par) {
                            var addParamPromise = SITE.addSiteParameter({ id: siteId }, par).$promise;
                            AddPromises.push(addParamPromise);
                        });
                        //post resources
                        angular.forEach($scope.ResourceToAdd, function (res) {
                            var addResPromise = SITE.addSiteResource({ id: siteId }, res).$promise;
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
                        },
                        siteFreq: function () {
                            if (site !== 0) {
                                return SITE.getSiteFrequencies({ id: site.SiteId }).$promise;
                            }
                        },
                        siteMed: function () {
                            if (site !== 0) {
                                return SITE.getSiteMedia({ id: site.SiteId }).$promise;
                            }
                        },
                        siteRes: function () {
                            if (site !== 0) {
                                return SITE.getSiteResources({ id: site.SiteId }).$promise;
                            }
                        },
                        siteParams: function () {
                            if (site !== 0) {
                                return SITE.getSiteParameters({ id: site.SiteId }).$promise;
                            }
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
