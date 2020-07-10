"use strict";

const fs = require('fs');
const path = require("path");
const archiver = require('archiver');
const sha1File = require("sha1-file");
const globby = require('globby');

function createZip(filename, globs, callback)
{
    let output = fs.createWriteStream(filename);
    let archive = archiver('zip', {
        zlib: { level: 9 }
    });

    output.on('close', function() {
        let hash = sha1File.sync(filename);
        let size = fs.statSync(filename).size;
        callback(hash, size);
    });
    archive.pipe(output);

    (async () => {
        let patterns = globs.concat(['!'+filename]);
        console.log('Searching for files: ' + patterns)
        const paths = await globby(patterns, {
            gitignore: true
        });
        console.log('Found '+ paths.length +' files')
        paths.sort(); //important otherwise the hash will change!!!

        for(let i = 0; i < paths.length;i++){
            let dirname = path.dirname(paths[i]);
            let stats = fs.statSync(paths[i]);

            archive.append(fs.createReadStream(paths[i]), {
                'name': path.basename(paths[i]),
                'prefix': dirname !== '.' ? dirname : null,
                // modification date can we different but the content the same so it creates a different zip/hash
                'date': new Date(0),
                'stats': stats
            });
        }
        archive.finalize();
    })();
}

module.exports.createZip = createZip;

