#!/usr/bin/env node

const publisher = require("../lib/publisher.js");

const argv = require("yargs")
    .usage("\nUsage: ems-zip-create")
    .option('filename', {type: 'string', desc: 'Filename zip' }).default('filename', 'publish.zip')
    .option('globs', { type: 'array', desc: 'glob patterns)'}).default('globs', ['**'])
    .argv;

publisher.createZip(argv.filename, argv.globs, function(hash, size) {
    console.log('Zip created [hash: '+ hash +', size: '+ size +']');
});
