/* jslint node: true, esnext: true */
"use strict";

const changeCase = require('change-case');
const fs = require('fs');

const Base = require('./event_handler_base').EventHandlerBase;

// The name of the field storing the unique ids for each record
const ID_FIELD_NAME = "__id_unique";


const ATTR_TYPE_MAP = {
	"string" : "GraphQLString",
	"number" : "GraphQLInt",
	"date" : "GraphQLInt",
	"boolean": "GraphQLBoolean",
	"array"  : "GraphQLList"
};

/**
 * The base Model parser
 * Parses the model and calls eventhandler
 */
class EventHandlerGraphQl extends Base{

	constructor(opts) {
		super(opts);

		if(opts.template === undefined){
			throw new Error("No template file name given");
		}else{
			this.template = opts.template;
		}

		if(opts.id_name === undefined){
			this.id_name = ID_FIELD_NAME;
		}else{
			this.id_name = opts.id_name;
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

		if(this.model[objectName].description === undefined){
			this.model[objectName].description = "";
		}
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

		const newAttrConfig = {};

		this.model[objectName].attributes[attributeName] = newAttrConfig;

		newAttrConfig.type = ATTR_TYPE_MAP[attrConfig.type];

		if(attrConfig.description !== undefined){
			newAttrConfig.description = attrConfig.description;
		}
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

	/**
	 * returns the converted model as string
	 * @public
	 * @returns {string} The new created data as string
	 */
	getConfig(){
		return JSON.stringify(this.model);
	}

	/**
	 * Creates the imports from the database definition
	 * @returns {string} The string used to replace the placeholder in the template
	 */
	_buildDatabaseImports(){
		const imports = [];
		Object.keys(this.model).forEach((objectName) => {
			imports.push(changeCase.pascalCase(objectName));
			imports.push(changeCase.camelCase('get '+objectName));
		});
		const importsNew = imports.map((val)=>{
			return "  "+val;
		});
		return importsNew.join(",\n");
	}

	/**
	 * Creates the if statement to get an object via its id
	 * @returns {string} The string used to replace the placeholder in the template
	 */
	_buildGetElementById(){
		const ifs = [];
		Object.keys(this.model).forEach((objectName) => {
			const objName = changeCase.pascalCase(objectName);
			const getName = changeCase.camelCase('get '+objectName);
			const txt = `if (type === '${objName}') {\n      return ${getName}(id);\n    }`;

			ifs.push(txt);
		});
		return ifs.join(" else ")+"else { return null; }";
	}

	/**
	 * Creates the if statement to get the class type for an object
	 * @returns {string} The string used to replace the placeholder in the template
	 */
	_buildGetElementClassType(){
		const ifs = [];
		Object.keys(this.model).forEach((objectName) => {
			const objName = changeCase.pascalCase(objectName);
			const classType = changeCase.camelCase(objectName+" type");
			const txt = `if (obj instanceof ${objName}) {\n      return ${classType};\n    }`;
			ifs.push(txt);
		});
		return ifs.join(" else ")+"else { return null; }";
	}

	/**
	 * Creates the objects for the schema
	 * @param {string} objectName - The name of the object to build the fields for
	 * @returns {string} The string used to replace the placeholder in the template
	 */
	_buildObjects(){
		const objects = [];
		Object.keys(this.model).forEach((objectName) => {
			const objNameType = changeCase.camelCase(objectName);
			const objNameClass = changeCase.pascalCase(objectName);

			const lines = [];

			lines.push(`const ${objNameType} = new GraphQLObjectType({`);
			lines.push(`  name: '${objNameClass}',`);
			lines.push(`  description : '${this.model[objectName].description}',`);
			lines.push(`  fields: () => ({`)
			lines.push(`${this._buildFields(objectName)}`);
			lines.push(`  }),`);
			lines.push(`  interfaces: [nodeInterface]`);
			lines.push(`});`);

			objects.push(lines.join("\n")+"\n");
		});

		return objects.join("\n");
	}

	/**
	 * Creates the fields of an object
	 * @param {string} objectName - The name of the object to build the fields for
	 * @returns {string} The string used to replace the placeholder in the template
	 */
	_buildFields(objectName){
		const objNameClass = changeCase.pascalCase(objectName);
		const attributes = this.model[objectName].attributes;

		const fields = [];
		fields.push(`  id: globalIdField('${objNameClass}', (obj, context, info) => obj.${this.id_name})`);

		Object.keys(attributes).forEach((name) => {
			const attrConfig = attributes[name];
			let desc = attrConfig.description;
			if(desc === undefined){
				desc = "";
			}

			const lines =[];
			lines.push(`    ${name}: {`);
			lines.push(`      type: ${attrConfig.type},`);
			lines.push(`      description: '${desc}'`);
			lines.push(`    }`);

			fields.push(lines.join("\n"));
		});
		return fields.join(",\n");
	}

	_buildFile(){
		this.logger.info(`Read template '${this.template}'`);
		let templateFile = fs.readFileSync(this.template, {encoding: 'utf-8'});

		templateFile = templateFile.replace(/__imports__/, this._buildDatabaseImports());
		templateFile = templateFile.replace(/__GET_BY_ID__/, this._buildGetElementById());
		templateFile = templateFile.replace(/__GET_CLASS_TYPE__/, this._buildGetElementClassType());
		templateFile = templateFile.replace(/__OBJECTS__/, this._buildObjects());

		return templateFile;
	}
}



module.exports.eventHandlerGraphQlFactory = function (options) {
	return new EventHandlerGraphQl(options);
};
module.exports.EventHandlerGraphQl = EventHandlerGraphQl;
