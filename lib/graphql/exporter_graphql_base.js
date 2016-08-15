/* jslint node: true, esnext: true */
"use strict";

const changeCase = require('change-case');
const fs = require('fs');


// The name of the field storing the unique ids for each record
const ID_FIELD_NAME = "__id_unique";

/**
 * The base class for the GraphQL exporter
 */

/**
 * The base Model parser
 * Parses the model and calls eventhandler
 */
class ExporterGraphqlBase {

	constructor(opts) {
		if (!opts) {
			opts = {};
		}

		if(opts.annotation !== undefined){
			this.annotation = opts.annotation;
		}else{
			this.annotation = 'graphql';
		}


		if(opts.template === undefined){
			throw new Error("No template file name given");
		}else{
			this.template = opts.template;
		}

		// you could define your own logger in th config
		if (opts.logger) {
			this.logger = opts.logger;
		} else {
			console.error("No logger defined in constructor of 'EventHandler'");
		}

		if(opts.fileName === undefined){
			throw new Error("No export file name given");
		}else{
			this.fileName = opts.fileName;
		}

		// Stores the generated class strings by there name
		// definition->objectName.attributes.attributeName = attributeCreationString
		// definition->objectName.string = objectCreationString
		// definition->objectName.connection = connectionToThisObject
		// definition->objectName.dependencies = [objName1, ..n]
		// definition->objectName.name_class = className
		// definition->objectName.name_type = typeName
		this.definition = {};

		// stores the object dependencies.
		// On the root level are all the objects without dependencies.
		// dependencies.[source] = [targets]
		this.dependencies = {};

	}


	/**
	 * Writes the model as defined by this exporter.
	 * The model has the format as created by the appropriate event handler
	 * @public
	 * @param {object} model - The model to be exported
	 */
	write(model){
		const fileName = this.fileName;
		const templateFile = this.template;
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
		throw new Error("Implement this function");
	}


	/**
	 * Creates the objects for the schema and stores them into
	 * 'this.definition'
	 * @protected
	 * @param {object} model - The model to be exported
	 * @returns {string} The creation string for all the objects
	 */
	_buildObjects(model){
		Object.keys(model).forEach((objectName) => {
			this._buildObject(model, objectName);
			this._buildAttributes(model, objectName, "    ");
			this._buildReferences(model, objectName, "    ");
		});
	}


	/**
	 * Creates a single object and stores it under 'this.classes'
	 * @protected
	 * @param {object} model - The model to be exported
	 * @param {string} objectName - The name of the object to build the fields for
	 * @returns {string} The string used to replace the placeholder in the template
	 */
	_buildObject(model, objectName){
		const objNameType = changeCase.camelCase(objectName);
		const objNameClass = changeCase.pascalCase(objectName);

		if(this.definition[objectName] === undefined){
			this.definition[objectName] = {};
		}
		this.definition[objectName].name_class = objNameClass;
		this.definition[objectName].name_type = objNameType;

		// create object frame. With a placeholder for the fields
		const lines = [];
		lines.push(`const ${objNameType} = new GraphQLObjectType({`);
		lines.push(`  name: '${objNameClass}',`);
		lines.push(`  description : '${model[objectName].description}',`);
		lines.push(`  fields: () => ({`)
		lines.push(`__ATTRIBUTES__`);
		lines.push(`  }),`);
		lines.push(`  interfaces: [nodeInterface]`);
		lines.push(`});`);

		this.definition[objectName].string = lines.join("\n")+"\n";
	}

	/**
	 * Creates the attributes of an object
	 * @protected
	 * @param {object} model - The model to be exported
	 * @param {string} objectName - The name of the object to build the fields for
	 * @param {string} indent - A string used for indention
	 */
	_buildAttributes(model, objectName, indent){
		const objNameClass = this.definition[objectName].name_class;
		const attributes = model[objectName].attributes;

		// every object has at least one id attribute
		this.definition[objectName].attributes = {};
		this.definition[objectName].attributes.id = indent+`id: globalIdField('${objNameClass}', (obj, context, info) => obj.${ID_FIELD_NAME})`;
		if(attributes !== undefined){
			Object.keys(attributes).forEach((attributeName) => {
				this._buildAttribute(objectName, attributeName, attributes[attributeName], indent);
			});
		}
	}

