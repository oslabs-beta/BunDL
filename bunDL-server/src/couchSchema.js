const couchDBSchema = {
  _id: 'string',
  _rev: 'string',
  company: 'string',
  city: 'string',
  state: 'string',
  department: 'object',
  animal: 'string',
  avatar: 'string',
  subscriptionTier: 'string',
};


function documentValidation(doc) {
  const expectedFields = Object.keys(couchDBSchema);

  for (const field of expectedFields) {
    if (!doc.hasOwnProperty(field)) {
      return false;
    }
    if (typeof doc[field] !== 'string') {
      return false;
    }
  }
  return true;
}

module.exports = { couchDBSchema, documentValidation };
