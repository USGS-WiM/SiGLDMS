(function () {
    'use strict';

    var ModalControllers = angular.module('ModalControllers', []);
    
    ModalControllers.controller('siteModalCtrl', ['$scope', '$rootScope', '$q', '$location', '$cookies', '$http', '$uibModal', '$uibModalInstance', '$state', 'thisProject', 'allDropDownParts', 'thisSite',
        'siteFreq', 'siteMed', 'siteRes', 'siteParams', 'SITE',
        function ($scope, $rootScope, $q, $location, $cookies, $http, $uibModal, $uibModalInstance, $state, thisProject, allDropDownParts, thisSite, siteFreq, siteMed, siteRes, siteParams, SITE) {
            if ($cookies.get('siGLCreds') === undefined || $cookies.get('siGLCreds') === "") {
                $scope.auth = false;
                $location.path('/login');
            } else {
                angular.element('a#siteTab').addClass('active'); //make sure that tab still stays active
                $scope.status = { phyOpen: false, chemOpen: false, bioOpen: false, microOpen: false, toxOpen: false        };
                $rootScope.stateIsLoading.showLoading = false; //loading... 
                $scope.thisSite = {}; //holder for project (either coming in for edit, or being created on POST )
                $scope.freqDirty = false; $scope.freqToRemove = [];
                $scope.medDirty = false; $scope.medToRemove = [];
                $scope.resDirty = false; $scope.resToRemove = [];
                $scope.paramDirty = false; $scope.paramToRemove = [];
                $scope.freqCommaSep = []; $scope.medCommaSep = []; $scope.resCommaSep = []; $scope.paramCommaSep = [];
                $scope.showParams = false;// div containing all parameters (toggles show/hide)
                $scope.showHide = "Show"; //button text for show/hide parameters

                //all the dropdowns [siteStatList0, lakeList1, stateList2, CountryList3, resourceList4, mediaList5, frequencyList6, parameterList7];
                $scope.allCountries = angular.copy(allDropDownParts[3]); // CountryList;
                $scope.allStates = angular.copy(allDropDownParts[2]); //stateList;
                $scope.allLakes = angular.copy(allDropDownParts[1]);// lakeList;
                $scope.allStats = angular.copy(allDropDownParts[0]);// siteStatList;
                $scope.allResources = angular.copy(allDropDownParts[4]);// resourceList;
                $scope.allParametes = angular.copy(allDropDownParts[7]);// parameterList;
                $scope.allFrequencies = angular.copy(allDropDownParts[6]);
                $scope.allMedia = angular.copy(allDropDownParts[5]);

                //date without time
                var makeAdateString = function (d) {
                    var aDate = new Date();
                    if (d !== "") {
                        //provided date
                        aDate = new Date(d);
                    }

                    var year = aDate.getFullYear();
                    var month = aDate.getMonth();
                    var day = ('0' + aDate.getDate()).slice(-2);
                    var monthNames = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
                    var dateWOtime = monthNames[month] + "/" + day + "/" + year;
                    return dateWOtime;
                };
                var formatSITE = function (s) {
                    var site = {
                        SITE_ID: s.SiteId,
                        START_DATE: s.StartDate !== undefined && s.StartDate !== "" ? new Date(s.StartDate) : null,
                        END_DATE: s.EndDate !== undefined && s.EndDate !== "" ? new Date(s.EndDate) : null,
                        PROJECT_ID: thisProject.PROJECT_ID,
                        SAMPLE_PLATFORM: s.SamplePlatform,
                        ADDITIONAL_INFO: s.AdditionalInfo,
                        NAME: s.Name,
                        DESCRIPTION: s.Description,
                        LATITUDE: s.latitude,
                        LONGITUDE: s.longitude,
                        WATERBODY: s.Waterbody,
                        STATUS_TYPE_ID: s.Status !== "" && s.Status !== undefined ? $scope.allStats.filter(function (st) { return st.STATUS == s.Status; })[0].STATUS_ID : 0,
                        LAKE_TYPE_ID: $scope.allLakes.filter(function (l) { return l.LAKE == s.GreatLake; })[0].LAKE_TYPE_ID,
                        COUNTRY: s.Country,
                        STATE_PROVINCE: s.State,
                        WATERSHED_HUC8: s.WatershedHUC8,
                        URL: s.URL
                    };
                    return site;
                };

                //#region Datepicker
                $scope.datepickrs = {
                    projStDate: false,
                    projEndDate: false
                };
                $scope.open = function ($event, which) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    $scope.datepickrs[which] = true;
                };
                $scope.format = 'MMM dd, yyyy';
                //#endregion Datepicker
            
                //make sure lat/long are right number range
                $scope.checkValue = function () {
                    if ($scope.thisSite.LATITUDE < 0 || $scope.thisSite.LATITUDE > 73) {
                        openLatModal();
                    }
                    if ($scope.thisSite.LONGITUDE < -175 || $scope.thisSite.LONGITUDE > -60) {
                        openLongModal();
                    }
                };

                //start or end date was changed -- compare to ensure end date comes after start date
                $scope.compareSiteDates = function (d) {
                    if ($scope.thisSite.END_DATE !== undefined) {
                        if (new Date($scope.thisSite.END_DATE) < new Date($scope.thisSite.START_DATE)) {
                            var dateModal = $uibModal.open({
                                template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                                            '<div class="modal-body"><p>Sampling end date must come after start date.</p></div>' +
                                            '<div class="modal-footer"><button class="btn btn-primary" ng-enter="ok()" ng-click="ok()">OK</button></div>',
                                controller: function ($scope, $uibModalInstance) {
                                    $scope.ok = function () {
                                        $uibModalInstance.close(d);
                                    };
                                },
                                size: 'sm'
                            });
                            dateModal.result.then(function (wrongDate) {
                                if (wrongDate == "start") {
                                    $scope.thisSite.START_DATE = "";
                                    angular.element("#START_DATE").focus();
                                } else {
                                    $scope.thisSite.END_DATE = "";
                                    angular.element("#END_DATE").focus();
                                }
                            });
                        }
                    }
                };

                //are we in edit or create?
                if (thisSite !== undefined) {
                    //#region edit view

                    //1. this site
                    var siteModel = angular.copy(thisSite);
                    $scope.thisSite = formatSITE(siteModel);
                                
                    // $scope.title = "Site: " + $scope.thisSite.NAME;

                    //convert the multiSelects for isteven (add new property for checked flag
                    //#region siteFrequencies
                    //pull these from dropdownsToSend filter frequencies var siteFreqs = siteFrequencies;
               
                    //go through allFrequencies and add selected property
                    for (var i = 0; i < $scope.allFrequencies.length; i++) {
                        //for each one, if siteFreq has this id, add 'selected:true' else add 'selected:false'
                        for (var y = 0; y < siteFreq.length; y++) {
                            if (siteFreq[y].FREQUENCY_TYPE_ID == $scope.allFrequencies[i].FREQUENCY_TYPE_ID) {
                                $scope.allFrequencies[i].selected = true;
                                y = siteFreq.length;
                            }
                            else {
                                $scope.allFrequencies[i].selected = false;
                            }
                        }
                        if (siteFreq.length === 0) {
                            $scope.allFrequencies[i].selected = false;
                        }
                    }
                    $scope.Frequencydata = $scope.allFrequencies;
                    //#endregion siteFrequencies

                    //#region siteMedia              
                    //go through allMeds and add selected property
                    for (var mi = 0; mi < $scope.allMedia.length; mi++) {
                        //for each one, if siteMeds has this id, add 'selected:true' else add 'selected:false'
                        for (var sm = 0; sm < siteMed.length; sm++) {
                            if (siteMed[sm].MEDIA_TYPE_ID == $scope.allMedia[mi].MEDIA_TYPE_ID) {
                                $scope.allMedia[mi].selected = true;
                                sm = siteMed.length;
                            }
                            else {
                                $scope.allMedia[mi].selected = false;
                            }
                        }
                        if (siteMed.length === 0) {
                            $scope.allMedia[mi].selected = false;
                        }
                    }
                    $scope.Mediadata = $scope.allMedia;
                    //#endregion siteMedia

                    //#region siteParameters
                    //go through siteParams and add selected property
                    for (var pi = 0; pi < $scope.allParametes.length; pi++) {
                        //for each one, if siteParams has this id, add 'selected:true' else add 'selected:false'
                        for (var sp = 0; sp < siteParams.length; sp++) {
                            if (siteParams[sp].PARAMETER_TYPE_ID == $scope.allParametes[pi].PARAMETER_TYPE_ID) {
                                $scope.allParametes[pi].selected = true;
                                sp = siteParams.length;
                            }
                            else {
                                $scope.allParametes[pi].selected = false;
                            }
                        }
                        if (siteParams.length === 0) {
                            $scope.allParametes[pi].selected = false;
                        }
                    }
                    $scope.physParams = []; $scope.bioParams = []; $scope.chemParams = []; $scope.microBioParams = []; $scope.toxiParams = [];
                    $scope.physParams.push($scope.allParametes.filter(function (p) {
                        return p.PARAMETER_GROUP == "Physical";
                    }));
                    $scope.bioParams.push($scope.allParametes.filter(function (p) {
                        return p.PARAMETER_GROUP == "Biological";
                    }));
                    $scope.chemParams.push($scope.allParametes.filter(function (p) {
                        return p.PARAMETER_GROUP == "Chemical";
                    }));
                    $scope.microBioParams.push($scope.allParametes.filter(function (p) {
                        return p.PARAMETER_GROUP == "Microbiological";
                    }));
                    $scope.toxiParams.push($scope.allParametes.filter(function (p) {
                        return p.PARAMETER_GROUP == "Toxicological";
                    }));

                    //$scope.Parameterdata = allParams;

                    //#endregion siteParameters

                    //#region siteResources
                    //go through allRes and add selected property
                    for (var ri = 0; ri < $scope.allResources.length; ri++) {
                        //for each one, if siteRes has this id, add 'selected:true' else add 'selected:false'
                        for (var sr = 0; sr < siteRes.length; sr++) {
                            if (siteRes[sr].RESOURCE_TYPE_ID == $scope.allResources[ri].RESOURCE_TYPE_ID) {
                                $scope.allResources[ri].selected = true;
                                sr = siteRes.length;
                            }
                            else {
                                $scope.allResources[ri].selected = false;
                            }
                        }
                        if (siteRes.length === 0) {
                            $scope.allResources[ri].selected = false;
                        }
                    }
                    $scope.Resourcedata = $scope.allResources;
                    //#endregion siteResources
                    //#endregion
                }//end edit view
                else {
                    $scope.title = "New Site";
                }//end create view

                //requirements for both create and edit views

                //show/hide the parameters
                $scope.showParamDiv = function ($event) {
                    if ($scope.showHide == "Hide") {
                        $scope.showHide = "Show";
                        $scope.showParams = false;
                    } else {
                        $scope.showHide = "Hide";
                        $scope.showParams = true;
                    }
                    $event.preventDefault();
                    $event.stopPropagation();
                };

                if (thisSite === undefined) {

                    //#region add selected property to all multiselects (need to set these if new site)
                    //frequencies
                    for (var a = $scope.allFrequencies.length; a--;) {
                        $scope.allFrequencies[a].selected = false;
                    }
                    $scope.Frequencydata = $scope.allFrequencies;
                    //media
                    for (var ma = $scope.allMedia.length; ma--;) {
                        $scope.allMedia[ma].selected = false;
                    }
                    $scope.Mediadata = $scope.allMedia;
                    //parameters
                    for (var pa = $scope.allParametes.length; pa--;) {
                        $scope.allParametes[pa].selected = false;
                    }
                    $scope.physParams = []; $scope.bioParams = []; $scope.chemParams = []; $scope.microBioParams = []; $scope.toxiParams = [];
                    $scope.physParams.push($scope.allParametes.filter(function (p) {
                        return p.PARAMETER_GROUP == "Physical";
                    }));
                    $scope.bioParams.push($scope.allParametes.filter(function (p) {
                        return p.PARAMETER_GROUP == "Biological";
                    }));
                    $scope.chemParams.push($scope.allParametes.filter(function (p) { return p.PARAMETER_GROUP == "Chemical"; }));
                    $scope.microBioParams.push($scope.allParametes.filter(function (p) {
                        return p.PARAMETER_GROUP == "Microbiological";
                    }));
                    $scope.toxiParams.push($scope.allParametes.filter(function (p) {
                        return p.PARAMETER_GROUP == "Toxicological";
                    }));
                    // $scope.Parameterdata = parameterList;
                    //resources
                    for (var ra = $scope.allResources.length; ra--;) {
                        $scope.allResources[ra].selected = false;
                    }
                    $scope.Resourcedata = $scope.allResources;
                    //#endregion add selected property to all multiselects (need to set these if new site)

                }// thisSite == undefined

                //#region a FREQUENCY was clicked
                $scope.FreqClick = function (data) {
                    $scope.freqDirty = true;
                    if (data.selected) {
                        if ($scope.thisSite.SITE_ID !== undefined) { //editing
                            //see if it needs to be taken out of removeList
                            var i = $scope.freqToRemove.map(function (f) { return f.FREQUENCY_TYPE_ID; }).indexOf(data.FREQUENCY_TYPE_ID);
                            if (i >= 0) $scope.freqToRemove.splice(i, 1); //remove from removeList (in case they removed and then added it back)
                        }
                    } else {
                        //data.selected == false
                        if ($scope.thisSite.SITE_ID !== undefined) { //edit
                            $scope.freqToRemove.push(data); //add it to removeList
                        }
                    }
                };//end FreqClick
                //#endregion FREQUENCY 

                //#region a MEDIA was clicked 
                $scope.MedClick = function (data) {
                    $scope.medDirty = true;
                    if (data.selected) {
                        if ($scope.thisSite.SITE_ID !== undefined) { //editing
                            //see if it needs to be taken out of removeList
                            var i = $scope.medToRemove.map(function (m) { return m.MEDIA_TYPE_ID; }).indexOf(data.MEDIA_TYPE_ID);
                            if (i >= 0) $scope.medToRemove.splice(i, 1); //remove from removeList (in case they removed and then added it back)
                        }
                    } else {
                        //data.selected == false
                        if ($scope.thisSite.SITE_ID !== undefined) { //edit
                            $scope.medToRemove.push(data); //add it to removeList
                        }
                    }
                };//end MedClick
                //#endregion MEDIA

                //#region a RESOURCE was clicked 
                $scope.ResClick = function (data) {
                    $scope.resDirty = true;
                    if (data.selected)  {
                        //  $scope.resToAdd.push(data);
                        if ($scope.thisSite.SITE_ID !== undefined) { //editing
                            //see if it needs to be taken out of removeList
                            var i = $scope.resToRemove.map(function (r) { return r.RESOURCE_TYPE_ID; }).indexOf(data.RESOURCE_TYPE_ID);
                            if (i >= 0) $scope.resToRemove.splice(i, 1); //remove from removeList (in case they removed and then added it back)
                        }
                    } else {
                        //data.selected == false
                        if ($scope.thisSite.SITE_ID !== undefined) { //edit
                            $scope.resToRemove.push(data); //add it to removeList                      
                        }
                    }
                };//end ResClick
                //#endregion RESOURCE 

                //#region a PARAMETER was clicked 
                $scope.ParamClick = function (data) {
                    $scope.paramDirty = true;
                    if (data.selected) {
                        if ($scope.thisSite.SITE_ID !== undefined) { //editing
                            //see if it needs to be taken out of removeList
                            var i = $scope.paramToRemove.map(function (p) { return p.PARAMETER_TYPE_ID; }).indexOf(data.PARAMETER_TYPE_ID);
                            if (i >= 0) $scope.paramToRemove.splice(i, 1); //remove from removeList (in case they removed and then added it back)
                        }
                    } else {
                        //data.selected == false
                        if ($scope.thisSite.SITE_ID !== undefined) { //edit
                            $scope.paramToRemove.push(data); //add it to removeList                    
                        }
                    }
                };//end ParamClick
                //#endregion PARAMETER

                $scope.isNum = function (evt) {
                    var theEvent = evt || window.event;
                    var key = theEvent.keyCode || theEvent.which;
                    //key = String.fromCharCode(key);
                    //var regex = /[0-9]|\./;
                    if (key != 46 && key != 45 && key > 31 && (key < 48 || key > 57)) {
                        theEvent.returnValue = false;
                        if (theEvent.preventDefault) theEvent.preventDefault();
                    }
                };

                //lat modal 
                var openLatModal = function () {
                    var latModal = $uibModal.open({
                        template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                            '<div class="modal-body"><p>The Latitude must be between 0 and 73.0</p></div>' +
                            '<div class="modal-footer"><button class="btn btn-primary" ng-enter="ok()" ng-click="ok()">OK</button></div>',
                        controller: function ($scope, $uibModalInstance) {
                            $scope.ok = function () {
                                $uibModalInstance.close('lat');
                            };
                        },
                        size: 'sm'
                    });
                    latModal.result.then(function (fieldFocus) {
                        if (fieldFocus == "lat")
                            $("#LATITUDE").focus();
                    });
                };

                //long modal
                var openLongModal = function () {
                    var longModal = $uibModal.open({
                        template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                            '<div class="modal-body"><p>The Longitude must be between -175.0 and -60.0</p></div>' +
                            '<div class="modal-footer"><button class="btn btn-primary" ng-enter="ok()" ng-click="ok()">OK</button></div>',
                        controller: function ($scope, $uibModalInstance) {
                            $scope.ok = function () {
                                $uibModalInstance.close('long');
                            };
                        },
                        size: 'sm'
                    });
                    longModal.result.then(function (fieldFocus) {
                        if (fieldFocus == "long")
                            $("#LONGITUDE").focus();
                    });
                };

                //PUT
                $scope.save = function (valid) {
                    //check if they filled in all required fields
                    if (valid){
                        $rootScope.stateIsLoading.showLoading = true; //loading...
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        $http.defaults.headers.common.Accept = 'application/json';
                        $http.defaults.headers.common['X-HTTP-Method-Override'] = 'PUT';
                        $scope.thisSite.PROJECT_ID = thisProject.PROJECT_ID;                    
                        SITE.save({ id: $scope.thisSite.SITE_ID }, $scope.thisSite, function success(siteResponse) {
                            delete $http.defaults.headers.common['X-HTTP-Method-Override']; //remove 'PUT' override
                            //use $q for async call to delete and add objectives and keywords
                            var defer = $q.defer();
                            var RemovePromises = [];
                            var AddPromises = [];
                            //#region REMOVES
                            //remove frequencies (freqToRemove contains those to remove ->DELETE)
                            angular.forEach($scope.freqToRemove, function (Fvalue) {
                                $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';
                                var delFreqProm = SITE.deleteSiteFrequency({ id: $scope.thisSite.SITE_ID }, Fvalue).$promise;
                                RemovePromises.push(delFreqProm);
                                delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                            });

                            //remove media (medToRemove contains those to remove ->DELETE)
                            angular.forEach($scope.medToRemove, function (Mvalue) {
                                $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';
                                var delMedProm = SITE.deleteSiteMedia({ id: $scope.thisSite.SITE_ID }, Mvalue).$promise;
                                RemovePromises.push(delMedProm);
                                delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                            });

                            //remove resources (resToRemove contains those to remove ->DELETE)
                            angular.forEach($scope.resToRemove, function (Rvalue) {
                                $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';
                                var delResProm = SITE.deleteSiteResource({ id: $scope.thisSite.SITE_ID }, Rvalue).$promise;
                                RemovePromises.push(delResProm);
                                delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                            });

                            //remove Paramters (paramToRemove contains those to remove ->DELETE)
                            angular.forEach($scope.paramToRemove, function (Pvalue) {
                                $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';
                                var delParamProm = SITE.deleteSiteParameter({ id: $scope.thisSite.SITE_ID }, Pvalue).$promise;
                                RemovePromises.push(delParamProm);
                                delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                            });
                            //#endregion
                            //#region ADDS
                            //add Frequencies only if $scope.freqDirty = true;
                            if ($scope.freqDirty) {
                                angular.forEach($scope.Frequencymodel.value, function (FaddValue) {
                                    $scope.freqCommaSep.push(FaddValue.FREQUENCY);
                                    var freqProm = SITE.addSiteFrequency({ id: $scope.thisSite.SITE_ID }, FaddValue).$promise;
                                    AddPromises.push(freqProm);
                                });
                            }
                            //add Media only if $scope.medDirty = true;
                            if ($scope.medDirty) {
                                angular.forEach($scope.Mediamodel.value, function (MaddValue) {
                                    $scope.medCommaSep.push(MaddValue.MEDIA);
                                    var medProm = SITE.addSiteMedia({ id: $scope.thisSite.SITE_ID }, MaddValue).$promise;
                                    AddPromises.push(medProm);
                                });
                            }
                            //add Resources only if $scope.resDirty = true;
                            if ($scope.resDirty) {
                                angular.forEach($scope.Resourcemodel.value, function (RaddValue) {
                                    $scope.resCommaSep.push(RaddValue.RESOURCE_NAME);
                                    var resProm = SITE.addSiteResource({ id: $scope.thisSite.SITE_ID }, RaddValue).$promise;
                                    AddPromises.push(resProm);
                                });
                            }
                            //add Parameters only if $scope.paramDirty = true;
                            $scope.pParams =[]; $scope.bParams =[]; $scope.cParams =[]; $scope.mBioParams =[]; $scope.tParams =[];
                        
                            angular.forEach($scope.allParametes, function (p) {
                                if (p.selected) {
                                    $scope.paramCommaSep.push(p);
                                    if (p.PARAMETER_GROUP == 'Physical') $scope.pParams.push(p.PARAMETER);
                                    if (p.PARAMETER_GROUP == 'Biological') $scope.bParams.push(p.PARAMETER);
                                    if (p.PARAMETER_GROUP == 'Chemical') $scope.cParams.push(p.PARAMETER);
                                    if (p.PARAMETER_GROUP == 'Microbiological') $scope.mBioParams.push(p.PARAMETER);
                                    if (p.PARAMETER_GROUP == 'Toxicological') $scope.tParams.push(p.PARAMETER);
                                    if ($scope.resDirty) {
                                        var paramProm = SITE.addSiteParameter({ id: $scope.thisSite.SITE_ID }, p).$promise;
                                        AddPromises.push(paramProm);
                                    }
                                }
                            });
                        
                            //#endregion
                            //ok now run the removes, then the adds and then pass the stuff back out of here.
                            $q.all(RemovePromises).then(function () {
                                //clear remove arrays
                                $scope.freqToRemove = []; $scope.medToRemove = []; $scope.resToRemove = []; $scope.paramToRemove = [];
                                $q.all(AddPromises).then(function (response) {
                                    var newSiteFormatted = {
                                        'SiteId': $scope.thisSite.SITE_ID,
                                        'Name': $scope.thisSite.NAME,
                                        'latitude': $scope.thisSite.LATITUDE,
                                        'longitude': $scope.thisSite.LONGITUDE,
                                        'StartDate': $scope.thisSite.START_DATE !== undefined ? makeAdateString($scope.thisSite.START_DATE): '',
                                        'EndDate': $scope.thisSite.END_DATE !== undefined ? makeAdateString($scope.thisSite.END_DATE) : '',
                                        'SamplePlatform': $scope.thisSite.SAMPLE_PLATFORM,
                                        'AdditionalInfo': $scope.thisSite.ADDITIONAL_INFO,
                                        'Description': $scope.thisSite.DESCRIPTION,
                                        'Waterbody': $scope.thisSite.WATERBODY,
                                        'GreatLake': $scope.allLakes.filter(function (l) { return l.LAKE_TYPE_ID == $scope.thisSite.LAKE_TYPE_ID; })[0].LAKE,
                                        'Status': $scope.thisSite.STATUS_TYPE_ID > 0 ? $scope.allStats.filter(function (s) { return s.STATUS_ID == $scope.thisSite.STATUS_TYPE_ID; })[0].STATUS : "",
                                        'Country': $scope.thisSite.COUNTRY,
                                        'State': $scope.thisSite.STATE_PROVINCE,
                                        'WatershedHUC8': $scope.thisSite.WATERSHED_HUC8,
                                        'URL': $scope.thisSite.URL,
                                        'Media': $scope.medCommaSep.join(", "),
                                        'Resources': $scope.resCommaSep.join(", "),
                                        'Frequency': $scope.freqCommaSep.join(", "),
                                        'Parameters': $scope.paramCommaSep,
                                        'ParameterStrings': {
                                            'Biological': $scope.bParams.join(", "),
                                            'Chemical': $scope.cParams.join(", "),
                                            'Microbiological': $scope.mBioParams.join(", "),
                                            'Physical': $scope.pParams.join(", "),
                                            'Toxicological': $scope.tParams.join(", ")
                                        }
                                    };
                                    var siteParts = [newSiteFormatted, 'update'];
                                    toastr.success("Site Updated");
                                    $uibModalInstance.close(siteParts);
                                }).catch(function error(msg) {
                                    console.error(msg);
                                });
                            }).catch(function error(msg) {
                                console.error(msg);
                            });
                        }, function error(errorResponse) {
                            toastr.error("Site did not update");
                        });
                    } //end else valid
                };//end save

                //save NEW SITE and then frequencies, media, parameters, and resources
                $scope.create = function (valid) {
                    if ($scope.thisSite.SITE_ID !== undefined) {
                        $scope.save(valid);
                    } else {
                        if (valid) {
                            $scope.thisSite.PROJECT_ID = thisProject.PROJECT_ID;
                            $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                            $http.defaults.headers.common.Accept = 'application/json';
                            //post site
                            SITE.save({}, $scope.thisSite, function success(response) {
                                var newSite = response;
                                var defer = $q.defer();
                                var postPromises = [];
                                //post frequencies
                                angular.forEach($scope.Frequencymodel.value, function (fValue) {
                                    if (fValue.selected) {
                                        $scope.freqCommaSep.push(fValue.FREQUENCY);
                                        var freqProm = SITE.addSiteFrequency({ id: newSite.SITE_ID }, fValue).$promise;
                                        postPromises.push(freqProm);
                                    }
                                });
                                //post media
                                angular.forEach($scope.Mediamodel.value, function (mValue) {
                                    if (mValue.selected) {
                                        $scope.medCommaSep.push(mValue.MEDIA);
                                        var medProm = SITE.addSiteMedia({ id: newSite.SITE_ID }, mValue).$promise;
                                        postPromises.push(medProm);
                                    }
                                });
                                //post resources
                                angular.forEach($scope.Resourcemodel.value, function (rValue) {
                                    if (rValue.selected) {
                                        $scope.resCommaSep.push(rValue.RESOURCE_NAME);
                                        var resProm = SITE.addSiteResource({ id: newSite.SITE_ID }, rValue).$promise;
                                        postPromises.push(resProm);
                                    }
                                });
                                $scope.pParams = []; $scope.bParams = []; $scope.cParams = []; $scope.mBioParams = []; $scope.tParams = [];
                                //post parameters
                                angular.forEach($scope.allParametes, function (pValue) {
                                    if (pValue.selected) {
                                        $scope.paramCommaSep.push(pValue);
                                        if (pValue.PARAMETER_GROUP == 'Physical') $scope.pParams.push(pValue.PARAMETER);
                                        if (pValue.PARAMETER_GROUP == 'Biological') $scope.bParams.push(pValue.PARAMETER);
                                        if (pValue.PARAMETER_GROUP == 'Chemical') $scope.cParams.push(pValue.PARAMETER);
                                        if (pValue.PARAMETER_GROUP == 'Microbiological') $scope.mBioParams.push(pValue.PARAMETER);
                                        if (pValue.PARAMETER_GROUP == 'Toxicological') $scope.tParams.push(pValue.PARAMETER);

                                        var parProm = SITE.addSiteParameter({ id: newSite.SITE_ID }, pValue).$promise;
                                        postPromises.push(parProm);
                                    }
                                });
                                $q.all(postPromises).then(function (response) {
                                    var newSiteFormatted = {
                                        'SiteId': newSite.SITE_ID,
                                        'Name': newSite.NAME,
                                        'latitude': newSite.LATITUDE,
                                        'longitude': newSite.LONGITUDE,
                                        'StartDate': newSite.START_DATE !== undefined ? makeAdateString(newSite.START_DATE) : '',
                                        'EndDate': newSite.END_DATE !== undefined ? makeAdateString(newSite.END_DATE) : '',
                                        'SamplePlatform': newSite.SAMPLE_PLATFORM,
                                        'AdditionalInfo': newSite.ADDITIONAL_INFO,
                                        'Description': newSite.DESCRIPTION,
                                        'Waterbody': newSite.WATERBODY,
                                        'GreatLake': $scope.allLakes.filter(function (l) { return l.LAKE_TYPE_ID == newSite.LAKE_TYPE_ID; })[0].LAKE,
                                        'Status': newSite.STATUS_TYPE_ID > 0 && newSite.STATUS_TYPE_ID !== null ? $scope.allStats.filter(function (s) { return s.STATUS_ID == newSite.STATUS_TYPE_ID; })[0].STATUS : "",
                                        'Country': newSite.COUNTRY,
                                        'State': newSite.STATE_PROVINCE,
                                        'WatershedHUC8': newSite.WATERSHED_HUC8,
                                        'URL': newSite.URL,
                                        'Resources': $scope.resCommaSep.join(", "),
                                        'Media': $scope.medCommaSep.join(", "),
                                        'Frequency': $scope.freqCommaSep.join(", "),
                                        'Parameters': $scope.paramCommaSep,
                                        'ParameterStrings': {
                                            'Biological': $scope.bParams.join(", "),
                                            'Chemical': $scope.cParams.join(", "),
                                            'Microbiological': $scope.mBioParams.join(", "),
                                            'Physical': $scope.pParams.join(", "),
                                            'Toxicological': $scope.tParams.join(", ")
                                        }
                                    };

                                    var siteParts = [newSiteFormatted, 'create'];

                                    toastr.success("Site Created");
                                    $uibModalInstance.close(siteParts);
                                }).catch(function error(msg) {
                                    console.error(msg);
                                });
                            });//end SITE.save()
                        }//end valid == true
                    } //really is create and not just a save that got triggered by hitting enter in a field
                };//end create()

                //cancel modal
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };

            }//end CheckCreds() passed
        }]);
})();