	/**
	 * Creates the references of an object
	 * @protected
	 * @param {object} model - The model to be exported
	 * @param {string} objectName - The name of the object to build the fields for
	 * @param {string} indent - A string used for indention
	 */
	_buildReferences(model, objectName, indent){
		const references = model[objectName].references;

		if(references !== undefined){
			// There are existing references
			Object.keys(references).forEach((referenceName) => {
				this._buildReference(objectName, referenceName, references[referenceName], indent);
			});
		}
	}


	/**
	 * Create the order in which the objects needs to be printed
	 * @param {string} sourceObject - The name of the source object
	 * @param {string} targetObject - The name of the refernced object
	 * @returns {array} The list of objects in the order to print
	 */
	_createObjectPrintOrder(){
		const order = [];
		let allObjectNames = Object.keys(this.definition);

		let lastLength = allObjectNames.length;
		while(allObjectNames.length > 0){
			const newAllObject = [];

			allObjectNames.forEach((name)=>{
				if(this.dependencies[name] === undefined){
					// This object has no dependencies. So it could be printed
					order.push(name);

					// now remove this element from all the references
					Object.keys(this.dependencies).forEach((objectName)=>{
						Object.keys(this.dependencies[objectName]).forEach((usedObject)=>{
							if(usedObject === name){
								delete this.dependencies[objectName][usedObject] ;
							}
						})

						if(Object.keys(this.dependencies[objectName]).length === 0){
							// This object has now NO references any more
							delete this.dependencies[objectName] ;
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
		if(this.dependencies[sourceObject] === undefined){
			this.dependencies[sourceObject] = {};
		}
		const use = this.dependencies[sourceObject];
		if(use[targetObject] === undefined){
			use[targetObject] = 1;
		}
	}

 /**
 	 * Creates a single reference of an object
 	 * @protected
 	 * @param {string} objectName - The name of the object to build the fields for
 	 * @param {string} referenceName - The name of the reference to be created
 	 * @param {object} config - The configuration of this attribute
 	 * @param {string} indent - A string used for indention
 	 */
	_buildReference(objectName, referenceName, config, indent){
		let desc = config.description;
		if(desc === undefined){
			desc = "";
		}

		// get the annotations of the config
		const annotation = config.annotations[this.getAnnotationName()];

		const lines =[];

		// The referenced object
		const target = config.target;

		this._createDependency(objectName, target);

		if(annotation.upper_bound === 1){
			// this is not a real reference it is an attribute of the given type
			lines.push(indent+`${referenceName}: {`);
			lines.push(indent+`  type: ${target},`);
			lines.push(indent+`  description: '${desc}'`);
			lines.push(indent+`}`);
		}else{
			// This is a refernce
			if(annotation.refernce_type === 'list'){
				// Just a list of the type
				lines.push(indent+`${referenceName}: {`);
				lines.push(indent+`  type: new GraphQLList(${target}),`);
				lines.push(indent+`  description: '${desc}'`);
				lines.push(indent+`}`);
			}else if(annotation.reference_type === 'connection'){
				// This is a reference where a connection is needed
				// TODO create attribute
				const conectionTypeName = this._getConnectionTypeName(target);
				const getterName = this._getObjectGetterName(target);

				lines.push(indent+`${referenceName} :{`);
				lines.push(indent+`  type: ${conectionTypeName},`);
				lines.push(indent+`  description : '${desc}',`);
				lines.push(indent+`  args: connectionArgs,`);
				lines.push(indent+`  resolve: (parent, args) => connectionFromArray(`);
				lines.push(indent+`    parent.${referenceName}.map((id) => ${getterName}(id)),`);
				lines.push(indent+`    args`);
				lines.push(indent+`  ),`);
				lines.push(indent+`}`);
				// create conection
				this._buildConnection(target);
			}
		}

		// A reference will be saved as an attribute
		this.definition[objectName].attributes[referenceName] = lines.join("\n");
	}

	/**
	 * Creates the connection definitions for an object.
	 * For each target type one connection definition will be cretaed and stored
	 * under 'this.referenceTypes' by there target name
	 * @protected
	 * @param {string} targetObjectName - The name of the target object
	 */
	_buildConnection(targetObjectName){
		// check if the connection already exists
		if(this.definition[targetObjectName] === undefined){
			this.definition[targetObjectName] = {};
		}
		if(this.definition[targetObjectName].connection === undefined){
			// create this connection
			const conectionTypeName = this._getConnectionTypeName(targetObjectName);
			const conectionNodeName = changeCase.camelCase(targetObjectName);
			const conectionName = changeCase.pascalCase(targetObjectName);

			const line = `const ${conectionTypeName} = connectionDefinitions({name: '${conectionName}', nodeType: ${conectionNodeName}});\n`;
			this.definition[targetObjectName].connection = line;
		}
	}


	/**
	 * Creates a single attribute of an object
	 * @protected
	 * @param {string} objectName - The name of the object to build the fields for
	 * @param {string} attributeName - The name of the attribute to be created
	 * @param {object} config - The configuration of this attribute
	 * @param {string} indent - A string used for indention
	 */
	_buildAttribute(objectName, attributeName, config, indent){
		let desc = config.description;
		if(desc === undefined){
			desc = "";
		}

		if(indent === undefined){
			indent = "";
		}

		// The annotations

		const annotation = config.annotations[this.getAnnotationName()];
		const attributeType = config.type;

		let theType;
		if(annotation.upper_bound === 1){
			// This is a normal attribute
			theType = `${attributeType}`;
		}else{
			// This is a list
			theType	= `new GraphQLList(${attributeType})`
		}

		const lines =[];
		lines.push(indent+`${attributeName}: {`);
		lines.push(indent+`  type: ${theType},`);
		lines.push(indent+`  description: '${desc}'`);
		lines.push(indent+`}`);

		this.definition[objectName].attributes[attributeName] = lines.join("\n");
	}

	/**
	 * Creates the imports from the database definition
	 * @protected
	 * @param {object} model - The model to be exported
	 * @returns {string} The string used to replace the placeholder in the template
	 */
	_buildDatabaseImports(model){
		const imports = [];
		Object.keys(model).forEach((objectName) => {
			imports.push(this._getClassName(objectName));
			imports.push(this._getObjectGetterName(objectName));
		});
		const importsNew = imports.map((val)=>{
			return "  "+val;
		});
		return importsNew.join(",\n");
	}

	/**
	 * Creates the if statement to get an object via its id
	 * @protected
	 * @param {object} model - The model to be exported
	 * @returns {string} The string used to replace the placeholder in the template
	 */
	_buildGetElementById(model){
		const ifs = [];
		Object.keys(model).forEach((objectName) => {
			const objName = this._getClassName(objectName);
			const getName = this._getObjectGetterName(objectName);
			const txt = `if (type === '${objName}') {\n      return ${getName}(id);\n    }`;

			ifs.push(txt);
		});
		return ifs.join(" else ")+"else { return null; }";
	}

	/**
	 * Creates the if statement to get the class type for an object
	 * @protected
	 * @param {object} model - The model to be exported
	 * @returns {string} The string used to replace the placeholder in the template
	 */
	_buildGetElementClassType(model){
		const ifs = [];
		Object.keys(model).forEach((objectName) => {
			const objName = this._getClassName(objectName);
			const classType = this._getClassTypeName(objectName);
			const txt = `if (obj instanceof ${objName}) {\n      return ${classType};\n    }`;
			ifs.push(txt);
		});
		return ifs.join(" else ")+"else { return null; }";
	}


	/**
	* Returns the name used for the annotations
	* @public
	* @returns {string} The name
	 */
	getAnnotationName(){
		if(this.annotation === undefined){
			throw new Error("No annotation name defined");
		}
		return this.annotation;
	}

	/**
	 * Creates the name of the connection
	 * @protected
	 * @param {string} objectName - The name of the object to build the fields for
	 * @returns {string} The created connection name
	 */
	_getConnectionTypeName(objectName){
		return changeCase.pascalCase(objectName+' connection');
	}

	/**
	 * Creates the name of the 'getter' function
	 * @protected
	 * @param {string} objectName - The name of the object to build the fields for
	 * @returns {string} The created name
	 */
	_getObjectGetterName(objectName){
		return changeCase.camelCase('get '+objectName);
	}



	/**
	 * Creates the class name for an objectName
	 * @protected
	 * @param {string} objectName - The name of the object to build the fields for
	 * @returns {string} The created class name
	 */
	_getClassName(objectName){
		return changeCase.pascalCase(objectName);
	}

	/**
	 * Creates the class type name for an objectName
	 * @protected
	 * @param {string} objectName - The name of the object to build the fields for
	 * @returns {string} The created class type name
	 */
	_getClassTypeName(objectName){
		return changeCase.camelCase(objectName+" type");
	}
}


module.exports.ExporterGraphqlBase = ExporterGraphqlBase;
