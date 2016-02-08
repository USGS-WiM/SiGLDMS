(function () {
    /* controllers.js 'ui.unique',*/
    'use strict';

    var siGLControllers = angular.module('siGLControllers',
        ['ngInputModified', 'ui.grid', 'ui.grid.resizeColumns', 'ui.grid.edit', 'ui.grid.cellNav', 'ui.validate', 'angular.filter', 'xeditable']);

    //#region FILTERS
    siGLControllers.filter('mapLakes', function () {
        var lakeHash = {
            1: 'Erie',
            2: 'Huron',
            3: 'Michigan',
            4: 'Ontario',
            5: 'Superior'
        };
        return function (input) {
            if (!input) {
                return '';
            } else {
                return lakeHash[input];
            }
        };
    });
    siGLControllers.filter('mapSiteStats', function () {
        var siteStatHash = {
            1: 'Active',
            2: 'Inactive'
        };
        return function (input) {
            if (!input) {
                return '';
            } else {
                return siteStatHash[input];
            }
        };
    });
    siGLControllers.filter('mapStates', function () {
        var stateHash = {
            'Illinois': "Illinois",
            'Indiana': "Indiana",
            'Michigan': "Michigan",
            'Minnesota': "Minnesota",
            'New York': "New York",
            'Ohio': "Ohio",
            'Pennsylvania': "Pennsylvania",
            'Wisconsin': "Wisconsin",
            'Ontario': "Ontario"
        };
        return function (input) {
            if (!input) {
                return '';
            } else {
                return stateHash[input];
            }
        };
    });
    siGLControllers.filter('mapCountries', function () {
        var countryHash = {
            'Canada': 'Canada',
            'United States Of America': 'United States Of America'
        };
        return function (input) {
            if (!input) {
                return '';
            } else {
                return countryHash[input];
            }
        };
    });
    siGLControllers.filter('mapSiteResources', function () {
        var resourceHash = {
            1: 'Atmosphere',
            2: 'Beach',
            3: 'Drowned River Mouth',
            4: 'Embayment',
            5: 'Estuary',
            6: 'Ground Water',
            7: 'Harbors',
            8: 'Inland Lakes',
            9: 'Lake',
            10: 'Lake or Stream Bottom (Benthic Province)',
            11: 'Medium Nearshore',
            12: 'Offshore',
            13: 'River Mouth',
            14: 'River Substrate',
            15: 'Shallow Nearshore',
            16: 'Shoreline',
            17: 'Stormwater Conveyance System',
            18: 'Stream/River',
            19: 'Tributary',
            20: 'Water Column (Variable Depths; Pelagic Province)',
            21: 'Water Treatment Facility Intake',
            22: 'Wetland'
        };
        return function (input) {
            if (!input) {
                return '';
            } else {
                return resourceHash[input];
            }
        };
    });

    //#endregion FILTERS

    //#region CONSTANTS
    siGLControllers.directive('backButton', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.bind('click', goBack);

                function goBack() {
                    history.back();
                    scope.$apply();
                }
            }
        };
    });

    //regular expression for a password requirement of at least 8 characters long and at least 3 of 4 character categories used (upper, lower, digit, special
    siGLControllers.constant('RegExp', {
        PASSWORD: /^(((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[A-Z])(?=.*[!@@?#$%^&_:;-]))|((?=.*[a-z])(?=.*[0-9])(?=.*[!@@?#$%^&_:;-]))|((?=.*[A-Z])(?=.*[0-9])(?=.*[!@@?#$%^&_:;-]))).{8,}$/
    });
    //#endregion CONSTANTS

    //#region DIRECTIVES
    //focus on the first element of the page
    siGLControllers.directive('focus', function () {
        return function (scope, element, attributes) {
            element[0].focus();
        };
    });

    //validate password
    siGLControllers.directive('passwordValidate', ['RegExp', function (regex) {
        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {
                elm.unbind('keydown').unbind('change');
                elm.bind('blur', function (viewValue) {
                    scope.$apply(function () {
                        if ((regex.PASSWORD).test(viewValue.target.value)) {
                            //it is valid
                            ctrl.$setValidity("passwordValidate", true);
                            return viewValue;
                        } else {
                            //it is invalid, return undefined - no model update
                            ctrl.$setValidity("passwordValidate", false);
                            return undefined;
                        }
                    });
                });
            }
        };
    }]);

    siGLControllers.directive('sameAs', function ($parse) {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function (scope, elm, attrs, ctrl) {
                elm.unbind('keydown').unbind('change');
                elm.bind('blur', function (viewValue) {
                    scope.$watch(function () {
                        return $parse(attrs.sameAs)(scope) === ctrl.$modelValue;
                    }, function (currentValue) {
                        ctrl.$setValidity("passwordMismatch", currentValue);
                    });
                });
            }
        };
    });

    //disable tabs if there is no project (create page instead of edit page)
    siGLControllers.directive('aDisabled', function () {
        return {
            compile: function (tElement, tAttrs, transclude) {
                //Disable ngClick
                tAttrs["ngClick"] = "!(" + tAttrs["aDisabled"] + ") && (" + tAttrs["ngClick"] + ")";

                //Toggle "disabled" to class when aDisabled becomes true
                return function (scope, iElement, iAttrs) {
                    scope.$watch(iAttrs["aDisabled"], function (newValue) {
                        if (newValue !== undefined) {
                            iElement.toggleClass("disabled", newValue);
                        }
                    });

                    //Disable href on click
                    iElement.on("click", function (e) {
                        if (scope.$eval(iAttrs["aDisabled"])) {
                            e.preventDefault();
                        }
                    });
                };
            }
        };
    });

    siGLControllers.directive('tooltip', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                $(element).hover(function () {
                    // on mouseenter
                    $(element).tooltip('show');
                }, function () {
                    // on mouseleave
                    $(element).tooltip('hide');
                });
            }
        };
    });

    siGLControllers.directive('myInputMask', function () {
        return {
            restrict: 'AC',
            link: function (scope, el, attrs) {
                el.inputmask(scope.$eval(attrs.myInputMask));
                el.on('change', function () {
                    scope.$eval(attrs.ngModel + "='" + el.val() + "'");
                    // or scope[attrs.ngModel] = el.val() if your expression doesn't contain dot.
                });
            }
        };
    });

    //This directive allows us to pass a function in on an enter key to do what we want.
    siGLControllers.directive('ngEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.ngEnter);
                    });
                    event.preventDefault();
                }
            });
        };
    });

    //adding 'http://' to url inputs http://stackoverflow.com/questions/19482000/angularjs-add-http-prefix-to-url-input-field
    siGLControllers.directive('httpPrefix', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, controller) {
                function ensureHttpPrefix(value) {
                    // Need to add prefix if we don't have http:// prefix already AND we don't have part of it
                    if (value && !/^(https?):\/\//i.test(value)
                       && 'http://'.indexOf(value) !== 0 && 'https://'.indexOf(value) !== 0) {
                        controller.$setViewValue('http://' + value);
                        controller.$render();
                        return 'http://' + value;
                    }
                    else
                        return value;
                }
                controller.$formatters.push(ensureHttpPrefix);
                controller.$parsers.splice(0, 0, ensureHttpPrefix);
            }
        };
    });

    //make textarea height equal to content inside it (no scrollbars) http://stackoverflow.com/questions/17772260/textarea-auto-height
    siGLControllers.directive('elastic', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            link: function($scope, element) {
                $scope.initialHeight = $scope.initialHeight || element[0].style.height;
                var resize = function () {
                    element[0].style.height = $scope.initialHeight;
                    element[0].style.height = "" +element[0].scrollHeight + "px";
                };
                element.on("input change", resize);
                $timeout(resize, 0);
            }
        };
    }]);
    //#endregion DIRECTIVES

    //#region $cookie names
    //'siGLCreds', 'siGLUsername', 'usersName', 'dmID', 'projListSortOrder', 'pl_reverse', 'siteListSortOrder', 'sl_reverse', 'DMListSortOrder', 'dml_reverse', 'DMprojectsSortOrder', 'dmpl_reverse'
    //#endregion $cookie names

    //#region MAIN Controller
    siGLControllers.controller('mainCtrl', ['$scope', '$rootScope', '$cookies', '$location', '$state', mainCtrl]);
    function mainCtrl($scope, $rootScope, $cookies, $location, $state) {
        $scope.logo = 'images/usgsLogo.png';
        $rootScope.isAuth = {};
        if ($cookies.get('siGLCreds') == undefined || $cookies.get('siGLCreds') == "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            $rootScope.isAuth.val = true;
            $rootScope.usersName = $cookies.get('usersName');
            $rootScope.userID = $cookies.get('dmID');
            $rootScope.Role = $cookies.get('usersRole');

            $state.go('projectList');
        }
    }
    //#endregion MAIN Controller

    //#region settings
    siGLControllers.controller('settingsCtrl', ['$scope', '$location', '$state', '$cookies', settingsCtrl]);
    function settingsCtrl($scope, $location, $state, $cookies) {
        if ($cookies.get('siGLCreds') == undefined || $cookies.get('siGLCreds') == "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            $scope.changeView = function (view) {
                $state.go(view);
            };
        }
    }

    //#region Data Manager
    siGLControllers.controller('dataManagerCtrl', ['$scope', '$location', '$http', '$cookies', 'DATA_MANAGER', 'ROLE', 'allOrgRes', 'allOrgs', 'allDivs', 'allSecs', 'allRoles', dataManagerCtrl]);
    function dataManagerCtrl($scope, $location, $http, $cookies, DATA_MANAGER, ROLE, allOrgRes, allOrgs, allDivs, allSecs, allRoles) {
        //get all datamanagers once here to ensure passing auth
        if ($cookies.get('siGLCreds') == undefined || $cookies.get('siGLCreds') == "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            //global vars
            $scope.allORG_RES = allOrgRes;
            $scope.allORGs = allOrgs;
            $scope.allDIVs = allDivs;
            $scope.allSECs = allSecs;

            $scope.loggedInUser = {};
            $scope.allROLEs = allRoles;
            //get all the roles and data managers
            $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
            $http.defaults.headers.common.Accept = 'application/json';

            //TODO:::: Make this a VIEW so that I don't have to get all the projects again. NAME, Organization, Role, # of Projects
            DATA_MANAGER.getDMListModel().$promise.then(function (result) {
                for (var x = 0; x < result.length; x++) {
                    var orgName = allOrgRes.filter(function (or) { return or.OrganizationSystemID == result[x].ORGANIZATION_SYSTEM_ID; })[0];
                    result[x].OrgName = orgName != undefined ? orgName.OrganizationName : "";
                    //result[x].roleName = $scope.allROLEs.filter(function (ro) { return ro.ROLE_ID == result[x].ROLE_ID; })[0].ROLE_NAME;
                    //result[x].FULLNAME = result[x].FNAME + " " + result[x].LNAME;
                    //var theseProjs = allProj.filter(function (p) { return p.DataManagerID == result[x].DATA_MANAGER_ID; });
                    //result[x].projCount = theseProjs.length;
                }
                $scope.allDMs = result;
            });

            $scope.loggedInUser.Name = $cookies.get('usersName'); //User's NAME
            $scope.loggedInUser.ID = $cookies.get('dmID');
            $scope.loggedInUser.Role = $cookies.get('usersRole');
            //see if sorting order has already been set, preserve if so, otherwise set to 'LNAME'
            $scope.sortingOrder = $cookies.get('DMListSortOrder') != undefined ? $cookies.get('DMListSortOrder') : 'LNAME';
            $scope.reverse = $cookies.get('dml_reverse') != undefined ? Boolean($cookies.get('dml_reverse')) : true;
            $scope.sort_by = function (newSortingOrder) {
                $cookies.put('DMListSortOrder', newSortingOrder);
                if ($scope.sortingOrder == newSortingOrder) {
                    $scope.reverse = !$scope.reverse;
                    $cookies.put('dml_reverse', $scope.reverse);
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
        }//end auth user logged in
    }//end resourceCtrl

    siGLControllers.controller('dataManagerInfoCtrl', ['$scope', '$cookies', '$location', '$http', '$uibModal', '$stateParams', '$filter', 'ORGANIZATION_SYSTEM', 'PROJECT', 'DATA_MANAGER', 'ROLE', 'allRoles', 'thisDM', 'dmProjects', dataManagerInfoCtrl]);
    function dataManagerInfoCtrl($scope, $cookies, $location, $http, $uibModal, $stateParams, $filter, ORGANIZATION_SYSTEM, PROJECT, DATA_MANAGER, ROLE, allRoles, thisDM, dmProjects) {
        if ($cookies.get('siGLCreds') == undefined || $cookies.get('siGLCreds') == "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            $scope.DMProjects = dmProjects; //All their Projects
            $scope.RoleList = allRoles;

            //see if sorting order has already been set, preserve if so, otherwise set to 'Name'
            $scope.sortingOrder = $cookies.get('DMprojectsSortOrder') != undefined ? $cookies.get('DMprojectsSortOrder') : 'Name';
            $scope.reverse = $cookies.get('dmpl_reverse') != undefined ? Boolean($cookies.get('dmpl_reverse')) : true;
            $scope.sort_by = function (newSortingOrder) {
                $cookies.put('DMprojectsSortOrder', newSortingOrder);
                if ($scope.sortingOrder == newSortingOrder) {
                    $scope.reverse = !$scope.reverse;
                    $cookies.put('dmpl_reverse', $scope.reverse);
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

            $scope.pass = {
                newP: '',
                confirmP: ''
            };

            $scope.DM = {};
            //#region Org stuff for dropdowns, filtering, change org click, update org action
            $scope.allOrgs = $scope.$parent.allORGs;
            $scope.selectedOrgID = "";
            $scope.selectedDivID = "";
            $scope.selectedSecID = "";


            //needed for new and existing dms
            //#region Filter Divisions / Sections based on select change
            $scope.getDivs = function (orgID) {
                $scope.alldivs = {}; $scope.selectedDivID = ""; $scope.selectedSecID = "";
                $scope.alldivs = $scope.$parent.allDIVs.filter(function (d) { return d.ORG_ID == orgID; });
                $scope.allsecs = {};
            };

            $scope.getSecs = function (divID) {
                $scope.selectedSecID = "";
                $scope.allsecs = $scope.$parent.allSECs.filter(function (s) { return s.DIV_ID == divID; });
            };
            //#endregion Filter Divisions / Sections based on select change

            //ADD ORG MODAL CONTENT (Add New ORG NAME, DIVISION, OR SECTION)
            $scope.AddNewOrg = function () {
                //modal
                //pass array of chosen org/div so they will be prepopulated in modal
                var chosenparts = [$scope.selectedOrgID, $scope.selectedDivID, $scope.selectedSecID];
                var modalInstance = $uibModal.open({
                    templateUrl: 'AddOrganizationModal.html',
                    controller: 'AddOrgModalCtrl',
                    size: 'md',
                    backdrop: 'static',
                    resolve: {
                        chosenParts: function () { return chosenparts; },
                        allOrgs: function () { return $scope.$parent.allORGs; },
                        allDivs: function () { return $scope.$parent.allDIVs; },
                        allSecs: function () { return $scope.$parent.allSECs; }
                    }
                });
                modalInstance.result.then(function (updatedOrgDivSec) {
                    //make sure parent. are all updated
                    $scope.$parent.allORGs = updatedOrgDivSec[0]; //allOrgs updated
                    $scope.$parent.allDIVs = updatedOrgDivSec[1]; //allDivs updated
                    $scope.$parent.allSECs = updatedOrgDivSec[2]; //allSecs updated
                    //set selected choices
                    $scope.selectedOrgID = updatedOrgDivSec[3];
                    //need to populate all divs before making one selected
                    if ($scope.selectedOrgID != "")
                        $scope.alldivs = $scope.$parent.allDIVs.filter(function (d) { return d.ORG_ID == $scope.selectedOrgID; });

                    $scope.selectedDivID = updatedOrgDivSec[4];

                    //need to populate all secs before making one selected
                    if ($scope.selectedDivID != "")
                        $scope.allsecs = $scope.$parent.allSECs.filter(function (s) { return s.DIV_ID == $scope.selectedDivID; });

                    $scope.selectedSecID = updatedOrgDivSec[5];
                }, function () {
                    //logic to do on cancel
                });
                //end modal
            }; //end AddNewOrg
            //#endregion Org stuff for dropdowns, filtering, change org click, update org action

            //is this creating new member or editing existing?
            if (thisDM != undefined) {
                //check to see if the acct User is the same as the user they are looking at
                $scope.matchingUsers = $stateParams.id == $scope.$parent.loggedInUser.ID ? true : false;

                $scope.DM = thisDM;
                $scope.DM.roleName = $scope.RoleList.filter(function (rl) { return rl.ROLE_ID == $scope.DM.ROLE_ID; })[0].ROLE_NAME;

                $scope.dmOrg = $scope.$parent.allORG_RES.filter(function (o) { return o.OrganizationSystemID == $scope.DM.ORGANIZATION_SYSTEM_ID; })[0];

                $scope.changePass = false;
                $scope.changeOrg = false;
                $scope.newPass = "";

                //user wants to change his organization
                $scope.changeMyOrgBtn = function () {
                    $scope.changeOrg == false ? $scope.changeOrg = true : $scope.changeOrg = false;
                    //preset selects with org they  currently have
                    $scope.selectedOrgID = $scope.dmOrg.OrganizationID;
                    $scope.alldivs = $scope.$parent.allDIVs.filter(function (d) { return d.ORG_ID == $scope.selectedOrgID; });
                    $scope.selectedDivID = $scope.dmOrg.DivisionID;
                    $scope.allsecs = $scope.$parent.allSECs.filter(function (s) { return s.DIV_ID == $scope.selectedDivID; });
                    $scope.selectedSecID = $scope.dmOrg.SectionID;
                }; //end changeMyOrgBtn click

                //new org chosen (or created), now save
                $scope.UpdateMyOrg = function () {
                    //update user's org with PUT
                    var secID = $scope.selectedSecID != "" ? $scope.selectedSecID : "0";
                    var divID = $scope.selectedDivID != "" ? $scope.selectedDivID : "0";
                    var orgID = $scope.selectedOrgID != "" ? $scope.selectedOrgID : "0";
                    var chosenOrg = $scope.allORG_RES.filter(function (orgS) { return orgS.SectionID == secID && orgS.DivisionID == divID && orgS.OrganizationID == orgID; })[0];
                    if (chosenOrg != undefined) {
                        $scope.DM.ORGANIZATION_SYSTEM_ID = chosenOrg.OrganizationSystemID;
                        $scope.dmOrg = chosenOrg;
                        $scope.SaveOnBlur();
                    } else {
                        //is undefined, so they created a new one, so post the ORGANIZATION_SYSTEM then update the DM
                        var newORG_SYS = { ORG_ID: orgID, DIV_ID: divID, SEC_ID: secID };
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        $http.defaults.headers.common.Accept = 'application/json';
                        ORGANIZATION_SYSTEM.save(newORG_SYS, function success(response) {
                            $scope.DM.ORGANIZATION_SYSTEM_ID = response.ORGANIZATION_SYSTEM_ID;
                            //need to update $scope.dmOrg which is an ORGANIZATION_RESOURCE
                            var orgResource = {};
                            orgResource.OrganizationSystemID = response.ORGANIZATION_SYSTEM_ID;
                            orgResource.OrganizationID = orgID; orgResource.OrganizationName = $scope.allOrgs.filter(function (o) { return o.ORGANIZATION_ID == orgID; })[0].ORGANIZATION_NAME;
                            if (divID > 0) {
                                orgResource.DivisionID = divID; orgResource.DivisionName = $scope.$parent.allDIVs.filter(function (d) { return d.DIVISION_ID == divID; })[0].DIVISION_NAME;
                            }
                            if (secID > 0) {
                                orgResource.SectionID = secID; orgResource.SectionName = $scope.$parent.allSECs.filter(function (s) { return s.SECTION_ID == secID; })[0].SECTION_NAME;
                            }
                            $scope.$parent.allORG_RES.push(orgResource);
                            $scope.dmOrg = orgResource;
                            $scope.SaveOnBlur();
                        });
                    }
                }; //end UpdateMyOrg

                //nevermind
                $scope.DontUpdateOrg = function () {
                    $scope.selectedOrgID = "";
                    $scope.alldivs = {}; $scope.selectedDivID = "";
                    $scope.allsecs = {}; $scope.selectedSecID = [];
                    $scope.changeOrg = false;
                }; //end DontUpdateOrg

                //change to the user made, put it .. fired on each blur after change made to field
                $scope.SaveOnBlur = function () {
                    if ($scope.DM) {
                        //ensure they don't delete required field values
                        if ($scope.DM.FNAME != null) {
                            $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                            $http.defaults.headers.common.Accept = 'application/json';
                            $http.defaults.headers.common['X-HTTP-Method-Override'] = 'PUT';
                            var DM_PUT = {};
                            DM_PUT.DATA_MANAGER_ID = $scope.DM.DATA_MANAGER_ID; DM_PUT.EMAIL = $scope.DM.EMAIL;
                            DM_PUT.FNAME = $scope.DM.FNAME; DM_PUT.LNAME = $scope.DM.LNAME; DM_PUT.ORGANIZATION_SYSTEM_ID = $scope.DM.ORGANIZATION_SYSTEM_ID;
                            DM_PUT.PHONE = $scope.DM.PHONE; DM_PUT.ROLE_ID = $scope.DM.ROLE_ID; DM_PUT.USERNAME = $scope.DM.USERNAME;
                            DATA_MANAGER.save({ id: $scope.DM.DATA_MANAGER_ID }, DM_PUT, function success(response) {
                                toastr.success("User Updated");
                                $scope.selectedOrgID = "";
                                $scope.alldivs = {}; $scope.selectedDivID = "";
                                $scope.allsecs = {}; $scope.selectedSecID = [];
                                $scope.changeOrg = false;
                                //  $scope.dmOrg = $scope.$parent.allORG_RES.filter(function (o) { return o.OrganizationSystemID == $scope.DM.ORGANIZATION_SYSTEM_ID });
                            }, function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }); //end DATA_MANAGER.save
                            delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                        }
                    }
                };//end SaveOnBlur

                //#region all DMs for dropdown in case they want to change the dm on the project (WHEN THE CLICK TO EDIT Project)
                setTimeout(function () {
                //    for (var x = 0; x < $scope.$parent.allDMs.length; x++) {
                //        $scope.$parent.allDMs[x].FULLNAME = $scope.$parent.allDMs[x].FNAME + " " + $scope.$parent.allDMs[x].LNAME;
                //    };
                    $scope.allDMs = $scope.$parent.allDMs;
                    $scope.$apply;
                    //used in xeditable to show dm for project in dropdown
                    $scope.showDMs = function (project) {
                        var selected = [];
                        if (project.DATA_MANAGER_ID) {
                            selected = $filter('filter')($scope.allDMs, { DATA_MANAGER_ID: project.DATA_MANAGER_ID });
                        }
                        var fullName = "";
                        return selected.length ? selected[0].FULLNAME : '';
                    }; //end showDMs


                }, 3000);
                //#endregion all DMs for dropdown in case they want to change the dm on the project (WHEN THE CLICK TO EDIT Project)

                //reassign this project to a different data manager
                $scope.updateDMonProj = function (data, ProjID) {
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    //$http.defaults.headers.common['X-HTTP-Method-Override'] = 'PUT';

                    var retur = false;
                    PROJECT.updateDM({ id: ProjID, DataManager: data.DataManagerID }, function success(response) {
                    //PROJECT.save({ id: data.PROJECT_ID }, data, function success(response) {
                        toastr.success("Project Updated");
                        retur = response;
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                        retur = false;
                    }); //end PROJECT.save
                    delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                    return retur;
                }; //end updateDMonProj

                //delete this project and related stuff
                $scope.RemoveProject = function (proj) {
                    //modal
                    var modalInstance = $uibModal.open({
                        templateUrl: 'removemodal.html',
                        controller: 'ConfirmModalCtrl',
                        size: 'sm',
                        resolve: {
                            keyToRemove: function () {
                                return proj;
                            },
                            what: function () {
                                return "Project";
                            }
                        }
                    });
                    modalInstance.result.then(function (keyToRemove) {
                        //yes, remove this keyword
                        var index = $scope.DMProjects.indexOf(proj);
                        //DELETE it
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        PROJECT.delete({ id: proj.ProjId }, function success(response) {
                            $scope.DMProjects.splice(index, 1);
                            toastr.success("Project Removed");
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        });
                    }, function () {
                        //logic for cancel
                    });//end modal
                };

                //password update section
                $scope.changeMyPassBtn = function (evt) {
                    $scope.changePass == false ? $scope.changePass = true : $scope.changePass = false;
                }; //end changeMyPassBtn

                $scope.ChangePassword = function () {
                    //change User's password
                    if ($scope.pass.newP == "" || $scope.pass.confirmP == "") {
                        //modal for entering a password first
                        var modalInstance = $uibModal.open({
                            template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                                        '<div class="modal-body"><p>You must first enter a new Password.</p></div>' +
                                        '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button></div>',
                            controller: function ($scope, $uibModalInstance) {
                                $scope.ok = function () {
                                    $uibModalInstance.close('password');
                                };
                            },
                            size: 'sm'
                        });
                        modalInstance.result.then(function (fieldFocus) {
                            if (fieldFocus == "password") {
                                $("#inputNPASSWORD").focus();
                            }
                        });
                    } else {
                        DATA_MANAGER.changePW({ username: $scope.DM.USERNAME, newP: $scope.pass.newP },
                            function success(response) {
                                toastr.success("Password Updated");
                                //update creds
                                var enc = btoa($scope.DM.USERNAME.concat(":", $scope.pass.newP));
                                var expireDate = new Date().addHours(8);
                                $cookies.put('siGLCreds', enc, { 'expires': expireDate });
                                $cookies.put('siGLUsername', $scope.aMember.USERNAME);
                                $cookies.put('usersName', $scope.$parent.loggedInUser.Name);
                                $cookies.put('mID', $scope.DM.DATA_MANAGER_ID);
                                var roleName;
                                switch ($scope.DM.ROLE_ID) {
                                    case 1:
                                        roleName = "Admin";
                                        break;
                                    case 2:
                                        roleName = "Manager";
                                        break;
                                    default:
                                        roleName = "Public";
                                        break;
                                }
                                $cookies.put('usersRole', roleName);


                                $scope.changePass = false;
                                $scope.pass.newP = '';
                                $scope.pass.confirmP = '';
                            },
                            function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }
                        );//end DATA_MANAGER.changePW
                    } //end else
                }; //end ChangePassword

                $scope.DontChangePass = function () {
                    //nevermind, clear input
                    $scope.changePass = false;
                    $scope.pass.newP = '';
                    $scope.pass.confirmP = '';
                }; //end DontChangePass

            }//end if thisDM != undefined
            else {
                //this is a new dm being created
                $scope.changeOrg = true; //flag to true so that org drop downs show without clicking "change my organization" button
                $scope.save = function (valid) {
                    if (valid) {
                        $(".page-loading").removeClass("hidden");
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        $http.defaults.headers.common.Accept = 'application/json';
                        //see if they created an org or just chose an existing one
                        if ($scope.selectedOrgID != "") {
                            var divID = $scope.selectedDivID == "" ? 0 : $scope.selectedDivID;
                            var secID = $scope.selectedSecID == "" ? 0 : $scope.selectedSecID;
                            var existingOrgRes = $scope.allORG_RES.filter(function (or) { return or.OrganizationID == $scope.selectedOrgID && or.DivisionID == divID && or.SectionID == secID; })[0];
                            if (existingOrgRes != undefined) {
                                //they didn't create a new one so we don't have to. just add the orgsysId to the dm and post
                                $scope.DM.ORGANIZATION_SYSTEM_ID = existingOrgRes.OrganizationSystemID;
                                $scope.postNewDM();
                            } else {
                                //they created a new orgsys, post that first then post the new dm
                                var newOrgSys = { ORG_ID: $scope.selectedOrgID, DIV_ID: divID, SEC_ID: secID };
                                ORGANIZATION_SYSTEM.save(newOrgSys, function success(response) {
                                    $scope.DM.ORGANIZATION_SYSTEM_ID = response.ORGANIZATION_SYSTEM_ID;
                                    $scope.postNewDM();
                                }, function error(errorResponse) {
                                    $(".page-loading").addClass("hidden");
                                    toastr.error("Error: " + errorResponse.statusText);
                                });
                            }//end else (new Orgsys)
                        } else {
                            //they didn't choose an org
                            $scope.postNewDM();
                        }

                    }//end if valid
                    else {
                        alert("Please provide all required information.");
                    } //end else (not valid)
                };//end save

                //called from within save of new dm
                $scope.postNewDM = function () {
                    DATA_MANAGER.addDataManager({ pass: $scope.pass.confirmP }, $scope.DM, function success(response) {
                        toastr.success("Data Manager Created");
                        //push this new dm into the dmList
                        var nm = response;
                        var org = $scope.allORG_RES.filter(function (or) { return or.OrganizationSystemID == nm.ORGANIZATION_SYSTEM_ID; })[0];
                        nm.OrgName = org != undefined ? org.OrganizationName : "";
                        nm.FULLNAME = response.FNAME + " " + response.LNAME;
                        nm.roleName = $scope.$parent.allROLEs.filter(function (r) { return r.ROLE_ID == nm.ROLE_ID; })[0].ROLE_NAME;
                        nm.projCont = 0;
                        $scope.allDMs.push(nm); $scope.$parent.allDMs.push(nm);
                    }, function error(errorResponse) {
                        $(".page-loading").addClass("hidden");
                        toastr.error("Error: " + errorResponse.statusText);
                    }).$promise.then(function () {
                        $(".page-loading").addClass("hidden");
                        $location.path('/dataManager/dataManagerList').replace();
                    });
                };
            } //end else  - new dm
        }//end else - logged in
    }
    //#endregion Data Manager

    //#region Organizations
    siGLControllers.controller('organizationCtrl', ['$scope', organizationCtrl]);
    function organizationCtrl($scope) {
        $scope.holder = "Hi, from Organization Ctrler";
    }

    siGLControllers.controller('organizationInfoCtrl', ['$scope', organizationInfoCtrl]);
    function organizationInfoCtrl($scope) {
        $scope.holder = "Hi, from Organization INFO Ctrler";
    }

    //#endregion Organizations

    //#region resource Controller (abstract)
    siGLControllers.controller('resourcesCtrl', ['$scope', '$cookies', '$location', '$state', '$http', '$filter', '$uibModal', 'FREQUENCY_TYPE', 'LAKE_TYPE', 'MEDIA_TYPE', 'OBJECTIVE_TYPE',
        'PARAMETER_TYPE', 'RESOURCE_TYPE', 'HOUSING_TYPE', 'PROJ_DURATION', 'PROJ_STATUS', 'STATUS_TYPE', 'allFreqs', 'allLakes', 'allMedias', 'allObjectives', 'allParams', 'allResources',
        'allProjDurations', 'allProjStats', 'allSiteStats', resourcesCtrl]);
    function resourcesCtrl($scope, $cookies, $location, $state, $http, $filter, $uibModal, FREQUENCY_TYPE, LAKE_TYPE, MEDIA_TYPE, OBJECTIVE_TYPE, PARAMETER_TYPE, RESOURCE_TYPE, HOUSING_TYPE,
        PROJ_DURATION, PROJ_STATUS, STATUS_TYPE, allFreqs, allLakes, allMedias, allObjectives, allParams, allResources, allProjDurations, allProjStats, allSiteStats) {
        if ($cookies.get('siGLCreds') == undefined || $cookies.get('siGLCreds') == "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            $scope.accountRole = $cookies.get('usersRole');
            // change sorting order
            $scope.sortingOrder = ''; // TODO :: SET THIS
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
                    $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-up');
                } else {
                    $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-down');
                }
            };
            $scope.lookupForm = {};

            //#region ALL LOOKUPS (add/update/delete)

            //#region Frequency Types Add/Update/Delete
            $scope.freqTypeList = allFreqs; //ft
            $scope.showAddFTForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addFTButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newFT = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddFTClicked = function () {
                $scope.showAddFTForm = true; //show the form
                $scope.addFTButtonShowing = false; //hide button
            };
            $scope.NeverMindCT = function () {
                $scope.newFT = {};
                $scope.showAddFTForm = false; //hide the form
                $scope.addFTButtonShowing = true; //show button

            };

            $scope.AddFrequencyType = function (valid) {
                if (valid) {
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    FREQUENCY_TYPE.save($scope.newFT, function success(response) {
                        $scope.freqTypeList.push(response);
                        $scope.newFT = {};
                        $scope.showAddFTForm = false; //hide the form
                        $scope.addFTButtonShowing = true; //show the button again
                        toastr.success("Frequency Type Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };

            $scope.saveFrequencyType = function (data, id) {
                var retur = false;
                $http.defaults.headers.common.Authorization= 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                FREQUENCY_TYPE.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("Frequency Type Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };

            $scope.deleteFrequencyType = function (ft) {
                //modal
                var modalInstance = $uibModal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        keyToRemove: function () {
                            return ft;
                        },
                        what: function () {
                            return "Frequency Type";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    //yes, remove this keyword
                    var index = $scope.freqTypeList.indexOf(ft);
                    //DELETE it
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    FREQUENCY_TYPE.delete({ id: ft.FREQUENCY_TYPE_ID }, ft, function success(response) {
                        $scope.freqTypeList.splice(index, 1);
                        toastr.success("Frequency Type Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion Frequency Types Add/Update/Delete

            //#region Lake Type Add/Update/Delete
            $scope.lakeTypeList = allLakes; //lt
            $scope.showAddLTForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addLTButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newLT = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddLTClicked = function () {
                $scope.showAddLTForm = true; //show the form
                $scope.addLTButtonShowing = false; //hide button
            };
            $scope.NeverMindLT = function () {
                $scope.newLT = {};
                $scope.showAddLTForm = false; //hide the form
                $scope.addLTButtonShowing = true; //show button

            };
            $scope.AddLakeType = function (valid) {
                if (valid) {
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    LAKE_TYPE.save($scope.newLT, function success(response) {
                        $scope.lakeTypeList.push(response);
                        $scope.newLT = {};
                        $scope.showAddLTForm = false; //hide the form
                        $scope.addLTButtonShowing = true; //show the button again
                        toastr.success("Lake Type Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };
            $scope.saveLakeType = function (data, id) {
                var retur = false;
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                LAKE_TYPE.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("Lake Type Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };
            $scope.deleteLakeType = function (lt) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        keyToRemove: function () {
                            return lt;
                        },
                        what: function () {
                            return "Lake Type";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    var index = $scope.lakeTypeList.indexOf(lt);
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    LAKE_TYPE.delete({ id: lt.LAKE_TYPE_ID }, lt, function success(response) {
                        $scope.lakeTypeList.splice(index, 1);
                        toastr.success("Lake Type Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion Lake Type Add/Update/Delete

            //#region Media Type Add/Update/Delete
            $scope.mediaTypeList = allMedias; //mt
            $scope.showAddMTForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addMTButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newMT = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddMTClicked = function () {
                $scope.showAddMTForm = true; //show the form
                $scope.addMTButtonShowing = false; //hide button
            };
            $scope.NeverMindMT = function () {
                $scope.newMT = {};
                $scope.showAddMTForm = false; //hide the form
                $scope.addMTButtonShowing = true; //show button

            };
            $scope.AddMediaType = function (valid) {
                if (valid) {
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    MEDIA_TYPE.save($scope.newMT, function success(response) {
                        $scope.mediaTypeList.push(response);
                        $scope.newMT = {};
                        $scope.showAddMTForm = false; //hide the form
                        $scope.addMTButtonShowing = true; //show the button again
                        toastr.success("Media Type Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };
            $scope.saveMediaType = function (data, id) {
                var retur = false;
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                MEDIA_TYPE.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("Media Type Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };
            $scope.deleteMediaType = function (mt) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        keyToRemove: function () {
                            return mt;
                        },
                        what: function () {
                            return "Media Type";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    var index = $scope.mediaTypeList.indexOf(mt);
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    MEDIA_TYPE.delete({ id: mt.MEDIA_TYPE_ID }, mt, function success(response) {
                        $scope.mediaTypeList.splice(index, 1);
                        toastr.success("Media Type Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion Media Type Add/Update/Delete

            //#region Objective Type Add/Update/Delete
            $scope.objTypeList = allObjectives; //ot
            $scope.showAddOTForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addOTButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newOT = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddOTClicked = function () {
                $scope.showAddOTForm = true; //show the form
                $scope.addOTButtonShowing = false; //hide button
            };
            $scope.NeverMindOT = function () {
                $scope.newOT = {};
                $scope.showAddOTForm = false; //hide the form
                $scope.addOTButtonShowing = true; //show button

            };

            $scope.AddObjectiveType = function (valid) {
                if (valid) {
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    OBJECTIVE_TYPE.save($scope.newOT, function success(response) {
                        $scope.objTypeList.push(response);
                        $scope.newOT = {};
                        $scope.showAddOTForm = false; //hide the form
                        $scope.addOTButtonShowing = true; //show the button again
                        toastr.success("Objective Type Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };

            $scope.saveObjectiveType = function (data, id) {
                var retur = false;
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                OBJECTIVE_TYPE.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("Objective Type Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };

            $scope.deleteObjectiveType = function (ot) {
                //modal
                var modalInstance = $uibModal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        keyToRemove: function () {
                            return ot;
                        },
                        what: function () {
                            return "Objective Type";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    //yes, remove this keyword
                    var index = $scope.objTypeList.indexOf(ot);
                    //DELETE it
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    OBJECTIVE_TYPE.delete({ id: ot.OBJECTIVE_TYPE_ID }, ot, function success(response) {
                        $scope.objTypeList.splice(index, 1);
                        toastr.success("Objective Type Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion Objective Type Add/Update/Delete

            //#region Parameter Type Add/Update/Delete
            $scope.paramTypeList = allParams; //pt
            $scope.showAddPTForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addPTButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newPT = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddPTClicked = function () {
                $scope.showAddPTForm = true; //show the form
                $scope.addPTButtonShowing = false; //hide button
            };
            $scope.NeverMindPT = function () {
                $scope.newPT = {};
                $scope.showAddPTForm = false; //hide the form
                $scope.addPTButtonShowing = true; //show button

            };
            $scope.AddParameterType = function (valid) {
                if (valid) {
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    PARAMETER_TYPE.save($scope.newPT, function success(response) {
                        $scope.paramTypeList.push(response);
                        $scope.newPT = {};
                        $scope.showAddPTForm = false; //hide the form
                        $scope.addPTButtonShowing = true; //show the button again
                        toastr.success("Parameter Type Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };
            $scope.saveParameterType = function (data, id) {
                var retur = false;
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                PARAMETER_TYPE.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("Parameter Type Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };
            $scope.deleteParameterType = function (pt) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        keyToRemove: function () {
                            return pt;
                        },
                        what: function () {
                            return "Parameter Type";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    var index = $scope.fileTypeList.indexOf(pt);
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    PARAMETER_TYPE.delete({ id: pt.PARAMETER_TYPE_ID }, pt, function success(response) {
                        $scope.paramTypeList.splice(index, 1);
                        toastr.success("Parameter Type Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion Parameter Type Add/Update/Delete

            //#region Resource Type Add/Update/Delete
            $scope.resourceTypeList = allResources; //rt
            $scope.showAddRTForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addRTButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newRT = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddRTClicked = function () {
                $scope.showAddRTForm = true; //show the form
                $scope.addRTButtonShowing = false; //hide button
            };
            $scope.NeverMindRT = function () {
                $scope.newRT = {};
                $scope.showAddRTForm = false; //hide the form
                $scope.addRTButtonShowing = true; //show button

            };
            $scope.AddResourceType = function (valid) {
                if (valid) {
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    RESOURCE_TYPE.save($scope.newRT, function success(response) {
                        $scope.resourceTypeList.push(response);
                        $scope.newRT = {};
                        $scope.showAddRTForm = false; //hide the form
                        $scope.addRTButtonShowing = true; //show the button again
                        toastr.success("Resource Type Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };
            $scope.saveResourcType = function (data, id) {
                var retur = false;
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                RESOURCE_TYPE.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("Resource Type Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };
            $scope.deleteResourceType = function (rt) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        keyToRemove: function () {
                            return rt;
                        },
                        what: function () {
                            return "Resource Type";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    var index = $scope.resourceTypeList.indexOf(rt);
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    RESOURCE_TYPE.delete({ id: rt.RESOURCE_TYPE_ID }, rt, function success(response) {
                        $scope.resourceTypeList.splice(index, 1);
                        toastr.success("Resource Type Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion Resource Type Add/Update/Delete

            //#region Proj Duration Add/Update/Delete
            $scope.projDurationList = allProjDurations; //pd
            $scope.showAddPDForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addPDButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newPD = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddPDClicked = function () {
                $scope.showAddPDForm = true; //show the form
                $scope.addPDButtonShowing = false; //hide button
            };
            $scope.NeverMindPD = function () {
                $scope.newPD = {};
                $scope.showAddPDForm = false; //hide the form
                $scope.addPDButtonShowing = true; //show button

            };

            $scope.AddProjDuration = function (valid) {
                if (valid) {
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    PROJ_DURATION.save($scope.newPD, function success(response) {
                        $scope.projDurationList.push(response);
                        $scope.newPD = {};
                        $scope.showAddPDForm = false; //hide the form
                        $scope.addPDButtonShowing = true; //show the button again
                        toastr.success("Project Duration Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };

            $scope.saveProjDuration = function (data, id) {
                var retur = false;
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                PROJ_DURATION.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("Project Duration Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };

            $scope.deleteProjDuration = function (pd) {
                //modal
                var modalInstance = $uibModal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        keyToRemove: function () {
                            return pd;
                        },
                        what: function () {
                            return "Project Duration";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    //yes, remove this keyword
                    var index = $scope.projDurationList.indexOf(pd);
                    //DELETE it
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    PROJ_DURATION.delete({ id: pd.PROJ_DURATION_ID }, pd, function success(response) {
                        $scope.projDurationList.splice(index, 1);
                        toastr.success("Project Duration Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion Proj Duration Add/Update/Delete

            //#region Proj Status Add/Update/Delete
            $scope.projStatusList = allProjStats; //ps
            $scope.showAddPSForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addPSButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newPS = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddPSClicked = function () {
                $scope.showAddPSForm = true; //show the form
                $scope.addPSButtonShowing = false; //hide button
            };
            $scope.NeverMindPS = function () {
                $scope.newPS = {};
                $scope.showAddPSForm = false; //hide the form
                $scope.addPSButtonShowing = true; //show button

            };
            $scope.AddProjStatus = function (valid) {
                if (valid) {
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    PROJ_STATUS.save($scope.newPS, function success(response) {
                        $scope.projStatusList.push(response);
                        $scope.newPS = {};
                        $scope.showAddPSForm = false; //hide the form
                        $scope.addPSButtonShowing = true; //show the button again
                        toastr.success("Project Status Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };
            $scope.saveProjStatus = function (data, id) {
                var retur = false;
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                PROJ_STATUS.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("Project Status Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };
            $scope.deleteProjStatus = function (ps) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        keyToRemove: function () {
                            return ps;
                        },
                        what: function () {
                            return "Project Status Type";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    var index = $scope.projStatusList.indexOf(ps);
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    HOUSING_TYPE.delete({ id: ps.HOUSING_TYPE_ID }, ps, function success(response) {
                        $scope.projStatusList.splice(index, 1);
                        toastr.success("Project Status Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion Proj Status Add/Update/Delete

            //#region Site Status Add/Update/Delete
            $scope.siteStatusList = allSiteStats; //ss
            $scope.showAddSSForm = false; //add something new to a lookup clicked (will unhide form below it) False-> form: hidden, True-> form: visible
            $scope.addSSButtonShowing = true; //start it at true..when clicked, show form, hide button
            $scope.newSS = {};

            //show Add New .... clicked, hide the button and show the form
            $scope.showAddSSClicked = function () {
                $scope.showAddSSForm = true; //show the form
                $scope.addSSButtonShowing = false; //hide button
            };
            $scope.NeverMindSS = function () {
                $scope.newSS = {};
                $scope.showAddSSForm = false; //hide the form
                $scope.addSSButtonShowing = true; //show button

            };
            $scope.AddSiteStatus = function (valid) {
                if (valid) {
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    STATUS_TYPE.save($scope.newSS, function success(response) {
                        $scope.siteStatusList.push(response);
                        $scope.newSS = {};
                        $scope.showAddSSForm = false; //hide the form
                        $scope.addSSButtonShowing = true; //show the button again
                        toastr.success("Site Status Type Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            };
            $scope.saveSiteStatus = function (data, id) {
                var retur = false;
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                STATUS_TYPE.update({ id: id }, data, function success(response) {
                    retur = response;
                    toastr.success("Site Status Type Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            };
            $scope.deleteSiteStatus = function (ss) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        keyToRemove: function () {
                            return ss;
                        },
                        what: function () {
                            return "Status Type";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    var index = $scope.siteStatusList.indexOf(ss);
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    STATUS_TYPE.delete({ id: ss.STATUS_ID }, ss, function success(response) {
                        $scope.siteStatusList.splice(index, 1);
                        toastr.success("Site Status Type Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //#endregion Site Status Add/Update/Delete

            //#endregion ALL LOOKUPS (add/update/delete)
        }
    }
    //#endregion resource Controller (abstract)

    //#endregion settings

    //#region HELP Controller
    siGLControllers.controller('helpCtrl', ['$scope', helpCtrl]);
    function helpCtrl($scope) {
        $scope.helpInfo = {};
        $scope.helpInfo.fact = "Some really interesting help will be here.";
    }
    //#endregion HELP Controller

    //#region NAV Controller
    siGLControllers.controller('navCtrl', ['$scope', '$cookies', '$location', '$rootScope', navCtrl]);
    function navCtrl($scope, $cookies, $location, $rootScope) {
        $scope.logout = function () {
            $cookies.remove('siGLCreds');
            $cookies.remove('siGLUsername');
            $cookies.remove('usersName');
            $cookies.remove('usersRole');
            $cookies.remove('projListSortOrder'); $cookies.remove('pl_reverse');
            $cookies.remove('siteListSortOrder'); $cookies.remove('sl_reverse');
            $cookies.remove('DMListSortOrder'); $cookies.remove('dml_reverse');
            $cookies.remove('DMprojectsSortOrder'); $cookies.remove('dmpl_reverse');

            $rootScope.isAuth.val = false;
            $location.path('/login');
        };
    }
    //#endregion NAV Controller

    //#region PROJECT LIST Controller
    //ProjectListCtrl
    siGLControllers.controller('projectListCtrl', ['$scope', '$cookies', 'PROJECT', '$location', '$http', projectListCtrl]);
    function projectListCtrl($scope, $cookies, PROJECT, $location, $http) {
        if($cookies.get('siGLCreds') == undefined || $cookies.get('siGLCreds') == "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            //array of projects
            $http.defaults.headers.common.Authorization= 'Basic ' + $cookies.get('siGLCreds');
            $(".page-loading").removeClass("hidden");
            //get the projects to list
            PROJECT.getIndexProjects(function success(data) {
                data.sort(function (a, b) {
                    var nameA = a.Name.toLowerCase(), nameB = b.Name.toLowerCase();
                    if (nameA < nameB)
                        return -1;
                    if (nameA > nameB)
                        return 1;
                    return 0;
                });
                $scope.userRole = $cookies.get('usersRole');

                //test stuff to make it faster for now
                //$scope.projects = {Name: 'John Doe', Manager: 'Sam Smith', ManagerOrg: 'USGS', SiteCount: '9'};
                //$scope.ProjCnt = 1;
                //$scope.MoreThan20 = false;

                $scope.projects = data;
                $scope.ProjCnt = data.length;
                $scope.MoreThan20 = data.length >= 20 ? true : false;

                $(".page-loading").addClass("hidden");
            }, function error(errorResponse) {
                $(".page-loading").addClass("hidden");
                toastr.error("Error: " + errorResponse.statusText);
            }
            ).$promise;

            //see if sorting order has already been set, preserve if so, otherwise set to 'Name'
            $scope.sortingOrder = $cookies.get('projListSortOrder') != undefined ? $cookies.get('projListSortOrder') : 'Name';
            $scope.reverse = $cookies.get('pl_reverse') != undefined ? Boolean($cookies.get('pl_reverse')): false;

            $scope.sort_by = function (newSortingOrder) {
                $cookies.put('projListSortOrder', newSortingOrder);
                if ($scope.sortingOrder == newSortingOrder) {
                    $scope.reverse = !$scope.reverse;
                    $cookies.put('pl_reverse', $scope.reverse);
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

            $scope.User = $cookies.get('usersName');
        }
    }
    //end projectListCtrl
    //#endregion PROJECT LIST Controller

    //#region ABSTRACT PROJECT EDIT Controller
    //ProjectEditCtrl
    siGLControllers.controller('projectEditCtrl', ['$scope', '$rootScope', '$cookies', '$location', '$state', '$http', '$filter', '$uibModal', 'thisProject', 'projOrgs',
        'projDatum', 'projContacts', 'projPubs', 'projSites', 'projObjectives', 'projKeywords', 'PROJECT', 'SITE', 'allDurationList', 'allStatsList', 'allObjList', projectEditCtrl]);
    function projectEditCtrl($scope, $rootScope, $cookies, $location, $state, $http, $filter, $uibModal, thisProject, projOrgs, projDatum, projContacts, projPubs, projSites,
        projObjectives, projKeywords, PROJECT, SITE, allDurationList, allStatsList, allObjList) {
        //model needed for ProjectEdit Info tab: ( Counts for Cooperators, Datum, Contacts, Publications and Sites) 1. thisProject, 2. parsed urls, 3. project Keywords, 4. all objectives, 5. all statuses, 6. all durations
        if ($cookies.get('siGLCreds') == undefined || $cookies.get('siGLCreds') == "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            $scope.DurationList = allDurationList;
            $scope.StatusList = allStatsList;
            $scope.projectForm = {}; //holder for all the forms
            $scope.readyFlagModel = "No";

            //#region changing tabs handler /////////////////////
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                //var formNameModified = false;

                var formNamePristine = true;
                switch (fromState.url) {
                    case '/info':
                        formNamePristine = true;
                        break;
                    case '/cooperator':
                        formNamePristine = $scope.projectForm.Coop != undefined ? $scope.projectForm.Coop.$pristine : true;
                        break;
                    case '/data':
                        formNamePristine = $scope.projectForm.Data != undefined ? $scope.projectForm.Data.$pristine : true;
                        break;
                    case '/contact':
                        formNamePristine = $scope.projectForm.Contact != undefined ? $scope.projectForm.Contact.$pristine : true;
                        break;
                    case '/publication':
                        formNamePristine = $scope.projectForm.Pubs != undefined ? $scope.projectForm.Pubs.$pristine : true;
                        break;
                    case '/siteInfo/:siteId':
                        formNamePristine = true;
                        break;
                }
                if (!formNamePristine) {
                    if (confirm("Are you sure you want to change tabs? Any unsaved information will be lost.")) {
                        console.log('go to: ' + toState.name);
                    } else {
                        console.log('stay at state: ' + fromState.name);
                        $(".page-loading").addClass("hidden");
                        event.preventDefault();
                    }
                }
            });
            //#endregion changing tabs handler //////////////////////

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

            //#region GLOBALS
            $scope.aProject = {}; //holder for project (either coming in for edit, or being created on POST )
            $scope.urls = []; //holder for urls for future parsing back together ( | separated string)

            //#endregion GLOBALS

            //open modal to edit or create a project
            $scope.openProjectCreate = function () {
                var dropdownParts = [allDurationList, allStatsList, allObjList];
                //modal
                var modalInstance = $uibModal.open({
                    templateUrl: 'PROJECTmodal.html',
                    controller: 'PROJECTmodalCtrl',
                    size: 'lg',
                    backdrop: 'static',
                    windowClass: 'rep-dialog',
                    resolve: {
                        allDropDownParts: function () {
                            return dropdownParts;
                        },
                        thisProjectStuff: function () {
                            if ($scope.aProject.PROJECT_ID != undefined) {
                                var projObjectives = $scope.ProjectObjectives;
                                var projKeywords = $scope.ProjectKeywords;
                                var projectRelatedStuff = [$scope.aProject, projObjectives, projKeywords];
                                return projectRelatedStuff;
                            }
                        }
                    }
                });
                modalInstance.result.then(function (r) {
                    //$scope.aProject, projObjectives, projKeywords
                    $(".page-loading").addClass("hidden");
                    $scope.aProject = r[0];
                    if ($scope.aProject.URL) {
                        //split string into an array
                        if (($scope.aProject.URL).indexOf('|') > -1) $scope.urls = ($scope.aProject.URL).split("|");
                        else $scope.urls[0] = $scope.aProject.URL;
                    }
                    $scope.ProjectObjectives = r[1];
                    $scope.ProjectKeywords = r[2];
                });
            };

            if (thisProject != undefined) {
                //this is an existing project = build for details view
                $scope.aProject = thisProject;
                $scope.readyFlagModel = $scope.aProject.READY_FLAG > 0 ? "Yes" : "No";
                $scope.coopCount = { total: projOrgs.length };
                $scope.datumCount = { total: projDatum.length };
                $scope.contactCount = { total: projContacts.length };
                $scope.pubCount = { total: projPubs.length };
                $scope.sitesCount = { total: projSites.length };
                $scope.title = "Project: " + $scope.aProject.NAME;
                $scope.ProjectKeywords = projKeywords;
                $scope.ProjectObjectives = projObjectives;

                //#region deal with project SITES url formatting here
                var neededUpdating = false; //if url isn't formatted, flag so know to PUT after fix
                //if any ProjSites, make sure the url (if one) is formatted properly
                for (var psu = 0; psu < projSites.length; psu++) {
                    var ind = psu;
                    if (projSites[ind].URL != null && !projSites[ind].URL.startsWith('http')) {
                        //there is a url and it's not formatted
                        neededUpdating = true;
                        projSites[ind].URL = 'http://' + projSites[ind].URL;
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        $http.defaults.headers.common.Accept = 'application/json';
                        $http.defaults.headers.common['X-HTTP-Method-Override'] = 'PUT';

                        SITE.save({ id: projSites[ind].SITE_ID }, projSites[ind]).$promise.then(function () {
                            delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                        });
                    }
                }
                //#endregion loop to put each site's url in proper way (http://)

                //put string ProjURLs into array by '|' and then ensure proper url format
                if ($scope.aProject.URL) {
                    //split string into an array
                    if (($scope.aProject.URL).indexOf('|') > -1) {
                        $scope.urls = ($scope.aProject.URL).split("|");
                    } else {
                        $scope.urls[0] = $scope.aProject.URL;
                    }
                    //make sure they are formatted.. if not, format and PUT
                    var neededUpdating1 = false;
                    for (var u = 0; u < $scope.urls.length; u++) {
                        if (!$scope.urls[u].startsWith('http')) {
                            neededUpdating1 = true;
                            $scope.urls[u] = 'http://' + $scope.urls[u];
                        }
                    }
                    //if they needed updating, PUT the project
                    if (neededUpdating1) {
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        $http.defaults.headers.common.Accept = 'application/json';
                        $http.defaults.headers.common['X-HTTP-Method-Override'] = 'PUT';
                        $scope.aProject.URL = ($scope.urls).join('|');
                        PROJECT.save({ id: $scope.aProject.PROJECT_ID }, $scope.aProject).$promise.then(function (response) {
                            $scope.aProject = response;
                            //split string into an array
                            if (($scope.aProject.URL).indexOf('|') > -1) {
                                $scope.urls = ($scope.aProject.URL).split("|");
                            } else {
                                $scope.urls[0] = $scope.aProject.URL;
                            }
                            delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                        });
                    }
                } //end there's a url

            } //end existing project
            else {
                $scope.title = "Project";
                $scope.openProjectCreate();
            }

            //flag radio clicked
            $scope.Flagged = function (data) {
                //modal
                var changeFlagModal = $uibModal.open({
                    template: '<div class="modal-header"><h3 class="modal-title">Publish Project</h3></div>' +
                                '<div class="modal-body"><p>Are you sure this project is ready to publish on the SiGL Mapper?</p></div>' +
                                '<div class="modal-footer"><button class="sigl-btn btn-orange" ng-click="cancel()">Cancel</button><button class="sigl-btn" ng-click="ok()">OK</button></div>',
                    controller: function ($scope, $uibModalInstance) {
                        $scope.ok = function () {
                            $scope.aProject.READY_FLAG = data == "Yes" ? 1 : 0;
                            $uibModalInstance.close();
                        };
                        $scope.cancel = function () {
                            //undo
                            $scope.readyFlagModel = $scope.aProject.READY_FLAG > 0 ? "Yes" : "No";
                        };
                    },
                    size: 'sm'
                });
                changeFlagModal.result.then(function () {
                    //yes, PUT the project with the updated flag set
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    $http.defaults.headers.common['X-HTTP-Method-Override'] = 'PUT';
                    PROJECT.save({ id: $scope.aProject.PROJECT_ID }, $scope.aProject, function success(response) {
                        toastr.success("Project Updated");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });
                //end modal
            };

            $scope.cancel = function () {
                //navigate to a different state
                $state.go('projectList');
            };//end cancel
        }//end else (checkCreds == true)
    }//end projectEditCtrl
    //#endregion ABSTRACT PROJECT EDIT Controller

    //#region COOPERATOR Controller
    //ProjectEditCoopCtrl
    siGLControllers.controller('projectEditCoopCtrl', ['$scope', '$http', '$cookies', '$filter', '$uibModal', 'thisProject', 'projOrgs', 'allOrgList', 'allDivisionList', 'allSectionList', 'PROJECT', projectEditCoopCtrl]);
    function projectEditCoopCtrl($scope, $http, $cookies, $filter, $uibModal, thisProject, projOrgs, allOrgList, allDivisionList, allSectionList, PROJECT) {
        $scope.ProjOrgs = projOrgs; // ORGANIZATION_RESOURCE
        $scope.allOrgs = allOrgList; //ORGANIZATION
        $scope.allDivisions = allDivisionList; //DIVISION
        $scope.allSections = allSectionList; //SECTION

        $scope.selectedOrgID = "";
        $scope.selectedDivID = "";
        $scope.selectedSecID = "";

        $scope.getDivs = function (orgID) {
            $scope.alldivs = {}; $scope.selectedDivID = ""; $scope.selectedSecID = "";
            $scope.alldivs = $scope.allDivisions.filter(function (d) {
                return d.ORG_ID == orgID;
            });
            $scope.allsecs = {};
        };

        $scope.getSecs = function (divID) {
            $scope.selectedSecID = "";
            $scope.allsecs = $scope.allSections.filter(function (s) { return s.DIV_ID == divID; });
        };

        //ADD ORG MODAL CONTENT (Add New ORG NAME, DIVISION, OR SECTION)
        $scope.addNewOrg = function () {
            //modal
            //pass array of chosen org/div so they will be prepopulated in modal
            var chosenparts = [$scope.selectedOrgID, $scope.selectedDivID, $scope.selectedSecID];
            var modalInstance = $uibModal.open({
                templateUrl: 'AddOrganizationModal.html',
                controller: 'AddOrgModalCtrl',
                size: 'md',
                backdrop: 'static',
                resolve: {
                    chosenParts: function () { return chosenparts; },
                    allOrgs: function () { return $scope.allOrgs; },
                    allDivs: function () { return $scope.allDivisions; },
                    allSecs: function () { return $scope.allSections; }
                }
            });
            modalInstance.result.then(function (updatedOrgDivSec) {
                //make sure parent. are all updated
                $scope.allOrgs = updatedOrgDivSec[0]; //allOrgs updated
                $scope.allDivisions = updatedOrgDivSec[1]; //allDivs updated
                $scope.allSections = updatedOrgDivSec[2]; //allSecs updated
                //set selected choices
                $scope.selectedOrgID = updatedOrgDivSec[3];
                //need to populate all divs before making one selected
                if ($scope.selectedOrgID != "")
                    $scope.alldivs = $scope.allDivisions.filter(function (d) { return d.ORG_ID == $scope.selectedOrgID; });

                $scope.selectedDivID = updatedOrgDivSec[4];

                //need to populate all secs before making one selected
                if ($scope.selectedDivID != "")
                    $scope.allsecs = $scope.allSections.filter(function (s) { return s.DIV_ID == $scope.selectedDivID; });

                $scope.selectedSecID = updatedOrgDivSec[5];
            }, function () {
                //logic to do on cancel
            });
            //end modal
        }; //end AddNewOrg

        //adding a new organization to this project (need to check if a new ORGANIZATION_SYSTEM needs to be posted first
        $scope.AddOrgToProj = function () {
            if ($scope.selectedOrgID == "") {
                //modal for enter all required fields
                var modalInstance = $uibModal.open({
                    template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                                '<div class="modal-body"><p>You must choose an Organization Name to add.</p></div>' +
                                '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button></div>',
                    controller: function ($scope, $uibModalInstance) {
                        $scope.ok = function () {
                            $uibModalInstance.close('org');
                        };
                    },
                    size: 'sm'
                });
                modalInstance.result.then(function (fieldFocus) {
                    if (fieldFocus == "org") {
                        $("#OrgName").focus();
                    }
                });
            } else {
                var secID = $scope.selectedSecID != "" ? $scope.selectedSecID : "0";
                var divID = $scope.selectedDivID != "" ? $scope.selectedDivID : "0";
                var orgID = $scope.selectedOrgID != "" ? $scope.selectedOrgID : "0";
                var alreadyExist = $scope.ProjOrgs.filter(function (po) { return po.OrganizationID == orgID && po.DivisionID == divID && po.SectionID == secID; })[0];
                if (alreadyExist != undefined) {
                    alert("This Organization is already a part of this Project.");
                } //end this project doesn't already have this org
                else {
                    PROJECT.addProjOrg({ id: thisProject.PROJECT_ID, organizationId: orgID, divisionId: divID, sectionId: secID }, function success(response) {
                        //array of all the ORGANIZATION_RESOURCES for this project
                        var postedORG = response.filter(function (postedO) { return postedO.OrganizationID == orgID && postedO.DivisionID == divID && postedO.SectionID == secID; })[0];
                        $scope.ProjOrgs.push(postedORG);

                        //$scope.ProjOrgs = response;
                        $scope.coopCount.total = $scope.coopCount.total + 1;
                        $scope.alldivs = {}; $scope.allsecs = {}; $scope.selectedOrgID = ""; $scope.selectedDivID = ""; $scope.selectedSecID = "";
                        $scope.projectForm.Coop.$setPristine(true);
                        toastr.success("Organization Added");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            }
        };//end AddOrg (projectCooperator)

        $scope.RemoveOrgFromProj = function (org) {
            //modal
            var modalInstance = $uibModal.open({
                templateUrl: 'removemodal.html',
                controller: 'ConfirmModalCtrl',
                size: 'sm',
                resolve: {
                    keyToRemove: function () {
                        return org;
                    },
                    what: function () {
                        return "Organization";
                    }
                }
            });
            modalInstance.result.then(function (keyToRemove) {
                //yes, remove this keyword
                var index = $scope.ProjOrgs.indexOf(org);
                //DELETE it
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                PROJECT.deleteProjOrg({ id: thisProject.PROJECT_ID, orgId: org.OrganizationSystemID }, function success(response) {
                    $scope.ProjOrgs.splice(index, 1);
                    $scope.coopCount.total = $scope.coopCount.total - 1;
                    toastr.success("Organization Removed");
                }, function error(errorResponse) {
                    toastr.error("Error: " + errorResponse.statusText);
                });
            }, function () {
                //logic for cancel
            });
            //end modal
        };
    }
    //#endregion COOPERATOR Controller

    //#region DATA Controller
    //ProjectEditDataCtrl
    siGLControllers.controller('projectEditDataCtrl', ['$scope', '$cookies', '$http', '$uibModal', 'PROJECT', 'DATA_HOST', 'thisProject', 'projDatum', projectEditDataCtrl]);
    function projectEditDataCtrl($scope, $cookies, $http, $uibModal, PROJECT, DATA_HOST, thisProject, projDatum) {
        $scope.ProjData = projDatum;
        var neededUpdating = false; //if the url isn't formatted, flag so know to PUT it after fixing
        $scope.isEditing = false; //disables form inputs while user is editing existing data up top
        $scope.newData = {}; //holder
        var thisProjID = thisProject.PROJECT_ID; //projectID

        //if any ProjDatum, make sure the url (if one) is formatted properly
        for (var pdu = 0; pdu < $scope.ProjData.length; pdu++) {
            var ind = pdu;
            if ($scope.ProjData[ind].PORTAL_URL != null && !$scope.ProjData[ind].PORTAL_URL.startsWith('http')) {
                //there is a url and it's not formatted
                neededUpdating = true;
                $scope.ProjData[ind].PORTAL_URL = 'http://' + $scope.ProjData[ind].PORTAL_URL;
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                $http.defaults.headers.common['X-HTTP-Method-Override'] = 'PUT';

                DATA_HOST.save({ id: $scope.ProjData[ind].DATA_HOST_ID }, $scope.ProjData[ind]).$promise.then(function () {
                    delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                });
            }
        }

        //modal for required at least 1 field..
        var openModal = function () {
            var modalInstance = $uibModal.open({
                template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                    '<div class="modal-body"><p>You must populate at least one field.</p></div>' +
                    '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button></div>',
                controller: function ($scope, $uibModalInstance) {
                    $scope.ok = function () {
                        $uibModalInstance.close('req');
                    };
                },
                size: 'sm'
           });
           modalInstance.result.then(function (fieldFocus) {
                if (fieldFocus == "req") {
                    $("#DESCRIPTION").focus();
                }
          });
        };

        //POST Data click
        $scope.AddData = function (valid, d) {
            if (valid) {
                //add it
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                PROJECT.addProjData({ id: thisProjID }, d, function success(response) {
                    var postedDATA = response.filter(function (postedD) { return postedD.DESCRIPTION == d.DESCRIPTION && postedD.PORTAL_URL == d.PORTAL_URL && postedD.HOST_NAME == d.HOST_NAME; })[0];
                    $scope.ProjData.push(postedDATA);

                    $scope.datumCount.total = $scope.datumCount.total + 1;
                    $scope.newData = {};
                    $scope.projectForm.Data.$setPristine(true);
                    toastr.success("Data Added");
                }, function error(errorResponse) {
                    toastr.error("Error: " + errorResponse.statusText);
                });
            } else {
                //modal for enter all required fields
                openModal();
            }
        };//end addData

        //DELETE Data click
        $scope.RemoveData = function (dataH) {
            //modal
            var modalInstance = $uibModal.open({
                templateUrl: 'removemodal.html',
                controller: 'ConfirmModalCtrl',
                size: 'sm',
                resolve: {
                    keyToRemove: function () {
                        return dataH;
                    },
                    what: function () {
                        return "Data";
                    }
                }
            });
            modalInstance.result.then(function (keyToRemove) {
                //yes, remove this keyword
                var index = $scope.ProjData.indexOf(dataH);
                //DELETE it
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';

                PROJECT.deleteProjData({ id: thisProjID }, dataH, function success(response) {
                    $scope.ProjData.splice(index, 1); projDatum.splice(index, 1);
                    $scope.datumCount.total = $scope.datumCount.total - 1;
                    toastr.success("Data Removed");
                }, function error(errorResponse) {
                    toastr.error("Error: " + errorResponse.statusText);
                });
                delete $http.defaults.headers.common['X-HTTP-Method-Override'];
            }, function () {
                //logic for cancel
            });
            //end modal
        };

        //validate that at least 1 field is populated before saving edit
        $scope.ValidateAtLeastOne = function (d) {
            if ((d.DESCRIPTION == "" || d.DESCRIPTION == null) && (d.HOST_NAME == "" || d.HOST_NAME == null) && (d.PORTAL_URL == "" || d.PORTAL_URL == null)) {
                toastr.error("Data Source not updated.");
                openModal();
                return "You need to populate at least one field."; //way to stop it from closing edit..just return something cuz modal is opening
            }
        };

        //editing, disable create parts
        $scope.EditRowClicked = function () {
            $scope.projectForm.Data.$pristine = false; //make sure form is not pristine in case they change tabs before hitting save/cancel
            $scope.isEditing = true; //disable create new fields until they hit save/cancel
        };

        //cancel edit
        $scope.CancelEditRowClick = function () {
            $scope.projectForm.Data.$setPristine(true);//make sure form is pristine
            $scope.isEditing = false;//enable create new fields
        };

        //Edit existing Data
        $scope.saveData = function (data, id) {
            if (this.rowform.$valid) {
                var retur = false;
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                $http.defaults.headers.common['X-HTTP-Method-Override'] = 'PUT';
                DATA_HOST.save({ id: id }, data, function success(response) {
                    retur = response; //maybe need to update the projData that this controller gets from resolve, for returning to this tab later
                    $scope.projectForm.Data.$setPristine(true);
                    toastr.success("Data Updated");
                }, function error(errorResponse) {
                    retur = false;
                    toastr.error("Error: " + errorResponse.statusText);
                });
                delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                return retur;
            }
        };//end saveData

    }
    //#endregion DATA Controller

    //#region CONTACT Controller
    //projectEditContactCtrl
    siGLControllers.controller('projectEditContactCtrl', ['$scope', '$cookies', '$http', '$filter', '$uibModal', 'PROJECT', 'CONTACT', 'ORGANIZATION_SYSTEM', 'projContacts', 'thisProject', 'orgResources', 'allOrgList', 'allDivisionList', 'allSectionList', projectEditContactCtrl]);
    function projectEditContactCtrl($scope, $cookies, $http, $filter, $uibModal, PROJECT, CONTACT, ORGANIZATION_SYSTEM, projContacts, thisProject, orgResources, allOrgList, allDivisionList, allSectionList) {
        $scope.ProjContacts = projContacts;

        //make sure phone is formatted
        for (var p = 0; p < $scope.ProjContacts.length; p++) {
            var theI = p;
            if ($scope.ProjContacts[theI].PHONE != null && !$scope.ProjContacts[theI].PHONE.startsWith("(")) {
                //not formatted..remove any spaces, dashes or parenthesis to then do it properly
                var phNo = $scope.ProjContacts[theI].PHONE.replace("[()\\s-]+", "");
                if (phNo.length >= 10) {
                    //format it
                    $scope.ProjContacts[theI].PHONE = "(" + phNo.substring(0, 3) + ") " + phNo.substring(3, 6) + "-" + phNo.substring(6);
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    $http.defaults.headers.common['X-HTTP-Method-Override'] = 'PUT';
                    CONTACT.save({ id: $scope.ProjContacts[theI].CONTACT_ID }, $scope.ProjContacts[theI]).$promise.then(function (response) {
                        delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                    });
                }
            }
        }

        $scope.allOrgResources = orgResources; //ORGANIZATION_RESOURCE
        $scope.allOrganizations = allOrgList; //ORGANIZATION
        $scope.allDivisions = allDivisionList; //DIVISION
        $scope.allSections = allSectionList; //SECTION
        $scope.selectedOrgID = "";
        $scope.selectedDivID = "";
        $scope.selectedSecID = "";
        $scope.alldivs = {};
        $scope.allsecs = {};
        $scope.newContact = {}; //holder for the new contact being added to the project
        $scope.isEditing = false; //flag so that when editing, can't also add a new one below
        $scope.updatedContactOrg = false; //set flag to check on saveEdits to update the org

        //format contacts for display with org parts
        for (var x = 0; x < $scope.ProjContacts.length; x++) {
            var thisOrgRes = $scope.allOrgResources.filter(function (or) { return or.OrganizationSystemID == $scope.ProjContacts[x].ORGANIZATION_SYSTEM_ID; })[0];
            $scope.ProjContacts[x].OrgName = thisOrgRes.OrganizationName;
            if (thisOrgRes.DivisionID > 0)
                $scope.ProjContacts[x].DivName = thisOrgRes.DivisionName;
            if (thisOrgRes.SectionID > 0)
                $scope.ProjContacts[x].SecName = thisOrgRes.SectionName;
        }

        //org was chosen, go get the divs
        $scope.getDivs = function (orgID) {
            $scope.alldivs = {}; $scope.selectedDivID = ""; $scope.selectedSecID = "";
            $scope.alldivs = $scope.allDivisions.filter(function (d) { return d.ORG_ID == orgID; });
            $scope.allsecs = {};
        };

        //div was chosen, go get the secs
        $scope.getSecs = function (divID) {
            $scope.selectedSecID = "";
            $scope.allsecs = $scope.allSections.filter(function (s) {
                return s.DIV_ID == divID;
            });
        };

        //post this contact to the project and then format the list of projContacts with org info
        function postProjContact(orgSys) {
            $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
            $http.defaults.headers.common.Accept = 'application/json';
            PROJECT.addProjContact({ id: thisProject.PROJECT_ID }, $scope.newContact, function success(response) {
                $scope.ProjContacts = response;
                for (var pc = 0; pc < $scope.ProjContacts.length; pc++) {
                    var thisOrgSysRes = $scope.allOrgResources.filter(function (allOrgRe) {return allOrgRe.OrganizationSystemID == $scope.ProjContacts[pc].ORGANIZATION_SYSTEM_ID;})[0];
                    $scope.ProjContacts[pc].OrgName = thisOrgSysRes.OrganizationName;
                    if (orgSys.DivisionID > 0)
                        $scope.ProjContacts[pc].DivName = thisOrgSysRes.DivisionName;
                    if (orgSys.SectionID > 0)
                        $scope.ProjContacts[pc].SecName = thisOrgSysRes.SectionName;
                }
                $scope.contactCount.total = $scope.contactCount.total + 1;
                //clear inputs
                $scope.newContact = {};
                $scope.alldivs = {}; $scope.selectedDivID = "";
                $scope.allsecs = {}; $scope.selectedSecID = "";
                $scope.selectedOrgID = "";
                $scope.projectForm.Contact.$setPristine(true);
                toastr.success("Contact Added");
            }, function error(errorResponse) {
                toasstr.error("Error: " + errorResponse.statusText);
            });
        }

        //add this contact to the project
        $scope.AddContact = function (valid) {
            if (valid) {
                //make sure the org_sys exists -- did they create a new one?
                var secID = $scope.selectedSecID != "" ? $scope.selectedSecID : "0";
                var divID = $scope.selectedDivID != "" ? $scope.selectedDivID : "0";
                var orgID = $scope.selectedOrgID != "" ? $scope.selectedOrgID : "0";
                var chosenOrg = $scope.allOrgResources.filter(function (orgS) { return orgS.SectionID == secID && orgS.DivisionID == divID && orgS.OrganizationID == orgID; })[0];
                if (chosenOrg != undefined) {
                    $scope.newContact.ORGANIZATION_SYSTEM_ID = chosenOrg.OrganizationSystemID;
                    postProjContact(chosenOrg);
                } else {
                    //need to post the organization_system first
                    var newORG_SYS = { ORG_ID: orgID, DIV_ID: divID, SEC_ID: secID };
                    ORGANIZATION_SYSTEM.save(newORG_SYS, function success(responseOS) {
                        $scope.newContact.ORGANIZATION_SYSTEM_ID = responseOS.ORGANIZATION_SYSTEM_ID;
                        var org = $scope.allOrganizations.filter(function (o){return o.ORGANIZATION_ID == responseOS.ORG_ID;})[0];
                        var div = responseOS.DIV_ID > 0 ? $scope.allDivisions.filter(function (d) { return d.DIVISION_ID == responseOS.DIV_ID; })[0] : null;
                        var sec = responseOS.SEC_ID > 0 ? $scope.allSections.filter(function (s) { return s.SECTION_ID == responseOS.SEC_ID; })[0] : null;
                        var newOrgRes = {
                            OrganizationSystemID: responseOS.ORGANIZATION_SYSTEM_ID,
                            OrganizationID: org.ORGANIZATION_ID,
                            OrganizationName: org.ORGANIZATION_NAME,
                            DivisionID: div != null ? div.DIVISION_ID : 0,
                            DivisionName: div != null ? div.DIVISION_NAME : null,
                            SectionID: sec != null ? sec.SECTION_ID : 0,
                            SectionName: sec != null ? sec.SECTION_NAME : null
                        };
                        $scope.allOrgResources.push(newOrgRes);
                        postProjContact(newOrgRes);
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }
            } else {
                toastr.error("Contact not added");
            }
        };

        $scope.EditRowClicked = function (i) {
            //editing: only show (add org button) for this row, and disable inputs for new contact below
            var showAtag = document.getElementsByClassName("showHide")[this.$index];
            showAtag.style.display = "inline";
            $scope.isEditing = true;
        };
        $scope.CancelEditRowClick = function () {
            //done editing: hide (add org button) for this row, and re-enable inputs for new contact below
            var showAtag = document.getElementsByClassName("showHide")[this.$index];
            showAtag.style.display = "none";
            $scope.isEditing = false;
        };
        $scope.checkRequiredFields = function (which, data) {
            //            if null -- you must populate, else if which== email .. valid email
            if (data == null) {
                return "You must populate all required fields";
            } else {
                if (which == "email") {
                    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
                    if (re.test(data) == false)
                        return "You must provide a valid email address";
                }
            }
            ////modal for enter all required fields
            //var modalInstance = $uibModal.open({
            //    template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
            //                '<div class="modal-body"><p>You must populate all required fields.</p></div>' +
            //                '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button></div>',
            //    controller: function ($scope, $uibModalInstance) {
            //        $scope.ok = function () {
            //            $uibModalInstance.close(errorField);
            //        }
            //    },
            //    size: 'sm'
            //});
            //modalInstance.result.then(function (fieldFocus) {
            //    var test = "#" + fieldFocus;
            //    $(test).focus;
            //});

        };

        //edit contact done, save clicked
        $scope.saveContact = function (contact, id) {
            //hide the add org button for this row
            var showAtag = document.getElementsByClassName("showHide")[this.$index];
            showAtag.style.display = "none";
            if ($scope.updatedContactOrg == true) {
                //they updated the org for this contact
                var projContactBeingUpdated = $scope.ProjContacts.filter(function (pc) { return pc.CONTACT_ID == contact.CONTACT_ID; })[0];
                var thisOrgRes = $scope.allOrgResources.filter(function (or) { return or.OrganizationName == projContactBeingUpdated.OrgName && or.DivisionName == (projContactBeingUpdated.DivName != "" ? projContactBeingUpdated.DivName : null) && or.SectionName == (projContactBeingUpdated.SecName != "" ? projContactBeingUpdated.SecName : null); })[0];
                if (thisOrgRes != undefined) {
                    //they didn't create a new one, just add the orgsysid to hidden input
                    contact.ORGANIZATION_SYSTEM_ID = thisOrgRes.OrganizationSystemID;
                    PUTcontact(contact, id);
                    //do a put now
                } else {
                    //create the org_sys then add the id then put
                    var orgId = $scope.allOrganizations.filter(function (aorg) { return aorg.ORGANIZATION_NAME == projContactBeingUpdated.OrgName; })[0].ORGANIZATION_ID;
                    var divId = projContactBeingUpdated.DivName != "" ? $scope.allDivisions.filter(function (adiv) { return adiv.DIVISION_NAME == projContactBeingUpdated.DivName; })[0].DIVISION_ID : 0;
                    var secID = projContactBeingUpdated.SecName != "" ? $scope.allSections.filter(function (asec) { return asec.SECTION_NAME == projContactBeingUpdated.SecName; })[0].SECTION_ID : 0;
                    var newORGSYS = { ORG_ID: orgId, DIV_ID: divId, SEC_ID: secID };
                    ORGANIZATION_SYSTEM.save(newORGSYS, function success(response) {
                        contact.ORGANIZATION_SYSTEM_ID = response.ORGANIZATION_SYSTEM_ID;
                        PUTcontact(contact, id);
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                } //end else (thisOrgRes == undefined)
            } //end updateContactOrg
            else {
                //contactOrg wasn't updated.. putContact
                PUTcontact(contact, id);
            }
        };

        function PUTcontact(contactToUpdate, id) {
            //PUT
            var retur = false;
            $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
            $http.defaults.headers.common.Accept = 'application/json';
            $http.defaults.headers.common['X-HTTP-Method-Override'] = 'PUT';
            CONTACT.save({ id: id }, contactToUpdate, function success(response) {
                var projContact = response;
                var thisOrgRes = $scope.allOrgResources.filter(function (or) { return or.OrganizationSystemID == response.ORGANIZATION_SYSTEM_ID; })[0];
                projContacts.OrgName = thisOrgRes.OrganizationName;
                projContacts.DivName = thisOrgRes.DivisionName;
                projContacts.SecName = thisOrgRes.SectionName;
                retur = projContacts;
                toastr.success("Contact Updated");
                delete $http.defaults.headers.common['X-HTTP-Method-Override'];
            }, function error(errorResponse) {
                toastr.error("Error: " + errorResponse.statusText);
            });
            return retur;
        }

        $scope.secChosen = function (s) {
            //TODO: a section was chosen
        };

        //ADD ORG MODAL CONTENT (Add New ORG NAME, DIVISION, OR SECTION)
        $scope.addNewOrg = function () {
            //modal
            var editingContact = null;
            if (this.c != null) {
                editingContact = this.c;
            }
            //pass array of chosen org/div so they will be prepopulated in modal
            var chosenparts = [];
            if ($scope.isEditing == true) {
                //editing contact's org, pass their org id's to the modal for prepopulating
                var orgId = $scope.allOrganizations.filter(function (o) { return o.ORGANIZATION_NAME == editingContact.OrgName; })[0].ORGANIZATION_ID;
                var divId = editingContact.DivName != undefined ? $scope.allDivisions.filter(function (d) { return d.DIVISION_NAME == editingContact.DivName; })[0].DIVISION_ID : 0;
                var secId = editingContact.SecName != undefined ? $scope.allSections.filter(function (s) { return s.SECTION_NAME == editingContact.SecName; })[0].SECTION_ID : 0;
                chosenparts.push(orgId);
                chosenparts.push(divId);
                chosenparts.push(secId);
            } else {
                chosenparts.push($scope.selectedOrgID);
                chosenparts.push($scope.selectedDivID);
                chosenparts.push($scope.selectedSecID);
            }

            var modalInstance = $uibModal.open({
                templateUrl: 'AddOrganizationModal.html',
                controller: 'AddOrgModalCtrl',
                size: 'md',
                backdrop: 'static',
                resolve: {
                    chosenParts: function () { return chosenparts; },
                    allOrgs: function () { return $scope.allOrganizations; },
                    allDivs: function () { return $scope.allDivisions; },
                    allSecs: function () { return $scope.allSections; }
                }
            });
            modalInstance.result.then(function (updatedOrgDivSec) {
                //make sure parent. are all updated
                $scope.allOrganizations = updatedOrgDivSec[0]; //allOrgs updated
                $scope.allDivisions = updatedOrgDivSec[1]; //allDivs updated
                $scope.allSections = updatedOrgDivSec[2]; //allSecs updated

                if ($scope.isEditing) {
                    //this is updating the existing contact's organization
                    var chosenOrgID = updatedOrgDivSec[3];
                    var chosenDivID = updatedOrgDivSec[4] != "" ? updatedOrgDivSec[4] : 0;
                    var chosenSecID = updatedOrgDivSec[5] != "" ? updatedOrgDivSec[5] : 0;

                    var thisContact = editingContact;
                    $scope.updatedContactOrg = true;

                    var i = $scope.ProjContacts.indexOf(thisContact);
                    //update this contact's binded org info
                    $scope.ProjContacts[i].OrgName = $scope.allOrganizations.filter(function (o) { return o.ORGANIZATION_ID == chosenOrgID; })[0].ORGANIZATION_NAME;
                    $scope.ProjContacts[i].DivName = chosenDivID > 0 ? $scope.allDivisions.filter(function (o) { return o.DIVISION_ID == chosenDivID; })[0].DIVISION_NAME: "";
                    $scope.ProjContacts[i].SecName = chosenSecID > 0 ? $scope.allSections.filter(function (o) { return o.SECTION_ID == chosenSecID; })[0].SECTION_NAME : "";
                    var thisOrgRes = $scope.allOrgResources.filter(function (or) { return or.OrganizationID == chosenOrgID && or.DivisionID == chosenDivID && or.SectionID == chosenSecID; })[0];
                    if (thisOrgRes != undefined) {
                        //they didn't create a new one, just add the orgsysid to hidden input
                        $scope.ProjContacts[i].ORGANIZATION_SYSTEM_ID = thisOrgRes.OrganizationSystemID;
                    } else {
                        //post the orgSys and then apply the id to hidden input
                        var newORGSYS = { ORG_ID: chosenOrgID, DIV_ID: chosenDivID, SEC_ID: chosenSecID };
                        ORGANIZATION_SYSTEM.save(newORGSYS, function success(response) {
                            var test;
                            //update the orgResourceList
                            var orgResToAdd = {
                                OrganizationSystemID: response.ORGANIZATION_SYSTEM_ID,
                                OrganizationID: response.ORG_ID,
                                OrganizationName: $scope.ProjContacts[i].OrgName,
                                DivisionID: response.DIV_ID,
                                DivisionName: $scope.ProjContacts[i].DivName,
                                SectionID: response.SEC_ID,
                                SectionName: $scope.ProjContacts[i].SecName
                            };
                            $scope.allOrgResources.push(orgResToAdd);
                            $scope.ProjContacts[i].ORGANIZATION_SYSTEM_ID = response.ORGANIZATION_SYSTEM_ID;
                        }, function error(errorResponse) { toastr.error(errorResponse.statusText);}).$promise;

                    }

                } else {
                    //new contact section
                    //set selected choices
                    $scope.selectedOrgID = updatedOrgDivSec[3];
                    //need to populate all divs before making one selected
                    if ($scope.selectedOrgID != "")
                        $scope.alldivs = $scope.allDivisions.filter(function (d) { return d.ORG_ID == $scope.selectedOrgID; });

                    $scope.selectedDivID = updatedOrgDivSec[4];

                    //need to populate all secs before making one selected
                    if ($scope.selectedDivID != "")
                        $scope.allsecs = $scope.allSections.filter(function (s) { return s.DIV_ID == $scope.selectedDivID; });

                    $scope.selectedSecID = updatedOrgDivSec[5];
                }//end else (new contact)
            }, function () {
                //logic to do on cancel
            });
            //end modal
        }; //end AddNewOrg

        $scope.RemoveContact = function (con) {
            //modal
            var modalInstance = $uibModal.open({
                templateUrl: 'removemodal.html',
                controller: 'ConfirmModalCtrl',
                size: 'sm',
                resolve: {
                    keyToRemove: function () {
                        return con;
                    },
                    what: function () {
                        return "Contact";
                    }
                }
            });
            modalInstance.result.then(function (keyToRemove) {
                //yes, remove this keyword
                var index = $scope.ProjContacts.indexOf(con);
                //put it back to a CONTACT
                var aCONTACT = {
                    CONTACT_ID: con.CONTACT_ID,
                    NAME: con.NAME,
                    EMAIL: con.EMAIL,
                    PHONE: con.PHONE,
                    ORGANIZATION_SYSTEM_ID: con.ORGANIZATION_SYSTEM_ID,
                    SCIENCE_BASE_ID: con.SCIENCE_BASE_ID
                };
                //DELETE it
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';

                PROJECT.deleteProjContact({ id: thisProject.PROJECT_ID }, aCONTACT, function success(response) {
                    $scope.ProjContacts.splice(index, 1);
                    $scope.contactCount.total = $scope.contactCount.total - 1;
                    //TODO: Make sure services are removing the organizationsystem object
                    toastr.success("Contact Removed");
                }, function error(errorResponse) {
                    toastr.error("Error: " + errorResponse.statusText);
                });
                delete $http.defaults.headers.common['X-HTTP-Method-Override'];
            }, function () {
                //logic for cancel
            });
            //end modal
        };

    }
    //#endregion CONTACT Controller

    //#region PUBLICATION Controller
    siGLControllers.controller('projectEditPubCtrl', ['$scope', '$cookies', '$http', '$uibModal', 'PROJECT', 'thisProject', 'PUBLICATION', 'projPubs', projectEditPubCtrl]);
    function projectEditPubCtrl($scope, $cookies, $http, $uibModal, PROJECT, thisProject, PUBLICATION, projPubs) {
        $scope.ProjPubs = projPubs;
        $scope.isEditing = false; //disables form inputs while user is editing existing data up top
        $scope.newPub = {
        };
        var thisProjID = thisProject.PROJECT_ID;

        //modal for required at least 1 field..
        var openModal = function () {
            var modalInstance = $uibModal.open({
                template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                    '<div class="modal-body"><p>You must populate at least one field.</p></div>' +
                    '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button></div>',
                controller: function ($scope, $uibModalInstance) {
                    $scope.ok = function () {
                        $uibModalInstance.close('req');
                    };
                },
                size: 'sm'
            });
            modalInstance.result.then(function (fieldFocus) {
                if (fieldFocus == "req") {
                    $("#TITLE").focus();
                }
            });
        };

        //#region POST Pub click
        $scope.AddPub = function (valid, p) {
            if (valid) {
                //add it
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                PROJECT.addProjPublication({ id: thisProjID }, p, function success(response) {
                    var postedPUB = response.filter(function (postedP) {
                        return postedP.URL == p.URL && postedP.TITLE == p.TITLE && postedP.DESCRIPTION == p.DESCRIPTION;
                    })[0];
                    $scope.ProjPubs.push(postedPUB);

                    $scope.pubCount.total = $scope.pubCount.total + 1;
                    $scope.newPub = {
                    };
                    $scope.projectForm.Pubs.$setPristine(true);
                    toastr.success("Publication Added");
                }, function error(errorResponse) {
                    toastr.error("Error: " + errorResponse.statusText);
                });

            } else {
                //modal for enter all required fields
                openModal();
            }
        };
        //#endregion POST Pub click

        //#region DELETE Pub click
        $scope.RemovePub = function (pub) {
            //modal
            var modalInstance = $uibModal.open({
                templateUrl: 'removemodal.html',
                controller: 'ConfirmModalCtrl',
                size: 'sm',
                resolve: {
                    keyToRemove: function () {
                        return pub;
                    },
                    what: function () {
                        return "Publication";
                    }
                }
            });
            modalInstance.result.then(function (keyToRemove) {
                //yes, remove this keyword
                var index = $scope.ProjPubs.indexOf(pub);
                //DELETE it
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';

                PROJECT.deleteProjPublication({ id: thisProjID }, pub, function success(response) {
                    $scope.ProjPubs.splice(index, 1);
                    $scope.pubCount.total = $scope.pubCount.total - 1;
                    toastr.success("Publication Removed");
                }, function error(errorResponse) {
                    toastr.error("Error: " + errorResponse.statusText);
                });
                delete $http.defaults.headers.common['X-HTTP-Method-Override'];
            }, function () {
                //logic for cancel
            });
            //end modal
        };
        //#endregion DELETE Pub click

        //validate that at least 1 field is populated before saving edit
        $scope.ValidateAtLeastOne = function (d) {
            if ((d.TITLE == "" || d.TITLE == null) && (d.DESCRIPTION == "" || d.DESCRIPTION == null) && (d.URL == "" || d.URL == null)) {
                toastr.error("Publication not updated.");
                openModal();
                return "You need to populate at least one field."; //way to stop it from closing edit..just return something cuz modal is opening
            }
        };

        $scope.EditRowClicked = function () {
            //make sure form is not pristine in case they change tabs before hitting save/cancel
            $scope.projectForm.Pubs.$pristine = false;
            //disable create new fields until they hit save/cancel
            $scope.isEditing = true;
        };

        $scope.CancelEditRowClick = function () {
            //make sure form is not pristine in case they change tabs before hitting save/cancel
            $scope.projectForm.Pubs.$setPristine(true);
            //disable create new fields until they hit save/cancel
            $scope.isEditing = false;
        };

        //#region Edit existing Data
        $scope.savePub = function (data, id) {
            var test;
            var retur = false;
            $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
            $http.defaults.headers.common.Accept = 'application/json';
            $http.defaults.headers.common['X-HTTP-Method-Override'] = 'PUT';

            PUBLICATION.save({
                id: id
            }, data, function success(response) {
                retur = response;
                $scope.projectForm.Pubs.$setPristine(true);
                toastr.success("Publication Updated");
            }, function error(errorResponse) {
                retur = false;
                toastr.error("Error: " + errorResponse.statusText);
            });
            delete $http.defaults.headers.common['X-HTTP-Method-Override'];
            return retur;
        };
        //#endregion Edit existing Data
    }
    //#endregion PUBLICATION Controller

    //#region SITE Controller

    siGLControllers.controller('projectEditSiteListCtrl', ['$scope', '$location', '$cookies', '$uibModal', '$http', 'projS', 'thisProject', 'siteStatList', 'lakeList', 'stateList', 'CountryList', 'resourceList', 'mediaList', 'frequencyList', 'parameterList', 'SITE', projectEditSiteListCtrl]);
    function projectEditSiteListCtrl($scope, $location, $cookies, $uibModal, $http, projS, thisProject, siteStatList, lakeList, stateList, CountryList, resourceList, mediaList, frequencyList, parameterList, SITE) {
        $scope.projectSites = projS;
        for (var psu = 0; psu < $scope.projectSites.length; psu++) {
            var ind = psu;
            if ($scope.projectSites[ind].URL != null && !$scope.projectSites[ind].URL.startsWith('http')) {
                $scope.projectSites[ind].URL = 'http://' + $scope.projectSites[ind].URL;
            }
        }
        $scope.thisProject = thisProject;
        $scope.LakeList = lakeList; $scope.StatusList = siteStatList; $scope.ResourceList = resourceList; $scope.MediaList = mediaList; $scope.FreqList = frequencyList; $scope.ParamList = parameterList;
        $scope.FrequenciesToAdd = []; $scope.MediaToAdd = []; $scope.ParameterToAdd = []; $scope.ResourceToAdd = [];
        // change sorting order
        $scope.sortingOrder = $cookies.get('siteListSortOrder') != undefined ? $cookies.get('siteListSortOrder') : 'Name';
        $scope.reverse = $cookies.get('sl_reverse') != undefined ? Boolean($cookies.get('sl_reverse')) : false;
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
            aSITE.START_DATE = aSite.StartDate != undefined ? aSite.StartDate : "";
            aSITE.END_DATE = aSite.EndDate != undefined ? aSite.EndDate : "";
            aSITE.PROJECT_ID = aSite.ProjID;
            aSITE.SAMPLE_PLATFORM = aSite.SamplePlatform != undefined ? aSite.SamplePlatform : "";
            aSITE.ADDITIONAL_INFO = aSite.AdditionalInfo;
            aSITE.NAME = aSite.Name;
            aSITE.DESCRIPTION = aSite.Description != undefined ? aSite.Description : "";
            aSITE.LATITUDE = aSite.latitude;
            aSITE.LONGITUDE = aSite.longitude;
            aSITE.WATERBODY = aSite.Waterbody != undefined ? aSite.Waterbody : "";
            aSITE.STATUS_TYPE_ID = aSite.StatType != undefined ? aSite.StatType[0].STATUS_ID : "0";
            aSITE.LAKE_TYPE_ID = aSite.LakeType[0].LAKE_TYPE_ID;
            aSITE.COUNTRY = aSite.Country;
            aSITE.STATE_PROVINCE = aSite.State;
            aSITE.WATERSHED_HUC8 = aSite.WatershedHUC8 != undefined ? aSite.WatershedHUC8 : "";
            aSITE.URL = aSite.URL != undefined ? aSite.URL : "";

            return aSITE;
        };

        //copy to new site using this site's info, show edit page populated with create button
        $scope.CopyToNew = function (siteId) {
            //ask for new name: (modal)
            var modalInstance = $uibModal.open({
                templateUrl: 'newSiteNameModal.html',
                controller: 'NewSiteNameModalCtrl',
                size: 'sm',
                resolve: {
                    thisSiteID: function () {
                        return siteId;
                    }
                }
            });
            modalInstance.result.then(function (newSiteName) {
                //go use this (newSiteName.name and newSiteName.id) (new with this new name and duplicate everything and then direct to it
                var thisSite = $scope.projectSites.filter(function (s) {
                    return s.SiteId == newSiteName.id;
                });
                thisSite[0].ProjID = $scope.thisProject.PROJECT_ID;
                thisSite[0].Name = newSiteName.name;
                thisSite[0].StatType = $scope.StatusList.filter(function (st) {
                    return st.STATUS == thisSite[0].Status;
                });
                thisSite[0].LakeType = $scope.LakeList.filter(function (st) { return st.LAKE == thisSite[0].GreatLake; });
                //properly form the site
                var aSITE = formatSite(thisSite[0]);
                var freqSplit = thisSite[0].Frequency != undefined ? thisSite[0].Frequency.split(',') : [];
                var medSplit = thisSite[0].Media != undefined ? thisSite[0].Media.split(',') : [];
                var resSplit = thisSite[0].Resources != undefined ? thisSite[0].Resources.split(',') : [];

                var paramSorted = [];
                var bioSplit = thisSite[0].ParameterStrings.Biological.split(';');
                var chemSplit = thisSite[0].ParameterStrings.Chemical.split(';');
                var micSplit = thisSite[0].ParameterStrings.Microbiological.split(';');
                var phySplit = thisSite[0].ParameterStrings.Physical.split(';');
                var toxSplit = thisSite[0].ParameterStrings.Toxicological.split(';');

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
                SITE.save({}, aSITE, function success(response) {
                    toastr.success("Site Created");
                    siteId = response.SITE_ID;
                    //projSites.push(response);
                    $scope.sitesCount.total = $scope.sitesCount.total + 1;
                    //post frequencies added
                    for (var o = $scope.FrequenciesToAdd.length; o--;) {
                        SITE.addSiteFrequency({
                            id: siteId
                        }, $scope.FrequenciesToAdd[o],
                            function success(response) {
                                //                toastr.success("Site Frequency added");
                            },
                            function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }
                        );
                    }
                    //post media
                    for (var k = $scope.MediaToAdd.length; k--;) {
                        SITE.addSiteMedia({
                            id: siteId
                        }, $scope.MediaToAdd[k],
                            function success(response) {
                                //                toastr.success("Site Media Added");
                            },
                            function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }
                        );
                    }
                    //post parameters
                    for (var pk = $scope.ParameterToAdd.length; pk--;) {
                        SITE.addSiteParameter({
                            id: siteId
                        }, $scope.ParameterToAdd[pk],
                            function success(response) {
                                //                toastr.success("Site Parameter Added");
                            },
                            function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }
                        );
                    }
                    //post resources
                    for (var rk = $scope.ResourceToAdd.length; rk--;) {
                        SITE.addSiteResource({
                            id: siteId
                        }, $scope.ResourceToAdd[rk],
                            function success(response) {
                                //                toastr.success("Site Resource Added");
                            },
                            function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }
                        );
                    }
                }, function error(errorResponse) {
                    toastr.success("Error: " + errorResponse.statusText);
                }).$promise.then(function () {
                    $location.path('/project/edit/' + thisProject.PROJECT_ID + '/site/siteInfo/' + siteId).replace();
                    $scope.apply;
                });

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
            var dropdownParts = [siteStatList, lakeList, stateList, CountryList, resourceList, mediaList, frequencyList, parameterList];
            var indexClicked = $scope.projectSites.indexOf(site);
            //modal
            var modalInstance = $uibModal.open({
                templateUrl: 'SITEmodal.html',
                controller: 'SITEmodalCtrl',
                size: 'lg',
                backdrop: 'static',
                windowClass: 'rep-dialog',
                resolve: {
                    allDropDownParts: function () {
                        return dropdownParts;
                    },
                    thisProject: function () {
                        return thisProject;
                    },
                    thisSite: function () {
                        if (site != 0) {
                            return site;
                        }
                    },
                    siteFreq: function () {
                        if (site != 0) {
                            return SITE.getSiteFrequencies({ id: site.SiteId }).$promise;
                        }
                    },
                    siteMed: function () {
                        if (site != 0) {
                            return SITE.getSiteMedia({ id: site.SiteId }).$promise;
                        }
                    },
                    siteRes: function () {
                        if (site != 0) {
                            return SITE.getSiteResources({ id: site.SiteId }).$promise;
                        }
                    },
                    siteParams: function () {
                        if (site != 0) {
                            return SITE.getSiteParameters({ id: site.SiteId }).$promise;
                        }
                    },
                }
            });
            modalInstance.result.then(function (r) {
                //$scope.aProject, projObjectives, projKeywords
                $(".page-loading").addClass("hidden");
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

    }

    //projectEditALL Sites
    siGLControllers.controller('projectEditAllSitesCtrl', ['$scope', '$cookies', '$location', '$http', '$state', 'thisProject', 'SITE', 'projSites',
        'lakeList', 'CountryList', 'stateList', 'siteStatList', 'resourceList', 'mediaList', 'frequencyList', 'parameterList', projectEditAllSitesCtrl]);
    function projectEditAllSitesCtrl($scope, $cookies, $location, $http, $state, thisProject, SITE, projSites,
        lakeList, CountryList, stateList, siteStatList, resourceList, mediaList, frequencyList, parameterList) {
        //need id/value format for ui-grid
        $scope.formatArray = function (o) {
            var newlyFormatted = [];
            for (var x = 0; x < o.length; x++) {
                var thisone = {
                    'id': x + 1, 'value': o[x]
                };
                newlyFormatted.push(thisone);
            }
            return newlyFormatted;
        };

        //dropdowns and multiselects
        $scope.countryArray = $scope.formatArray(CountryList);
        $scope.stateArray = $scope.formatArray(stateList);
        $scope.lakeArray = lakeList;
        $scope.statusArray = siteStatList;
        $scope.resourceArray = resourceList;//  $scope.convertToArray(resourceList);
        $scope.mediaArray = mediaList;// $scope.convertToArray(mediaList);
        $scope.frequencyArray = frequencyList;// $scope.convertToArray(frequencyList);
        $scope.paramsArray = parameterList;// $scope.convertToArray(parameterList);


        //http://stackoverflow.com/questions/26245495/using-an-ng-option-dropdown-in-a-ui-grid-editablecelltemplate-ng-grid-3-x  //
        $scope.gridOptions = {
            enableSorting: true,
            columnDefs: [
    {
        name: 'NAME', enableCellEdit: true, enableCellEditOnFocus: true, width: 200
    },
            {
                name: 'LATITUDE', type: 'string', enableCellEdit: true, enableCellEditOnFocus: true, width: 100
            },
        {
            name: 'LONGITUDE', type: 'string', enableCellEdit: true, enableCellEditOnFocus: true, width: 100,
        },
            {
                name: 'COUNTRY', editType: 'dropdown', width: 200,
                editableCellTemplate: 'ui-grid/dropdownEditor', enableCellEdit: true, enableCellEditOnFocus: true,
                editDropdownOptionsArray: $scope.countryArray, editDropdownValueLabel: 'value', editDropdownIdLabel: 'value',
                cellFilter: 'mapCountries'
            },
                    {
                        name: 'STATE_PROVINCE', displayName: 'State', editType: 'dropdown', width: 100,
                        editableCellTemplate: 'ui-grid/dropdownEditor', enableCellEdit: true, enableCellEditOnFocus: true,
                        editDropdownOptionsArray: $scope.stateArray, editDropdownValueLabel: 'value', editDropdownIdLabel: 'value',
                        cellFilter: 'mapStates'
                    },
                        {
                            name: 'LAKE_TYPE_ID', displayName: 'Lake', editType: 'dropdown', width: 100,
                            editableCellTemplate: 'ui-grid/dropdownEditor', enableCellEdit: true, enableCellEditOnFocus: true,
                            editDropdownOptionsArray: $scope.lakeArray, editDropdownIdLabel: 'LAKE_TYPE_ID',
                            editDropdownValueLabel: 'LAKE', cellFilter: 'mapLakes'
                        },
        {
            name: 'WATERBODY', width: 200,
            enableCellEdit: true, enableCellEditOnFocus: true
        },
        {
            name: 'WATERSHED_HUC8', displayName: 'Watershed (HUC8)', width: 100,
            enableCellEdit: true, enableCellEditOnFocus: true
        },
        {
            name: 'DESCRIPTION', width: 200,
            enableCellEdit: true, enableCellEditOnFocus: true
        },
        {
            name: 'STATUS_TYPE_ID', displayName: 'Status', editType: 'dropdown', width: 100, editableCellTemplate: 'ui-grid/dropdownEditor',
            enableCellEdit: true, enableCellEditOnFocus: true, editDropdownOptionsArray: $scope.statusArray, editDropdownIdLabel: 'STATUS_ID',
            editDropdownValueLabel: 'STATUS', cellFilter: 'mapSiteStats'
        },
        {
            name: 'RESOURCE_TYPE', displayName: 'Resource Component', multiselect: true, editType: 'dropdown', width: 200, editableCellTemplate: 'ui-grid/dropdownEditor',
            enableCellEdit: true, enableCellEditOnFocus: true, editDropdownOptionsArray: $scope.resourceArray, editDropdownIdLabel: 'RESOURCE_TYPE_ID',
            editDropdownValueLabel: 'RESOURCE_NAME', cellFilter: 'mapSiteResources'
        }
            ]
        };

        $scope.gridOptions.data = projSites;

    }
    //#endregion SITE Controller

})();
