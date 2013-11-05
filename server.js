var express = require('express');
var app = express();
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var server = require('http').createServer(app);
var io = require('socket.io').listen(server, { log: false });
var fs = require('fs');
var path=require('path');
var utils = require('./mycloud/lib/utils.js');
var dir_info = require('./mycloud/lib/dir_info.js');
var config = require('./config.js');
var ss = require('socket.io-stream');
var ioc = require('socket.io-client');
var crypto = require('crypto');
var os=require('os');
var db=require('./mongodb.js');
var async = require('async');
var transmission = require('./transmission.js');
var sm=require('./splitmerge.js');

//get self ip address, save into variable ipaddr
var ipaddr = '';
var ifaces=os.networkInterfaces();
for (var dev in ifaces) {
  ifaces[dev].forEach(function(details){
    if (details.family=='IPv4') {
      console.log(details.address);
      ipaddr = details.address;
    }
  });
}

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
  //encrypt contact string.
  var encryptString = ipaddr+' '+req.user.id+' '+req.user.username+' '+req.user.photos[0].value;
  var cipher = crypto.createCipher('aes256','technicolor@ColorShare');
  var encrypted = cipher.update(encryptString, 'utf8', 'hex') + cipher.final('hex');


  //initial mycloud
  var dir = '/data';
  var parentdir = utils.parentdirFromPath(dir);
  var path = __dirname + dir;
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
    async.parallel({
        contacts: function(callback){
          db.find('contacts',{id:req.user.id},{contacts:1},function(contacts){
            db.find('localusers',{id:{$in:contacts[0].contacts}},{},function(data){
              callback(null,data);
            });
          });
        },
        groups: function(callback){
          db.find('groups',{owner:req.user.id},{},function(data){
            callback(null,data);
          }); 
        }
    },
    function(err, results) {
        // results is now equals to: {one: 1, two: 2}
        var data = {contacts:results.contacts,groups:results.groups, title: 'myCloud',dirpath:dir, parentdir: parentdir, dirs: dirInfos, files: fileInfos, user:req.user.username, userid:req.user.id, code:encrypted, serverip:config.data.serverip};
        //console.log(data);
        res.render('index', data);
    });
    //read contact and group information from DATABASE
    //console.log(db.find('contacts',{id:req.user.id}));
    });
  }
});

app.get('/account', ensureAuthenticated,function(req, res){
  res.send(req.user);
});

app.post('/mycloud', function(req, res){
  res.render('views/dirframe',req.body);
});

app.post('/invite', ensureAuthenticated,function(req, res){
  console.log(req.body.email);
  console.log(req.body.code);
});


app.post('/uploadfile*', function(req, res){
    console.log('first upload: ');
    var dir = utils.dirFromParam(req.params[0]);
    console.log(dir);
    var tmp_path = req.files.uploadfile.path;
    
    res.writeHead(200, {'Content-Type': 'application/json'});
    var data = { status: 'ok' };
    
    
    if (req.files.uploadfile.size == 0) {
      fs.unlink(tmp_path, function(err) {
              //if (err) throw err;
              data['status'] = 'fail';
          }); 
      res.end( JSON.stringify(data) );
      return;
    }
    
    var path = dir + '/' + decodeURI(req.files.uploadfile.name);
    //console.log('path: ' + path);
    var target_path = __dirname + path;
    console.log('upload: ' + target_path);
    var target_file = fs.createWriteStream(target_path);
    target_file.on('close', function() {
      fs.unlink(tmp_path, function(err) {
        var filetime = req.body.filetime ? new Date(parseInt(req.body.filetime)) : new Date();
        var version = parseInt(req.body.version) >= 0 ? parseInt(req.body.version) : 0;
        fs.utimes(target_path, filetime, filetime, function(err){
          if (err) console.log('utime err: ' + err);
        }); 
      }); 
    }); 
    
    var tmp_file = fs.createReadStream(tmp_path);
    tmp_file.on('data', function(data) {
      target_file.write(data);
    }); 
    tmp_file.on('close', function() { target_file.end(); });
});

app.get('/file*', function(req, res){
  var dir = utils.dirFromParam(req.params[0]);
  var parentdir = utils.parentdirFromPath(dir);
  var path = __dirname + dir;
  console.log(path);
  console.log(dir);
  res.download(path);
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
    db.update('localusers',{id:req.user.id},req.user);
    res.redirect('/');
  });

//helper functions
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

