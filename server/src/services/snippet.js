const Snippet = require('../models/Snippet');

const service = {
  get(where, projection, sort = { createdAt: -1 }, limit = 10) {
    return Promise.resolve(
      Snippet.find(where, projection)
        .sort(sort)
        .limit(limit),
    );
  },
  getOne(where) {
    return Promise.resolve(Snippet.findOne(where));
  },
  getOneRandom() {
    const option = [
      {
        $sample: {
          size: 1,
        },
      },
    ];
    return Promise.resolve(Snippet.aggregate(option));
  },
  create(body) {
    return Promise.resolve(Snippet.create(body));
  },
  deleteOne(where) {
    return Promise.resolve(Snippet.deleteOne(where));
  },
};

module.exports = service;
