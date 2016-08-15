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
  get__Viewer,
  Application,
  getApplication,
  Entitlement,
  getEntitlement,
  Account,
  getAccount,
  Identity,
  getIdentity
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

    if (type === 'Application') {
      return getApplication(id);
    } else if (type === 'Entitlement') {
      return getEntitlement(id);
    } else if (type === 'Account') {
      return getAccount(id);
    } else if (type === 'Identity') {
      return getIdentity(id);
    }else { return null; }

  }, (obj) => {

    if (obj instanceof Application) {
      return applicationType;
    } else if (obj instanceof Entitlement) {
      return entitlementType;
    } else if (obj instanceof Account) {
      return accountType;
    } else if (obj instanceof Identity) {
      return identityType;
    }else { return null; }

  }
);


const entitlementType = new GraphQLObjectType({
  name: 'Entitlement',
  description : 'An entitlement of an application, which could be assigned to an account.',
  fields: () => ({
    id: globalIdField('Entitlement', (obj, context, info) => obj.__id_unique),
    name: {
      type: GraphQLString,
      description: 'The ID for this entitlement per application'
    },
    description: {
      type: GraphQLString,
      description: ''
    },
    __id_unique: {
      type: GraphQLInt,
      description: ''
    },
    __id_hash: {
      type: GraphQLString,
      description: ''
    },
    __content_hash: {
      type: GraphQLString,
      description: ''
    }
  }),
  interfaces: [nodeInterface]
});
const EntitlementConnection = connectionDefinitions({name: 'Entitlement', nodeType: entitlementType});


const accountType = new GraphQLObjectType({
  name: 'Account',
  description : 'The definition of an account',
  fields: () => ({
    id: globalIdField('Account', (obj, context, info) => obj.__id_unique),
    account_id: {
      type: GraphQLString,
      description: 'The ID for this account'
    },
    name: {
      type: GraphQLString,
      description: 'The name of the application'
    },
    description: {
      type: GraphQLString,
      description: ''
    },
    creation_date: {
      type: GraphQLInt,
      description: ''
    },
    __id_unique: {
      type: GraphQLInt,
      description: ''
    },
    __id_hash: {
      type: GraphQLString,
      description: ''
    },
    __content_hash: {
      type: GraphQLString,
      description: ''
    }
  }),
  interfaces: [nodeInterface]
});

const identityType = new GraphQLObjectType({
  name: 'Identity',
  description : '',
  fields: () => ({
    id: globalIdField('Identity', (obj, context, info) => obj.__id_unique),
    identity_id: {
      type: GraphQLString,
      description: 'An id identifying this identity'
    },
    first_name: {
      type: GraphQLString,
      description: ''
    },
    last_name: {
      type: GraphQLString,
      description: ''
    },
    email: {
      type: GraphQLString,
      description: ''
    },
    date_of_birth: {
      type: GraphQLInt,
      description: ''
    },
    __id_unique: {
      type: GraphQLInt,
      description: ''
    },
    __id_hash: {
      type: GraphQLString,
      description: ''
    },
    __content_hash: {
      type: GraphQLString,
      description: ''
    }
  }),
  interfaces: [nodeInterface]
});
const IdentityConnection = connectionDefinitions({name: 'Identity', nodeType: identityType});


const applicationType = new GraphQLObjectType({
  name: 'Application',
  description : 'The definition of an application',
  fields: () => ({
    id: globalIdField('Application', (obj, context, info) => obj.__id_unique),
    app_id: {
      type: GraphQLString,
      description: 'The ID for this application'
    },
    name: {
      type: GraphQLString,
      description: 'The name of the application'
    },
    description: {
      type: GraphQLString,
      description: ''
    },
    creation_date: {
      type: GraphQLInt,
      description: ''
    },
    __id_unique: {
      type: GraphQLInt,
      description: ''
    },
    __id_hash: {
      type: GraphQLString,
      description: ''
    },
    __content_hash: {
      type: GraphQLString,
      description: ''
    },
    entitlements :{
      type: EntitlementConnection,
      description : '',
      args: connectionArgs,
      resolve: (parent, args) => connectionFromArray(
        parent.entitlements.map((id) => getEntitlement(id)),
        args
      ),
    }
  }),
  interfaces: [nodeInterface]
});



const __Viewer = new GraphQLObjectType({
  name: '__Viewer',
  description : 'The currently connected user',
  fields: () => ({
    id: globalIdField('__Viewer', (obj, context, info) => obj.id),
    identities :{
      type: IdentityConnection,
      description : 'Get all identities',
      args: connectionArgs,
      resolve: (parent, args) => connectionFromArray(
        parent.identities.map((id) => getIdentity(id)),
        args
      ),
    }
  }),
  interfaces: [nodeInterface]
});




/*
 * The viewer is the user currently login in
 */
const Root = new GraphQLObjectType({
  name: 'Root',
  fields: {
    viewer: {
      type: identityType,
      resolve: () => get__Viewer(),
    },
    node: nodeField,
  },
});


/**
 * Finally, we construct our schema (whose starting query type is the query
 * type we defined above) and export it.
 */
export const schema = new GraphQLSchema({
  query: Root,
});
