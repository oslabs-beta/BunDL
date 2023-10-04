//client sends a request (wants to retrieve of list of books)
// server receives the query and parses and validates the query
//the server parses in 2 steps:
//1) lexical analysis: splits the query string into individual tokens (e.g., keyworks, puntations)
//2) once query is tokenized, server constructs AST from tokens

//server performs validation checks against query to ensure it adheres to server's schema (ensures it's well formed and safe to execute)

//server executes it by traversing the ast and invoking resolver functions to retrieve thee requested data

//invokes resolver functions to retrieve the requested data

// server generates a response in JSON with requested dadta and response is sent back to the client

// Quell intercepts a query string -> parses into an AST
// -> creates a JS object out of the fields that are needed from the database -> converts the object into a JSON object (query string)
// -> sends it to next middleware which is graphQL

//'parseAST' traverses the AST and builds a 'proto' object which is used to check the cache

// any data already in the cache is removed from 'proto' and the modified object only contains fields that are not yet in the cache
//and hence needs to be fetched from the server

//we dont mutate the original AST that quell creates because a prototype leaves out any unintended side effects, its simple, efficient, and flexible
