<style>
  @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap');
</style>
<p align="center"><img src="./assets/bundl-logo-color.svg" width='500' style="margin-top: 10px; margin-bottom: -10px;"></p>

<br />
<div align="center">

![AppVeyor](https://img.shields.io/badge/version-1.0.0-blue.svg?style=for-the-badge&labelColor=B5A886&color=5A2A27) [![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=for-the-badge&labelColor=B5A886&color=5A2A27)](https://github.com/open-source-labs/bunDL/issues) ![LicenseMIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge&labelColor=B5A886&color=5A2A27&link=https%3A%2F%2Fopensource.org%2Flicense%2Fmit%2F)

</div>

<h3 align="center" style="font-family: 'Fira Code'; font-weight: 700; color: #5A2A27;"> GraphQL Query Interceptor & Data Caching Solution</h3>

<!-- <p><strong style="color:#5a2a27; font-size: 22px; font-family: monospace">bunDL</strong> is an intuitive, skinny GraphQL interceptor, that checks for cached data, handles mutations with PouchDB, and only sends modified or non-cached queries to the server. The returned data is then cached for future requests.</p> -->

<p><img src="./assets/bundl-inline.svg" style="width: 72px; position: relative; top: 1px;"> is an intuitive, skinny GraphQL interceptor, that checks for cached data, handles mutations with PouchDB, and only sends modified or non-cached queries to the server. The returned data is then cached for future requests.</p>

<div align="center">

![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white) ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) ![Redis](https://img.shields.io/badge/redis%20Stack-%23DD0031.svg?&style=for-the-badge&logo=redis&logoColor=white) ![GraphQL](https://img.shields.io/badge/-GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white) ![MongoDB](https://img.shields.io/badge/Mongo%20DB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![pouchDB](https://img.shields.io/badge/pouch%20db-green?style=for-the-badge&logo=data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI4LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGw6IzZDQ0I5OTt9Cjwvc3R5bGU+CjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik05MC4xLDZjMC4yLDAsMC4zLDAsMC41LDBjMzYuNSw0OC4zLDczLDk2LjcsMTA5LjUsMTQ1LjFjMS40LDEuOCwyLjksMi41LDUuMSwyLjRjMzQuNy0wLjEsNjkuNS0wLjEsMTA0LjIsMAoJYzIuNiwwLDQuMi0wLjgsNS44LTIuOUMzNTAuNSwxMDMuMywzODYsNTYuMSw0MjEuNCw4LjljMC43LTAuOSwxLjItMS45LDEuOC0yLjljMC4yLDAsMC4zLDAsMC41LDBjMC40LDIsMC45LDMuOSwxLjIsNS45CgljNi45LDM2LjgsMTMuNyw3My42LDIwLjYsMTEwLjVjMS40LDcuMywyLjksMTQuNiw0LjMsMjEuOGMwLDAuMiwwLDAuMywwLDAuNWMtMC42LDAuNS0xLjIsMS4xLTEuOCwxLjYKCWMtMjQuNywyNC4yLTQ5LjQsNDguNC03NC4yLDcyLjVjLTIuOSwyLjgtMi45LDIuOC0wLjksNi4yYzE2LjYsMjkuNCwzMy4yLDU4LjgsNDkuOSw4OC4yYzEuMSwxLjksMS4zLDMuMywwLjIsNS4zCgljLTM1LjEsNjEuNS03MC4yLDEyMy4xLTEwNS4zLDE4NC42Yy0xLjEsMi0yLjQsMi44LTQuNywyLjhjLTM3LjItMC4xLTc0LjUtMC4xLTExMS43LDBjLTIuMywwLTMuNi0wLjgtNC44LTIuOAoJYy0zNC43LTYxLjMtNjkuNS0xMjIuNi0xMDQuMy0xODMuOGMtMS40LTIuNS0xLjUtNC4zLDAtNi44YzE2LjYtMjkuNSwzMy4xLTU5LDQ5LjgtODguNWMxLjEtMS45LDAuOS0zLTAuNy00LjUKCWMtMjUuOS0yNC40LTUxLjctNDguOC03Ny42LTczLjJjLTEuMy0xLjMtMS43LTIuNC0xLjMtNC4zQzY5LjgsMTA2LjIsNzcuMSw3MC4xLDg0LjUsMzRDODYuNCwyNC43LDg4LjIsMTUuMyw5MC4xLDZ6Ii8+Cjwvc3ZnPgo=&logoColor=6ccb99&color=555555) ![CouchDB](https://img.shields.io/badge/Couch%20DB-DB?style=for-the-badge&logo=apachecouchdb&logoColor=%23E42528&color=black) ![IBM Cloudant](https://img.shields.io/badge/IBM%20Cloud-1261FE?style=for-the-badge&logo=IBM%20Cloud&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Prettier](https://img.shields.io/badge/prettier-1A2C34?style=for-the-badge&logo=prettier&logoColor=F7BA3E) ![ESLint](https://img.shields.io/badge/eslint-3A33D1?style=for-the-badge&logo=eslint&logoColor=white)

<!--![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)-->

</div>
<!-- <div align="center" style="font-size: 22px; font-weight: bold; color: #5A2A27;  >

<!-- [Features](#features) | [Server Set-Up](#server-set-up) | [Client Set-Up](#client-set-up) -->

## <!-- </div -->

<div align="center" style="font-size: 22px; font-weight: bold; color: #5A2A27;">
  <a href="#features" style="color: #5A2A27; font-family: 'Fira Code'; font-weight: 700;">Features</a>  |  
  <a href="#server-set-up" style="color: #5A2A27; font-family: 'Fira Code'; font-weight: 700;">Server Set-Up</a>  |  
  <a href="#client-set-up" style="color: #5A2A27; font-family: 'Fira Code'; font-weight: 700;">Client Set-Up</a>
</div>

---

<a id="features"></a>

<h2 style="color: #5A2A27; font-family: 'Fira Code'; font-weight: 600">Features: </h2>

#### 🗂️ Caching with Redis Stack (Server) & LRU Cache (Client)

<img src="./assets/bundl-inline.svg" style="width: 72px; position: relative; top: 1px;">retrieves data from the local cache with lightning speed

🥟 In-Memory Storage: Fast access to frequently used data.
🥟 Disk-Based Storage: Suitable for larger datasets that don't fit into memory.
🥟 Time-to-Live (TTL): Automatic eviction of old data based on time or size constraints.

#### 🗄️ Database Integration

<img src="./assets/bundl-inline.svg" style="width: 72px; position: relative; top: 1px;">seamlessly integrates with both relational and document based databases.

🥟 SQL Support: Easily connect to MySQL, PostgreSQL, and SQLite databases.
🥟 NoSQL Support: Options for integrating with MongoDB, Redis, and other NoSQL databases.
🥟 Connection Pooling: Efficiently manage and share database connections.

#### 🔎 Query Optimization

<img src="./assets/bundl-inline.svg" style="width: 72px; position: relative; top: 1px;"> ensures

🥟 Lazy Loading: Fetch only the data that is needed, reducing initial load times.
🥟 Batch Processing: Perform bulk operations for improved efficiency.
🥟 Indexing: Speed up data retrieval operations with intelligent indexing.

#### 🎁 Plus More!

🥟 RESTful API: Easy integration with other services.
🥟 Data Validation: Robust validation mechanisms to ensure data integrity.
🥟 Real-Time Analytics: Keep track of various metrics in real-time.

---

<a id="server-set-up"></a>

<h2 style="color: #5A2A27; font-family: 'Fira Code'; font-weight: 600">Set-Up: </h2>

<h2 style="color: #5A2A27; font-family:Fira Code;"><img src="./assets/bundl-inline.svg" style="width: 96px; position: relative; top: 1px;"> Server:</h2>

— <img src="./assets/bundl-inline.svg" style="width: 72px; position: relative; top: 1px;"> makes use of [Redis Stack](https://redis.io/docs/install/install-stack/) for caching data as JSON objects; [Redis Stack](https://redis.io/docs/install/install-stack/) needs to be installed independently. Installaion instructions can be found on the Redis website [here](https://redis.io/docs/install/install-stack/).

```javascript
bun add
```

#### Installation

##### Server Middleware:

1. Install Bun runtime

```javascript
npm install -g bun
```

2. Clone this repo:

```javascript
git clone https://github.com/oslabs-beta/BunDL.git
```

3. Define your schema shape

```javascript
touch .env
echo "QUERY={ user(id: ) { enter your query shape { here here here } } }"
```

<a id="client-set-up"></a>

<h2 style="color: #5A2A27; font-family:Fira Code;"><img src="./assets/bundl-inline.svg" style="width: 96px; position: relative; top: 1px;"> Client:</h2>

---

## BunDL Contributors

Accelerated by [OS Labs](https://github.com/open-source-labs) and devloped by [Ken Iwane](https://www.linkedin.com/in/ken-iwane-5b9209157/), [Shi Kuang](https://www.linkedin.com/in/shi-kuang/), [Brandon Do](https://www.linkedin.com/in/brandonndo/), [Gio Mogi](https://www.linkedin.com/in/giovanni-mogi-189013193/), & [Andrew Wicker](https://www.linkedin.com/in/andrewwicker/).
