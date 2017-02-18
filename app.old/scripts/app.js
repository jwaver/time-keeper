'use strict';


var app = angular.module('app', ['ui.router','ui.bootstrap','ngNotify']);

app.run(['$rootScope', '$state',function($rootScope, $state,$stateParams){

    $rootScope.$state = $state;

    $rootScope.$stateParams = $stateParams;

    $rootScope.$on('$stateChangeStart',function(event,toState,toParams){
        $rootScope.stateIsLoading = true;

        if(toState.authenticate && _.isUndefined(localStorage.session)){
            $state.transitionTo('login');
            event.preventDefault();
        }

    });

    $rootScope.$on('$stateChangeSuccess',function(){
        $rootScope.stateIsLoading = false;
    });

}]);
