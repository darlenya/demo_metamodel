/* jslint node: true, esnext: true */
"use strict";

const Logger = require('./logger');


/**
 * The base Model parser
 * Parses the model and calls eventhandler
 */
class  ModelParser {

	constructor(opts) {
		if(!opts){
			opts = {};
		}

		if(opts.logger){
			this.logger = opts.logger;
		}else{
			this.logger = Logger;
		}

		this.event_handler = [];

		if(opts.event_handler){
			this.event_handler = opts.event_handler;
		}
	}


	/**
	 * Parses the model file. For each element all the handler are called.
	 * @public
	 * @param {object} model - The loaded model json
	 */
	printErrors(model) {
		this.event_handler[0].printErrors();
	}


	/**
	 * Parses the model file. For each element all the handler are called.
	 * @public
	 * @param {object} model - The loaded model json
	 */
	parse(model) {

		// ---------------------------------
		// Called for each existing object
		// ---------------------------------
		Object.keys(model).forEach((objectName)=>{
			this.event_handler.forEach((handler)=>{
				handler.initObject(objectName);
			});
		});

		// ---------------------------------
		// Called for each attribute of an object
		// ---------------------------------
		Object.keys(model).forEach((objectName)=>{
			const modelObject = model[objectName];

			if(modelObject.attributes){
				Object.keys(modelObject.attributes).forEach((attributeName)=>{
					let attrConfig = modelObject.attributes[attributeName];

					if(typeof(attrConfig)==='string'){
						attrConfig = {
							"type" : attrConfig
						}
					}

					this.event_handler.forEach((handler)=>{
						handler.handleAttribute(objectName, attributeName, attrConfig);
					});
				});
			}
		});


		// ---------------------------------
		// Called for each reference of an object
		// ---------------------------------
		Object.keys(model).forEach((objectName)=>{
			const modelObject = model[objectName];

			if(modelObject.references){
				Object.keys(modelObject.references).forEach((referenceName)=>{
					let refConfig = modelObject.references[referenceName];

					if(typeof(refConfig)==='string'){
						refConfig = {
							"target" : refConfig
						}
					}

					this.event_handler.forEach((handler)=>{
						handler.handleReference(objectName, referenceName, refConfig);
					});
				});
			}
		});


	}


}

module.exports.modelParserFactory = function (options) {
	return new ModelParser(options);
};
module.exports.ModelParser = ModelParser;
