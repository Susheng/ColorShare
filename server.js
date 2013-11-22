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

var torrentHash = {};
var taskTime = {};
var taskPara = {};
var cleanup = {};

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
            db.find('externalusers',{id:{$in:contacts[0].contacts}},{},function(data){
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

  socket.on('Cleanup', function(data) {
    //the whole task is finished.
    //rm tempfiles and transmission tasks.
    console.log('Cleanup');
    sm.remove(__dirname+'/tempdata/'+data.filename);
    transmission.removeAll(cleanup[data.taskid]);
  });

  socket.on('disconnect', function(){
    console.log('disconnect');
  });

  /*
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
  */

  socket.on('finish', function(data){
    console.log(data);
  });

  //begin to share files to others
  socket.on('shareFile', function(data){
    var filepath = __dirname+data.dir;
    var parentpath = __dirname+data.path;
    var filename = path.basename(filepath);
    var stats = fs.statSync(filepath);
    var fileSizeInBytes = stats["size"];
    var fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
    //decide split into how many pieces
    if(fileSizeInMegabytes>config.data.chunksize){
      //it represents that the file should be splited into pieces for delivering.
	  //time record
	  if(!(filename in taskPara)){
	  	var temphash = {'connectedPeer':{}, 'sockets':[]};
		  taskPara[filename] = temphash;
	  }
	  var startTime = new Date().getTime();
	  taskPara[filename]['startTime'] = startTime;
      sm.split(config.data.chunksize,filepath,__dirname+'/tempdata/'+filename+'.');
	  var splitTime = new Date().getTime(); 
	  taskPara[filename]['splitTime'] = splitTime - startTime;
	  var sizearr = new Array();
      fs.readdir(__dirname+'/tempdata/', function(err, files) {
         files.filter(function(file) {
           return file.substr(0,file.lastIndexOf('.'))==filename 
         }).forEach(function(file,index,arr) {
				//save size info into sizearr in taskPara.
				var stats = fs.statSync(__dirname+'/tempdata/'+file);
				sizearr[index] = stats["size"] ;
              	CreateSeedSendTorrent(__dirname+'/tempdata/'+file,__dirname+'/tempdata/',data.group,data.user,data.sendername,true,filename,index,arr.length);
            });
		taskPara[filename]['sizearr'] = sizearr;
      });
    } else {
      CreateSeedSendTorrent(filepath,parentpath,data.group,data.user,false);
    }
  });

  //when receives torrents from others
  ss(socket).on('transmitTorrent', function(stream, data) {
    //socket.emit('finish', {hello:'world'});
    var callbackEmit = function(log){
      if(log.taskid in cleanup){
        cleanup[log.taskid].push(log.torrentid);
      } else {
        cleanup[log.taskid] = [log.torrentid];
      }
      socket.emit('finish', log, data.receivername);

      //notify clients
      if(log.length == log.index + 1){
        //Save the transmission information into database.
        //type:1 represents receiver
        var info = {type:1, viewed:0, userid:log.userid, target:log.sender, targetname:log.sendername, file:log.taskid, time:new Date().getTime()};
        db.insert('log', info);
      }
    }

    var parentdir = '/torrent/';
    var filename = __dirname + parentdir + data.name;
    stream.pipe(fs.createWriteStream(filename, {flags: 'w', encoding: 'binary', mode: 0666}));
    //start downloading...
    stream.on('end', function(){
        console.log('Streaming begins.');
        //socket.disconnect();
        if(data.split){
          if(data.id in torrentHash) {
              var arr = torrentHash[data.id];
              arr[data.index] = data;
          } else {
              var arr = new Array();
              arr[data.index]=data;
              torrentHash[data.id] = arr;
          }   
          if(data.index == 0){
              transmission.seedTorrentSeq(data.sender, data.sendername, data.receivername,filename, __dirname+'/tempdata/',data.id,data.index,torrentHash,callbackEmit);
          }else{
              socket.disconnect();
          }
        }else{
          transmission.seedTorrent(filename, __dirname+'/data/');
        }   
    }); 
  }); 


  ss(socket).on('transmitFile', function(stream, data) {
    var parentdir = '/data/received/'+data.sender+'/';
    fs.mkdir(__dirname+parentdir, function(){
      var filename = __dirname + parentdir + data.name;
      stream.pipe(fs.createWriteStream(filename, {flags: 'w', encoding: 'binary', mode: 0666}));
    });
  }); 
  //end of sockets
});

