import PouchDb from 'pouchdb-browser';
import PouchDbIdbAdapter from 'pouchdb-adapter-idb';

PouchDb.plugin(PouchDbIdbAdapter);
const db = new PouchDb('localdb', { adapter: 'idb' });
console.log(db.adapter);
