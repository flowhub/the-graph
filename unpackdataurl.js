
var buffer = require('buffer');
var fs = require('fs');

function unpack(dataurl) { 
    if (dataurl.indexOf('data:') != 0) {
        throw new Error('Dataurl must start with data');
    }
    var mimetype = dataurl.substring(dataurl.indexOf(':'), dataurl.indexOf(';'));
    var encoding = dataurl.substring(dataurl.indexOf(';')+1, dataurl.indexOf(',')); 
    if (encoding != 'base64') {
        throw new Error('Dataurl must have base64 encoding, got ' + encoding);
    }
    
    var encoded = dataurl.substring(dataurl.indexOf(','), dataurl.length);
    var raw = buffer.Buffer.from(encoded, 'base64');
    return raw;
}

function main() {
    var callback = function(err) { 
        if (err) {
            throw err
        }
        process.exit(0);
    };

    fs.readFile('out.png.dataurl', 'utf-8', function(err, d){
        d = d.replace('"', '');
        if (err) { return callback(err); }
        var out = unpack(d);
        fs.writeFile('out.png', out, function(err) {
            return callback(err);
        });
    })
}

if (!module.parent) {
    main();
}
