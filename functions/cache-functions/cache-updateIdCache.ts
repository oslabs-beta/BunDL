  /**
   * Stores keys in a nested object under parent name.
   * If the key is a duplication, it is stored in an array.
   *  @param {string} objKey - Object key; key to be cached without ID string.
   *  @param {string} keyWithID - Key to be cached with ID string attached; Redis data is stored under this key.
   *  @param {string} currName - The parent object name.
   */
 

  updateIdCache(objKey: string, keyWithID: string, currName: string): void {

    if (!idCache[currName]) {
      idCache[currName] = {};
      idCache[currName][objKey] = keyWithID;
      return undefined; // Explicitly return undefined
    } else if (!Array.isArray(idCache[currName][objKey]) || !idCache[currName][objKey]) {
      idCache[currName][objKey] = [];
    } else {
      (idCache[currName][objKey] as string[]).push(keyWithID);    
    }
    return undefined; // Explicitly return undefined
  }