var Transmission = require('transmission')
var ProgressBar = require('progress');
var sys = require('sys')
var exec = require('child_process').exec;
var sh = require('execSync');
var sm = require('./splitmerge.js');

function puts(error, stdout, stderr) { sys.puts(stdout) }

var transmission = new Transmission({
        port : 9091,
        host : '127.0.0.1'
})

function get(id, cb) {
        transmission.get(id, function(err, result) {
                if (err) {
                        throw err
                }
                cb(null, result.torrents[0])
        })
}

function watch(sender, sendername, receiver, id, hashid, index, torrentHash, callback) {
        get(id, function(err, torrent) {
                if (err) {
                        throw err
                }
                var downloadedEver = 0
                var WatchBar = new ProgressBar('  downloading [:bar] :percent :etas', {
                        complete : '=',
                        incomplete : ' ',
                        width : 35,
                        total : torrent.sizeWhenDone
                })

                function tick(err, torrent) {
                        if (err) {
                                throw err
                        }
                        var downloaded = torrent.downloadedEver - downloadedEver
                        downloadedEver = torrent.downloadedEver
                        WatchBar.tick(downloaded);

                        //finish one piece.
                        if (torrent.sizeWhenDone == torrent.downloadedEver) {
                                var arr = torrentHash[hashid];
                                //finish one file
                                if(arr.length==index+1){
                                    //merge the file
                                    sm.merge(__dirname+'/tempdata/'+hashid, __dirname+'/data/received/'+sendername, hashid);
                                    //consider whether delete record in torrentHash
                                    console.log('finished');
                                } else {
                                    var data = arr[index+1];
                                    seedTorrentSeq(sender, sendername, receiver, __dirname+'/torrent/'+data.name,__dirname+'/tempdata/', hashid, index+1, torrentHash,callback);
                                }
								//callback to emit meesage, indicating finishing one piece. 
								callback({userid:receiver, sender:sender, sendername:sendername, taskid:hashid,length:arr.length,index:index,torrentid:id});
                                return;
                                //return remove(id)
                        }
                        setTimeout(function() {
                                get(id, tick)
                        }, 1000)
                }

                get(id, tick)
        })
}

function remove(id) {
        transmission.remove(id, function(err) {
                if (err) {
                        throw err
                }
                console.log('torrent was removed');
        })
}

function removeAll(arr) {
  console.log(arr);
  for(var i=0; i<arr.length; i++){
    remove(arr[i]);
  }
}

//downloading
function seedTorrentSeq(sender, sendername, receiver, torrent, dir, hashid, index, torrentHash, callback) {
  transmission.add(torrent, {
    "download-dir": dir
  }, function(err, result) {
          if (err) {
                  return console.log(err)
          }
          var id = result.id;
          watch(sender, sendername, receiver, id,hashid,index,torrentHash,callback);
  })
}

//uploading
function seedTorrent(torrent, dir, taskid, index, callback) {
  transmission.add(torrent, {
    "download-dir": dir
  }, function(err, result) {
          if (err) {
                  return console.log(err)
          }
          callback(taskid, index, result.id);
  })
}

function createTorrent(dir, piecesize, name, tracker) {
  var code = sh.run('transmission-create'+' -o '+name+' -t '+tracker+' -s '+piecesize+' '+dir);
  console.log(code);
}
exports.seedTorrent = seedTorrent;
exports.seedTorrentSeq = seedTorrentSeq;
exports.remove = remove;
exports.removeAll = removeAll;
exports.createTorrent = createTorrent;

