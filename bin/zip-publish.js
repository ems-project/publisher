#!/usr/bin/env node

const dontenv = require('dotenv');
const publisher = require("../lib/publisher.js");

const argv = require("yargs")
    .usage("\nUsage: ems-zip-publish")
    .command('ems-publish [emsId]', 'emsId (contentType:ouuid)')
    .option('filename', {type: 'string', desc: 'Filename zip' }).default('filename', 'publish.zip')
    .option('field', {type: 'string', desc: 'Field name' }).default('field', 'zip_file')
    .demandCommand(1)
    .argv;

dontenv.config();
const EMS_URL = process.env.EMS_URL || false;
const EMS_TOKEN = process.env.EMS_TOKEN || false;

if (EMS_URL === false) {
    throw Error('Please define the ENV variable EMS_URL');
}
if (EMS_TOKEN === false) {
    throw Error('Please define the ENV variable EMS_TOKEN');
}

publisher.publishZip({
    'ems_url': EMS_URL,
    'ems_token': EMS_TOKEN,
    'ems_id': argv._.shift(),
    'filename': argv.filename,
    'field': argv.field
});


