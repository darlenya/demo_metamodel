/* jslint node: true, esnext: true */
"use strict";

const changeCase = require('change-case');
const fs = require('fs');

const Base = require('../event_handler_base').EventHandlerBase;


/**
 * This handler creates the configuration to create the test data for this model
 */
class EventHandlerTdgImport extends Base{

	constructor(opts) {
		super(opts);

		if(this.annotation === undefined){
			this.annotation = 'tdg';
		}

		// defines for how many iterations the data should be created
		if(opts.iterations === undefined){
			this.iterations = 1;
		}else{
			this.iterations = opts.iterations;
		}
	}

	/**
	 * initializes a new object
	 * @public
	 * @param {string} objectName - The name of the object to be created
	 * @param {object} config - The complete configuration of this object
	 */
	initObject(objectName, config) {
		super.initObject(objectName, config);

		if(this.model.vertices === undefined){
			// This is the first call

			this.model.vertices = {};
			this.model.edges = {};
			this.model.time_shift = {
				"iterations" : this.iterations
			}
		}

		this.model.vertices[objectName] = {};
	}

	/**
	 * Handles the creation of an attribute for an object
	 * @public
	 * @param {string} objectName - The name of the object to be created
	 * @param {string} attributeName - The name of the attribute to be created for this object
	 * @param {object} attrConfig - The configuration of this attribute
	 */
	handleAttribute(objectName, attributeName, attrConfig) {
		super.handleAttribute(objectName, attributeName, attrConfig);
	}

	/**
	 * Handles the creation of a reference for an object
	 * @public
	 * @param {string} objectName - The name of the object to be created
	 * @param {string} referenceName - The name of the reference to be created for this object
	 * @param {object} refConfig - The configuration of this reference
	 */
	handleReference(objectName, referenceName, refConfig) {
		super.handleReference(objectName, referenceName, refConfig);
	}


}




module.exports.eventHandlerTdgImportFactory = function (options) {
	return new EventHandlerTdgImport(options);
};
module.exports.EventHandlerTdgImport = EventHandlerTdgImport;
