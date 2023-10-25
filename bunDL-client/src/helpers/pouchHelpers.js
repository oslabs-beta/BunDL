const PouchDB = require('pouchdb');

//couch at the top
//pouch is local and syncs with cloud database
//client is going to store info in cache and next check is pouch (bc pouch syncs with couch, even if you're offline you should be able to get from couch)
//anytime you add it to the database, you add to the pouch and it will sync to couchdb
//couch - bring data to local so it can run offline

PouchDB.plugin(require('pouchdb-find'))

export default class PouchDBDataBase {
  constructor(databaseName, options = {}) {
    const defaultOptions = {
      adapter: 'idb',
      revs_limit: 1,
      auto_compaction: true,
    };
    const finalOptions = { ...defaultOptions, ...options };
    // ToDo: parse argument to determine if web address or name
    this.db = new PouchDB(databaseName, finalOptions);
    this.storeDocument = this.storeDocument.bind(this);
    this.printDBMessage = this.printDBMessage.bind(this);
    // this.db = new PouchDB('http://path.to/couchdb/here')
  }

    // RETRIEVE DOCUMENT FROM POUCHDB
    async retrieveDocument(id, key=null) {
      try {
        let doc = await this.db.get(id);
        if (key) {
          key.split(':').slice(1).forEach((eachkey)=>{
            doc = doc[eachkey]
          })
        }
        return doc

      } catch (error) {
        console.error(error);
      }
    }

      //STORE A DOCUMENT IN POUCHDB
  // post - pouch creates id
  // put - has id
  // todo create conditional for put/post based on id
  async storeDocument(document) {
    try {
      await this.db.put(document);
      await this.db.get(document);
      await this.set(document._id, document);
    } catch (error) {
      console.error(error);
    }
  }
  }

  // printDBMessage() {
  //   console.log('this is a messgae from pouchHelper');
  //   return;
  // }
  // CHECK STATUS OF DATABASE
  // async checkDatabase() {
  //   try {
  //     const info = await this.db.info();
  //     console.log(
  //       `The current state of the ${this.db.name} database is: `,
  //       info
  //     );
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }




  // UPDATE DOCUMENT IN POUCHDB
  // async updateDocument(id, key, value) {
  //   try {
  //     let doc = await this.db.get(id);
  //     let copy = doc
  //     key.split(':').slice(1).forEach((eachkey)=>{
  //       copy = copy[eachkey]
  //     })
  //     copy = value;
  //     await this.db.put(doc);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  // DELETE A DOCUMENT FROM POUCHDB
  // async deleteDocument(id) {
  //   try {
  //     const doc = await this.db.get(id);
  //     const response = await this.db.remove(doc);
  //     console.log('Document deleted: ', response);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  // BULK OPERATIONS (STORE, UPDATE, DELETE)
  // async performBulkOperations(docs) {
  //   try {
  //     const response = await this.db.bulkDocs(docs);
  //     console.log(('Bulk operations success: ', response));
  //   } catch (error) {
  //     console.error('Bulk operation failed:', error);
  //   }
  // }

  // RESOLVE CONFLICTS
//   async resolveAndUpdateDocument(id, field, value) {
//     try {
//       const doc = await this.db.get(id, {
//         conflicts: true,
//       });
//       if (doc._conflicts && doc._conflicts.length) {
//         // todo: need conflicts resolution functions here

//         await Promise.all(
//           doc._conflicts.map((rev) => {
//             this.db.remove(id, rev);
//           })
//         );
//       }
//       doc[field] = value;
//       await this.db.put(doc);
//       console.log('Document updated with conflict resolution.');
//     } catch (error) {
//       console.error('Could not update document: ', error);
//     }
//   }
// }
