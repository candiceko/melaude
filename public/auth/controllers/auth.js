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

            var comparePasswords = function() {
                return $scope.user.password === $scope.user.confirmPassword;
            };

            $scope.register = function( form ) {
                $scope.emailError = null;
                $scope.registerError = null;
                $scope.unmatchedPasswordsError = null;
                $scope.agreement = null;
                $scope.passwordStrength = null;

                if ( form.$valid && comparePasswords() ) {
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

            var getPasswordStrength = function( pw ) {

                var len = pw.length;
                var total = 0;
                var uppercaseCount = pw.replace(/[^A-Z]/g, '').length;
                var lowercaseCount = pw.replace(/[^a-z]/g, '').length;
                var numberCount = pw.replace(/[^0-9]/g, '').length;
                var letterCount = pw.replace(/[^a-zA-Z]/g, '').length;
                var symbolCount = pw.replace(/[a-zA-Z0-9]/g, '').length;
                var consecutiveUppercaseCount = 0;
                var consecutiveLowercaseCount = 0;
                var consecutiveNumberCount = 0;
                var sequentialLettersCount = 0;
                var sequentialNumbersCount = 0;
                var sequentialSymbolsCount = 0;

                for( var i = 0; i < len; i++ ) {

                    if ( /[A-Z]/g.test(pw.charAt(i)) ) {
                        if ( pw.charAt(i) === pw.charAt(i - 1) ) {
                            consecutiveUppercaseCount++;
                        }
                    }
                    else if ( /[a-z]/g.test(pw.charAt(i)) ) {
                        if ( pw.charAt(i) === pw.charAt(i - 1) ) {
                            consecutiveLowercaseCount++;
                        }
                    }
                    else if ( /[0-9]/g.test(pw.charAt(i)) ) {
                        if ( pw.charAt(i) === pw.charAt(i - 1) ) {
                            consecutiveNumberCount++;
                        }

                        if ( pw.charAt(i) === pw.charAt(i - 1) && pw.charAt(i) === pw.charAt(i - 2) ) {
                            sequentialNumbersCount++;
                        }
                    }

                    if ( /[a-zA-Z]/g.test(pw.charAt(i)) ) {
                        if ( pw.charAt(i) === pw.charAt(i - 1) && pw.charAt(i) === pw.charAt(i - 2) ) {
                            sequentialLettersCount++;
                        }
                    }
                    else if ( /[^a-zA-Z0-9]/g.test(pw.charAt(i)) ) {
                        if ( pw.charAt(i) === pw.charAt(i - 1) && pw.charAt(i) === pw.charAt(i - 2) ) {
                            sequentialSymbolsCount++;
                        }
                    }
                }

                total += len * 4;
                total += (len - uppercaseCount) * 2;
                total += (len - lowercaseCount) * 2;
                total += numberCount * 4;
                total += symbolCount * 6;
                total -= (letterCount - len) === 0 ? len : 0;
                total -= (numberCount - len) === 0 ? len : 0;
                total -= consecutiveUppercaseCount * 2;
                total -= consecutiveLowercaseCount * 2;
                total -= consecutiveNumberCount * 2;
                total -= sequentialNumbersCount * 3;
                total -= sequentialSymbolsCount * 3;
                total -= sequentialLettersCount * 3;

                return total;
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

            $scope.showConfirmPasswordError = function() {
                if ( !$scope.user.password ) { return false; }

                return !comparePasswords() && $scope.showDisplayErrors;
            };

            $scope.showConfirmPasswordSuccess = function() {
                if ( !$scope.user.password ) { return false; }

                if ( !$scope.showDisplayErrors ) { return false; }

                return comparePasswords();
            };

            $scope.checkPasswordStrength = function() {
                if ( !$scope.user.password) { 
                    $scope.passwordStrength = null;
                    return; 
                }

                var strength = getPasswordStrength($scope.user.password);

                if ( strength >= 150 ) {
                    $scope.passwordStrength = 4;
                }
                else if ( strength >= 100 && strength < 150 ) {
                    $scope.passwordStrength = 3;
                }
                else if ( strength >= 50 && strength < 100 ) {
                    $scope.passwordStrength = 2;
                }
                else if ( strength < 50 ) {
                    $scope.passwordStrength = 1;
                }

                console.log(strength);
            };

            $scope.showPasswordError = function( form, name, error ) {

                if ( !$scope.showDisplayErrors ) { return false; }

                return form[name].$error[error] || $scope.validatePasswordMinLength();
            };

            $scope.showPasswordSuccess = function( form, name, errors ) {
                return showNotifications(true, form, name, errors) && !$scope.validatePasswordMinLength();
            };

            $scope.validatePasswordMinLength = function() {
                var pw = $scope.user.password;

                if ( !$scope.showDisplayErrors ) { return false; }

                if ( !pw ) { return false; }

                return $scope.user.password.length < 8;
            };
        }
    ]);