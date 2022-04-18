# PostGraphile Apple Example

This is an example of using PostGraphile with data generated from the Wikipedia
page on the history of Apple products and very simple row level security
policies.

## Installing the database

Assuming you have PostgreSQL running locally with "trust" authentication, first
create the `graphql` role using password `insecure`:

```bash
createuser --pwprompt graphql
```

Next create the `postgraphile_apple` schema, and populate it with our
`example_schema.sql` file:

```bash
createdb postgraphile_apple
psql -X1v ON_ERROR_STOP=1 -f example_schema.sql postgraphile_apple
```

## Running

Clone down this repository and change directory into it.

If you don't already have `yarn`, install it:

```bash
npm install -g yarn
```

Install the dependencies:

```bash
yarn
```

Then run PostGraphile:

```bash
yarn postgraphile
```

For future runs, only the `yarn postgraphile` command is necessary (but be sure
to run it from inside the project directory, otherwise the configuration will
not be pulled in).

## Configuration

The configuration is in `.postgraphilerc.js`; we've pulled in a number of
plugins that are particularly useful when building internal tooling for a
company. In general we wouldn't necessarily recommend these plugins for
production when you are exposing a PostGraphile schema to the internet (in these
cases a much more tightly defined schema is recommended).

If you are not using a local database, or your database is not configured for
"trust" authentication, or you are not a database superuser, you will need to
change the `connection` and `ownerConnection` strings to suitable connection
strings for you. If unsure, try with the default config, and dig in if there are
errors.

## Authentication

This is designed as a public API (i.e. anyone can request data from it), but
where certain data is protected and requires authentication via JWT. You can go
and run queries at http://localhost:5000 without entering any authentication
details.

To enter a JWT in GraphiQL, look below the query pane where "Query Variables"
and "Request Headers" can be seen. Select "Request Headers" and replace its
contents with the following **non-admin** JWT header configuration:

```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJwb3N0Z3JhcGhpbGUiLCJlbWFpbCI6ImJlbmppZUBncmFwaGlsZS5jb20iLCJpc19hZG1pbiI6ZmFsc2V9.QJTdmPDqD-CMBMI5Nooy01wi_4cQbPjIAVXKinUs3io"
}
```

You can replace the JWT token with an **admin** token if you prefer:

```
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJwb3N0Z3JhcGhpbGUiLCJlbWFpbCI6ImJlbmppZUBncmFwaGlsZS5jb20iLCJpc19hZG1pbiI6dHJ1ZX0.IQJYLT7AhxiCbLkzJyKj05FL2dCNnqwkK-xHY3bMtD8"
}
```

You can see the content of these tokens at [JWT.io](https://jwt.io/); critically
the `aud` must be `postgraphile`, and (according to our configuration) the JWT
secret is the word `secret`. These are _NOT_ secure tokens, in a production app
be sure to use a cryptographically secure secret!

**NOTE**: JWT is not required to use PostGraphile but it's very easy to demo.
PostGraphile can run as a middleware in many Node.js server frameworks, so any
authentication method supported by those frameworks (Express, Koa, Fastify,
etc.) should work with PostGraphile.

## Example queries

You can paste the following code block into GraphiQL at http://localhost:5000/
and then select the query to run from the "Play button" dropdown, or
alternatively click inside the relevant query and perform ⌘↵ (Command-Enter) on
your keyboard.

```graphql
# Paginate through product history
query Products($after: Cursor) {
  products(first: 5, after: $after, orderBy: [RELEASED_ASC]) {
    nodes {
      id
      family
      model
      released
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}

# View the products various emails are permitted to access
# (NOTE: this will change based on your JWT token!)
query AppleExample {
  authorisedEmails {
    nodes {
      email
      product {
        id
        family
        model
        released
      }
    }
  }
}

query Aggregates {
  aggregates: products(filter: { released: { isNull: false } }) {
    # Find the number of products (the count of distinct product ids) released
    # each year.

    productsPerYear: groupedAggregates(groupBy: [RELEASED_TRUNCATED_TO_YEAR]) {
      keys
      distinctCount {
        id
      }
    }

    # Find families with more than 20 products in, and their count of products
    families: groupedAggregates(
      groupBy: [FAMILY]
      having: { distinctCount: { id: { greaterThan: 20 } } }
    ) {
      keys
      distinctCount {
        id
      }
    }
  }
}
```

## The schema

The schema is defined in `example_schema.sql` and has some documentation inline.
The descriptions for some of the functions/tables/fields can be found at the
bottom of the file in `COMMENT` statements. Feel free to edit and re-run the
file using the `psql` command line above and then restart PostGraphile to see
the changes. (If watch mode is working, you might not even have to restart!)

## How the data was generated

This part is just for interest. Visit
[the Wikipedia page for the Timeline of Apple Inc. products](https://en.wikipedia.org/wiki/Timeline_of_Apple_Inc._products)
and then open your browser devtools. Paste in the code from
`apple_products_from_wikipedia.js` and you should find that the SQL values are
now in your clipboard. This is liable to break any time Wikipedia changes it's
formatting (or any time data is added to that page that does not conform to the
assumptions of the script.)