/**************************socket.io***************************************/
io.sockets.on('connection', function (socket) {
  console.log('on connection');
  socket.on('disconnect', function(){
    console.log('disconnect');
  });

  socket.on('listDirectory', function (data) {
    var dir = data;
    var parentdir = utils.parentdirFromPath(dir);
    var path = __dirname + dir;
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

  socket.on('addcontact', function(data){
    //check validity
    var decipher = crypto.createDecipher('aes256','technicolor@ColorShare');
    var decrypted = decipher.update(data.code, 'hex', 'utf8') + decipher.final('utf8');
    console.log(decrypted);
    var pieces = decrypted.split(" ");
    db.update('externalusers',{id:pieces[1]},{ip:pieces[0],id:pieces[1],username:pieces[2],photo:pieces[3]});
    db.updateAdd('contacts', {id:data.userid}, pieces[1]);
  });

  socket.on('renameDirectory', function(data) {
    var dir = data;
    var parentdir = utils.parentdirFromPath(dir);
    var oldpath = __dirname + dir;
    var newpath =  __dirname + parentdir + '/' + req.body.rename;
    fs.rename(oldpath, newpath, function (err) {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('ok');
    });
  });
  
  socket.on('deleteFile', function(data) {
      var path = data;
      var filepath = __dirname + path;
      var parentdir = utils.parentdirFromPath(path);
      console.log(new Date().getTime() + ': delete ' + filepath);
      fs.unlink(filepath, function(error) {
        if (error) console.log(error);
      });
      socket.emit('refreshDirectory',parentdir);
  });

  socket.on('disconnect', function(){
    console.log('disconnect');
  });


  socket.on('sendfile', function(data) {
    console.log(data);
    //send files
    //Step1. find ip for the user(user:)
    //Step2. looking for files to be shared.
    //Step3. send streamming files
    var clientSocket = ioc.connect('http://192.168.1.37:2000');
    var stream = ss.createStream();
    var filename = data.filename.substring(1);
    var pieces = filename.split("/");
    var displayname = pieces[pieces.length-1];
    
    ss(clientSocket).emit('transmitFile', stream, {name: displayname, myname:data.myname});
    fs.createReadStream(filename).pipe(stream);
  });

  socket.on('shareFile', function(data){
    console.log(data);
    var filepath = __dirname+data.dir;
    var parentpath = __dirname+data.path;
    var filename = path.basename(filepath);
    var stats = fs.statSync(filepath);
    var fileSizeInBytes = stats["size"];
    var fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
    //decide split into how many pieces
    if(fileSizeInMegabytes>config.data.chunksize){
      //it represents that the file should be splited into pieces for delivering.
      sm.split(config.data.chunksize,filepath,__dirname+'/tempdata/'+filename+'.');
      //CreateSeedSendTorrent(filepath,parentpath,data.group,data.user);
      fs.readdir(__dirname+'/tempdata/', function(err, files) {
        console.log(files);
         files.filter(function(file) {
           return file.substr(0,file.lastIndexOf('.'))==filename 
         }).forEach(function(file) {
              console.log(file);
              CreateSeedSendTorrent(__dirname+'/tempdata/'+file,__dirname+'/tempdata/',data.group,data.user,true);
            });
      });
    } else {
      CreateSeedSendTorrent(filepath,parentpath,data.group,data.user,false);
    }
  });
    ss(socket).on('transmitTorrent', function(stream, data) {
      var parentdir = '/torrent/';
      var filename = __dirname + parentdir + data.name;
      stream.pipe(fs.createWriteStream(filename, {flags: 'w', encoding: 'binary', mode: 0666}));
      //start downloading...
      stream.on('end', function(){
          console.log('Streaming begins.');
          socket.disconnect();
          if(data.split){
            transmission.seedTorrent(filename, __dirname+'/data/');
          }else{
            transmission.seedTorrent(filename, __dirname+'/tempdata/');
          }
      });
    }); 
    
    ss(socket).on('transmitFile', function(stream, data) {
      var parentdir = '/data/received/'+data.myname+'/';
      fs.mkdir(__dirname+parentdir, function(){
        var filename = __dirname + parentdir + data.name;
        stream.pipe(fs.createWriteStream(filename, {flags: 'w', encoding: 'binary', mode: 0666}));
      });
    }); 
});

function CreateSeedSendTorrent(filename,seedpath,group,myname,split){
  //__dirname+data.path
  //create .torrent and seed it.
  crypto.randomBytes(8, function(ex, buf) {
    var torrentname = buf.toString('hex')+'.torrent';
    var torrentfile = __dirname+'/torrent/'+torrentname;
    transmission.createTorrent(filename, 100, torrentfile, config.data.tracker); //here
    transmission.seedTorrent(torrentfile, seedpath);
    //let's send it by websocket.
    db.find('groups', {groupname:group},{},function(datamember){
      for(var member in datamember[0].members){
        var memid = datamember[0].members[member];
        db.find('externalusers', {id:memid}, {}, function(dataip){
          console.log(dataip[0].ip);
          //get the ip address
          var clientSocket = ioc.connect(dataip[0].ip+':2000', { 'connect timeout': 5000 , 'force new connection': true});
          clientSocket.on('connect',function(){
            var stream = ss.createStream();
            ss(clientSocket).emit('transmitTorrent', stream, {name: torrentname, myname:myname, split:split});
            fs.createReadStream(torrentfile).pipe(stream);
          });
          clientSocket.on('connect_failed',function(){
            console.log('connect_failed: '+dataip[0].ip);
          });
          clientSocket.on('disconnect', function(){
            console.log('disconnected: '+dataip[0].ip);
          });
        });
      }
    });
  });
}


