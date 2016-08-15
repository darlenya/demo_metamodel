/* jslint node: true, esnext: true */
"use strict";


/**
 * The base Model parser
 * Parses the model and calls eventhandler
 */
class Gumbo {

	constructor(opts) {
		this.definition = {};
		this.dependencies = {};
		this.dependencies.use = {};
		this.dependencies.used_by = {};
		this.referenceTypes = {};
	}



	/**
	 * Create the order in which the objects needs to be printed
	 * @param {string} sourceObject - The name of the source object
	 * @param {string} targetObject - The name of the refernced object
	 */
	_createObjectPrintOrder(){
		const order = [];
		let allObjectNames = Object.keys(this.definition);

		let lastLength = allObjectNames.length;
		while(allObjectNames.length > 0){
			const newAllObject = [];

			allObjectNames.forEach((name)=>{
				if(this.dependencies.use[name] === undefined){
					// This object has no dependencies. So it could be printed
					order.push(name);

					// now remove this element from all the references
					Object.keys(this.dependencies.use).forEach((objectName)=>{
						Object.keys(this.dependencies.use[objectName]).forEach((usedObject)=>{
							if(usedObject === name){
								delete this.dependencies.use[objectName][usedObject] ;
							}
						})

						if(Object.keys(this.dependencies.use[objectName]).length === 0){
							// This object has now NO references any more
							delete this.dependencies.use[objectName] ;
						}

					})
				}else{
					newAllObject.push(name);
				}
			});
			allObjectNames = newAllObject;

			if(lastLength === allObjectNames.length){
				// no new object could be assigned in this iteration:
				const message = [];
				message.push("----------------------------------");
				message.push("These objects are done:");
				message.push("  "+order.join("\n  "));
				message.push("-----------");
				message.push("These objects could not be ordered:");
				message.push("  "+allObjectNames.join("\n  "));
				message.push("----------------------------------");
				throw new Error(`Cyclic refernces detected. Could not process all objects:\n`+message.join("\n"));
			}else{
				lastLength = allObjectNames.length;
			}
		}
		return order;
	}

	/**
	 * Create the dependencies.
	 * Stores for each object which objects it needs and vice versa
	 * where id is needed.
	 * @param {string} sourceObject - The name of the source object
	 * @param {string} targetObject - The name of the refernced object
	 */
	_createDependency(sourceObject, targetObject){
		if(this.dependencies.use[sourceObject] === undefined){
			this.dependencies.use[sourceObject] = {};
		}
		const use = this.dependencies.use[sourceObject];
		if(use[targetObject] === undefined){
			use[targetObject] = 1;
		}
	}

}

const ALL_OBJECTS = [
	'application',
	'entitlement',
	'account',
	'identity',
	'role',
	'Application admin'
]

const DEPENDENCIES = [
	['application', 'entitlement'],
	['application', 'account'],
	['account', 'entitlement'],
	['account', 'identity'],
	['role', 'role'],
	['role', 'entitlement'],
	['application admin', 'application'],
	['application admin', 'identity'],
	['account', 'role']
]


const gumbo = new Gumbo();
ALL_OBJECTS.forEach((obj)=>{
	gumbo.definition[obj] = {};
});

DEPENDENCIES.forEach((dep)=>{
	gumbo._createDependency(...dep);
});


console.log(gumbo._createObjectPrintOrder());
