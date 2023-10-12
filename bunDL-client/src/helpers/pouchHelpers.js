const PouchDB = require('pouchdb');

export default class Database {
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

  printDBMessage() {
    console.log('this is a messgae from pouchHelper');
    return;
  }
  // CHECK STATUS OF DATABASE
  async checkDatabase() {
    try {
      const info = await this.db.info();
      console.log(
        `The current state of the ${this.db.name} database is: `,
        info
      );
    } catch (error) {
      console.error(error);
    }
  }

  //STORE A DOCUMENT IN POUCHDB
  async storeDocument(document) {
    try {
      console.log(document);
      const id = document._id;
      await this.db.put(document);
      await this.db.get(document);
      await this.set(document._id, document);
    } catch (error) {
      console.error(error);
    }
  }

  // RETRIEVE DOCUMENT FROM POUCHDB
  async retrieveDocument(id) {
    try {
      const doc = await this.db.get(id);
      console.log(doc);
    } catch (error) {
      console.error(error);
    }
  }

  // UPDATE DOCUMENT IN POUCHDB
  async updateDocument(id, field, value) {
    try {
      let doc = await this.db.get(id);
      doc[field] = value;
      await this.db.put(doc);

      // To verify updated document
      doc = await this.db.get(id);
      console.log(doc);
    } catch (error) {
      console.error(error);
    }
  }

  // DELETE A DOCUMENT FROM POUCHDB
  async deleteDocument(id) {
    try {
      const doc = await this.db.get(id);
      const response = await this.db.remove(doc);
      console.log('Document deleted: ', response);
    } catch (error) {
      console.error(error);
    }
  }

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
  async resolveAndUpdateDocument(id, field, value) {
    try {
      const doc = await this.db.get(id, {
        conflicts: true,
      });
      if (doc._conflicts && doc._conflicts.length) {
        // todo: need conflicts resolution functions here

        await Promise.all(
          doc._conflicts.map((rev) => {
            this.db.remove(id, rev);
          })
        );
      }
      doc[field] = value;
      await this.db.put(doc);
      console.log('Document updated with conflict resolution.');
    } catch (error) {
      console.error('Could not update document: ', error);
    }
  }
}
