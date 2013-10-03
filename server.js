var express = require('express');
var app = express();
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var server = require('http').createServer(app);
var io = require('socket.io').listen(server, { log: false });
var fs = require('fs');
var utils = require('./mycloud/lib/utils.js');
var dir_info = require('./mycloud/lib/dir_info.js');
var db = require('./mycloud/lib/db.js');
var serverConfig = require('./mycloud/serverConfig.js');
var ss = require('socket.io-stream');
var ioc = require('socket.io-client');


var TWITTER_CONSUMER_KEY = "l2QMed6qvZSA9EbVymRMgw";
var TWITTER_CONSUMER_SECRET = "73jCYWrZ1CTQl8WoPoX2YvWFrH6NK2axzH5LSVOVIM";

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
//app.use(express.logger());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(__dirname + '/public'));

server.listen(2000);
console.log('App started on port 2000');

passport.use(new TwitterStrategy({
    consumerKey: TWITTER_CONSUMER_KEY,
    consumerSecret: TWITTER_CONSUMER_SECRET,
    callbackURL: "/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Twitter profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Twitter account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

//routes
app.get('/', ensureAuthenticated,function(req, res){
  var dir = utils.dirFromParam(req.params[0]);
  var parentdir = utils.parentdirFromPath(dir);
  var path = serverConfig.data.basepath + dir;
  var stats = fs.statSync(path);
  if (stats.isDirectory()) {
    var data = new Object();
    fs.readdir(path, function(err, files) {
      var dirInfos = new Array();
      var fileInfos = new Array();
      for (i in files) {
        if (files[i].indexOf('.') != 0) {
          var stats = fs.statSync(path + '/' + files[i]);
          if (stats.isDirectory())
            dirInfos.push({
              name: files[i],
              path: dir + '/' + files[i],
            });
          else
            fileInfos.push({
              name: files[i],
              path: dir + '/' + files[i],
              //icon: getMimetype(files[i]),
              //size: getFormattedSize( stats.size )
            });
        }
      }
      res.render('index', {title: 'myCloud', parentdir: parentdir, dirs: dirInfos, files: fileInfos, user:  'Susheng'});
    });
  }
  else {
    res.download(path, dir);
  }
});

app.get('/account', ensureAuthenticated,function(req, res){
  res.send(req.user);
});

app.post('/mycloud', function(req, res){
  res.render('views/dirframe',req.body);
});


app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/auth/twitter',
  passport.authenticate('twitter'));

app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

//helper functions
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}


io.sockets.on('connection', function (socket) {
  console.log('on connection');
  socket.on('listDirectory', function (data) {
    var dir = data;
    var parentdir = utils.parentdirFromPath(dir);
    var path = serverConfig.data.basepath + dir;
    var stats = fs.statSync(path);
    if (stats.isDirectory()) {
      var data = new Object();
      fs.readdir(path, function(err, files) {
        var dirInfos = new Array();
        var fileInfos = new Array();
        for (i in files) {
          if (files[i].indexOf('.') != 0) {
            var stats = fs.statSync(path + '/' + files[i]);
            if (stats.isDirectory())
              dirInfos.push({
                name: files[i], 
                path: dir + '/' + files[i],
              }); 
            else
              fileInfos.push({
                name: files[i], 
                path: dir + '/' + files[i], 
                //icon: getMimetype(files[i]),
                //size: getFormattedSize( stats.size )
              }); 
          }   
        }   
        socket.emit('listDirectoryReturn', {title: 'myCloud', dirpath: dir, parentdir: parentdir, dirs: dirInfos, files: fileInfos, user:  'Susheng'});
      }); 
    }
  });

  socket.on('renameDirectory', function(data) {
    var dir = data;
    var parentdir = utils.parentdirFromPath(dir);
    var oldpath = serverConfig.data.basepath + dir;
    var newpath = serverConfig.data.basepath + parentdir + '/' + req.body.rename;
    fs.rename(oldpath, newpath, function (err) {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('ok');
    });
  });
  
  socket.on('deleteFile', function(data) {
      var path = data;
      var filepath = serverConfig.data.basepath + path;
      var parentdir = utils.parentdirFromPath(path);
      console.log(new Date().getTime() + ': delete ' + filepath);
      fs.unlink(filepath, function(error) {
        if (error) console.log(error);
      });
      socket.emit('deleteFileReturn',parentdir);
  });

  socket.on('sendfile', function(data) {
    console.log(data);
    //send files
    //Step1. find ip for the user(user:)
    //Step2. looking for files to be shared.
    //Step3. send streamming files
    var clientSocket = ioc.connect('http://192.168.1.37:2000');
    var stream = ss.createStream();
    var filename = data.filename.substring(2);
    
    ss(clientSocket).emit('transmitFile', stream, {name: filename});
    fs.createReadStream(filename).pipe(stream);
  });

});

