/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
}
from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions,
}
from 'graphql-relay';

import {
__imports__
}
from './database';



/**
 * We get the node interface and field from the Relay library.
 *
 * The first method defines the way we resolve an ID to its object.
 * The second defines the way we resolve an object to its GraphQL type.
 */
var {
  nodeInterface, nodeField
} = nodeDefinitions(
  (globalId) => {
    const res = fromGlobalId(globalId);
    let type = res.type;
    let id = res.id;

    __GET_BY_ID__

  }, (obj) => {

    __GET_CLASS_TYPE__

  }
);


__OBJECTS__



/*
 * The viewer is the user currently login in
 */
const Root = new GraphQLObjectType({
  name: 'Root',
  fields: {
    viewer: {
      type: identityType,
      resolve: () => getViewer(),
    },
    node: nodeField,
  },
});


/**
 * Finally, we construct our schema (whose starting query type is the query
 * type we defined above) and export it.
 */
export var Schema = new GraphQLSchema({
  query: Root,
});
