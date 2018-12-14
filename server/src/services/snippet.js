const Snippet = require('../models/Snippet');
const Book = require('../models/Book');

const logger = console;

const service = {
  get(where, sortOption = { createdAt: -1 }) {
    return Promise.resolve(
      Snippet.find(where)
        .sort(sortOption)
        .lean(),
    );
  },
  getOneRandom(where) {
    const option = [
      {
        $match: where,
      },
      {
        $sample: {
          size: 1,
        },
      },
    ];
    return Promise.resolve(Snippet.aggregate(option));
  },
  async getOneRandomWithSource(where) {
    let snippet = await this.getOneRandom(where);
    if (!snippet || snippet.length < 1) {
      logger.error('no snippet matched: ', where);
      return;
    }
    snippet = snippet[0];
    const source = await Book.findOne({ name: snippet.bookName });
    snippet.cover = source.cover;
    snippet.name = source.name;
    snippet.author = source.author;
    return snippet;
  },
  create(body) {
    return Promise.resolve(Snippet.create(body));
  },
  deleteOne(where) {
    return Promise.resolve(Snippet.deleteOne(where));
  },
};

module.exports = service;
