'use strict';

angular.module('mean.controllers.login', [])
    .controller('LoginCtrl', ['$scope', '$rootScope', '$http', '$location',
        function($scope, $rootScope, $http, $location) {
            // This object will be filled by the form
            $scope.user = {};

            // Register the login() function
            $scope.login = function() {
                $http.post('/login', {
                    email: $scope.user.email,
                    password: $scope.user.password
                })
                    .success(function(response) {
                        // authentication OK
                        $scope.loginError = 0;
                        $rootScope.user = response.user;
                        $rootScope.$emit('loggedin');
                        if (response.redirect) {
                            if (window.location.href === response.redirect) {
                                //This is so an admin user will get full admin page
                                window.location.reload();
                            } else {
                                window.location = response.redirect;
                            }
                        } else {
                            $location.url('/');
                        }
                    })
                    .error(function() {
                        $scope.loginerror = 'Authentication failed.';
                    });
            };
        }
    ])
    .controller('RegisterCtrl', ['$scope', '$rootScope', '$http', '$location',
        function($scope, $rootScope, $http, $location) {
            $scope.user = {};
            $scope.showDisplayErrors = false;

            var showNotifications = function( isSuccess, form, name, errors ) {

                var show = isSuccess;

                if ( !Array.isArray(errors) ) { return false; }

                if ( !$scope.showDisplayErrors ) { return false; }

                errors.every(function( val ) {
                    if ( form[name].$error[val] ) {
                        show = !isSuccess;

                        return false;
                    }
                    return true;
                });

                return show;
            };

            $scope.register = function( form ) {
                $scope.emailError = null;
                $scope.registerError = null;

                if ( form.$valid ) {
                    $http.post('/register', {
                        email: $scope.user.email,
                        password: $scope.user.password,
                        confirmPassword: $scope.user.confirmPassword,
                        username: $scope.user.username,
                        name: $scope.user.name
                    })
                        .success(function() {
                            // authentication OK
                            $scope.registerError = 0;
                            $rootScope.user = $scope.user;
                            $rootScope.$emit('loggedin');
                            $location.url('/');     
                        })
                        .error(function(error) {
                            // Error: authentication failed
                            if (error === 'Email already taken') {
                                $scope.emailError = error;
                            } else {
                                $scope.registerError = error;
                            }
                        });
                }
                else {
                    
                    $scope.showDisplayErrors = true;
                }
                
            };

            $scope.showError = function( form, name, error ) {
                return $scope.showDisplayErrors && form[name].$error[error];
            };

            $scope.showErrors = function( form, name, errors ) {
                return showNotifications(false, form, name, errors);
            };

            $scope.showSuccess = function( form, name, errors ) {
                return showNotifications(true, form, name, errors);
            };
        }
    ]);