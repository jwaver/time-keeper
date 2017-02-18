(function() {
    'use strict';

    app

    .factory('DBService', function($q) {
        return {
            user: function() {
                return {
                    DB: function(){
                        return userDB;
                    },
                    getByUsername: function(username) {
                        var deferred = $q.defer();

                        this.DB().findOne({username:username}, function (err, username) {
                              deferred.resolve(username);
                        });

                        return deferred.promise;
                    },
                    getUser: function(id) {
                        var deferred = $q.defer();

                        this.DB().findOne({_id:id}, function (err, user){
                              deferred.resolve(user);
                        });

                        return deferred.promise;
                    },
                    getUsers: function() {
                        var deferred = $q.defer();

                        this.DB().find({})
                        .sort({ _id: 1 })
                        .exec(function (err, users) {
                            deferred.resolve(users);
                        });

                        return deferred.promise;
                    },
                    create: function(fData){
                        var deferred = $q.defer();

                        this.DB().insert(fData, function (err, user) {
                            deferred.resolve(user);
                        });

                        return deferred.promise;
                    },
                    remove: function(id){
                        var deferred = $q.defer();

                        this.DB().remove({ _id: id }, {}, function (err, numRemoved) {
                            deferred.resolve(numRemoved);
                        });

                        return deferred.promise;
                    }
                };
            },
            timeCard: function() {
                return {
                    DB: function(){
                        return timeDB;
                    },
                    create: function(fData){
                        var deferred = $q.defer();

                        this.DB().insert(fData, function (err, time) {
                            deferred.resolve(time);
                        });

                        return deferred.promise;
                    },
                    getByID: function(id){
                        var deferred = $q.defer();

                        this.DB().find({userId:id})
                        .sort({ date: -1 })
                        .exec(function (err, time) {
                            deferred.resolve(time);
                        });

                        return deferred.promise;
                    }
                };
            },
        };
    })

    .factory('calcService',function(){
        var LateTime    = '6:10 am';
        var LateAmount  = 10;
        var Total       = 0;

        return {
            getTag: function(timeIn){
                var Time = moment('6:09 pm','h:mm:s a').format('h:mm');

                return 'Late';
                return this.getSecDeff(LateTime,timeIn);

                return moment(timeIn,'h:mm:s a').format('h:mm');
            },
            getAmount: function(timeIn){

                // bEYOND 1 HOUR
                if( moment(timeIn,'h:mm:s a').format('HH:mm')>=moment(LateTime,'h:mm').add(1, 'hours').format('HH:mm') )
                return 50;

                // Only beyond late period
                // and not 1 hour from late time
                if( (moment(timeIn,'h:mm:s a')>=moment(LateTime,'h:mm:s a')) && moment(LateTime,'h:mm a').format('a')==moment(timeIn,'h:mm:s a').format('a') )
                {
                    Total = Number(LateAmount)+Number(this.getSecDeff(LateTime,timeIn));
                    return Total>=50 ? 50 : Total;
                }

                return 0;
            },
            getTotal: function(){

            },
            getSecDeff: function(now,then){
                // Format must hh:mm
                return moment(moment(then,'h:mm a').diff(moment(now,'h:mm a'))).format('mm');
            }
        };
    })

})();
