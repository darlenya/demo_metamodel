/* jslint node: true, esnext: true */
"use strict";

const VALID_ATTRIBUTE_TYPES = {
	"string" : "Just a string",
	"date" : "A date time representation",
	"boolean" : "A boolean value",
	"number" : "Any valid number"
}



/**
 * The base Model parser
 * Parses the model and calls eventhandler
 */
class  EventHandlerBase {

	constructor(opts) {
		if(!opts){
			opts = {};
		}

		// you could define your own logger in th config
		if(opts.logger){
			this.logger = opts.logger;
		}else{
			console.error("No logger defined in constructor of 'EventHandler'");
		}

		// define you own valid attributes
		if(opts.valid_attribute_types){
			this.valid_attribute_types = opts.valid_attribute_types;
		}else{
			this.valid_attribute_types = VALID_ATTRIBUTE_TYPES;
		}

		// the model created by this handler
		this.model = {};

		// stores all the errors created while parsing
		this.errors = {};
	}


	/**
	 * initializes a new object
	 * @public
	 * @param {string} objectName - The name of the object to be created
	 */
	initObject(objectName) {
		if(!objectName){
			handleError(objectName, 'initObject', '-', "No Object Name defined")
		}else{
			this.logger.debug(`Init Object ${objectName}`);

			this.model[objectName] = {};
		}
	}

	/**
	 * Handles the creation of an attribute for an object
	 * @public
	 * @param {string} objectName - The name of the object to be created
	 * @param {string} attributeName - The name of the attribute to be created for this object
	 * @param {object} attrConfig - The configuration of this attribute
	 */
	handleAttribute(objectName, attributeName, attrConfig){
		if(!objectName){
			handleError(objectName, 'handleAttribute', '-', "No Object Name defined")
		}
		if(!attributeName){
			handleError(objectName, 'handleAttribute', '-', "No attribute Name defined")
		}
		if(!attrConfig){
			handleError(objectName, 'attribute', attributeName, "No attribute config defined")
		}

		if(objectName && attributeName && attrConfig){
			this.logger.debug(`Handle attribute '${objectName}'->'${attributeName}'`);
		}
	}

	/**
	 * Handles the creation of a reference for an object
	 * @public
	 * @param {string} objectName - The name of the object to be created
	 * @param {string} referenceName - The name of the reference to be created for this object
	 * @param {object} refConfig - The configuration of this reference
	 */
	handleReference(objectName, referenceName, refConfig){
		if(!objectName){
			handleError(objectName, 'handleReference', '-', "No Object Name defined")
		}
		if(!attributeName){
			handleError(objectName, 'handleReference', '-', "No reference Name defined")
		}
		if(!attrConfig){
			handleError(objectName, 'reference', attributeName, "No reference config defined")
		}

		if(objectName && referenceName && refConfig){
			this.logger.debug(`Handle reference '${objectName}'->'${referenceName}'`);
		}
	}


	validateAttributeType(objectName, attributeName, attrConfig){
		if(! attrConfig.type){
			attrConfig.type = "string";
		}else{
			if(this.valid_attribute_types[attrConfig.type] === undefined){
				this.logger.error(`The attribute type '${attrConfig.type}' is not valid! In '${objectName}'->'${attributeName}'`);
			}
		}
	}

	/**
	 * Hadles an error created while parsing the model
	 * @protected
	 * @param {string} objectName - The name of the object to be created
	 * @param {string} type - The type of the object. For example 'attribute'.
	 * @param {string} name - The name of the part in the object. For example 'email' while working on an attribute
	 */
	handleError(objectName, type, name, message){
		if(!objectName){
			objectName = '__UNKNOWN_OBJECTS__';
		}

		if(! this.errors[objectName]){
			this.errors[objectName] = {};
		}

		if(! this.errors[objectName][type]){
			this.errors[objectName][type] = {};
		}

		if(! this.errors[objectName][type][name]){
			this.errors[objectName][type][name] = [];
		}

		this.errors[objectName][type][name].push(message);
	}

	/**
	 * print all detected errors
	 * @public
	 */
	printErrors(){
		if(!this.isValid()){
			const errorPrint = [];

			Object.keys(this.errors).forEach((objectName)=>{
				errorPrint.push(objectName);

				Object.keys(this.errors[objectName]).forEach((type)=>{
					errorPrint.push("\t"+type);

					Object.keys(this.errors[objectName][type]).forEach((name)=>{
						errorPrint.push("\t\t"+name);

						this.errors[objectName][type][name].forEach((message) => {
							errorPrint.push("\t\t\t"+message);
						});
						
					});
				});
			});

			this.logger.error("The following errors where detected:\n"+errorPrint.join("\n"));
		}
	}

	/**
	 * Returns the status of parsing the model
	 * @public
	 * @returns {boolean} True if there where no errors detected
	 */
	isValid(){
		if(Object.keys(this.error).length > 0){
			return false;
		}else{
			return true;
		}
	}
}

module.exports.eventHandlerBaseFactory = function (options) {
	return new EventHandlerBase(options);
};
module.exports.EventHandlerBase = EventHandlerBase;