/**************************help functions*********************************/
function CreateSeedSendTorrent(filename,seedpath,group,sender,sendername,split,id,index,length){
  //create .torrent and seed it.
  crypto.randomBytes(8, function(ex, buf) {
    var torrentname = buf.toString('hex')+'.torrent';
    var torrentfile = __dirname+'/torrent/'+torrentname;
    transmission.createTorrent(filename, 100, torrentfile, config.data.tracker); //here
    //here the chunk size
    transmission.seedTorrent(torrentfile, seedpath, id, index, saveTorrentid);

	taskPara[id]['torrentTime'] = new Date().getTime() - taskPara[id]['startTime'] - taskPara[id]['splitTime'];
    //let's send it by websocket.
    db.find('groups', {groupname:group},{},function(datamember){
      for(var member in datamember[0].members){
        var memid = datamember[0].members[member];
        db.find('externalusers', {id:memid}, {}, function(dataip){
          //get the ip address
          var clientSocket = ioc.connect(dataip[0].ip+':2000', { 'connect timeout': 5000 , 'force new connection': true});
          clientSocket.on('connect',function(){
            //update taskPara['connectedPeer']
            if(memid in taskPara[id]['connectedPeer']){
              taskPara[id]['connectedPeer'][memid] = taskPara[id]['connectedPeer'][memid]+1;
            } else {
              taskPara[id]['connectedPeer'][memid] = 1;
            }
            var stream = ss.createStream();
            ss(clientSocket).emit('transmitTorrent', stream, {name: torrentname, sender:sender, sendername:sendername, receivername:memid, split:split,id:id,index:index,length:length});
            fs.createReadStream(torrentfile).pipe(stream);
          });
          clientSocket.on('finish',function(data, userid){
            //save to taskPara[id]['sockets']
            if(data.index == 0) {
              taskPara[data.taskid]['sockets'].push(clientSocket);
            }
            //log information from peers, c'est important.
            console.log(taskPara);
            if(!(data.taskid in taskTime)) {
              var tempHash = {};
              taskTime[data.taskid] = tempHash;
            }
            if(!(data.userid in taskTime[data.taskid])) {
              var tempArr = new Array();
              taskTime[data.taskid][data.userid] = tempArr;
            }
            taskTime[data.taskid][data.userid][data.index] = new Date().getTime()-taskPara[data.taskid]['startTime'] - taskPara[data.taskid]['splitTime'] - taskPara[data.taskid]['torrentTime']; 
            //console.log(taskTime[data.taskid][data.userid][data.index]);
            if(data.index+1==data.length) {
                //write to file
              logFinished(data.taskid, taskPara[data.taskid]['sizearr'], taskTime[data.taskid][data.userid], userid,taskPara[data.taskid]['splitTime'], taskPara[data.taskid]['torrentTime']);
              if('finishedPeer' in taskPara[data.taskid]){
                taskPara[data.taskid]['finishedPeer'].push(data.userid);
              } else {
                var finishedArr = new Array();
                finishedArr.push(data.userid);
                taskPara[data.taskid]['finishedPeer'] = finishedArr;
              }
              if(taskPara[data.taskid]['finishedPeer'].length==Object.keys(taskPara[data.taskid]['connectedPeer']).length){
                //it means that the entire task is finished.
                console.log('remove the transmission tasks and temp data');
                //remove the torrent from tranmission-daemon.
                transmission.removeAll(taskPara[data.taskid]['torrentid']);
                //remove the temp splited files
                sm.remove(__dirname+'/tempdata/'+data.taskid);
                //broadcast end message to all the peers
                for(index in taskPara[data.taskid]['sockets']){
                  taskPara[data.taskid]['sockets'][index].emit('Cleanup', {taskid:data.taskid, filename:data.taskid});
                }
              }
			      }
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

function logFinished(logname,sizeArr,timeArr,username,splitTime,torrentTime) {
  var outputString = getCurrentTime()+'\r\n';
  outputString = appendNewline(outputString, 'User ' + username + ' finished downloading file '+logname);
  outputString = appendNewline(outputString, 'Time consumption in splitting file: '+timeToStr(splitTime));
  outputString = appendNewline(outputString, 'Time consumption in creating torrents: '+timeToStr(torrentTime));

	var totalsize = 0;
	var totaltime = 0;
	for(var i=0; i<timeArr.length; i++) {
		var duration = timeArr[i];
		if(i!=0)
			duration = timeArr[i] - timeArr[i-1];
		var str = 'Piece '+ (i+1)+': '+sizeToStr(sizeArr[i])+'-----------'+timeToStr(duration);
    outputString = appendNewline(outputString, str);
		totalsize = totalsize + sizeArr[i];
		totaltime = totaltime + duration;
	}
	var str = 'Total size: '+ sizeToStr(totalsize)+'------------'+timeToStr(totaltime)+'\r\n';
  outputString = appendNewline(outputString, str);
	writeToLog(logname,outputString);
}

function writeToLog(logname, str) {
	fs.appendFile('log/'+logname, str+'\r\n', function(err) {
		if (err) throw err;
	}); 
}

function appendNewline(str, newline) {
  return str+newline+'\r\n';
}

function timeToStr(time) {
  return time/1000+'s';
}

function sizeToStr(size) {
  return size/1000000+'MB';  
}

function saveTorrentid(id, index, torrentid) {
		if(!('torrentid' in taskPara[id])) {
      var torrentidArr = new Array();
      torrentidArr[index] = torrentid;
      taskPara[id]['torrentid'] = torrentidArr;
    } else {
      taskPara[id]['torrentid'][index] = torrentid;
    }
    console.log(taskPara);
}

function getCurrentTime(){
  var currentdate = new Date(); 
  var datetime = "End Time: " + currentdate.getDate() + "/"
                  + (currentdate.getMonth()+1)  + "/" 
                  + currentdate.getFullYear() + " @ "  
                  + currentdate.getHours() + ":"  
                  + currentdate.getMinutes() + ":" 
                  + currentdate.getSeconds();
  return datetime;
}
