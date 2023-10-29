# bundl-cache

bundl-cache is a client-side GraphQL caching solution, optimized for the Bun runtime. Our product is designed to intercept GraphQL queries, parse through relevant information from the AST, and generate unique cache key/value pairs to accomodate for an array of query types all within the browser. BunDL is most optimal when utilizing pouchDB and couchDB. The offline synchronization between the two databases allowed us to further reduce requests to the server and provide a seamless experience for the user in terms of performance speeds.

## Installation

Within your terminal, download bundl-cache with 'bun install bundl-cache'

## Implementation

1. Import BunDL from 'bundl-cache'
2. Create a new instance of 'bundl-cache'
3. Set configurations based on your caching needs
4. Replace any fetch requests with 'bunDL.query'

Example:

If a user queries the following code below...

```js
const query = `query {
  company (id: 123) {
    name
    city
    state
    department {
      name
    }
  }
}`;
```

A typical fetch request may look like this:

```js
fetch('/graphql', {
  method: 'POST',
  body: JSON.stringify({ query }),
  headers: { 'Content-Type': 'application/json' },
});
```

With bunDL your fetch request would now look like the following:

```js
const BunDL = new BunDL();

BunDL.query('/graphQL', query).then(/* use parsed response */);
```

Before creating a new instance of BunDL, you may also pass in specific configurations. However, this feature is currently in beta and may exhibit unintended bugs. We encourage users to stick with default configurations for the time being.

Currently, the default configurations are:

```js
const defaultConfig = {
  cacheMetadata: false,
  cacheVariables: true,
  requireArguments: true,
};
```

Setting 'cacheMetadata' to true will reconfigure bunDL to store additional information about the query (This may decrease performance speeds)
Setting 'cacheVariables' to false will reconfigure bunDL to cache queries without variables
Setting 'requireArguments' to false will reconfigure bunDL to cache queries without arguments.

To set your own configurations, initialize an object with any or all of the default configurations and change the boolean to your desired option.

## Usage Notes

- bunDL is around 94% faster than fetching the same data without caching over a network request. However, our current limitations lies within the granularity of our caching solutions. The bunDL developers are always looking to improve our product, and any support/contributions from the open source community is always welcomed.

- bunDL can only cache 1-2-depth queries with arguments/variables
- Any mutated queries will invalidate the entire cache
- Deeply nested (3-depth+) queries will not be cached
- Partial queries works at the single depth level and inconsistently works on the 2-depth level
