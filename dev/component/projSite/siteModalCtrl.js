(function () {
    'use strict';

    var ModalControllers = angular.module('ModalControllers');
    
    ModalControllers.controller('siteModalCtrl', ['$scope', '$rootScope', '$q', '$location', '$cookies', '$http', '$uibModal', '$uibModalInstance', '$state', 'thisProject', 'allDropDownParts', 'thisSite', 'SITE',
        function ($scope, $rootScope, $q, $location, $cookies, $http, $uibModal, $uibModalInstance, $state, thisProject, allDropDownParts, thisSite, SITE) {
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
                $scope.freqAdded = []; $scope.medAdded = []; $scope.resAdded = []; $scope.paramAdded = [];
                $scope.showParams = false;// div containing all parameters (toggles show/hide)
                $scope.showHide = "Show"; //button text for show/hide parameters
                $scope.siteSaving = false; //set to true when saving for visual cue
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
                        site_id: s.SiteId,
                        start_date: s.StartDate !== undefined && s.StartDate !== "" ? new Date(s.StartDate) : null,
                        end_date: s.EndDate !== undefined && s.EndDate !== "" ? new Date(s.EndDate) : null,
                        project_id: thisProject.project_id,
                        sample_platform: s.SamplePlatform,
                        additional_info: s.AdditionalInfo,
                        name: s.Name,
                        description: s.Description,
                        latitude: s.latitude,
                        longitude: s.longitude,
                        waterbody: s.Waterbody,
                        status_type_id: s.Status !== "" && s.Status !== undefined ? $scope.allStats.filter(function (st) { return st.status == s.Status; })[0].status_id : 0,
                        lake_type_id: $scope.allLakes.filter(function (l) { return l.lake == s.Lake; })[0].lake_type_id,
                        country: s.Country,
                        state_province: s.State,
                        watershed_huc8: s.Watershed,
                        url: s.url
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
                $scope.format = 'MM/dd/yyyy';
                //#endregion Datepicker
            
                //make sure lat/long are right number range
                $scope.checkValue = function () {
                    if ($scope.thisSite.latitude < 0 || $scope.thisSite.latitude > 73) {
                        openLatModal();
                    }
                    if ($scope.thisSite.longitude < -175 || $scope.thisSite.longitude > -60) {
                        openLongModal();
                    }
                };

                //start or end date was changed -- compare to ensure end date comes after start date
                $scope.compareSiteDates = function (d) {
                    if ($scope.thisSite.end_date !== undefined && $scope.thisSite.end_date !== null) {
                        if (new Date($scope.thisSite.end_date) < new Date($scope.thisSite.start_date)) {
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
                                    $scope.thisSite.start_date = "";
                                    angular.element("#start_date").focus();
                                } else {
                                    $scope.thisSite.end_date = "";
                                    angular.element("#end_date").focus();
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
                                
                    // $scope.title = "Site: " + $scope.thisSite.name;

                    //convert the multiSelects for isteven (add new property for checked flag
                    //#region siteFrequencies
                    //pull these from dropdownsToSend filter frequencies var siteFreqs = siteFrequencies;
               
                    //go through allFrequencies and add selected property
                    $scope.siteFreq = thisSite.Frequencies;
                    for (var i = 0; i < $scope.allFrequencies.length; i++) {
                        //for each one, if siteFreq has this id, add 'selected:true' else add 'selected:false'
                        for (var y = 0; y < $scope.siteFreq.length; y++) {
                            if ($scope.siteFreq[y].frequency_type_id == $scope.allFrequencies[i].frequency_type_id) {
                                $scope.allFrequencies[i].selected = true;
                                y = $scope.siteFreq.length;
                            }
                            else {
                                $scope.allFrequencies[i].selected = false;
                            }
                        }
                        if ($scope.siteFreq.length === 0) {
                            $scope.allFrequencies[i].selected = false;
                        }
                    }
                    $scope.Frequencydata = $scope.allFrequencies;
                    //#endregion siteFrequencies

                    //#region siteMedia              
                    //go through allMeds and add selected property
                    $scope.siteMed = thisSite.Media;
                    for (var mi = 0; mi < $scope.allMedia.length; mi++) {
                        //for each one, if siteMeds has this id, add 'selected:true' else add 'selected:false'
                        for (var sm = 0; sm < $scope.siteMed.length; sm++) {
                            if ($scope.siteMed[sm].media_type_id == $scope.allMedia[mi].media_type_id) {
                                $scope.allMedia[mi].selected = true;
                                sm = $scope.siteMed.length;
                            }
                            else {
                                $scope.allMedia[mi].selected = false;
                            }
                        }
                        if ($scope.siteMed.length === 0) {
                            $scope.allMedia[mi].selected = false;
                        }
                    }
                    $scope.Mediadata = $scope.allMedia;
                    //#endregion siteMedia

                    //#region siteParameters
                    //go through siteParams and add selected property
                    $scope.siteParams = thisSite.Parameters;
                    for (var pi = 0; pi < $scope.allParametes.length; pi++) {
                        //for each one, if siteParams has this id, add 'selected:true' else add 'selected:false'
                        for (var sp = 0; sp < $scope.siteParams.length; sp++) {
                            if ($scope.siteParams[sp].parameter_type_id == $scope.allParametes[pi].parameter_type_id) {
                                $scope.allParametes[pi].selected = true;
                                sp = $scope.siteParams.length;
                            }
                            else {
                                $scope.allParametes[pi].selected = false;
                            }
                        }
                        if ($scope.siteParams.length === 0) {
                            $scope.allParametes[pi].selected = false;
                        }
                    }
                    $scope.physParams = []; $scope.bioParams = []; $scope.chemParams = []; $scope.microBioParams = []; $scope.toxiParams = [];
                    $scope.physParams.push($scope.allParametes.filter(function (p) {
                        return p.parameter_group == "Physical";
                    }));
                    $scope.bioParams.push($scope.allParametes.filter(function (p) {
                        return p.parameter_group == "Biological";
                    }));
                    $scope.chemParams.push($scope.allParametes.filter(function (p) {
                        return p.parameter_group == "Chemical";
                    }));
                    $scope.microBioParams.push($scope.allParametes.filter(function (p) {
                        return p.parameter_group == "Microbiological";
                    }));
                    $scope.toxiParams.push($scope.allParametes.filter(function (p) {
                        return p.parameter_group == "Toxicological";
                    }));

                    //$scope.Parameterdata = allParams;

                    //#endregion siteParameters

                    //#region siteResources
                    //go through allRes and add selected property
                    $scope.siteRes = thisSite.Resources;
                    for (var ri = 0; ri < $scope.allResources.length; ri++) {
                        //for each one, if siteRes has this id, add 'selected:true' else add 'selected:false'
                        for (var sr = 0; sr < $scope.siteRes.length; sr++) {
                            if ($scope.siteRes[sr].resource_type_id == $scope.allResources[ri].resource_type_id) {
                                $scope.allResources[ri].selected = true;
                                sr = $scope.siteRes.length;
                            }
                            else {
                                $scope.allResources[ri].selected = false;
                            }
                        }
                        if ($scope.siteRes.length === 0) {
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
                        return p.parameter_group == "Physical";
                    }));
                    $scope.bioParams.push($scope.allParametes.filter(function (p) {
                        return p.parameter_group == "Biological";
                    }));
                    $scope.chemParams.push($scope.allParametes.filter(function (p) { return p.parameter_group == "Chemical"; }));
                    $scope.microBioParams.push($scope.allParametes.filter(function (p) {
                        return p.parameter_group == "Microbiological";
                    }));
                    $scope.toxiParams.push($scope.allParametes.filter(function (p) {
                        return p.parameter_group == "Toxicological";
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
                        if ($scope.thisSite.site_id !== undefined) { //editing
                            //see if it needs to be taken out of removeList
                            var i = $scope.freqToRemove.map(function (f) { return f.frequency_type_id; }).indexOf(data.frequency_type_id);
                            if (i >= 0) $scope.freqToRemove.splice(i, 1); //remove from removeList (in case they removed and then added it back)
                        }
                    } else {
                        //data.selected == false
                        if ($scope.thisSite.site_id !== undefined) { //edit
                            if ($scope.siteFreq.map(function (freq) { return freq.frequency_type_id; }).indexOf(data.frequency_type_id) >= 0)
                                $scope.freqToRemove.push(data); //add it to removeList(if it's in in siteFreq to begin with)       
                        }
                    }
                };//end FreqClick
                //#endregion FREQUENCY 

                //#region a MEDIA was clicked 
                $scope.MedClick = function (data) {
                    $scope.medDirty = true;
                    if (data.selected) {
                        if ($scope.thisSite.site_id !== undefined) { //editing
                            //see if it needs to be taken out of removeList
                            var i = $scope.medToRemove.map(function (m) { return m.media_type_id; }).indexOf(data.media_type_id);
                            if (i >= 0) $scope.medToRemove.splice(i, 1); //remove from removeList (in case they removed and then added it back)
                        }
                    } else {
                        //data.selected == false
                        if ($scope.thisSite.site_id !== undefined) { //edit
                            if ($scope.siteMed.map(function (med) { return med.media_type_id; }).indexOf(data.media_type_id) >= 0)
                                $scope.medToRemove.push(data); //add it to removeList(if it's in in siteMed to begin with)       
                        }
                    }
                };//end MedClick
                //#endregion MEDIA

                //#region a RESOURCE was clicked 
                $scope.ResClick = function (data) {
                    $scope.resDirty = true;
                    if (data.selected)  {
                        //  $scope.resToAdd.push(data);
                        if ($scope.thisSite.site_id !== undefined) { //editing
                            //see if it needs to be taken out of removeList
                            var i = $scope.resToRemove.map(function (r) { return r.resource_type_id; }).indexOf(data.resource_type_id);
                            if (i >= 0) $scope.resToRemove.splice(i, 1); //remove from removeList (in case they removed and then added it back)
                        }
                    } else {
                        //data.selected == false
                        if ($scope.thisSite.site_id !== undefined) { //edit
                            if ($scope.siteRes.map(function (res) { return res.resource_type_id; }).indexOf(data.resource_type_id) >= 0)
                                $scope.resToRemove.push(data); //add it to removeList  (if it's in in siteRes to begin with)                     
                        }
                    }
                };//end ResClick
                //#endregion RESOURCE 

                //#region a PARAMETER was clicked 
                $scope.ParamClick = function (data) {
                    $scope.paramDirty = true;
                    if (data.selected) {
                        if ($scope.thisSite.site_id !== undefined) { //editing
                            //see if it needs to be taken out of removeList
                            var i = $scope.paramToRemove.map(function (p) { return p.parameter_type_id; }).indexOf(data.parameter_type_id);
                            if (i >= 0) $scope.paramToRemove.splice(i, 1); //remove from removeList (in case they removed and then added it back)
                        }
                    } else {
                        //data.selected == false
                        if ($scope.thisSite.site_id !== undefined) { //edit
                            if ($scope.siteParams.map(function (par) { return par.parameter_type_id; }).indexOf(data.parameter_type_id) >= 0)
                                $scope.paramToRemove.push(data); //add it to removeList   (if it's in in siteParams to begin with)     
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
                            $("#latitude").focus();
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
                            $("#longitude").focus();
                    });
                };

                //PUT
                $scope.save = function (valid) {
                    //check if they filled in all required fields
                    if (valid) {
                        $scope.siteSaving = true;
                        $rootScope.stateIsLoading.showLoading = true; //loading...
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        $http.defaults.headers.common.Accept = 'application/json';
                        $scope.thisSite.project_id = thisProject.project_id;                    
                        SITE.update({ id: $scope.thisSite.site_id }, $scope.thisSite, function success(siteResponse) {
                            //use $q for async call to delete and add objectives and keywords
                            var defer = $q.defer();
                            var RemovePromises = [];
                            var AddPromises = [];
                            //#region REMOVES
                            //remove frequencies (freqToRemove contains those to remove ->DELETE)
                            angular.forEach($scope.freqToRemove, function (Fvalue) {
                                var delFreqProm = SITE.deleteSiteFrequency({ id: $scope.thisSite.site_id, FrequencyTypeId: Fvalue.frequency_type_id }).$promise;
                                RemovePromises.push(delFreqProm);
                            });

                            //remove media (medToRemove contains those to remove ->DELETE)
                            angular.forEach($scope.medToRemove, function (Mvalue) {                              
                                var delMedProm = SITE.deleteSiteMedia({ id: $scope.thisSite.site_id, MediaTypeId: Mvalue.media_type_id }).$promise;
                                RemovePromises.push(delMedProm);
                            });

                            //remove resources (resToRemove contains those to remove ->DELETE)
                            angular.forEach($scope.resToRemove, function (Rvalue) {
                                var delResProm = SITE.deleteSiteResource({ id: $scope.thisSite.site_id, ResourceTypeId: Rvalue.resource_type_id }).$promise;
                                RemovePromises.push(delResProm);
                            });

                            //remove Paramters (paramToRemove contains those to remove ->DELETE)
                            angular.forEach($scope.paramToRemove, function (Pvalue) {
                                var delParamProm = SITE.deleteSiteParameter({ id: $scope.thisSite.site_id, ParameterTypeId: Pvalue.parameter_type_id }).$promise;
                                RemovePromises.push(delParamProm);
                            });
                            //#endregion
                            //#region ADDS
                            //add Frequencies only if $scope.freqDirty = true;
                            //if ($scope.freqDirty) {
                                angular.forEach($scope.Frequencymodel.value, function (FaddValue) {
                                    $scope.freqAdded.push(FaddValue);
                                    var freqProm = SITE.addSiteFrequency({ id: $scope.thisSite.site_id, frequencyTypeId: FaddValue.frequency_type_id }).$promise;
                                    AddPromises.push(freqProm);
                                });
                           // }
                            //add Media only if $scope.medDirty = true;
                           // if ($scope.medDirty) {
                                angular.forEach($scope.Mediamodel.value, function (MaddValue) {
                                    $scope.medAdded.push(MaddValue);
                                    var medProm = SITE.addSiteMedia({ id: $scope.thisSite.site_id, mediaTypeId: MaddValue.media_type_id }).$promise;
                                    AddPromises.push(medProm);
                                });
                           // }
                            //add Resources only if $scope.resDirty = true;
                            //if ($scope.resDirty) {
                                angular.forEach($scope.Resourcemodel.value, function (RaddValue) {
                                    $scope.resAdded.push(RaddValue);
                                    var resProm = SITE.addSiteResource({ id: $scope.thisSite.site_id, resourceTypeId: RaddValue.resource_type_id }).$promise;
                                    AddPromises.push(resProm);
                                });
                           // }
                            //add Parameters only if $scope.paramDirty = true;
                            $scope.pParams =[]; $scope.bParams =[]; $scope.cParams =[]; $scope.mBioParams =[]; $scope.tParams =[];
                        
                            angular.forEach($scope.allParametes, function (p) {
                                if (p.selected) {
                                    $scope.paramAdded.push(p);
                                    //if (p.parameter_group == 'Physical') $scope.pParams.push(p.parameter);
                                    //if (p.parameter_group == 'Biological') $scope.bParams.push(p.parameter);
                                    //if (p.parameter_group == 'Chemical') $scope.cParams.push(p.parameter);
                                    //if (p.parameter_group == 'Microbiological') $scope.mBioParams.push(p.parameter);
                                    //if (p.parameter_group == 'Toxicological') $scope.tParams.push(p.parameter);
                                    if ($scope.paramDirty) {
                                        var paramProm = SITE.addSiteParameter({ id: $scope.thisSite.site_id, parameterTypeId: p.parameter_type_id }).$promise;
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
                                        'SiteId': $scope.thisSite.site_id,
                                        'Name': $scope.thisSite.name,
                                        'latitude': $scope.thisSite.latitude,
                                        'longitude': $scope.thisSite.longitude,
                                        'StartDate': $scope.thisSite.start_date !== undefined && $scope.thisSite.start_date !== null ? makeAdateString($scope.thisSite.start_date): '',
                                        'EndDate': $scope.thisSite.end_date !== undefined && $scope.thisSite.end_date !== null ? makeAdateString($scope.thisSite.end_date) : '',
                                        'SamplePlatform': $scope.thisSite.sample_platform,
                                        'AdditionalInfo': $scope.thisSite.additional_info,
                                        'Description': $scope.thisSite.description,
                                        'Waterbody': $scope.thisSite.waterbody,
                                        'Lake': $scope.allLakes.filter(function (l) { return l.lake_type_id == $scope.thisSite.lake_type_id; })[0].lake,
                                        'Status': $scope.thisSite.status_type_id > 0 ? $scope.allStats.filter(function (s) { return s.status_id == $scope.thisSite.status_type_id; })[0].status : "",
                                        'Country': $scope.thisSite.country,
                                        'State': $scope.thisSite.state_province,
                                        'Watershed': $scope.thisSite.watershed_huc8,
                                        'url': $scope.thisSite.url,
                                        'Media': $scope.medAdded,
                                        'Resources': $scope.resAdded,
                                        'Frequencies': $scope.freqAdded,
                                        'Parameters': $scope.paramAdded//,
                                        //'ParameterStrings': {
                                        //    'Biological': $scope.bParams.join("; "),
                                        //    'Chemical': $scope.cParams.join("; "),
                                        //    'Microbiological': $scope.mBioParams.join("; "),
                                        //    'Physical': $scope.pParams.join("; "),
                                        //    'Toxicological': $scope.tParams.join("; ")
                                        //}
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
                    if ($scope.thisSite.site_id !== undefined) {
                        $scope.save(valid);
                    } else {
                        if (valid) {
                            $scope.siteSaving = true;
                            $scope.thisSite.project_id = thisProject.project_id;
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
                                        $scope.freqAdded.push(fValue);
                                        var freqProm = SITE.addSiteFrequency({ id: newSite.site_id, frequencyTypeId: fValue.frequency_type_id }).$promise;
                                        postPromises.push(freqProm);
                                    }
                                });
                                //post media
                                angular.forEach($scope.Mediamodel.value, function (mValue) {
                                    if (mValue.selected) {
                                        $scope.medAdded.push(mValue);
                                        var medProm = SITE.addSiteMedia({ id: newSite.site_id, mediaTypeId: mValue.media_type_id }).$promise;
                                        postPromises.push(medProm);
                                    }
                                });
                                //post resources
                                angular.forEach($scope.Resourcemodel.value, function (rValue) {
                                    if (rValue.selected) {
                                        $scope.resAdded.push(rValue);
                                        var resProm = SITE.addSiteResource({ id: newSite.site_id, resourceTypeId: rValue.resource_type_id }).$promise;
                                        postPromises.push(resProm);
                                    }
                                });
                                $scope.pParams = []; $scope.bParams = []; $scope.cParams = []; $scope.mBioParams = []; $scope.tParams = [];
                                //post parameters
                                angular.forEach($scope.allParametes, function (pValue) {
                                    if (pValue.selected) {
                                        $scope.paramAdded.push(pValue);
                                        //if (pValue.parameter_group == 'Physical') $scope.pParams.push(pValue.parameter);
                                        //if (pValue.parameter_group == 'Biological') $scope.bParams.push(pValue.parameter);
                                        //if (pValue.parameter_group == 'Chemical') $scope.cParams.push(pValue.parameter);
                                        //if (pValue.parameter_group == 'Microbiological') $scope.mBioParams.push(pValue.parameter);
                                        //if (pValue.parameter_group == 'Toxicological') $scope.tParams.push(pValue.parameter);

                                        var parProm = SITE.addSiteParameter({ id: newSite.site_id, parameterTypeId: pValue.parameter_type_id }).$promise;
                                        postPromises.push(parProm);
                                    }
                                });
                                $q.all(postPromises).then(function (response) {
                                    var newSiteFormatted = {
                                        'SiteId': newSite.site_id,
                                        'Name': newSite.name,
                                        'latitude': newSite.latitude,
                                        'longitude': newSite.longitude,
                                        'StartDate': newSite.start_date !== undefined && newSite.start_date !== null ? makeAdateString(newSite.start_date) : '',
                                        'EndDate': newSite.end_date !== undefined && newSite.end_date !== null ? makeAdateString(newSite.end_date) : '',
                                        'SamplePlatform': newSite.sample_platform,
                                        'AdditionalInfo': newSite.additional_info,
                                        'Description': newSite.description,
                                        'Waterbody': newSite.waterbody,
                                        'Lake': $scope.allLakes.filter(function (l) { return l.lake_type_id == newSite.lake_type_id; })[0].lake,
                                        'Status': newSite.status_type_id > 0 && newSite.status_type_id !== null ? $scope.allStats.filter(function (s) { return s.status_id == newSite.status_type_id; })[0].status : "",
                                        'Country': newSite.country,
                                        'State': newSite.state_province,
                                        'Watershed': newSite.watershed_huc8,
                                        'url': newSite.url,
                                        'Resources': $scope.resAdded,
                                        'Media': $scope.medAdded,
                                        'Frequencies': $scope.freqAdded,
                                        'Parameters': $scope.paramAdded//,
                                        //'ParameterStrings': {
                                        //    'Biological': $scope.bParams.join("; "),
                                        //    'Chemical': $scope.cParams.join("; "),
                                        //    'Microbiological': $scope.mBioParams.join("; "),
                                        //    'Physical': $scope.pParams.join("; "),
                                        //    'Toxicological': $scope.tParams.join("; ")
                                        //}
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
