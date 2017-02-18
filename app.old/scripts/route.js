(function() {
    'use strict';

    app.config(['$stateProvider', function($stateProvider) {
        $stateProvider

        .state('login', {
            url: '/',
            templateUrl: 'app/views/login.html',
            controller: 'loginController'
        })

        .state('dashboard', {
            url: '/dashboard',
            authenticate: true,
            templateUrl: 'app/views/dashboard.html',
            controller: 'dashboardController',
            resolve: {
                users: function(DBService) {
                    return DBService.user().getUsers();
                }
            }
        })

        .state('user', {
            url: '/user',
            authenticate: true,
            params: {
                id: null
            },
            templateUrl: 'app/views/user.html',
            controller: 'userController'
        })

        .state('time-card', {
            url: '/time-card',
            authenticate: true,
            templateUrl: 'app/views/time-card.html',
        })

        .state('calendar', {
            url: '/calendar',
            authenticate: true,
            templateUrl: 'app/views/calendar.html',
            controller: 'calendarController'
        })

        .state('bill', {
            url: '/bill',
            authenticate: true,
            templateUrl: 'app/views/bill.html'
        });
    }]);

})();
