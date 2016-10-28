(function () {
    'use strict';

    var LogInOutController = angular.module('LogInOutController', []);


    //login 
    LogInOutController.controller('loginCtrl', ['$scope', '$state', '$http', '$rootScope', '$cookies', '$uibModal', '$location', 'LOGIN',
        function ($scope, $state, $http, $rootScope, $cookies, $uibModal, $location, LOGIN) {
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
                var modalInstance = $uibModal.open({
                    template: '<div class="modal-header"><h3 class="modal-title">Forgot your password?</h3></div>' +
                        '<div class="modal-body"><p>Not working yet......</p></div>' +
                        '<form name="newSiteName"><div class="form-group"><label class="col-md-2 control-label req" for="email">Email:</label>' +
                        '<div class="col-md-8" style="margin-bottom:20px"><input class="form-control" id="email" name="email" ng-enter="ok()" ng-model="email" type="text" required /></div></div></form><br clear="all" />' +
                        '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">Reset</button></div>',
                    controller: function ($scope, $uibModalInstance) {
                        $scope.email = "";
                        $scope.ok = function () {
                            $uibModalInstance.close($scope.email);
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
                $rootScope.stateIsLoading = { showLoading: true }; //loading...
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

                LOGIN.login({}, 
                    function success(response) {
                        var user = response;
                        if (user !== undefined) {
                            //set user cookies (cred, username, name, role
                            var usersNAME = user.fname + " " + user.lname;
                            var enc = btoa($scope.username.concat(":", $scope.password));
                            //set expiration on cookies
                            var expireDate = new Date().addHours(8);                            
                            $cookies.put('siGLCreds', enc, { expires: expireDate });
                            $cookies.put('siGLUsername', $scope.username);
                            $cookies.put('usersName', usersNAME);
                            $cookies.put('dmID', user.data_manager_id);
                            var roleName;
                            switch (user.role_id) {
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
                            $rootScope.userID = user.data_manager_id;
                            $rootScope.Role = roleName;
                            
                            if ($rootScope.returnToState !== undefined) {
                                $state.go($rootScope.returnToState, { id: $rootScope.returnToStateParams });
                            } else {
                                $state.go('projectList');
                            }
                        }
                        else {
                            $rootScope.stateIsLoading = { showLoading: false }; //loading...
                            $scope.error = "Login Failed";
                        }
                    },
                    function error(errorResponse) {
                        //modal for error
                        $rootScope.stateIsLoading = { showLoading: false }; //loading...
                        var modalInstance = $uibModal.open({
                            template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                                       '<div class="modal-body"><p>There was an error.</p><p>Error: {{status}} - {{statusText}}</p></div>' +
                                       '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button></div>',
                            controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                                $scope.ok = function () {
                                    $uibModalInstance.close();
                                };
                                $scope.status = errorResponse.status !== -1 ? errorResponse.status : 'Unknown';
                                $scope.statusText = errorResponse.statusText !== "" ? errorResponse.statusText : '';
                            }],
                            size: 'sm'
                        });
                        modalInstance.result.then(function (fieldFocus) {
                            $location.path('/login');
                        });
                    }
                );
            };
        }]);

    //logOut
    LogInOutController.controller('logoutCtrl', ['$scope', '$rootScope', '$cookies', '$location',
        function ($scope, $rootScope, $cookies, $location) {
            $scope.logout = function () {
                $cookies.remove('siGLCreds');
                $cookies.remove('siGLUsername');
                $cookies.remove('usersName');
                $cookies.remove('usersRole');
                $cookies.remove('projListSortOrder'); $cookies.remove('pl_reverse');
                $cookies.remove('siteListSortOrder'); $cookies.remove('sl_reverse');
                $cookies.remove('DMListSortOrder'); $cookies.remove('dml_reverse');
                $cookies.remove('DMprojectsSortOrder'); $cookies.remove('dmpl_reverse');
                $rootScope.isAuth = undefined;
                $rootScope.usersName = undefined;
                $rootScope.userID = undefined;
                $rootScope.Role = undefined;
                $rootScope.returnToState = undefined;
                $rootScope.returnToStateParams = undefined;
                $rootScope.stateIsLoading = undefined;

                $location.path('/login');
            };
        }]);
}());
