var Transmission = require('transmission')
var ProgressBar = require('progress');
var sys = require('sys')
var exec = require('child_process').exec;
var sh = require('execSync');

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

function watch(id) {
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

                        if (torrent.sizeWhenDone == torrent.downloadedEver) {
                                return remove(id)
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
                console.log('torrent was removed')
        })
}

function seedTorrent(torrent, dir) {
  transmission.add(torrent, {
    "download-dir": dir
  }, function(err, result) {
          if (err) {
                  return console.log(err)
          }
          var id = result.id
          //watch(id)
  })
}

function createTorrent(dir, piecesize, name, tracker, callback) {
  var code = sh.run('transmission-create'+' -o '+name+' -t '+tracker+' -s '+piecesize+' '+dir);
  console.log(code);
}
exports.seedTorrent = seedTorrent;
exports.remove = remove;
exports.createTorrent = createTorrent;
