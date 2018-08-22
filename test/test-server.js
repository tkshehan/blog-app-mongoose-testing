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

  });

  describe('GET posts/:id endpoint', function() {

  });

  describe('POST /posts endpoint', function() {

  });

  describe('DELETE /posts/:id endpoint', function() {

  });

  describe('PUT /posts/:id endpoint', function() {

  });

  describe('DELETE /:id endpoint', function() {

  });
});