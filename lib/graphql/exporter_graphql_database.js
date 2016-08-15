/* jslint node: true, esnext: true */
"use strict";

const GraphQlBase = require('./exporter_graphql_base').ExporterGraphqlBase;


// The name of the field storing the unique ids for each record
const ID_FIELD_NAME = "__id_unique";

/**
 * Creates the graphql schema file.
 */

/**
 * The base Model parser
 * Parses the model and calls eventhandler
 */
class ExporterGraphqlDatabase extends GraphQlBase{

	constructor(opts) {
		super(opts);
	}
	/**
	 * Writes the model as defined by this exporter.
	 * The model has the format as created by the appropriate event handler
	 * @public
	 * @param {object} model - The model to be exported
	 */
	write(model){
		const fileName = this.fileName;
		console.log(`Export the model as file '${fileName}'`);

		this.logger.info(`Read template '${templateFile}'`);
		let templateFileContent = fs.readFileSync(templateFile, {encoding: 'utf-8'});

		// Build the obejcts
		this._buildObjects(model);

		const fileContent = this._buildFile(model, templateFileContent);

		fs.writeFileSync(fileName, fileContent);
	}

	/**
	 * Builds the schema.js content from the model and the template fil
	 * @protected
	 * @param {object} model - The model to be exported
	 * @param {string} templateFileContent - The template file content read from the template file
	 */
	_buildFile(model, templateFileContent){
		// TODO

		return templateFileContent;
	}


}

module.exports.exporterGraphqlDatabaseFactory = function (options) {
	return new ExporterGraphqlDatabase(options);
};
module.exports.ExporterGraphqlDatabase = ExporterGraphqlDatabase;
