const Snippet = require('../models/Snippet');

const service = {
  get(where, sortOption = { createdAt: -1 }) {
    return Promise.resolve(
      Snippet.find(where)
        .sort(sortOption)
        .lean(),
    );
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
