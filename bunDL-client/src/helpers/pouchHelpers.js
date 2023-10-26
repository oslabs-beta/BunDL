import pouchdb from 'pouchdb';

const db = new pouchdb('bundl-database');

let dbName = Bun.env.COUCHDB_DB_NAME;
let pouchURL = Bun.env.POUCHDB_URL;
let username = Bun.env.POUCHDB_USERNAME;
let password = Bun.env.POUCHDB_PASSWORD;

if (!dbName || !pouchURL || !username || !password) {
  try {
    const config = JSON.parse(await Bun.file('./config.json').text());
    dbName = config.couchDBName;
    pouchURL = config.pouchURL;
    username = config.username;
    password = config.password;
  } catch (error) {
    console.error('no couchDB credentials found!');
  }
}
if (dbName && pouchURL && username && password) {
  const remoteDB = new pouchdb(`${pouchURL}/${dbName}`, {
    auth: {
      username,
      password,
    },
  });
  const sync = db.sync(remoteDB, { live: true });
  sync.on('error', function (err) {
    console.error('Sync Error', err);
  });
}

export { db };
