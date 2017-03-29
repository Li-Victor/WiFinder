var mongoose = require('mongoose');

var dbURI = 'mongodb://localhost/WiFinder';
if(process.env.NODE_ENV === 'production') {
    dbURI = 'mongodb://username:password@ds143980.mlab.com:43980/wifinder';
}
mongoose.connect(dbURI);

//Listens to mongoose connections

//for successful connection through mongoose
mongoose.connection.on('connected', function() {
    console.log('Mongoose connected to ' + dbURI);
});

//checks for connection error
mongoose.connection.on('error', function(err) {
    console.log('Mongoose connection error: ' + err);
});

//checks for disonnection event
mongoose.connection.on('disconnected', function() {
    console.log('Mongoose disconnected');
});

var gracefulShutdown = function(msg, callback) {
    //closes Mongoose connection
    mongoose.connection.close(function() {
        //outputs message when Mongoose connection is closed
        console.log('Mongoose disconnected through ', msg);
        callback();
    });
};

//graceful function happens from the different shutdowns of all the connections

//Listen for SIGUSR2, which nodemon uses
process.once('SIGUSR2', function() {
    gracefulShutdown('nodemon restart', function() {
        process.kill(process.pid, 'SIGUSR2');
    });
});

//Listen for SIGINT emitted on application termination
process.on('SIGINT', function() {
    gracefulShutdown('app termination', function() {
        process.exit(0);
    });
});

//Listen for SIGTERM when Heroku shuts down the process
process.on('SIGTERM', function() {
    gracefulShutdown('Heroku app shutdown', function() {
        process.exit(0);
    });
});

require('./locations');
