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
    //'siGLCreds', 'siGLUsername', 'usersName', 'dmID'
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
    siGLControllers.controller('dataManagerCtrl', ['$scope', '$location', '$http', '$cookies', 'DATA_MANAGER', 'ROLE', 'allProj', 'allOrgRes', 'allOrgs', 'allDivs', 'allSecs', 'allRoles', dataManagerCtrl]);
    function dataManagerCtrl($scope, $location, $http, $cookies, DATA_MANAGER, ROLE, allProj, allOrgRes, allOrgs, allDivs, allSecs, allRoles) {
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
            DATA_MANAGER.getAll().$promise.then(function (result) {
                for (var x = 0; x < result.length; x++) {
                    var orgName = allOrgRes.filter(function (or) { return or.OrganizationSystemID == result[x].ORGANIZATION_SYSTEM_ID; })[0];
                    result[x].OrgName = orgName != undefined ? orgName.OrganizationName : "";
                    result[x].roleName = $scope.allROLEs.filter(function (ro) { return ro.ROLE_ID == result[x].ROLE_ID; })[0].ROLE_NAME;
                    result[x].FULLNAME = result[x].FNAME + " " + result[x].LNAME;
                    var theseProjs = allProj.filter(function (p) { return p.DataManagerID == result[x].DATA_MANAGER_ID; });
                    result[x].projCount = theseProjs.length;
                }
                $scope.allDMs = result;
            });
            
            $scope.loggedInUser.Name = $cookies.get('usersName'); //User's NAME
            $scope.loggedInUser.ID = $cookies.get('dmID'); 
            $scope.loggedInUser.Role = $cookies.get('usersRole'); 
            // change sorting order
            $scope.sortingOrder = 'LNAME';
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
        }//end auth user logged in
    }//end resourceCtrl

    siGLControllers.controller('dataManagerInfoCtrl', ['$scope', '$cookies', '$location', '$http', '$modal', '$stateParams', '$filter', 'ORGANIZATION_SYSTEM', 'PROJECT', 'DATA_MANAGER', 'ROLE', 'allRoles', 'thisDM', 'dmProjects', dataManagerInfoCtrl]);
    function dataManagerInfoCtrl($scope, $cookies, $location, $http, $modal, $stateParams, $filter, ORGANIZATION_SYSTEM, PROJECT, DATA_MANAGER, ROLE, allRoles, thisDM, dmProjects) {
        if ($cookies.get('siGLCreds') == undefined || $cookies.get('siGLCreds') == "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            $scope.DMProjects = dmProjects; //All their Projects            
            $scope.RoleList = allRoles;
                
            // change sorting order
            $scope.sortingOrder = 'Name';
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
                var modalInstance = $modal.open({
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
                    var modalInstance = $modal.open({
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
                        PROJECT.delete({ id: proj.PROJECT_ID }, proj, function success(response) {
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
                        var modalInstance = $modal.open({
                            template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                                        '<div class="modal-body"><p>You must first enter a new Password.</p></div>' +
                                        '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button></div>',
                            controller: function ($scope, $modalInstance) {
                                $scope.ok = function () {
                                    $modalInstance.close('password');
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
                                $cookies.put('siGLCreds', enc);
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
    siGLControllers.controller('resourcesCtrl', ['$scope', '$cookies', '$location', '$state', '$http', '$filter', '$modal', 'FREQUENCY_TYPE', 'LAKE_TYPE', 'MEDIA_TYPE', 'OBJECTIVE_TYPE',
        'PARAMETER_TYPE', 'RESOURCE_TYPE', 'HOUSING_TYPE', 'PROJ_DURATION', 'PROJ_STATUS', 'STATUS_TYPE', 'allFreqs', 'allLakes', 'allMedias', 'allObjectives', 'allParams', 'allResources',
        'allProjDurations', 'allProjStats', 'allSiteStats', resourcesCtrl]);
    function resourcesCtrl($scope, $cookies, $location, $state, $http, $filter, $modal, FREQUENCY_TYPE, LAKE_TYPE, MEDIA_TYPE, OBJECTIVE_TYPE, PARAMETER_TYPE, RESOURCE_TYPE, HOUSING_TYPE,
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
                var modalInstance = $modal.open({
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
                var modalInstance = $modal.open({
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
                var modalInstance = $modal.open({
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
                var modalInstance = $modal.open({
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
                var modalInstance = $modal.open({
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
                var modalInstance = $modal.open({
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
                var modalInstance = $modal.open({
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
                var modalInstance = $modal.open({
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
                var modalInstance = $modal.open({
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

            // change sorting order
            $scope.sortingOrder = 'Name';
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

            $scope.User = $cookies.get('usersName');
        }
    }
    //end projectListCtrl    
    //#endregion PROJECT LIST Controller

    //#region ABSTRACT PROJECT EDIT Controller
    //ProjectEditCtrl
    siGLControllers.controller('projectEditCtrl', ['$scope', '$rootScope', '$cookies', '$location', '$state', '$http', '$filter', '$modal', 'thisProject', 'projOrgs',
        'projDatum', 'projContacts', 'projPubs', 'projSites', 'projObjectives', 'projKeywords', 'PROJECT', 'SITE', 'allDurationList', 'allStatsList', 'allObjList', projectEditCtrl]);
    function projectEditCtrl($scope, $rootScope, $cookies, $location, $state, $http, $filter, $modal, thisProject, projOrgs, projDatum, projContacts, projPubs,
            projSites, projObjectives, projKeywords, PROJECT, SITE, allDurationList, allStatsList, allObjList) {
        //model needed for ProjectEdit Info tab: ( Counts for Cooperators, Datum, Contacts, Publications and Sites) 1. thisProject, 2. parsed urls, 3. project Keywords, 4. all objectives, 5. all statuses, 6. all durations 
        if ($cookies.get('siGLCreds') == undefined || $cookies.get('siGLCreds') == "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            $scope.projectForm = {};
            $scope.readyFlagModel = "No";

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
                   // var yesOrNo = false;
                    //modal for changing states.. goes before user clicks ok or cancel... think because modal.open isn't async
//                    var modalInstance = $modal.open({ 
//                        template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
//                                    '<div class="modal-body"><p>Are you sure you want to change tabs? Any unsaved information will be lost.</p></div>' +
//                                    '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button>' +
//                                    '<button class="btn btn-primary" ng-click="cancel()">Cancel</button></div>',
//                        controller: function ($scope, $modalInstance) {
//                            $scope.ok = function () {
//                                $modalInstance.dismiss();
////                                $state.go(toState.name, toParams);
//                            }
//                            $scope.cancel = function () {
//                                $(".page-loading").addClass("hidden");
//                                $modalInstance.close('stay');
//                                //event.preventDefault();
//                                //$modalInstance.dismiss();
//                            }
//                        },
//                        size: 'sm'
//                    });
//                    modalInstance.result.then(function (stayOrGo) {
//                        //do nothing..let them go
//                        if (stayOrGo == "stay") {
//                            $(".page-loading").addClass("hidden");
//                            event.preventDefault();
//                        }
//                    });


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

            //#region GLOBALS
            $scope.aProject = {}; //holder for project (either coming in for edit, or being created on POST )
            $scope.Objectivesmodel = {}; //holder for new ProjObjs if they make any to multiselect
            $scope.urls = []; //holder for urls for future parsing back together ( | separated string)
            $scope.undetermined = false; //ng-disabled on end date boolean..set to true if status = end date undefined
            $scope.ObjectivesToAdd = []; //holder for create Project page and user adds Objective Types
            $scope.ProjectKeywords = []; //add projKeywords if edit page, instantiate for create page to allow keys to be added
            var globalKeyHolder; //store key passed so that once success from post comes back still have access to it
            $scope.KeywordsToAdd = []; //holder for create Project page and user adds Keywords
            $scope.isProjDescChanged = {}; //trigger to show/hide save button for description change
            $scope.isProjAddInfoChanged = {}; //trigger to show/hide save button for additional info change
            //#endregion GLOBALS

            if (thisProject != undefined) {
                //this is an edit view
                $scope.coopCount = { total: projOrgs.length };
                $scope.datumCount = { total: projDatum.length };
                $scope.contactCount = { total: projContacts.length };
                $scope.pubCount = { total: projPubs.length };
                $scope.sitesCount = { total: projSites.length };

                //deal with site url formatting here
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

                //1. aProject
                $scope.aProject = thisProject;
                
                $scope.title = "Project: " + $scope.aProject.NAME;
                $scope.readyFlagModel = thisProject.READY_FLAG > 0 ? "Yes" : "No";

                //check status for disabling of end date
                if ($scope.aProject.PROJ_STATUS_ID == 1) {
                    $scope.undetermined = true;
                }

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
                $scope.ProjectKeywords = projKeywords;

                //#region add new property to OBJECTIVE_TYPES (selected:true/false)
                //get projObjectives to use in making new prop in all objectives for multi select ('selected: true')
                var projObjs = projObjectives;

                var allObjectiveList = allObjList;

                ////http://isteven.github.io/angular-multi-select/#/demo-minimum
                ////go through allObjList and add selected Property.
                for (var i = 0; i < allObjectiveList.length; i++) {
                    //for each one, if projObjectives has this id, add 'selected:true' else add 'selected:false'
                    for (var y = 0; y < projObjs.length; y++) {
                        if (projObjs[y].OBJECTIVE_TYPE_ID == allObjectiveList[i].OBJECTIVE_TYPE_ID) {
                            allObjectiveList[i].selected = true;
                            y = projObjs.length; //ensures it doesn't set it as false after setting it as true
                        }
                        else {
                            allObjectiveList[i].selected = false;
                        }
                    }
                    if (projObjs.length == 0) {
                        allObjectiveList[i].selected = false;
                    }
                }
                //#endregion add new property to OBJECTIVE_TYPES (selected:true/false)

                //all objectives (with new selected property)
                $scope.Objectivesdata = allObjectiveList;
            } else {
                $scope.title = "New Project";
            }

            //get the objective types (need to set these if new project as well as existing project)
            if (thisProject == undefined) {
                for (var a = allObjList.length; a--;) {
                    allObjList[a].selected = false;
                }
                $scope.Objectivesdata = allObjList;
            }

            //all project statuses 
            $scope.StatusList = allStatsList;

            //all durations
            $scope.DurationList = allDurationList;

            //an OBJECTIVE_TYPE was clicked - if added POST, if removed DELETE - for edit view or store for create view
            $scope.ObjClick = function (data) {
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';

                if ($scope.aProject.PROJECT_ID != undefined) {
                    //this is an edit page and there is a project
                    if (data.selected == true) {
                        //post it
                        delete data.selected;
                        PROJECT.addProjObjective({ id: $scope.aProject.PROJECT_ID }, data,
                            function success(response) {
                                toastr.success("Project Objectives added");
                            },
                            function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }
                        );
                    } else {
                        //delete it
                        delete data.selected; // remove the selected flag first
                        $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';
                        PROJECT.deleteProjObjective({ id: $scope.aProject.PROJECT_ID }, data,
                            function success(response) {
                                toastr.success("Project Objectives removed");
                            },
                            function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }
                        );
                    }
                } else {
                    //this is a create project and need to store this to handle after project is POSTed
                    if (data.selected == true) {
                        delete data.selected;
                        //only care if true since this is a new project and nothing to delete
                        $scope.ObjectivesToAdd.push(data);
                    }
                }
            };//end ObjClick

            $scope.newURL = {}; //model binding to return newUrl.value to ADD/REMOVE functions                

            //#region ADD/REMOVE URLS
            $scope.removeUrl = function (key) {
                //modal
                var modalInstance = $modal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        keyToRemove: function () {
                            return key;
                        },
                        what: function () {
                            return "URL";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    //yes, remove this url
                    var index = $scope.urls.indexOf(key);
                    $scope.urls.splice(index, 1);
                    if ($scope.aProject.PROJECT_ID != undefined) {
                        //PUT the Project
                        $scope.aProject.URL = ($scope.urls).join('|');
                        $scope.SaveOnBlur(); //send to PUT
                    }
                }, function () {
                    //logic to do on cancel
                });
                //end modal
            };

            $scope.addProjURL = function (form) {
                if ($scope.newURL.value != undefined && form.inputURL.$valid) {
                    //push to array of urls to show on view and store in model
                    $scope.urls.push($scope.newURL.value);
                    if ($scope.aProject.PROJECT_ID != undefined) {
                        //PUT the Project
                        $scope.aProject.URL = ($scope.urls).join('|');
                        $scope.SaveOnBlur(); //send to PUT
                    }
                    $scope.newURL = {};
                } else {
                    //modal for entering a password first
                    var modalInstance = $modal.open({
                        template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                                   '<div class="modal-body"><p>Please type a url in first.</p></div>' +
                                   '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button></div>',
                        controller: function ($scope, $modalInstance) {
                            $scope.ok = function () {
                                $modalInstance.close('url');
                            };
                        },
                        size: 'sm'
                    });
                    modalInstance.result.then(function (fieldFocus) {
                        if (fieldFocus == "url") {
                            $("#inputURL").focus();
                        }
                    });
                }
            };
            //#endregion ADD/REMOVE URLS

            $scope.newKey = {}; //model binding to return keys to ADD/REMOVE functions

            //#region ADD/REMOVE KEYWORDS
            //add keyword click
            $scope.addThisKeyword = function () {
                if ($scope.newKey.value != undefined) {
                    var newKEY = { TERM: $scope.newKey.value }; //store object of KEYWORD
                    globalKeyHolder = $scope.newKey.value;  //store value of key
                    if ($scope.aProject.PROJECT_ID != undefined) {
                        //this is an edit, go ahead and post PROJ_KEYWORD
                        $http.defaults.headers.common.Accept = 'application/json';
                        //POST it                            
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        PROJECT.addProjKeyword({ id: $scope.aProject.PROJECT_ID }, newKEY, function success(response) {
                            $scope.ProjectKeywords.push({ TERM: globalKeyHolder });
                            toastr.success("Keyword Added");
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        });
                    } else {
                        //this is a create, no projectid yet, store it
                        $scope.KeywordsToAdd.push(newKEY);
                        $scope.ProjectKeywords.push({ TERM: globalKeyHolder });
                    }

                    $scope.newKey = {};
                } else {
                    // the value is empty
                    //modal for entering a password first
                    var modalInstance = $modal.open({
                        template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                                    '<div class="modal-body"><p>Please type a keyword in first.</p></div>' +
                                    '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button></div>',
                        controller: function ($scope, $modalInstance) {
                            $scope.ok = function () {
                                $modalInstance.close('keyword');
                            };
                        },
                        size: 'sm'
                    });
                    modalInstance.result.then(function (fieldFocus) {
                        if (fieldFocus == "keyword") {
                            $("#inputKEYWORD").focus();
                        }
                    });
                }
            };

            //remove keyword click (passed confirm)
            $scope.removeKey = function (key, index) {
                //modal
                var modalInstance = $modal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        keyToRemove: function () {
                            return key;
                        },
                        what: function () {
                            return "Keyword";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    //yes, remove this keyword
                    var index1 = $scope.ProjectKeywords.indexOf(key);
                    if ($scope.aProject.PROJECT_ID != undefined) {
                        //DELETE it
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        $http.defaults.headers.common.Accept = 'application/json';
                        $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';

                        PROJECT.deleteProjKeyword({ id: $scope.aProject.PROJECT_ID }, key, function success(response) {
                            $scope.ProjectKeywords.splice(index1, 1);
                            toastr.success("Keyword Removed");
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        });
                        delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                    } else {
                        //just remove it from the list (this is a create page)
                        $scope.ProjectKeywords.splice(index1, 1);
                        $scope.KeywordsToAdd.splice(index, 1);

                    }
                }, function () {
                    //logic for cancel
                });
                //end modal
            };

            //#endregion ADD/REMOVE KEYWORDS

            //disable end date if status has 'end date undetermined'
            $scope.selectedStat = function (id) {
                if (id == 1) {
                    if ($scope.aProject != undefined && $scope.aProject.END_DATE != null) {
                        $scope.aProject.END_DATE = "";
                    }
                    $scope.undetermined = true;
                }
                else {
                    $scope.undetermined = false;
                }
            };

            //flag radio clicked
            $scope.Flagged = function (data) {
                $scope.aProject.READY_FLAG = data == "Yes" ? 1 : 0;

                if ($scope.aProject.PROJECT_ID != undefined) {
                    $scope.SaveOnBlur($scope.aProject.PROJECT_ID);
                }
            };

            //save NEW PROJECT and then Keywords and Objectives
            $scope.save = function (valid) {
                //check if they filled in all required fields
                if (valid) {
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    $scope.aProject.URL = ($scope.urls).join('|');
                    var projID;
                    $(".page-loading").removeClass("hidden");
                    PROJECT.save({}, $scope.aProject, function success(response) {
                        toastr.success("Project Created");
                        projID = response.PROJECT_ID;
                        //post objectives added
                        for (var o = $scope.ObjectivesToAdd.length; o--;) {
                            PROJECT.addProjObjective({ id: projID }, $scope.ObjectivesToAdd[o],
                                function success(response) {
                                    toastr.success("Project Objectives added");
                                },
                                function error(errorResponse) {
                                    toastr.error("Error: " + errorResponse.statusText);
                                }
                            );
                        }
                        //post keywords
                        for (var k = $scope.KeywordsToAdd.length; k--;) {
                            PROJECT.addProjKeyword({ id: projID }, $scope.KeywordsToAdd[k],
                                function success(response) {
                                    toastr.success("Keyword Added");
                                },
                                function error(errorResponse) {
                                    toastr.error("Error: " + errorResponse.statusText);
                                }
                            );
                        }
                    }, function error(errorResponse) {
                        toastr.success("Error: " + errorResponse.statusText);
                    }).$promise.then(function () {
                        $(".page-loading").addClass("hidden");
                        $location.path('/project/edit/' + projID + '/info').replace();//.notify(false);
                        $scope.apply;
                    });
                }
            };

            //change to the aProject made, put it .. fired on each blur after change made to field
            $scope.SaveOnBlur = function (valid, id) {
                if (id < 0) {
                    //they changed end date, compare to make sure it comes after start date
                    if (new Date($scope.aProject.END_DATE) < new Date($scope.aProject.START_DATE)) {
                        var dateModal = $modal.open({
                            template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                                        '<div class="modal-body"><p>Completion date must come after Start date.</p></div>' +
                                        '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button></div>',
                            controller: function ($scope, $modalInstance) {
                                $scope.ok = function () {
                                    $modalInstance.close('startDate');
                                };
                            },
                            size: 'sm'
                        });
                        dateModal.result.then(function (d) {
                            if (d == "startDate") {
                                // $scope.aProject.END_DATE = "";
                                angular.element("#END_DATE").focus();
                            }
                        });
                        if ($scope.aProject.PROJECT_ID != undefined) toastr.error("Project not updated.");
                        return;
                    }
                }
                if ($scope.aProject.PROJECT_ID != undefined) {
                    //ensure they don't delete required field values
                    if (valid) {
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        $http.defaults.headers.common.Accept = 'application/json';
                        $http.defaults.headers.common['X-HTTP-Method-Override'] = 'PUT';
                        PROJECT.save({ id: $scope.aProject.PROJECT_ID }, $scope.aProject, function success(response) {
                            toastr.success("Project Updated");
                            $scope.isProjDescChanged.bool = false;
                            $scope.isProjAddInfoChanged.bool = false;
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        });
                        delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                    } else {
                        //modal for enter all required fields
                        var modalInstance = $modal.open({
                            template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                                        '<div class="modal-body"><p>Please populate all required fields.</p></div>' +
                                        '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button></div>',
                            controller: function ($scope, $modalInstance) {
                                $scope.ok = function () {
                                    $modalInstance.close('required');
                                };
                            },
                            size: 'sm'
                        });
                        modalInstance.result.then(function (fieldFocus) {
                            if (fieldFocus == "required") {
                                angular.element("[name='" + $scope.projectForm.Info.$name + "']").find('.ng-invalid:visible:first').focus();
                            }
                        });
                        toastr.error("Project not updated.");
                    }
                }
                if (id > 0) {
                    $scope.selectedStat(id);
                }
            };//end SaveOnBlur

            $scope.cancel = function () {
                //navigate to a different state
                $state.go('projectList');
            };//end cancel           
        }//end else (checkCreds == true)
    }//end projectEditCtrl
    //#endregion ABSTRACT PROJECT EDIT Controller

    //#region COOPERATOR Controller
    //ProjectEditCoopCtrl
    siGLControllers.controller('projectEditCoopCtrl', ['$scope', '$http', '$cookies', '$filter', '$modal', 'thisProject', 'projOrgs', 'allOrgList', 'allDivisionList', 'allSectionList', 'PROJECT', projectEditCoopCtrl]);
    function projectEditCoopCtrl($scope, $http, $cookies, $filter, $modal, thisProject, projOrgs, allOrgList, allDivisionList, allSectionList, PROJECT) {
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
            var modalInstance = $modal.open({
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
                var test;
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
                var modalInstance = $modal.open({
                    template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                                '<div class="modal-body"><p>You must choose an Organization Name to add.</p></div>' +
                                '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button></div>',
                    controller: function ($scope, $modalInstance) {
                        $scope.ok = function () {
                            $modalInstance.close('org');
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
            var modalInstance = $modal.open({
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
    siGLControllers.controller('projectEditDataCtrl', ['$scope', '$cookies', '$http', '$modal', 'PROJECT', 'DATA_HOST', 'thisProject', 'projDatum', projectEditDataCtrl]);
    function projectEditDataCtrl($scope, $cookies, $http, $modal, PROJECT, DATA_HOST, thisProject, projDatum) {
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
           var modalInstance = $modal.open({
                template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                    '<div class="modal-body"><p>You must populate at least one field.</p></div>' +
                    '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button></div>',
                controller: function ($scope, $modalInstance) {
                    $scope.ok = function () {
                        $modalInstance.close('req');
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
            var modalInstance = $modal.open({
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
    siGLControllers.controller('projectEditContactCtrl', ['$scope', '$cookies', '$http', '$filter', '$modal', 'PROJECT', 'CONTACT', 'ORGANIZATION_SYSTEM', 'projContacts', 'thisProject', 'orgResources', 'allOrgList', 'allDivisionList', 'allSectionList', projectEditContactCtrl]);
    function projectEditContactCtrl($scope, $cookies, $http, $filter, $modal, PROJECT, CONTACT, ORGANIZATION_SYSTEM, projContacts, thisProject, orgResources, allOrgList, allDivisionList, allSectionList) {
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
            //var modalInstance = $modal.open({
            //    template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
            //                '<div class="modal-body"><p>You must populate all required fields.</p></div>' +
            //                '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button></div>',
            //    controller: function ($scope, $modalInstance) {
            //        $scope.ok = function () {
            //            $modalInstance.close(errorField);
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
            var test;
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

            var modalInstance = $modal.open({
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
            var modalInstance = $modal.open({
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
    siGLControllers.controller('projectEditPubCtrl', ['$scope', '$cookies', '$http', '$modal', 'PROJECT', 'thisProject', 'PUBLICATION', 'projPubs', projectEditPubCtrl]);
    function projectEditPubCtrl($scope, $cookies, $http, $modal, PROJECT, thisProject, PUBLICATION, projPubs) {
        $scope.ProjPubs = projPubs;
        $scope.isEditing = false; //disables form inputs while user is editing existing data up top
        $scope.newPub = {
        };
        var thisProjID = thisProject.PROJECT_ID;

        //modal for required at least 1 field..
        var openModal = function () {
            var modalInstance = $modal.open({
                template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                    '<div class="modal-body"><p>You must populate at least one field.</p></div>' +
                    '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button></div>',
                controller: function ($scope, $modalInstance) {
                    $scope.ok = function () {
                        $modalInstance.close('req');
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
            var modalInstance = $modal.open({
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

    siGLControllers.controller('projectEditSiteListCtrl', ['$scope', '$location', '$cookies', '$modal', '$http', 'projS', 'thisProject', 'siteStatList', 'lakeList', 'stateList', 'resourceList', 'mediaList', 'frequencyList', 'parameterList', 'SITE', projectEditSiteListCtrl]);
    function projectEditSiteListCtrl($scope, $location, $cookies, $modal, $http, projS, thisProject, siteStatList, lakeList, stateList, resourceList, mediaList, frequencyList, parameterList, SITE) {
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
        $scope.sortingOrder = 'Name';
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
        var responsiveTables = {
            init: function () {
                $(document).find('.fixed-columns').each(function (i, elem) {
                    responsiveTables.fixColumns(elem);
                });
            },

            fixColumns: function (table, columns) {
                var $table = $(table);
                $table.removeClass('fixed-columns');
                var $fixedColumns = $table.clone().attr('id', $table.attr('id') + '-fixed').insertBefore($table).addClass('fixed-columns-fixed');

                $fixedColumns.find('*').each(function (i, elem) {
                    if ($(this).attr('id') !== undefined) {
                        $table.find("[id='" + $(this).attr("id") + "']").attr('id', $(this).attr('id') + '-hidden');
                    }
                    if ($(this).attr('name') !== undefined) {
                        $table.find("[name='" + $(this).attr("name") + "']").attr('name', $(this).attr('name') + '-hidden');
                    }
                });

                if (columns !== undefined) {
                    $fixedColumns.find('tr').each(function (x, elem) {
                        $(elem).find('th,td').each(function (i, elem) {
                            if (i >= columns) {
                                $(elem).remove();
                            }
                        });
                    });
                } else {
                    $fixedColumns.find('tr').each(function (x, elem) {
                        $(elem).find('th,td').each(function (i, elem) {
                            if (!$(elem).hasClass('fixed-column')) {
                                $(elem).remove();
                            }
                        });
                    });
                }

                $fixedColumns.find('tr').each(function (i, elem) {
                    $(this).height($table.find('tr:eq(' + i + ')').height());
                });
            }
        };

        responsiveTables.init();
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
            var modalInstance = $modal.open({
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

        //#region DELETE Site
        $scope.DeleteSite = function (site) {
            //modal
            var modalInstance = $modal.open({
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
        //#endregion DELETE Pub click
    }

    //projectEditSiteInfoCtrl ( CREATE / EDIT page)    
    siGLControllers.controller('projectEditSiteInfoCtrl', ['$scope', '$location', '$cookies', '$http', '$modal', '$state', 'thisProject', 'thisSite', 'SITE', 'projSites', 'siteFrequencies', 'siteMedium',
             'siteParameters', 'siteResources', 'CountryList', 'lakeList', 'stateList', 'siteStatList', 'resourceList', 'mediaList', 'frequencyList', 'parameterList', projectEditSiteInfoCtrl]);
             function projectEditSiteInfoCtrl($scope, $location, $cookies, $http, $modal, $state, thisProject, thisSite, SITE, projSites, siteFrequencies, siteMedium,
        siteParameters, siteResources, CountryList, lakeList, stateList, siteStatList, resourceList, mediaList, frequencyList, parameterList) {
        if ($cookies.get('siGLCreds') == undefined || $cookies.get('siGLCreds') == "") {
            $scope.auth = false;
            $location.path('/login');
        } else {
            $scope.thisSite = {
            }; //holder for project (either coming in for edit, or being created on POST )
            $scope.Frequencymodel = {
            }; //holder for new siteFrequencies if they make any change to multiselect
            $scope.Mediamodel = {
            }; //holder for new siteMedia if they make any change to multiselect
            // $scope.Parametermodel = {}; //holder for new siteParameters if they make any change to multiselect
            $scope.Resourcemodel = {
            }; //holder for new siteResource if they make any change to multiselect
            $scope.FrequenciesToAdd = []; //holder for create Site page and user adds Frequency Types
            $scope.MediaToAdd = []; //holder for create Site page and user adds Media Types
            $scope.ParameterToAdd = []; //holder for create Site page and user adds Parameters Types
            $scope.ResourceToAdd = []; //holder for create Site page and user adds Resources Types
            $scope.isSiteDescChanged = {
            }; //trigger to show/hide save button for description change
            $scope.isSiteAddInfoChanged = {
            }; //trigger to show/hide save button for additional info change
            $scope.showParams = false;// div containing all parameters (toggles show/hide)
            $scope.showHide = "Show"; //button text for show/hide parameters
            
            //all the dropdowns
            $scope.allCountries = CountryList;
            $scope.allStates = stateList;
            $scope.allLakes = lakeList;
            $scope.allStats = siteStatList;
            $scope.allResources = resourceList;
            $scope.allParametes = parameterList;


            //are we in edit or create?
            if (thisSite != undefined) {
                //edit view

                //1. this site
                $scope.thisSite = thisSite;
                $scope.title = "Site: " + $scope.thisSite.NAME;

                //convert the multiSelects for isteven (add new property for checked flag
                //#region siteFrequencies
                var siteFreqs = siteFrequencies;
                var allFrequencies = frequencyList;
                //go through allFrequencies and add selected property
                for (var i = 0; i < allFrequencies.length; i++) {
                    //for each one, if siteFreqs has this id, add 'selected:true' else add 'selected:false'
                    for (var y = 0; y < siteFreqs.length; y++) {
                        if (siteFreqs[y].FREQUENCY_TYPE_ID == allFrequencies[i].FREQUENCY_TYPE_ID) {
                            allFrequencies[i].selected = true;
                            y = siteFreqs.length;
                        }
                        else {
                            allFrequencies[i].selected = false;
                        }
                    }
                    if (siteFreqs.length == 0) {
                        allFrequencies[i].selected = false;
                    }
                }
                $scope.Frequencydata = allFrequencies;
                //#endregion siteFrequencies

                //#region siteMedia
                var siteMeds = siteMedium;
                var allMeds = mediaList;
                //go through allMeds and add selected property
                for (var mi = 0; mi < allMeds.length; mi++) {
                    //for each one, if siteMeds has this id, add 'selected:true' else add 'selected:false'
                    for (var sm = 0; sm < siteMeds.length; sm++) {
                        if (siteMeds[sm].MEDIA_TYPE_ID == allMeds[mi].MEDIA_TYPE_ID) {
                            allMeds[mi].selected = true;
                            sm = siteMeds.length;
                        }
                        else {
                            allMeds[mi].selected = false;
                        }
                    }
                    if (siteMeds.length == 0) {
                        allMeds[mi].selected = false;
                    }
                }
                $scope.Mediadata = allMeds;
                //#endregion siteMedia

                //#region siteParameters
                var siteParams = siteParameters;
                var allParams = parameterList;
                //go through siteParams and add selected property
                for (var pi = 0; pi < allParams.length; pi++) {
                    //for each one, if siteParams has this id, add 'selected:true' else add 'selected:false'
                    for (var sp = 0; sp < siteParams.length; sp++) {
                        if (siteParams[sp].PARAMETER_TYPE_ID == allParams[pi].PARAMETER_TYPE_ID) {
                            allParams[pi].selected = true;
                            sp = siteParams.length;
                        }
                        else {
                            allParams[pi].selected = false;
                        }
                    }
                    if (siteParams.length == 0) {
                        allParams[pi].selected = false;
                    }
                }
                $scope.physParams = []; $scope.bioParams = []; $scope.chemParams = []; $scope.microBioParams = []; $scope.toxiParams = [];
                $scope.physParams.push(allParams.filter(function (p) {
                    return p.PARAMETER_GROUP == "Physical";
                }));
                $scope.bioParams.push(allParams.filter(function (p) {
                    return p.PARAMETER_GROUP == "Biological";
                }));
                $scope.chemParams.push(allParams.filter(function (p) {
                    return p.PARAMETER_GROUP == "Chemical";
                }));
                $scope.microBioParams.push(allParams.filter(function (p) {
                    return p.PARAMETER_GROUP == "Microbiological";
                }));
                $scope.toxiParams.push(allParams.filter(function (p) {
                    return p.PARAMETER_GROUP == "Toxicological";
                }));

                //$scope.Parameterdata = allParams;

                //#endregion siteParameters

                //#region siteResources
                var siteRes = siteResources;
                var allRes = resourceList;
                //go through allRes and add selected property
                for (var ri = 0; ri < allRes.length; ri++) {
                    //for each one, if siteRes has this id, add 'selected:true' else add 'selected:false'
                    for (var sr = 0; sr < siteRes.length; sr++) {
                        if (siteRes[sr].RESOURCE_TYPE_ID == allRes[ri].RESOURCE_TYPE_ID) {
                            allRes[ri].selected = true;
                            sr = siteRes.length;
                        }
                        else {
                            allRes[ri].selected = false;
                        }
                    }
                    if (siteRes.length == 0) {
                        allRes[ri].selected = false;
                    }
                }
                $scope.Resourcedata = allRes;
                //#endregion siteResources

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

            if (thisSite == undefined) {

                //#region add selected property to all multiselects (need to set these if new site)
                //frequencies
                for (var a = frequencyList.length; a--;) {
                    frequencyList[a].selected = false;
                }
                $scope.Frequencydata = frequencyList;
                //media
                for (var ma = mediaList.length; ma--;) {
                    mediaList[ma].selected = false;
                }
                $scope.Mediadata = mediaList;
                //parameters
                for (var pa = parameterList.length; pa--;) {
                    parameterList[pa].selected = false;
                }
                $scope.physParams = []; $scope.bioParams = []; $scope.chemParams = []; $scope.microBioParams = []; $scope.toxiParams = [];
                $scope.physParams.push(parameterList.filter(function (p) {
                    return p.PARAMETER_GROUP == "Physical";
                }));
                $scope.bioParams.push(parameterList.filter(function (p) {
                    return p.PARAMETER_GROUP == "Biological";
                }));
                $scope.chemParams.push(parameterList.filter(function (p) { return p.PARAMETER_GROUP == "Chemical"; }));
                $scope.microBioParams.push(parameterList.filter(function (p) {
                    return p.PARAMETER_GROUP == "Microbiological";
                }));
                $scope.toxiParams.push(parameterList.filter(function (p) {
                    return p.PARAMETER_GROUP == "Toxicological";
                }));
                // $scope.Parameterdata = parameterList;
                //resources
                for (var ra = resourceList.length; ra--;) {
                    resourceList[ra].selected = false;
                }
                $scope.Resourcedata = resourceList;
                //#endregion add selected property to all multiselects (need to set these if new site)

            }// thisSite == undefined

            //#region a FREQUENCY was clicked - if added POST, if removed DELETE - for edit view or store for create view
            $scope.FreqClick = function (data) {
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';

                if ($scope.thisSite.SITE_ID != undefined) {
                    //this is an edit page and there is a site
                    if (data.selected == true) {
                        //post it
                        delete data.selected; //need to remove the selected property first
                        SITE.addSiteFrequency({ id: $scope.thisSite.SITE_ID }, data,
                            function success(response) {
                                toastr.success("Site Frequency added");
                            },
                            function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }
                        );
                    } else {
                        //delete it
                        delete data.selected; // remove the selected flag first
                        $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';
                        SITE.deleteSiteFrequency({ id: $scope.thisSite.SITE_ID }, data,
                            function success(response) {
                                toastr.success("Site Frequency removed");
                            },
                            function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }
                        );
                    }
                } else {
                    //this is a create Site and need to store this to handle after site is POSTed
                    if (data.selected == true) {
                        delete data.selected;
                        //only care if true since this is a new site and nothing to delete
                        $scope.FrequenciesToAdd.push(data);
                    }
                }
            };//end FreqClick
            //#endregion a FREQUENCY was clicked - if added POST, if removed DELETE - for edit view or store for create view

            //#region a MEDIA was clicked - if added POST, if removed DELETE - for edit view or store for create view
            $scope.MedClick = function (data) {
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';

                if ($scope.thisSite.SITE_ID != undefined) {
                    //this is an edit page and there is a site
                    if (data.selected == true) {
                        //post it
                        delete data.selected; //need to remove the selected property first
                        SITE.addSiteMedia({ id: $scope.thisSite.SITE_ID }, data,
                            function success(response) {
                                toastr.success("Site Media added");
                            },
                            function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }
                        );
                    } else {
                        //delete it
                        delete data.selected; // remove the selected flag first
                        $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';
                        SITE.deleteSiteMedia({ id: $scope.thisSite.SITE_ID }, data,
                            function success(response) {
                                toastr.success("Site Media removed");
                            },
                            function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }
                        );
                    }
                } else {
                    //this is a create Site and need to store this to handle after site is POSTed
                    if (data.selected == true) {
                        delete data.selected;
                        //only care if true since this is a new site and nothing to delete
                        $scope.MediaToAdd.push(data);
                    }
                }
            };//end MedClick
            //#endregion a MEDIA was clicked - if added POST, if removed DELETE - for edit view or store for create view

            //#region a PARAMETER was clicked - if added POST, if removed DELETE - for edit view or store for create view
            $scope.ParamClick = function (data) {
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                var Param = {
                };
                Param.PARAMETER_TYPE_ID = data.PARAMETER_TYPE_ID;
                Param.PARAMETER = data.PARAMETER;
                Param.PARAMETER_GROUP = data.PARAMETER_GROUP;

                if ($scope.thisSite.SITE_ID != undefined) {
                    //this is an edit page and there is a site    
                    if (data.selected == true) {
                        //POST                       
                        //delete Param['selected'];//need to remove the selected property first
                        SITE.addSiteParameter({ id: $scope.thisSite.SITE_ID }, Param,
                            function success(response) {
                                toastr.success("Site Parameter added");
                            },
                            function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }
                            );
                    } else if (data.selected == false) {
                        //DELETE
                        //delete Param['selected']; // remove the selected flag first
                        $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';
                        SITE.deleteSiteParameter({ id: $scope.thisSite.SITE_ID }, Param,
                            function success(response) {
                                toastr.success("Site Parameter removed");
                            },
                            function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }
            );
                        delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                    }
                } else {
                    //this is a create Site and need to store this to handle after site is POSTed
                    if (data.selected == true) {
                        //delete Param['selected'];
                        //only care if true since this is a new site and nothing to delete
                        $scope.ParameterToAdd.push(Param);
                    }
                }
            };//end ParamClick
            //#endregion a PARAMETER was clicked - if added POST, if removed DELETE - for edit view or store for create view

            //#region a RESOURCE was clicked - if added POST, if removed DELETE - for edit view or store for create view
            $scope.ResClick = function (data) {
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';

                if ($scope.thisSite.SITE_ID != undefined) {
                    //this is an edit page and there is a site
                    if (data.selected == true) {
                        //post it
                        delete data.selected; //need to remove the selected property first
                        SITE.addSiteResource({ id: $scope.thisSite.SITE_ID }, data,
                            function success(response) {
                                toastr.success("Site Resource added");
                            },
                            function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }
                        );
                    } else {
                        //delete it
                        delete data.selected; // remove the selected flag first
                        $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';
                        SITE.deleteSiteResource({ id: $scope.thisSite.SITE_ID }, data,
                            function success(response) {
                                toastr.success("Site Resource removed");
                            },
                            function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            }
                        );
                    }
                } else {
                    //this is a create Site and need to store this to handle after site is POSTed
                    if (data.selected == true) {
                        delete data.selected;
                        //only care if true since this is a new site and nothing to delete
                        $scope.ResourceToAdd.push(data);
                    }
                }
            };//end ResClick
            //#endregion a RESOURCE was clicked - if added POST, if removed DELETE - for edit view or store for create view

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
                var latModal = $modal.open({
                    template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                        '<div class="modal-body"><p>The Latitude must be between 0 and 73.0</p></div>' +
                        '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button></div>',
                    controller: function ($scope, $modalInstance) {
                        $scope.ok = function () {
                            $modalInstance.close('lat');
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
                var longModal = $modal.open({
                    template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                        '<div class="modal-body"><p>The Longitude must be between -175.0 and -60.0</p></div>' +
                        '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button></div>',
                    controller: function ($scope, $modalInstance) {
                        $scope.ok = function () {
                            $modalInstance.close('long');
                        };
                    },
                    size: 'sm'
                });
                longModal.result.then(function (fieldFocus) {
                    if (fieldFocus == "long")
                        $("#LONGITUDE").focus();
                });
            };

            //change to the thisSite made, put it .. fired on each blur after change made to field
            $scope.SaveOnBlur = function (valid, da) {
                if (da < 0) {
                    //they changed end date, compare to make sure it comes after start date
                    if (new Date($scope.thisSite.END_DATE) < new Date($scope.thisSite.START_DATE)) {
                        var dateModal = $modal.open({
                            template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                                        '<div class="modal-body"><p>Sampling end date must come after start date.</p></div>' +
                                        '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button></div>',
                            controller: function ($scope, $modalInstance) {
                                $scope.ok = function () {
                                    $modalInstance.close('startDate');
                                };
                            },
                            size: 'sm'
                        });
                        dateModal.result.then(function (d) {
                            if (d == "startDate") {
                                // $scope.aProject.END_DATE = "";
                                angular.element("#END_DATE").focus();
                            }
                        });
                        if ($scope.thisSite.SITE_ID != undefined) toastr.error("Site not updated.");
                        return;
                    }
                }
                if ($scope.thisSite.SITE_ID != undefined) {
                    if (valid) {
                        //ensure they don't delete required field values
                        if (($scope.thisSite.LATITUDE > 0 && $scope.thisSite.LATITUDE < 73.0) && ($scope.thisSite.LONGITUDE > -175 && $scope.thisSite.LONGITUDE < -60)) {
                            $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                            $http.defaults.headers.common.Accept = 'application/json';
                            $http.defaults.headers.common['X-HTTP-Method-Override'] = 'PUT';
                            SITE.save({
                                id: $scope.thisSite.SITE_ID
                            }, $scope.thisSite, function success(response) {
                                toastr.success("Site Updated");
                                $scope.isSiteDescChanged.bool = false;
                                $scope.isSiteAddInfoChanged.bool = false;
                            }, function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            });
                            delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                        }
                        else if ($scope.thisSite.LATITUDE < 0 || $scope.thisSite.LATITUDE > 73) {
                            openLatModal();
                        }
                        else if ($scope.thisSite.LONGITUDE < -175 || $scope.thisSite.LONGITUDE > -60) {
                            openLongModal();
                        }
                    }
                    else {
                        //not valid.. modal for enter all required fields
                        var modalInstance = $modal.open({
                            template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                                        '<div class="modal-body"><p>Please populate all required fields.</p></div>' +
                                        '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button></div>',
                            controller: function ($scope, $modalInstance) {
                                $scope.ok = function () {
                                    $modalInstance.close('required');
                                };
                            },
                            size: 'sm'
                        });
                        modalInstance.result.then(function (fieldFocus) {
                            if (fieldFocus == "required")
                                angular.element("[name='" + $scope.projectForm.SiteInfo.$name + "']").find('.ng-invalid:visible:first').focus();
                        });
                        toastr.error("Site not updated.");
                    }
                }
            };//end SaveOnBlur

            //save NEW SITE and then frequencies, media, parameters, and resources
            $scope.save = function (valid) {
                //check if they filled in all required fields
                if (valid && ($scope.thisSite.LATITUDE > 0 && $scope.thisSite.LATITUDE < 73.0) && ($scope.thisSite.LONGITUDE > -175 && $scope.thisSite.LONGITUDE < -60)) {
                    $(".page-loading").removeClass("hidden");
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    $scope.thisSite.PROJECT_ID = thisProject.PROJECT_ID;
                    var siteID;
                    SITE.save({}, $scope.thisSite, function success(response) {
                        toastr.success("Site Created");
                        siteID = response.SITE_ID;
                        projSites.push(response);
                        $scope.sitesCount.total = $scope.sitesCount.total + 1;
                        //post frequencies added
                        for (var o = $scope.FrequenciesToAdd.length; o--;) {
                            SITE.addSiteFrequency({
                                id: siteID
                            }, $scope.FrequenciesToAdd[o],
                                function success(response) {
                                    toastr.success("Site Frequency added");
                                },
                                function error(errorResponse) {
                                    toastr.error("Error: " + errorResponse.statusText);
                                }
                            );
                        }
                        //post media
                        for (var k = $scope.MediaToAdd.length; k--;) {
                            SITE.addSiteMedia({
                                id: siteID
                            }, $scope.MediaToAdd[k],
                                function success(response) {
                                    toastr.success("Site Media Added");
                                },
                                function error(errorResponse) {
                                    toastr.error("Error: " + errorResponse.statusText);
                                });
                        }
                        //post parameters
                        for (var para = $scope.ParameterToAdd.length; para--;) {
                            SITE.addSiteParameter({
                                id: siteID
                            }, $scope.ParameterToAdd[para],
                                function success(response) {
                                    toastr.success("Site Parameter Added");
                                },
                                function error(errorResponse) {
                                    toastr.error("Error: " + errorResponse.statusText);
                                }
                            );
                        }
                        //post resources
                        for (var res = $scope.ResourceToAdd.length; res--;) {
                            SITE.addSiteResource({
                                id: siteID
                            }, $scope.ResourceToAdd[res],
                                function success(response) {
                                    toastr.success("Site Resource Added");
                                },
                                function error(errorResponse) {
                                    toastr.error("Error: " + errorResponse.statusText);
                                }
                            );
                        }
                    }, function error(errorResponse) {
                        toastr.success("Error: " + errorResponse.statusText);
                    }).$promise.then(function () {
                        $scope.projectForm.SiteInfo.$setPristine(true);
                        $(".page-loading").addClass("hidden");
                        $location.path('/project/edit/' + thisProject.PROJECT_ID + '/site/siteList').replace();//.notify(false);
                        $scope.apply;
                    });
                } else {
                    if ($scope.thisSite.LATITUDE < 0 || $scope.thisSite.LATITUDE > 73.0)
                        openLatModal();

                    if ($scope.thisSite.LONGITUDE < -175 || $scope.thisSite.LONGITUDE > -60)
                        openLongModal();

                } //end else valid
            };//end save

        }//end CheckCreds() passed
    }//end projectEditSiteInfoCtrl

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

    //#region MODALS
    //popup new Site name
    siGLControllers.controller('NewSiteNameModalCtrl', ['$scope', '$modalInstance', 'thisSiteID', NewSiteNameModalCtrl]);
    function NewSiteNameModalCtrl($scope, $modalInstance, thisSiteID) {
        var nameToSendBack = {
        };
        $scope.newSite = {};
        $scope.ok = function () {
            nameToSendBack.name = $scope.newSite.NAME;
            nameToSendBack.id = thisSiteID;
            $modalInstance.close(nameToSendBack);
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }

    //popup confirm box
    siGLControllers.controller('ConfirmModalCtrl', ['$scope', '$modalInstance', 'keyToRemove', 'what', ConfirmModalCtrl]);
    function ConfirmModalCtrl($scope, $modalInstance, keyToRemove, what) {

        //todo: figure out how removing url is handled.. "URL"
        switch (what) {
            case "URL":
                $scope.keyToRmv = keyToRemove;
                break;
            case "Keyword":
                //keyword
                $scope.keyToRmv = keyToRemove.TERM;
                break;
            case "Organization":
                $scope.keyToRmv = keyToRemove.OrganizationName;
                break;
            case "Data":
                var DstringToUse = keyToRemove.DESCRIPTION != null ? keyToRemove.DESCRIPTION : keyToRemove.HOST_NAME;
                DstringToUse = DstringToUse != null ? DstringToUse : keyToRemove.PORTAL_URL;
                $scope.keyToRmv = DstringToUse;
                break;
            case "Contact":
                $scope.keyToRmv = keyToRemove.NAME;
                break;
            case "Publication":
                var stringToUse = keyToRemove.TITLE != null ? keyToRemove.TITLE : keyToRemove.DESCRIPTION;
                stringToUse = stringToUse != null ? stringToUse : keyToRemove.URL;
                $scope.keyToRmv = stringToUse;
                break;
            case "Frequency Type":
                $scope.keyToRmv = keyToRemove.FREQUENCY;
                break;
            case "Lake Type":
                $scope.keyToRmv = keyToRemove.LAKE;
                break;
            case "Media Type":
                $scope.keyToRmv = keyToRemove.MEDIA;
                break;
            case "Objective Type":
                $scope.keyToRmv = keyToRemove.OBJECTIVE;
                break;
            case "Parameter Type":
                $scope.keyToRmv = keyToRemove.PARAMETER;
                break;
            case "Resource Type":
                $scope.keyToRmv = keyToRemove.RESOURCE_NAME;
                break;
            case "Project Duration":
                $scope.keyToRmv = keyToRemove.DURATION_VALUE;
                break;
            case "Project Status Type":
                $scope.keyToRmv = keyToRemove.STATUS_VALUE;
                break;
            case "Status Type":
                $scope.keyToRmv = keyToRemove.STATUS;
                break;
            case "Project":
                $scope.keyToRmv = keyToRemove.Name;
                break;
            case "Site":
                $scope.keyToRmv = keyToRemove.Name;
                break;
            default:
                $scope.keyToRmv = "error";
        }

        $scope.what = what;

        $scope.ok = function () {
            $modalInstance.close(keyToRemove);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }

    //org popup to add to org db
    siGLControllers.controller('AddOrgModalCtrl', ['$scope', '$cookies', '$modalInstance', '$http', 'chosenParts', 'allOrgs', 'allDivs', 'allSecs', 'ORGANIZATION', 'DIVISION', 'SECTION', AddOrgModalCtrl]);
    function AddOrgModalCtrl($scope, $cookies, $modalInstance, $http, chosenParts, allOrgs, allDivs, allSecs, ORGANIZATION, DIVISION, SECTION) {
        //globals
        $scope.OrgName = {}; //new org name input ng-model
        $scope.divisionName = {}; //new div name input ng-model
        $scope.sectionName = {}; //new sec name input ng-model
        $scope.orgList = allOrgs;
        $scope.allDivList = allDivs;
        $scope.allSecList = allSecs;
        $scope.orgsBeenChosen = false; //flag for showing 'Add new Division' button
        $scope.divsBeenChosen = false; //flag for showing 'Add new Section' button
        $scope.showAddNAMEinput = false; //flag for ng-show on new org name input area
        $scope.showAddDIVISIONinput = false; //flag for ng-show on new div name input area
        $scope.showAddSECTIONinput = false; //flag for ng-show on new sec name input area
        $scope.disableOrgSelect = false; //disable the select dropdown while they are created a new one
        $scope.disableDivSelect = false; //disable the select dropdown while they are created a new one
        $scope.disableSecSelect = false; //disable the select dropdown while they are created a new one
        $scope.originalOrgId = chosenParts[0] != "" ? Number(chosenParts[0]) : 0;
        $scope.originalDivId = chosenParts[1] != "" ? Number(chosenParts[1]) : 0;
        $scope.originalSecId = chosenParts[2] != "" ? Number(chosenParts[2]) : 0;

        //set selected parts based on what they choose from main page before hitting button to open modal
        $scope.selectedOrgID = {};
        $scope.selectedOrgID.id = chosenParts[0] != "" ? Number(chosenParts[0]) : "";
        $scope.divList = []; //what the select uses, based on org chosen
        $scope.secList = []; //what the select uses, based on div chosen

        //if they did choose an org before opening modal, go get the divs for this org
        if ($scope.selectedOrgID.id != "") {
            $scope.orgsBeenChosen = true;
            $scope.divList = $scope.allDivList.filter(function (d) { return d.ORG_ID == $scope.selectedOrgID.id; });
        }
        $scope.selectedDivID = {};
        $scope.selectedDivID.id = chosenParts[1] != "" ? Number(chosenParts[1]) : "";
        //if they did choose an div before opening modal, go get the sec for this div
        if ($scope.selectedDivID.id != "") {
            $scope.divsBeenChosen = true;
            $scope.secList = $scope.allSecList.filter(function (s) { return s.DIV_ID == $scope.selectedDivID.id; });
        }

        $scope.selectedSecID = {}; //not going to preset this because if they are in the modal, they will at the least be created a new section
        $scope.selectedSecID.id = chosenParts[2] != "" ? Number(chosenParts[2]) : "";

        //ng-change event on org select: they selected an org name, get those divs
        $scope.getDivs = function (orgID) {
            $scope.selectedOrgID.id = orgID;
            $scope.selectedDivID.id = ""; $scope.selectedSecID.id = "";
            $scope.divList = []; 
            $scope.divList = $scope.allDivList.filter(function (d) { return d.ORG_ID == orgID; });
            
            $scope.secList = [];
            $scope.orgsBeenChosen = true;
            $scope.divsBeenChosen = false;
        };
        //ng-change event on div select: they selected an div, get those secs
        $scope.getSecs = function (divID) {
            $scope.selectedDivID.id = divID;
            $scope.selectedSecID.id = "";
            $scope.secList = $scope.allSecList.filter(function (s) { return s.DIV_ID == divID; });
            $scope.divsBeenChosen = true;
        };

        //they clicked 'Add Organization' 
        $scope.addOrgName = function () {
            $scope.showAddNAMEinput = true;
            $scope.selectedOrgID.id = ""; $scope.selectedDivID.id = ""; $scope.selectedSecID.id = "";
            $scope.disableOrgSelect = true;

        };
        //this is the one they want to add
        $scope.addThisName = function (nameToAdd) {
            //make sure they typed something in to add
            if (nameToAdd != "") {
                var orgToPost = {
                    ORGANIZATION_NAME: nameToAdd
                };
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                ORGANIZATION.save(orgToPost, function success(response) {
                    //add this new one to the lists
                    $scope.orgList.push(response);
                    //Make just added one selected
                    $scope.selectedOrgID.id = response.ORGANIZATION_ID;
                    //they added it, so update the originalOrgID too 
                    $scope.originalOrgId = response.ORGANIZATION_ID;
                    $scope.orgsBeenChosen = true;

                    //clear input, hide input
                    $scope.OrgName.value = "";
                    $scope.showAddNAMEinput = false;
                    $scope.disableOrgSelect = false;
                });
            } else {
                alert("Type in the new Organization first.");
            }
        };

        //they clicked 'Add Division' 
        $scope.addDivName = function () {
            $scope.showAddDIVISIONinput = true;
            $scope.selectedDivID.id = ""; $scope.selectedSecID.id = "";
            $scope.disableDivSelect = true;
        };
        //this is the one they want to add
        $scope.addThisDivision = function (divToAdd, orgID) {
            if (divToAdd != "" && orgID != "") {
                var divToPost = { DIVISION_NAME: divToAdd, ORG_ID: orgID };
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                DIVISION.save(divToPost, function success(response) {
                    $scope.allDivList.push(response);
                    $scope.divList.push(response); //push to the dropdown (these divs for this org)
                    //Make just added one selected
                    $scope.selectedDivID.id = response.DIVISION_ID;
                    //they added it, so update the originalDivID with it
                    $scope.originalDivId = response.DIVISION_ID;
                    $scope.divsBeenChosen = true; //show "add section" button text

                    //clear input, hide input
                    $scope.divisionName.value = "";
                    $scope.showAddDIVISIONinput = false;
                    $scope.disableDivSelect = false;
                });
            } else {
                alert("Choose an Organization and type in the new Division first.");
            }
        };

        //they clicked 'Add Section' 
        $scope.addSecName = function () {
            $scope.showAddSECTIONinput = true;
            $scope.selectedSecID.id = "";
            $scope.disableSecSelect = true;
        };
        //this is the one they want to add
        $scope.addThisSection = function (secToAdd, divID) {
            if (secToAdd != "" && divID != "") {
                var secToPost = { SECTION_NAME: secToAdd, DIV_ID: divID };
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                SECTION.save(secToPost, function success(response) {
                    $scope.allSecList.push(response); //push to all sections 
                    $scope.secList.push(response); //push to the dropdown (these secs for this div)
                    //Make just added one selected
                    $scope.selectedSecID.id = response.SECTION_ID;
                    //they added it, so update the originalDivID with it
                    $scope.originalSecId = response.SECTION_ID;

                    //clear input, hide input
                    $scope.sectionName.value = "";
                    $scope.showAddSECTIONinput = false;
                    $scope.disableSecSelect = false;
                });
            } else {
                alert("Choose an Organization, Division and type in the new Section first.");
            }
        };
        //make sure the selectedSecID gets stored to pass back to the page that called this modal so it will be preselected there upon closing the modal

        $scope.setSecs = function (secID) {
            $scope.selectedSecID.id = secID;
        };

        //want to close input for adding new part
        $scope.neverMind = function (which) {
            //clear 'which' input and hide all input divs
            if (which == "org") {
                $scope.OrgName.value = ""; $scope.showAddNAMEinput = false;
                $scope.disableOrgSelect = false;
                $scope.selectedOrgID.id = $scope.originalOrgId;
            }
            if (which == "div") {
                $scope.divisionName.value = ""; $scope.showAddDIVISIONinput = false;
                $scope.disableDivSelect = false;
                $scope.selectedDivID.id = $scope.originalDivId;
            }
            if (which == "sec") {
                $scope.sectionName.value = ""; $scope.showAddSECTIONinput = false;
                $scope.disableSecSelect = false;
                $scope.selectedSecID.id = $scope.originalSecId;
            } 
        };

        $scope.ok = function () {
            var allLists = [];
            allLists.push($scope.orgList); allLists.push($scope.allDivList); allLists.push($scope.allSecList);
            allLists.push($scope.selectedOrgID.id); allLists.push($scope.selectedDivID.id); allLists.push($scope.selectedSecID.id);
            $modalInstance.close(allLists);
        };
    }
    //#endregion MODALS

    //#region LOGIN/OUT
    //login 
    siGLControllers.controller('LoginCtrl', ['$scope', '$state', '$http', '$rootScope', '$cookies', '$modal', 'LOGIN', LoginCtrl]);
    function LoginCtrl($scope, $state, $http, $rootScope, $cookies, $modal, LOGIN) {

        //#region CAP lock Check
        $('[type=password]').keypress(function (e) {
            var $password = $(this),
                tooltipVisible = $('.tooltip').is(':visible'),
                s = String.fromCharCode(e.which);

            if (s.toUpperCase() === s && s.toLowerCase() !== s && !e.shiftKey) {
                if (!tooltipVisible)
                    $password.tooltip('show');
            } else {
                if (tooltipVisible)
                    $password.tooltip('hide');
            }

            //hide the tooltip when moving away from password field
            $password.blur(function (e) {
                $password.tooltip('hide');
            });
        });
        //#endregion CAP lock Check

        //forgot password
        $scope.forgotPassword = function () {
            //modal for required at least 1 field..Please enter the email address for your account. An email will be sent to you with your new generic password.
            var modalInstance = $modal.open({
                template: '<div class="modal-header"><h3 class="modal-title">Forgot your password?</h3></div>' +
                    '<div class="modal-body"><p>Not working yet......</p></div>' +
                    '<form name="newSiteName"><div class="form-group"><label class="col-md-2 control-label req" for="EMAIL">Email:</label>' +
                    '<div class="col-md-8" style="margin-bottom:20px"><input class="form-control" id="EMAIL" name="EMAIL" ng-enter="ok()" ng-model="EMAIL" type="text" required /></div></div></form><br clear="all" />' +
                    '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">Reset</button></div>',
                controller: function ($scope, $modalInstance) {
                    $scope.EMAIL = "";
                    $scope.ok = function () {
                        $modalInstance.close($scope.EMAIL);
                    };
                },
                size: 'md'
            });
            modalInstance.result.then(function (email) {
                if (email == "reset") {
                    //need to send creds to hit the reset endpoint and change their password to default OWNERPROFILE_EDITPASSWORD requires OWNERPROFILE..
                }
            });


        };
        $scope.submit = function () {
            //$scope.sub = true;
            var postData = {
                "username": $scope.username,
                "password": $scope.password
            };
            var up = $scope.username + ":" + $scope.password;
            $http.defaults.headers.common.Authorization = 'Basic ' + btoa(up);
            $http.defaults.headers.common.Accept = 'application/json';

            Date.prototype.addHours = function (h) {
                this.setHours(this.getHours() + h);
                return this;
            };

            LOGIN.login({}, postData,
                function success(response) {
                    var user = response;
                    if (user != undefined) {
                        //set user cookies (cred, username, name, role
                        var usersNAME = user.FNAME + " " + user.LNAME;
                        var enc = btoa($scope.username.concat(":", $scope.password));
                        //set expiration on cookies
                        var expireDate = new Date().addHours(8);                        
                        $cookies.put('siGLCreds', enc, { 'expires': expireDate });
                        $cookies.put('siGLUsername', $scope.username);
                        $cookies.put('usersName', usersNAME);
                        $cookies.put('dmID', user.DATA_MANAGER_ID);
                        var roleName;
                        switch (user.ROLE_ID) {
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
                        

                        $rootScope.isAuth.val = true;
                        $rootScope.usersName = usersNAME;
                        $rootScope.userID = user.DATA_MANAGER_ID;
                        $rootScope.Role = roleName;
                        $state.go('projectList');
                    }
                    else {
                        $scope.error = "Login Failed";
                    }
                },
                function error(errorResponse) {
                    toastr.error("Error: " + errorResponse.statusText);
                }
            );
        };
    }

    //logOut
    siGLControllers.controller('LogoutCtrl', ['$scope', '$cookies', '$location', LogoutCtrl]);
    function LogoutCtrl($scope, $cookies, $location) {
        $scope.logout = function () {
            $cookies.remove('siGLCreds');
            $cookies.remove('siGLUsername');
            $cookies.remove('usersName');
            $cookies.remove('usersRole');
            $location.path('/login');
        };
    }
    //#endregion LOGIN/OUT


})();