var sh = require('execSync');
var fs = require('fs');

function split(chunksize, file, output){
  sh.run('split -b'+chunksize+'m -d '+file+' '+output);
}

function merge(input, parentdir, file){
  fs.mkdir(parentdir, function(){
    var filepath = parentdir+'/'+file;
    sh.run('cat '+input+'.* > '+filepath);
  });
}

function remove(path){
  sh.run('rm '+path+'.*');
}

exports.merge=merge;
exports.split=split;
exports.remove=remove;
