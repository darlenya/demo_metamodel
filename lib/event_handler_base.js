/* jslint node: true, esnext: true */
"use strict";

/**
 * The base Model parser
 * Parses the model and calls eventhandler
 */
class  EventHandlerBase {

	constructor(opts) {
		if(!opts){
			opts = {};
		}

		if(opts.logger){
			this.logger = opts.logger;
		}else{
			console.error("No logger defined in constructor of 'EventHandler'");
		}

		// the model created by this handler
		this.model = {};
	}


	/**
	 * initializes a new object
	 * @param {string} objectName - The name of the object to be created
	 */
	initObject(objectName) {
		if(!objectName){
			this.logger.error(`No Object Name defined for 'initObject'`);
		}else{
			this.logger.debug(`Init Object ${objectName}`);

			this.model[objectName] = {};
		}
	}

	/**
	 * Handles the creation of an attribute for an object
	 * @param {string} objectName - The name of the object to be created
	 * @param {string} attributeName - The name of the attribute to be created for this object
	 * @param {object} attrConfig - The configuration of this attribute
	 */
	handleAttribute(objectName, attributeName, attrConfig){
		if(!objectName){
			this.logger.error(`No object name defined for 'handleAttribute'`);
		}
		if(!attributeName){
			this.logger.error(`No attribute name defined for 'handleAttribute' in object '${objectName}'`);
		}
		if(!attrConfig){
			this.logger.error(`No attribute config defined for 'handleAttribute' in object '${objectName}'->'${attributeName}'`);
		}

		if(objectName && attributeName && attrConfig){
			this.logger.debug(`Handle attribute '${objectName}'->'${attributeName}'`);
		}
	}

	/**
	 * Handles the creation of a reference for an object
	 * @param {string} objectName - The name of the object to be created
	 * @param {string} referenceName - The name of the reference to be created for this object
	 * @param {object} refConfig - The configuration of this reference
	 */
	handleReference(objectName, referenceName, refConfig){
		if(!objectName){
			this.logger.error(`No object name defined for 'handleReference'`);
		}
		if(!referenceName){
			this.logger.error(`No reference name defined for 'handleReference' in object '${objectName}'`);
		}
		if(!refConfig){
			this.logger.error(`No reference config defined for 'handleReference' in object '${objectName}'->'${referenceName}'`);
		}

		if(objectName && referenceName && refConfig){
			this.logger.debug(`Handle reference '${objectName}'->'${referenceName}'`);
		}

	}


}

module.exports.eventHandlerBaseFactory = function (options) {
	return new EventHandlerBase(options);
};
module.exports.EventHandlerBase = EventHandlerBase;
