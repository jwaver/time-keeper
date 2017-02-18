(function () {
    'use strict';

    app

    // Login Controller
    .controller('loginController',function($scope,$state,DBService){
        $scope.form = {};
        $scope.message = 'Everyone come and see how good I look!';

        $scope.submit = function(){

            DBService.user().DB().findOne({username:$scope.form.username,password:$scope.form.password}, function (err, user) {
                if(user){
                    localStorage.session = JSON.stringify(user);
                    $state.go('dashboard.widget');
                    return;
                }else{

                }
            });

        }

        localStorage.clear();
    })

    // dashboard Controller
    .controller('widgetController',function($scope,$state,DBService){
        $scope.users = null;
        $scope.test = null;

        $scope.getUsers = function(){
            DBService.user().getUsers()
            .then(function(users) {
                $scope.users = users;
            })
        };

        $scope.getTime = function(id){
            DBService.timeCard().getByID(id)
            var deferred = $q.defer();

            this.DB().findOne({userId:id}, function (err, time) {
                  deferred.resolve(time);
            });

            return deferred.promise;
        };

        $scope.go = function(id){
            $state.go('dashboard.user',{id:id});
        };

        // Run
        $scope.getUsers();

    })

    // User Controller
    .controller('userController',function($rootScope,$scope,$state,$q,$timeout,$mdDialog,DBService,calcService){
        $scope.id           = $state.params.id || 0;
        $scope.form         = {};
        $scope.status       = false;
        $scope.editable     = false;
        $scope.clock        = moment().format('h:mm:s a');
        $scope.tickInterval = 1000;
        $scope.user         = {};
        $scope.loader       = false;
        $scope.calcService  = calcService;
        $scope.timeLogs     = null;

        // New User
        if($scope.id==0)
        {
            $scope.form.username   = faker.internet.userName();
            $scope.form.name       = faker.name.findName();
            $scope.form.email      = faker.internet.email();
            $scope.form.password   = faker.internet.password();
            $scope.form.avatar     = faker.image.imageUrl();


            $scope.create = function(){
                // $scope.loader = true;


                // Validate Form
                if(!validator.isEmail($scope.form.email)){ return console.log('Check Email!') }
                if(!validator.equals($scope.form.password, $scope.form.confirm)){ return console.log('Password not Match!') }

                $scope.form.avatar = '../app/asset/images/avatar-default.png';

                $rootScope.stateIsLoading = true;

                // Insert to DB
                DBService.user()
                .create($scope.form)
                .then(function(user) {
                    console.log('New user added.');
                    $rootScope.stateIsLoading = false;
                    $state.go('dashboard.widget');
                })


                // Empty Fields
                $scope.form = {};
            };

        }
        // Show User
        else
        {
            $scope.tick         = function() {
                if($scope.editable!=true)
                $scope.clock = moment().format('h:mm:s a') // get the current time
                $timeout($scope.tick, $scope.tickInterval); // reset the timer
            }

            $scope.setStatus    = function(){
                var deferred = $q.defer();

                timeDB.findOne({userId: $scope.id,out:null}, function (err, status) {
                    deferred.resolve(status);
                });

                deferred.promise.then(function(res){
                    if(res)
                    $scope.status = (res.out==null) ? true:false;
                });
            };

            $scope.inOut        = function(state){
                $scope.status = state;

                // In
                if(state)
                {
                    DBService.timeCard().create({
                        userId: $scope.id,
                        in:     moment($scope.clock,'h:mm:s a').format('h:mm a'),
                        out:    null,
                        date:   moment().format("YYYY-MM-DD HH:mm:ss")
                    })
                    .then(function(status){
                        if(_.isObject(status))
                        $scope.getLogs(); // Update Table logs
                    });
                }
                // Out
                else
                {
                    timeDB.update({ userId: $scope.id, out:null }, { $set: { out: moment($scope.clock,'h:mm:s a').format('h:mm a') } }, { multi: true }, function (err, numReplaced) {
                        if(numReplaced)
                        $scope.getLogs(); // Update Table logs
                    });
                }


            };

            $scope.customInOut  = function(){
                if(moment($scope.clock,'h:mm:s a').format('h:mm a')=='Invalid date'){
                    console.log('Invalid input!');
                    return false;
                }
                $scope.inOut($scope.status ? false : true);
            };

            $scope.getUser      = function(id){
                DBService.user()
                .getUser(id)
                .then(function(user) {
                    $scope.user = user;
                    $scope.user.avatar  = $scope.user.avatar ? $scope.user.avatar : 'app/asset/images/avatar-default.png';
                })
            };

            $scope.remove       = function(ev){
                DBService.user().remove($scope.id)
                .then(function(id){
                    console.log(id+' is removed.')
                    $state.go('dashboard.widget');
                });
            };

            $scope.getLogs      = function(){
                DBService.timeCard()
                .getByID($scope.id)
                .then(function(logs){
                    $scope.timeLogs =  _.map(logs,function(v){
                        v.date = moment(v.date,'YYYY-MM-DD HH:mm:ss').format('MMM D, Y - HH:mm');
                        return v;
                    });
                });
            };

            $scope.getTotal     = function(){
                _.map($scope.timeLogs,function(v){
                    console.log( $scope.calcService.getAmount(v.in) );
                    return v;
                });
            };


            $scope.tick();      // Start the timer
            $scope.setStatus();
            $scope.getLogs();
            $scope.getUser($scope.id);
            $scope.getTotal();
        }

    })

    // Calendar Controller
    .controller('calendarController',function($scope){
        $scope.birthday = new Date();
        // $scope.fullCalendar = {
        //     target: $('#calendar'),
        //     init: function(){
        //         return this.target.fullCalendar({
        // 			header: {
        // 				left: 'prev,next today',
        // 				center: 'title',
        // 				right: 'month,agendaWeek,agendaDay,listWeek'
        // 			},
        // 			defaultDate: '2016-12-12',
        // 			navLinks: true, // can click day/week names to navigate views
        // 			editable: true,
        // 			eventLimit: true, // allow "more" link when too many events
        // 			events: [
        // 				{
        // 					title: 'All Day Event',
        // 					start: '2016-12-01'
        // 				},
        // 				{
        // 					title: 'Long Event',
        // 					start: '2016-12-07',
        // 					end: '2016-12-10'
        // 				},
        // 				{
        // 					id: 999,
        // 					title: 'Repeating Event',
        // 					start: '2016-12-09T16:00:00'
        // 				},
        // 				{
        // 					id: 999,
        // 					title: 'Repeating Event',
        // 					start: '2016-12-16T16:00:00'
        // 				},
        // 				{
        // 					title: 'Conference',
        // 					start: '2016-12-11',
        // 					end: '2016-12-13'
        // 				}
        // 			]
        // 		});
        //     }
        // }
        //
        //
        // $scope.fullCalendar.init();
    });

})();
