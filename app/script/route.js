(function() {
    'use strict';

    app.config(['$stateProvider', function($stateProvider) {
        $stateProvider

        .state('login', {
            url: '/',
            templateUrl: '../app/view/login.html',
            controller: 'loginController'
        })

        .state('dashboard', {
            url: '/dashboard',
            authenticate: true,
            templateUrl: '../app/view/dashboard.html',
            // controller: 'dashboardController',
            resolve: {
                users: function(DBService) {
                    return DBService.user().getUsers();
                }
            }
        })

        .state('dashboard.widget', {
            url: 'widget',
            parent: 'dashboard',
            authenticate: true,
            templateUrl: '../app/view/widget.html',
            controller: 'widgetController'
        })

        .state('dashboard.calendar', {
            url: 'calendar',
            parent: 'dashboard',
            // authenticate: true,
            templateUrl: '../app/view/calendar.html',
            controller: 'calendarController'
        })

        .state('dashboard.settings', {
            url: '/settings',
            parent: 'dashboard',
            // authenticate: true,
            templateUrl: '../app/view/settings.html',
            controller: 'calendarController'
        })

        .state('dashboard.user', {
            url: '/user/:id',
            authenticate: true,
            templateUrl: '../app/view/user.html',
            controller: 'userController'
        })

        .state('time-card', {
            url: '/time-card',
            authenticate: true,
            templateUrl: '../app/view/time-card.html',
        })

        .state('bill', {
            url: '/bill',
            authenticate: true,
            templateUrl: '../app/view/bill.html'
        });

    }]);

})();
