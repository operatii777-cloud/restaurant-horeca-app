/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GRAPHQL SERVER - Restaurant App
 * 
 * Configurare Apollo Server pentru GraphQL API
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

let apolloServer = null;

/**
 * Initializează Apollo Server
 */
function initGraphQLServer(app) {
  if (apolloServer) {
    return apolloServer;
  }

  apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: process.env.NODE_ENV !== 'production', // Enable in dev
    playground: process.env.NODE_ENV !== 'production', // Enable in dev
    formatError: (err) => {
      console.error('GraphQL Error:', err);
      return {
        message: err.message,
        code: err.extensions?.code || 'INTERNAL_ERROR',
        path: err.path,
      };
    },
    context: async ({ req }) => {
      // Extract user from JWT if available
      return {
        user: req.user || null,
        db: await require('../../database').dbPromise,
      };
    },
  });

  return apolloServer;
}

/**
 * Start GraphQL Server
 */
async function startGraphQLServer(app) {
  const server = initGraphQLServer(app);
  
  await server.start();
  
  // Mount GraphQL endpoint
  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req }) => {
      return {
        user: req.user || null,
        db: await require('../../database').dbPromise,
      };
    },
  }));
  
  console.log('✅ GraphQL Server started at /graphql');
  
  return server;
}

module.exports = {
  initGraphQLServer,
  startGraphQLServer,
};
