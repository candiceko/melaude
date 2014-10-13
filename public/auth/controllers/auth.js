'use strict';

angular.module('mean.controllers.login', [])
    .controller('LoginCtrl',
        ['$scope', '$state', '$rootScope', '$http', '$location',
        function($scope, $state, $rootScope, $http, $location) {

            // This object will be filled by the form
            $scope.user = {};
            $scope.showDisplayErrors = false;
            $scope.isCapsLockOn = false;
            $scope.isSigningIn = false;
            $scope.signInAttempts = 0;
            $scope.maxSignInAttempts = 6;
            $scope.showUsername = false;
            $scope.showIndividualDisplayErrors = {};

            var showNotifications = function( isSuccess, form, name, errors ) {

                var show = isSuccess;

                if ( !Array.isArray(errors) ) { return false; }

                if ( !$scope.showDisplayErrors && !$scope.showIndividualDisplayErrors[name] ) { return false; }

                errors.every(function( val ) {
                    if ( form[name].$error[val] ) {
                        show = !isSuccess;

                        return false;
                    }
                    return true;
                });

                return show;
            };

            var isCapsLockOn = function ( e ) {
                e = (e) ? e : window.event;

                var kc = ( e.keyCode ) ? e.keyCode : e.which; // get keycode
                var isUp = (kc >= 65 && kc <= 90) ? true : false; // uppercase
                var isLow = (kc >= 97 && kc <= 122) ? true : false; // lowercase
                var isShift = ( e.shiftKey ) ? e.shiftKey : ( (kc === 16) ? true : false ); // shift is pressed -- works for IE8-

                // uppercase w/out shift or lowercase with shift == caps lock
                if ( (isUp && !isShift) || (isLow && isShift) ) {
                    return true;
                }

                return false;
            };

            // Register the login() function
            $scope.login = function( form ) {
                if ( form.$valid && !$scope.user.username ) {
                    $scope.isSigningIn = true;
                    $scope.hasLoginError = false;

                    $http.post('/login', {
                        email: $scope.user.email,
                        password: $scope.user.password,
                        rememberMe: $scope.user.rememberMe
                    })
                        .success(function(response) {

                            // authentication OK
                            setTimeout(function() {
                                $scope.hasLoginError = false;
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
                                    $state.go('createProfile');
                                }
                                $scope.$apply();
                            }, 1500);
                        })
                        .error(function() {

                            setTimeout(function() {
                                $scope.signInAttempts++;
                                $scope.hasLoginError = true;
                                $scope.isSigningIn = false;
                                $scope.user.password = null;
                                $scope.showDisplayErrors = false;
                                $scope.showIndividualDisplayErrors.password = false;
                                $scope.$apply();
                            }, 1500);
                        });
                } else {
                    $scope.showDisplayErrors = true;
                }
            };

            $scope.showError = function( form, name, error ) {
                return ($scope.showDisplayErrors || $scope.showIndividualDisplayErrors[name]) && form[name].$error[error];
            };

            $scope.showErrors = function( form, name, errors ) {
                return showNotifications(false, form, name, errors);
            };

            $scope.validateOnBlur = function( form, name ) {
                if ( !form[name].$viewValue ) {
                    $scope.showIndividualDisplayErrors[name] = false;
                    return;
                }

                $scope.showIndividualDisplayErrors[name] = true;
            };

            $scope.checkCapsLock = function( e ) {
                $scope.isCapsLockOn = isCapsLockOn(e);
            };
        }
    ])
    .controller('RegisterCtrl', ['$scope', '$rootScope', '$http', '$location',
        function($scope, $rootScope, $http, $location) {
            $scope.user = {};
            $scope.showDisplayErrors = false;
            $scope.agreement = null;
            $scope.passwordStrength = null;
            $scope.showIndividualDisplayErrors = {};

            var showNotifications = function( isSuccess, form, name, errors ) {

                var show = isSuccess;

                if ( !Array.isArray(errors) ) { return false; }

                if ( !$scope.showDisplayErrors && !$scope.showIndividualDisplayErrors[name] ) { return false; }

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

                if ( form.$valid && comparePasswords() ) {
                    $http.post('/register', {
                        email: $scope.user.email,
                        password: $scope.user.password,
                        confirmPassword: $scope.user.confirmPassword,
                        name: $scope.user.name
                    })
                        .success(function() {
                            // authentication OK
                            $scope.registerError = 0;
                            $rootScope.user = $scope.user;
                            $rootScope.$emit('loggedin');
                            $location.url('/create-profile');
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
                return ($scope.showDisplayErrors || $scope.showIndividualDisplayErrors[name]) && form[name].$error[error];
            };

            $scope.showErrors = function( form, name, errors ) {
                return showNotifications(false, form, name, errors);
            };

            $scope.showSuccess = function( form, name, errors ) {
                return showNotifications(true, form, name, errors);
            };

            $scope.showConfirmPasswordError = function( name ) {
                if ( !$scope.user.password ) { return false; }

                return !comparePasswords() && ( $scope.showDisplayErrors || $scope.showIndividualDisplayErrors[name] );
            };

            $scope.showConfirmPasswordSuccess = function( name ) {
                if ( !$scope.user.password ) { return false; }

                if ( !$scope.showDisplayErrors && !$scope.showIndividualDisplayErrors[name]  ) { return false; }

                return comparePasswords();
            };

            $scope.checkPasswordStrength = function( form, name ) {
                if ( !form[name].$viewValue ) {
                    $scope.passwordStrength = null;
                    return;
                }

                var strength = getPasswordStrength(form[name].$viewValue);

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

            $scope.validateOnBlur = function( form, name ) {
                if ( !form[name].$viewValue ) {
                    $scope.showIndividualDisplayErrors[name] = false;
                    return;
                }

                $scope.showIndividualDisplayErrors[name] = true;
            };
        }
    ]);
