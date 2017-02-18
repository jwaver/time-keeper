(function () {
    'use strict';

    app

    // Login Controller
    .controller('loginController',function($scope,$state,notify,DBService){
        $scope.form = {};
        $scope.message = 'Everyone come and see how good I look!';

        $scope.submit = function(){
            DBService.user().DB().findOne({username:$scope.form.username,password:$scope.form.password}, function (err, user) {
                if(user){
                    localStorage.session = JSON.stringify(user);
                    notify.success('Hello '+$scope.form.username+'!');
                    $state.go('dashboard');
                    return;
                }

                notify.error('Failed!');
            });
        }

        localStorage.clear();
    })

    // dashboard Controller
    .controller('dashboardController',function($scope,$state,DBService,notify){
        $scope.users = null;

        $scope.getUsers = function(){
            DBService.user().getUsers()
            .then(function(users) {
                $scope.users = users;
                var timeDB = DBService.time();

                angular.forEach($scope.users, function(value, key){
                    if(value._id)
                    timeDB.getByID(value._id).then(function(logs){
                        $scope.users[key]['logs'] = logs;
                        // console.log($scope.users);
                    })
                });
            })
        };

        $scope.getTime = function(id){
            DBService.time().getByID(id)
            var deferred = $q.defer();

            this.DB().findOne({userId:id}, function (err, time) {
                  deferred.resolve(time);
            });

            return deferred.promise;
        };

        $scope.go = function(id){
            $state.go('user',{id:id});
        };

        // Run
        $scope.getUsers();

        DBService.time().getByID('rgewH97oBS9jk8lH').then(function(logs){
            console.log(logs);
        });
    })

    // User Controller
    .controller('userController',function($scope,$state,$q,$uibModal,$timeout,DBService,calcService,notify){
        $scope.id           = $state.params.id || 0;
        $scope.form         = {};
        $scope.status       = false;
        $scope.editable     = false;
        $scope.clock        = moment().format('h:mm:s a');
        $scope.tickInterval = 1000;
        $scope.user         = {};
        $scope.loader       = false;
        $scope.calcService  = calcService;

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
                if(!validator.isEmail($scope.form.email)){ return notify.error('Check Email!') }
                if(!validator.equals($scope.form.password, $scope.form.confirm)){ return notify.error('Password not Match!') }



                // Insert to DB
                DBService.user()
                .create($scope.form)
                .then(function(user) {
                    notify.success('New user added.');
                    $state.go('dashboard');
                })



                // Unique username
                // userDB.findOne({username:$scope.fData.username}, function (err, user){
                //       if(user===null)
                //       {
                //         userDB.insert($scope.fData, function (err, user) {
                //             $scope.stateIsLoading = false;
                //
                //             notify.success('New user added.');
                //         });
                //       }
                //       else
                //       {
                //           notify.error('Username is taken!');
                //           $scope.stateIsLoading = false;
                //       }
                // });

                // Empty Fields
                $scope.form = {};
            };

        }
        // Show User
        else
        {
            $scope.tick = function() {
                if($scope.editable!=true)
                $scope.clock = moment().format('h:mm:s a') // get the current time
                $timeout($scope.tick, $scope.tickInterval); // reset the timer
            }

            $scope.setStatus = function(){
                var deferred = $q.defer();

                timeDB.findOne({userId: $scope.id,out:null}, function (err, status) {
                    deferred.resolve(status);
                });

                deferred.promise.then(function(res){
                    if(res)
                    $scope.status = (res.out==null) ? true:false;
                });
            };

            $scope.inOut = function(state){
                $scope.status = state;

                // In
                if(state)
                {
                    DBService.time().create({
                        userId: $scope.id,
                        in:     moment($scope.clock,'h:mm:s a').format('h:mm a'),
                        out:    null,
                        date:   moment().format("YYYY-MM-DD HH:mm:ss")
                    })
                    .then(function(status){
                        if(_.isObject(status))
                        notify.success('Time IN successful!');
                        $scope.getLogs(); // Update Table logs
                    });
                }
                // Out
                else
                {
                    timeDB.update({ userId: $scope.id, out:null }, { $set: { out: moment($scope.clock,'h:mm:s a').format('h:mm a') } }, { multi: true }, function (err, numReplaced) {
                        if(numReplaced)
                        notify.success('Time OUT successful!');
                        $scope.getLogs(); // Update Table logs
                    });
                }


            };

            $scope.customInOut = function(){
                if(moment($scope.clock,'h:mm:s a').format('h:mm a')=='Invalid date'){
                    notify.error('Invalid input!');
                    return false;
                }
                $scope.inOut($scope.status ? false : true);
            };

            $scope.getUser = function(id){
                DBService.user()
                .getUser(id)
                .then(function(user) {
                    $scope.user = user;
                    $scope.user.avatar  = $scope.user.avatar ? $scope.user.avatar : 'app/asset/images/avatar-default.png';
                })
            };

            $scope.remove = function(){
                DBService.user().remove($scope.id)
                .then(function(id){
                    notify.success(id+' is removed.')
                    $state.go('dashboard');
                });
            };

            $scope.getLogs = function(){
                var deferred = $q.defer();

                timeDB.find({userId: $scope.id}, function (err, logs) {
                    deferred.resolve(logs);
                });

                deferred.promise.then(function(res){
                    $scope.timeLogs = res.reverse();
                });
            };



            $scope.tick();      // Start the timer
            $scope.setStatus();
            $scope.getLogs();
            $scope.getUser($scope.id);
        }

    })

    // Calendar Controller
    .controller('calendarController',function($scope){

        $scope.fullCalendar = {
            target: $('#calendar'),
            init: function(){
                return this.target.fullCalendar({
        			header: {
        				left: 'prev,next today',
        				center: 'title',
        				right: 'month,agendaWeek,agendaDay,listWeek'
        			},
        			defaultDate: '2016-12-12',
        			navLinks: true, // can click day/week names to navigate views
        			editable: true,
        			eventLimit: true, // allow "more" link when too many events
        			events: [
        				{
        					title: 'All Day Event',
        					start: '2016-12-01'
        				},
        				{
        					title: 'Long Event',
        					start: '2016-12-07',
        					end: '2016-12-10'
        				},
        				{
        					id: 999,
        					title: 'Repeating Event',
        					start: '2016-12-09T16:00:00'
        				},
        				{
        					id: 999,
        					title: 'Repeating Event',
        					start: '2016-12-16T16:00:00'
        				},
        				{
        					title: 'Conference',
        					start: '2016-12-11',
        					end: '2016-12-13'
        				}
        			]
        		});
            }
        }


        $scope.fullCalendar.init();
    });

})();
