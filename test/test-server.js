const chai = require('chai');
const chaitHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaitHttp);

function seedBlogPostData() {
  console.info('seeding post data');
  const seedData = [...Array(10)].map(() => generateBlogPostData());
  return BlogPost.insertMany(seedData);
}

function generateBlogPostData() {
  return {
    author: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    },
    title: faker.random.words(),
    content: faker.lorem.paragraph(),
    created: faker.date.past(),
  };
}

function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('BlogPost API Resource', function() {

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedBlogPostData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  describe('GET /posts endpoint', function() {
    it('should return all existing posts');
    it('should return posts with the correct fields');
  });

  describe('GET posts/:id endpoint', function() {
    it('should return one post by id');
    it('should return the post matching the id given');
  });

  describe('POST /posts endpoint', function() {
    it('should add a new post');
  });

  describe('DELETE /posts/:id endpoint', function() {
    it('should delete a post by id');
  });

  describe('PUT /posts/:id endpoint', function() {
    it('should update the fields of a post by id');
  });

  describe('DELETE /:id endpoint', function() {
    it('should delete a post by id', function() {
      let post;

      return BlogPost.findOne()
        .then(function(_post) {
          post = _post;
          return chai.request(app).delete(`/posts/${post.id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return BlogPost.findById(post.id);
        })
        .then(function(_post) {
          expect(_post).to.be.null;
        })
    });
  });
});