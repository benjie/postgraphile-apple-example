module.exports = {
  options: {
    connection: "postgres://graphql:insecure@localhost:5432/postgraphile_apple",
    // This needs to be a 'superuser' role so that the watch fixtures can be
    // installed.
    ownerConnection: "postgres://localhost:5432/postgraphile_apple",

    schema: ["public"],
    jwtSecret: "secret",
    graphiql: "/",
    showErrorStack: true,
    enhanceGraphiql: true,
    allowExplain: true,
    watch: true,

    // Useful if you're running this in Docker or similar
    host: "0.0.0.0",

    appendPlugins: [
      "@graphile-contrib/pg-simplify-inflector",
      "postgraphile-plugin-connection-filter",
      "@graphile/pg-aggregates",
      `${__dirname}/AggregateGroupsPlugin.js`,
    ],

    // Simplify the schema by removing the global object identifiers/etc
    skipPlugins: ["graphile-build:NodePlugin"],
  },
};
