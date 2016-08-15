/**
 * Template for the GraphQL database
 */

// -------------------------------
// export classes
// -------------------------------
__EXPORT_CLASSES__


// -------------------------------
// Datastores
// -------------------------------
// const <ObjectName>ById = {};

__DATA_STORES__

// -------------------------------
// Getter
// -------------------------------
// export function get<ObjectName>(id) {
//   return <ObjectName>ById[id];
// }

__GETTER_FUNCTIONS__


// -------------------------------
// Remove
// -------------------------------




let ___uniqueId = 1000;
/**
 * Creates a new unique id
 * @returns {integer} A new id value
 */
function ___getUniqueId(){
	___uniqueId++;
	return ___uniqueId;
}
