/* jslint node: true, esnext: true */
"use strict";

const mkdirp = require('mkdirp');
const path = require('path');
const fs = require('fs');
const LoggerClass = require('./logger');
const logger = new LoggerClass();



// The directory for the generated data
const targetDir = path.join(__dirname, '../tests/volatile/result');
prepareDir(targetDir);



// get all the file names
const metaModelFile = path.join(__dirname, '../tests/fixtures/demo_model.json');
const schemaFile = path.join(targetDir, 'schema.js');
const tdgConfig = path.join(targetDir, 'tdg_model.js');

const metaModelContent = fs.readFileSync(metaModelFile);
const metaModel = JSON.parse(metaModelContent);


const templateGraphQl = path.join(__dirname, './template_graphql.js');
const eventHandlerGraphQl = require('./event_handler_graphql').eventHandlerGraphQlFactory({logger:logger, template:templateGraphQl});


const options = {
	"event_handler": [eventHandlerGraphQl]
};


// This would be const gdg = require('graph-data-generator');
const modelParser = require('./model_parser_base').modelParserFactory(options);
modelParser.parse(metaModel);
modelParser.printErrors();


//console.log(eventHandlerGraphQl._buildFile());

/**
 * create the directory if missing
 */
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
