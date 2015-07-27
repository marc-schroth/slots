'use strict';

/* Controllers */

var slotsControllers = angular.module('slotsControllers', []);

slotsControllers.controller('PlayCtrl', ['$scope', '$routeParams', '$http', '$location', '$compile',
    function($scope, $routeParams, $http, $location, $compile) {
        // Initialze slot values and playerName
        $scope.slot1 = 1, $scope.slot2 = 2, $scope.slot3 = 3;
        $scope.playerName = $routeParams.playerName;
        
        // Send a login request and receive player data back
        $http.get('play/'+$routeParams.playerName).success(function(data) {
            $scope.credits = data.credits;
        });
        
        // Login function. Redirects to login page.
        $scope.login = function() {
            $location.path('/login');
            $scope.$apply();
        }
        
        /*
         * Spin function. Disables spin button, sends spin request,
         * stores response data, then animates the slots.
         */
        $scope.spin = function() {
            $("#spin-button").toggleClass('disabled',true);
            $http.get('play/'+$scope.playerName+'?spin=1').success(function(data) {
                $scope.credits--;
                $scope.newCredits = data.credits;
                $scope.spinResult = data.spinResult;
                animateSlots();
            });

        }
        
        /*
         * Animates the slots. Once slots have stopped spinning,
         * ensures that player has credits left and calls awardCredits()
         * if they won any. 
         */
        function animateSlots() {
            // Some constants
            var FASTEST = 200;
            var SLOWEST = 1000;
            
            var spinningSlots = 3;
            // Animate each slot differently
            $(".slots").each(function(index) {
                // 5-10 rotations
                var rotations = Math.floor(Math.random() * 5) + 5;
                var speedIncrement = (SLOWEST - FASTEST) / rotations;
                // Initial animation to spin current value out of view
                $(this).animate({top:"+=500"},"slow");
                // Spin random values through the slot, slowing down at a linear rate with each rotation.
                for(var i = 0; i < rotations; i++) {
                    // Move the slot up (still out of view), fill with a random value
                    $(this).animate({top:"-500"},0,function() {
                        $scope['slot'+(index+1)] = Math.floor(Math.random() * 3) + 1;
                        $scope.$apply();
                    });
                    // Spin the slot through the view area
                    $(this).animate({top:"+=1000"},FASTEST + (i*speedIncrement));
                }
                // Now place the final value into the slot...
                $(this).animate({top:"-500"},0,function() {
                    $scope['slot'+(index+1)] = $scope.spinResult.spin[index];
                    $scope.$apply();
                });
                // And spin it into place
                $(this).animate({top:"0"},SLOWEST,function() {
                    spinningSlots--;
                    // Once all slots have stopped spinning, do some checks.
                    if(spinningSlots === 0) {
                        if($scope.newCredits <= 0) {
                            // If no credits left, replace SPIN button with GAME OVER
                            $("#spin-button").replaceWith('<a id="game-over" class="btn btn-danger btn-lg" ng-click="login()">GAME OVER</a>');
                            // Need to compile for login() function to work
                            $compile($("#game-over"))($scope);
                            
                        } else {
                            // User has more credits. Re-enable SPIN button and animate any winnings.
                            $("#spin-button").toggleClass('disabled',false);
                            awardCredits();
                        }
                    }
                });
                
            });
        }
        
        /*
         * Checks if any credits have been won and plays an animation if so
         */
        function awardCredits() {
            var creditsWon = $scope.spinResult.value;
            if(creditsWon > 0) {
                for(var i = 0; i < creditsWon; i++) {
                    // Simple pulsing animation increments the credit counter 1 at a time.
                    $('#credits').animate({fontSize:"+=5"},100,function() {
                        $scope.credits++;
                        $scope.$apply();
                    });
                    $('#credits').animate({fontSize:"-=5"},150);
                }
            }
        }
    }
]);