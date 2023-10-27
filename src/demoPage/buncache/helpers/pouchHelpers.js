import pouchdb from 'pouchdb';

const vcapLocal = {
  services: {
    cloudantnosqldb: {
      credentials: {
        "apikey": "K9StPMhYQ7gGvkVe-6vbB-1_yKoV4hpmIdT9SjJzSp7X",
        "host": "bb239217-6899-4f67-bc43-e8a61ab80e4f-bluemix.cloudantnosqldb.appdomain.cloud",
        "iam_apikey_description": "Auto-generated for key crn:v1:bluemix:public:cloudantnosqldb:us-south:a/346615b68f04446082a512b3c612e711:44f41151-8ec7-4efd-8b54-b1eb9f927391:resource-key:9b79b4b5-4bfd-4822-91cf-4ee1852e4164",
        "iam_apikey_name": "bundl-brandon",
        "iam_role_crn": "crn:v1:bluemix:public:iam::::serviceRole:Manager",
        "iam_serviceid_crn": "crn:v1:bluemix:public:iam-identity::a/346615b68f04446082a512b3c612e711::serviceid:ServiceId-7d760fca-83d5-48b1-92cf-d22664ae55cd",
        "password": "f4116c05768ba33c8ae4ce89c6c71a26",
        "port": 443,
        "url": "https://apikey-v2-eo862nd3l7nn9eonwj3uwnzviny8k5am6nuzl13f5tq:f4116c05768ba33c8ae4ce89c6c71a26@bb239217-6899-4f67-bc43-e8a61ab80e4f-bluemix.cloudantnosqldb.appdomain.cloud",
        "username": "apikey-v2-eo862nd3l7nn9eonwj3uwnzviny8k5am6nuzl13f5tq"
      },
      label: 'cloudantnosqldb',
    },
  },
};

const cloudantCredentials = vcapLocal.services.cloudantnosqldb.credentials;

const db = new pouchdb('bundl-database');

const pouchURL = cloudantCredentials.url;
const remoteDB = new pouchdb(`${pouchURL}/bundl-test`, {
  auth: {
    username: cloudantCredentials.username,
    password: cloudantCredentials.password,
  },
});

const sync = db.sync(remoteDB, { live: true });
sync.on('error', function (err) {
  console.error('Sync Error', err);
});

export { db };

// export default class PouchDBDataBase {
//   constructor(databaseName, options = {}) {
//     const defaultOptions = {
//       adapter: 'idb',
//       revs_limit: 1,
//       auto_compaction: true,
//     };
//     const finalOptions = { ...defaultOptions, ...options };
//     // ToDo: parse argument to determine if web address or name
//     this.db = new PouchDB(databaseName, finalOptions);
//     // this.db = new PouchDB('http://path.to/couchdb/here')
//   }
// }

//     // RETRIEVE DOCUMENT FROM POUCHDB
//     async retrieveDocument(id, key=null) {
//       try {
//         let doc = await this.db.get(id);
//         if (key) {
//           key.split(':').slice(1).forEach((eachkey)=>{
//             doc = doc[eachkey]
//           })
//         }
//         return doc

//       } catch (error) {
//         console.error(error);
//       }
//     }

//       //STORE A DOCUMENT IN POUCHDB
//   // post - pouch creates id
//   // put - has id
//   // todo create conditional for put/post based on id
//   async storeDocument(document) {
//     try {
//       await this.db.put(document);
//       await this.db.get(document);
//       await this.set(document._id, document);
//     } catch (error) {
//       console.error(error);
//     }
//   }
//   }

//   // printDBMessage() {
//   //   console.log('this is a messgae from pouchHelper');
//   //   return;
//   // }
//   // CHECK STATUS OF DATABASE
//   // async checkDatabase() {
//   //   try {
//   //     const info = await this.db.info();
//   //     console.log(
//   //       `The current state of the ${this.db.name} database is: `,
//   //       info
//   //     );
//   //   } catch (error) {
//   //     console.error(error);
//   //   }
//   // }

//   // UPDATE DOCUMENT IN POUCHDB
//   // async updateDocument(id, key, value) {
//   //   try {
//   //     let doc = await this.db.get(id);
//   //     let copy = doc
//   //     key.split(':').slice(1).forEach((eachkey)=>{
//   //       copy = copy[eachkey]
//   //     })
//   //     copy = value;
//   //     await this.db.put(doc);
//   //   } catch (error) {
//   //     console.error(error);
//   //   }
//   // }

//   // DELETE A DOCUMENT FROM POUCHDB
//   // async deleteDocument(id) {
//   //   try {
//   //     const doc = await this.db.get(id);
//   //     const response = await this.db.remove(doc);
//   //     console.log('Document deleted: ', response);
//   //   } catch (error) {
//   //     console.error(error);
//   //   }
//   // }

//   // BULK OPERATIONS (STORE, UPDATE, DELETE)
//   // async performBulkOperations(docs) {
//   //   try {
//   //     const response = await this.db.bulkDocs(docs);
//   //     console.log(('Bulk operations success: ', response));
//   //   } catch (error) {
//   //     console.error('Bulk operation failed:', error);
//   //   }
//   // }

//   // RESOLVE CONFLICTS
// //   async resolveAndUpdateDocument(id, field, value) {
// //     try {
// //       const doc = await this.db.get(id, {
// //         conflicts: true,
// //       });
// //       if (doc._conflicts && doc._conflicts.length) {
// //         // todo: need conflicts resolution functions here

// //         await Promise.all(
// //           doc._conflicts.map((rev) => {
// //             this.db.remove(id, rev);
// //           })
// //         );
// //       }
// //       doc[field] = value;
// //       await this.db.put(doc);
// //       console.log('Document updated with conflict resolution.');
// //     } catch (error) {
// //       console.error('Could not update document: ', error);
// //     }
// //   }
// // }
