const PouchDB = require('pouchdb');

export default class Database {
  constructor(databaseName) {
    this.db = new PouchDB(databaseName);
    // this.db = new PouchDB('http://path.to/couchdb/here')
  }

  // CHECK STATUS OF DATABASE
  async checkDatabase() {
    try {
      const info = await this.db.info();
      console.log(
        `The current state of the ${this.db.db_name} database is: ${info}`
      );
    } catch (error) {
      console.error(error);
    }
  }

  //STORE A DOCUMENT IN POUCHDB
  async storeDocument(document) {
    try {
      await this.db.put(document);
    } catch (error) {
      return console.error(error);
    }
  }

  async retrieveDocument(id) {
    try {
      this.db.get(id);
      await function (doc) {
        console.log(doc);
      };
    } catch (error) {
      console.error(error);
    }
  }

  async updateDocument(id, field, value) {
    try {
      this.db.get(id);
      await function (doc) {
        doc[field] = value;
        return this.db.put(doc);
      };
      await function () {
        return this.db.get(id);
      };
      await function (doc) {
        console.log(doc);
      };
    } catch (error) {
      console.error(error);
    }
  }
}
