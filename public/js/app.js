'use strict';

/* App Module */

var slotsApp = angular.module('slotsApp', ['ngAnimate','ngRoute','slotsControllers']);

slotsApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
          when('/login', {
            templateUrl: 'partials/login.html',
          }).
          when('/play/:playerName', {
            templateUrl: 'partials/play.html',
            controller: 'PlayCtrl'
          }).
          otherwise({
            redirectTo: '/login'
          });  
    }
]);