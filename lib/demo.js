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

// -------------------------------
// Common
// -------------------------------
const metaModelFile = path.join(__dirname, '../tests/fixtures/demo_model.json');
const metaModelContent = fs.readFileSync(metaModelFile);
const metaModel = JSON.parse(metaModelContent);

// -------------------------------
// GraphQL
// -------------------------------
const schemaFile = path.join(targetDir, 'schema.js');
const templateGraphQl = path.join(__dirname, './graphql/template_graphql_schema.js');
const eventHandlerGraphQl = require('./graphql/event_handler_graphql').eventHandlerGraphQlFactory({logger:logger});
const exporterGraphQl = require('./graphql/exporter_graphql_schema').exporterGraphqlSchemaFactory({logger:logger, template:templateGraphQl, fileName:schemaFile});

// -------------------------------
// TDG
// -------------------------------
const tdgConfig = path.join(targetDir, 'tdg_model.js');
const eventHandlerTdgImport = require('./tdg/event_handler_tdg_import').eventHandlerTdgImportFactory({logger:logger, iterations:1});
const eventHandlerTdgExport = require('./tdg/event_handler_tdg_export').eventHandlerTdgExportFactory({logger:logger});

// -------------------------------
// Run
// -------------------------------

const options = {
	//"event_handler": [eventHandlerGraphQl,eventHandlerTdgImport, eventHandlerTdgExport]
	"event_handler": [eventHandlerGraphQl]
};

const modelParser = require('./model_parser_base').modelParserFactory(options);
modelParser.parse(metaModel);
modelParser.printErrors();

// -------------------------------
// Export GraphQL
// -------------------------------
exporterGraphQl.write(eventHandlerGraphQl.getModel());

//console.log(eventHandlerGraphQl._buildFile());

//console.log(eventHandlerTdg.getConfig(2));

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
