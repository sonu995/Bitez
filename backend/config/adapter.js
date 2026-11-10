const mongoose = require('mongoose');
const { createJSONModel } = require('./jsonStore');

function getModel(collectionName, MongooseModel) {
  const jsonModel = createJSONModel(collectionName);

  return new Proxy({}, {
    get(target, prop) {
      // If mongoose is connected (readyState === 1), use mongoose model
      if (mongoose.connection && mongoose.connection.readyState === 1 && MongooseModel) {
        const val = MongooseModel[prop];
        if (typeof val === 'function') {
          return val.bind(MongooseModel);
        }
        return val;
      }

      // Otherwise, use fallback JSON storage engine
      const val = jsonModel[prop];
      if (typeof val === 'function') {
        return val.bind(jsonModel);
      }
      return val;
    }
  });
}

module.exports = { getModel };
