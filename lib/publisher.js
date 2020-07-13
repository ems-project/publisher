"use strict";

const fs = require('fs');
const path = require("path");
const archiver = require('archiver');
const sha1File = require("sha1-file");
const globby = require('globby');
const axios = require('axios');

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

function publishZip(options)
{
    const emsAPI = axios.create({
        baseURL: options.ems_url,
        headers: {'X-Auth-Token': options.ems_token},
        maxContentLength: Infinity
    });
    const hash = sha1File.sync(options.filename);
    const size = fs.statSync(options.filename)['size'];
    const type = 'application/zip';

    const emsID = options.ems_id.split(':');
    const contentType = emsID.shift();
    const ouuid = emsID.shift();

    const merge = {};
    merge[options.field] = {
        filename: options.filename,
        filesize: size,
        mimetype: type,
        sha1: hash
    };

    emsAPI
        .post('/api/file/init-upload/' + hash + '/' + size, { name: options.filename, type: type})
        .then(function (response) {
            let available = response.data.available || false;

            if (available) {
                console.log('Zip ('+ hash +') already exists!');
                _mergeFinalize(emsAPI, contentType, ouuid, merge);
            } else {
                emsAPI.post('/api/file/upload-chunk/' + hash, fs.readFileSync(options.filename), {
                    'headers': {'Content-Type': type}
                }).then(function (response) {
                    if (response.data.available === true) {
                        console.log('Uploaded zip (' + hash + ')');

                        _mergeFinalize(emsAPI, contentType, ouuid, merge);
                    }
                });
            }
    });
}

function _mergeFinalize(emsAPI, contentType, ouuid, merge)
{
    emsAPI
        .post('/api/data/'+ contentType +'/merge/' + ouuid, merge)
        .then(function (response) {
            let revisionId =  response.data.revision_id;
            console.log('created draft for revision: ' + revisionId);

            emsAPI
                .post('/api/data/'+ contentType +'/finalize/' + revisionId)
                .then(function (response) {
                    console.log('Published finalized!');
                });
        });
}

module.exports.createZip = createZip;
module.exports.publishZip = publishZip;

