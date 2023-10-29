<p align="center"><img src="./assets/bundl-logo-color.svg" width='500' style="margin-top: 10px; margin-bottom: -10px;"></p>

<br />
<div align="center">

![AppVeyor](https://img.shields.io/badge/version-1.0.0-blue.svg?style=for-the-badge&labelColor=B5A886&color=5A2A27) [![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=for-the-badge&labelColor=B5A886&color=5A2A27)](https://github.com/open-source-labs/bunDL/issues) ![LicenseMIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge&labelColor=B5A886&color=5A2A27&link=https%3A%2F%2Fopensource.org%2Flicense%2Fmit%2F)

</div>

<!-- <h2 align="center" style=color: #5A2A27;"> GraphQL Query Interceptor & Data Caching Solution</h2> -->

<!-- <p><strong style="color:#5a2a27; font-size: 22px; font-family: monospace">bunDL</strong> is an intuitive, skinny GraphQL interceptor, that checks for cached data, handles mutations with PouchDB, and only sends modified or non-cached queries to the server. The returned data is then cached for future requests.</p> -->

# bunDL

<p><img src="./assets/bundl-inline.svg" alt="bundl logo" style="width: 72px; position: relative; top: 1px;"> is an intuitive, skinny GraphQL interceptor, that checks for cached data, handles mutations with PouchDB, and only sends modified or non-cached queries to the server. The returned data is then cached for future requests.</p>

<div align="center">

![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white) ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) ![Redis](https://img.shields.io/badge/redis%20Stack-%23DD0031.svg?&style=for-the-badge&logo=redis&logoColor=white) ![GraphQL](https://img.shields.io/badge/-GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white) ![MongoDB](https://img.shields.io/badge/Mongo%20DB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![pouchDB](https://img.shields.io/badge/pouch%20db-green?style=for-the-badge&logo=data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI4LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGw6IzZDQ0I5OTt9Cjwvc3R5bGU+CjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik05MC4xLDZjMC4yLDAsMC4zLDAsMC41LDBjMzYuNSw0OC4zLDczLDk2LjcsMTA5LjUsMTQ1LjFjMS40LDEuOCwyLjksMi41LDUuMSwyLjRjMzQuNy0wLjEsNjkuNS0wLjEsMTA0LjIsMAoJYzIuNiwwLDQuMi0wLjgsNS44LTIuOUMzNTAuNSwxMDMuMywzODYsNTYuMSw0MjEuNCw4LjljMC43LTAuOSwxLjItMS45LDEuOC0yLjljMC4yLDAsMC4zLDAsMC41LDBjMC40LDIsMC45LDMuOSwxLjIsNS45CgljNi45LDM2LjgsMTMuNyw3My42LDIwLjYsMTEwLjVjMS40LDcuMywyLjksMTQuNiw0LjMsMjEuOGMwLDAuMiwwLDAuMywwLDAuNWMtMC42LDAuNS0xLjIsMS4xLTEuOCwxLjYKCWMtMjQuNywyNC4yLTQ5LjQsNDguNC03NC4yLDcyLjVjLTIuOSwyLjgtMi45LDIuOC0wLjksNi4yYzE2LjYsMjkuNCwzMy4yLDU4LjgsNDkuOSw4OC4yYzEuMSwxLjksMS4zLDMuMywwLjIsNS4zCgljLTM1LjEsNjEuNS03MC4yLDEyMy4xLTEwNS4zLDE4NC42Yy0xLjEsMi0yLjQsMi44LTQuNywyLjhjLTM3LjItMC4xLTc0LjUtMC4xLTExMS43LDBjLTIuMywwLTMuNi0wLjgtNC44LTIuOAoJYy0zNC43LTYxLjMtNjkuNS0xMjIuNi0xMDQuMy0xODMuOGMtMS40LTIuNS0xLjUtNC4zLDAtNi44YzE2LjYtMjkuNSwzMy4xLTU5LDQ5LjgtODguNWMxLjEtMS45LDAuOS0zLTAuNy00LjUKCWMtMjUuOS0yNC40LTUxLjctNDguOC03Ny42LTczLjJjLTEuMy0xLjMtMS43LTIuNC0xLjMtNC4zQzY5LjgsMTA2LjIsNzcuMSw3MC4xLDg0LjUsMzRDODYuNCwyNC43LDg4LjIsMTUuMyw5MC4xLDZ6Ii8+Cjwvc3ZnPgo=&logoColor=6ccb99&color=555555)

![CouchDB](https://img.shields.io/badge/Couch%20DB-DB?style=for-the-badge&logo=apachecouchdb&logoColor=%23E42528&color=black) ![IBM Cloudant](https://img.shields.io/badge/IBM%20Cloud-1261FE?style=for-the-badge&logo=IBM%20Cloud&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Prettier](https://img.shields.io/badge/prettier-1A2C34?style=for-the-badge&logo=prettier&logoColor=F7BA3E) ![ESLint](https://img.shields.io/badge/eslint-3A33D1?style=for-the-badge&logo=eslint&logoColor=white)

<!--![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)-->

</div>

<a id="installation"></a>

<h1 style="color: #5A2A27">Installation </h1>

### Install bunDL-server

```bash
bun install bundl-server
```

### Install bunDL-client

```bash
bun install bundl-cache
```

<a id="features"></a>

<h1 style="color: #5A2A27">Features: </h1>

## 🗂️ Caching with Redis Stack (Server) & LRU Cache (Client)

<img src="./assets/bundl-inline.svg" style="width: 72px; position: relative; top: 1px;">retrieves data from the local cache with lightning speed

🥟 In-Memory Storage: Fast access to frequently used data.

🥟 Disk-Based Storage: Suitable for larger datasets that don't fit into memory.

🥟 Time-to-Live (TTL): Automatic eviction of old data based on time or size constraints.

<br />

## 🗄️ Database Integration

<img src="./assets/bundl-inline.svg" style="width: 72px; position: relative; top: 1px;">seamlessly integrates with both relational and document based databases.

🥟 SQL Support: Easily connect to MySQL, PostgreSQL, and SQLite databases.

🥟 NoSQL Support: Options for integrating with MongoDB, Redis, and other NoSQL databases.

🥟 Syncing with PouchDB and CouchDB to provide offline access to data

<br />

## 🔎 Query Optimization

<img src="./assets/bundl-inline.svg" style="width: 72px; position: relative; top: 1px;"> ensures

🥟 Lazy Loading: Fetch only the data that is needed, reducing initial load times.

🥟 Batch Processing: Perform bulk operations for improved efficiency.

🥟 Indexing: Speed up data retrieval operations with intelligent indexing.

<br />

## 🎁 Plus More!

🥟 RESTful API: Easy integration with other services.

🥟 Data Validation: Robust validation mechanisms to ensure data integrity.

🥟 Real-Time Analytics: Keep track of various metrics in real-time.

<br />

---

<a id="server-set-up"></a>

## Server Side Implementation:

<img src="./assets/bundl-inline.svg" style="width: 72px; position: relative; top: 1px;"> makes use of [Redis Stack](https://redis.io/docs/install/install-stack/) for caching data as JSON objects; [Redis Stack](https://redis.io/docs/install/install-stack/) needs to be installed independently. Installation instructions can be found on the Redis website [here](https://redis.io/docs/install/install-stack/).

### 1️⃣ Install Bun runtime

```bash
npm install -g bun
```

### 2️⃣ Install <img src="./assets/bundl-inline.svg" style="width: 72px; position: relative; top: 1px;"> :

```bash
bun install bundl-server
```

### 3️⃣ Define your schema shape

#### For Unix / Linux / macOS:

Open a terminal command line in the root directory folder that houses your server file.

Run the following commands:

```bash
touch .env  # will create a new `.env` file if one doesn't exist
echo "QUERY=\"[enter your query here]\"" >> .env
```

For example, if your GraphQL schema looks like this:

```graphql
query samplePokeAPIquery {
  pokemon_v2_pokemon_by_pk(id: ) {
    name
    id
    height
    base_experience
    weight
    pokemon_v2_pokemonsprites {
      id
      pokemon_id
      sprites
    }
  }
}

```

Your `QUERY="[...]"` input will look like this:

```bash
touch .env  // This will create a new `.env` file if one doesn't exist
echo "QUERY=\"{ pokemon_v2_pokemon_by_pk(id: ) { name id height base_experience weight pokemon_v2_pokemonsprites { id pokemon_id sprites } } }\"" >> .env
```

<a id="client-set-up"></a>

## Client Side Documentation:

<img src="./assets/bundl-inline.svg" style="width: 72px; position: relative; top: 1px;"> works best with [GraphQL](https://graphql.org/), [LRU Cache](https://github.com/isaacs/node-lru-cache#readme), [PouchDB](https://github.com/pouchdb/pouchdb), and CouchDB style database.

For more information on our client side implementation, please visit the corresponding [README file][https://github.com/oslabs-beta/BunDL/tree/main/bunDL-client]

<a id="contributing"></a>

## Contributing

We believe in the power of open source. By contributing to bunDL, you're not just making an impact on this project but also supporting the wider open source community. Our mission with bunDL is to create an accessible tool, and every contribution, big or small, pushes this vision forward.

This project, bunDL, is an open source endeavor. If you're looking to understand our project's journey and how to contribute, visit our [Demo Repository](https://github.com/bunDL-demo/bunDL-demo)

---

<a id="contributors"></a>

## BunDL Contributors

Accelerated by [OS Labs](https://github.com/open-source-labs) and devloped by [Ken Iwane](https://www.linkedin.com/in/ken-iwane-5b9209157/), [Shi Kuang](https://www.linkedin.com/in/shi-kuang/), [Brandon Do](https://www.linkedin.com/in/brandonndo/), [Gio Mogi](https://www.linkedin.com/in/giovanni-mogi-189013193/), & [Andrew Wicker](https://www.linkedin.com/in/andrewwicker/).
