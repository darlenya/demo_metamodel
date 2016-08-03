/* jslint node: true, esnext: true */
"use strict";

const mkdirp = require('mkdirp');
const path = require('path');
const fs = require('path');
const Logger = require('./logger');



// The directory for the generated data
const targetDir = path.join(__dirname, '../tests/volatile/result');
prepareDir(targetDir);



// get all the file names
const metaModelFile = path.join(__dirname, '../tests/fixtures/demo_model.json');
const schemaFile = path.join(targetDir, 'schema.js');
const tdgConfig = path.join(targetDir, 'tdg_model.js');

const metaModel = JSON.parse(metaModelFile);

const eventHandlerBase = require('./event_handler_base').eventHandlerBaseFactory({logger:Logger});


const options = {
	"event_handler": [eventHandlerBase]
};


// This would be const gdg = require('graph-data-generator');
const modelParser = require('./model_parser_base').modelParserFactory(options);
modelParser.parse(metaModel);
modelParser.printErrors();


function prepareDir(dir) {
	// Create the target directory if it does not exists
	let stats;
	try {
		stats = fs.lstatSync(dir);
	} catch (err) {
		// do nothing
	}

	if (!stats) {
		// the path does not exists, create it
		mkdirp.sync(dir);
	} else {
		if (!stats.isDirectory()) {
			throw `The given directory '${dir}' is not a directory`;
		}
	}

}
