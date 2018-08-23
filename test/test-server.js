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
    it('should return all existing posts', function() {
      let res;
      return chai.request(app)
        .get('/posts')
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res.body).to.have.a.lengthOf.at.least(1);
          return BlogPost.count();
        })
        .then(function(count) {
          expect(res.body).to.have.a.lengthOf(count);
        })
    });

    it('should return posts with the correct fields', function() {
      let resPost;
      return chai.request(app)
        .get('/posts')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.a.lengthOf.at.least(1);

          res.body.forEach(function(post) {
            expect(post).to.be.an('object');
            expect(post).to.include.keys(
              'id', 'author', 'content', 'title', 'created'
            );
          });
          resPost = res.body[0];
          return BlogPost.findById(resPost.id);
        })
        .then(function(post) {
          expect(resPost.id).to.equal(post.id);
          expect(resPost.author).to.equal(post.authorName);
          expect(resPost.title).to.equal(post.title);
          expect(resPost.content).to.equal(post.content);
        });
    });
  });

  describe('GET posts/:id endpoint', function() {
    it('should return the post matching the id given', function() {
      let post;
      return BlogPost.findOne()
        .then(function(_post) {
          post = _post
        })
        .then(function() {
          return chai.request(app)
            .get(`/posts/${post.id}`)
        })
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body.id).to.equal(post.id);
          expect(res.body.author).to.equal(post.authorName);
          expect(res.body.title).to.equal(post.title);
          expect(res.body.content).to.equal(post.content);
        });
    });
  });

  describe('POST /posts endpoint', function() {
    it('should add a new post', function() {
      let newPost = generateBlogPostData();
      let count;
      BlogPost.count()
        .then(function(_count) {
          count = _count;
        })
        .then(function() {
          return chai.request(app)
            .post(`/posts`)
            .send(newPost)
        })
        .then(function(res) {
          // Check response Body against newPost
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.bo.an(Object);
          expect(res.body).to.include.keys(
            'id', 'author', 'content', 'title', 'created'
          );
          expect(res.body.author).to.equal(
            `${newPost.author.firstName} ${newPost.author.lastName}`
          );
          expect(res.body.content).to.equal(newPost.content);
          expect(res.body.title).to.equal(newPost.title);
          expect(res.body.id).to.not.be.null;
          expect(res.body.created).to.be.a(Date);

          return BlogPost.findById(res.body.id);
        })
        .then(function(post) {
          // Check post in database against newPost
          expect(post.author).to.equal(newPost.author);
          expect(post.content).to.equal(newPost.content);
          expect(post.title).to.equal(newPost.title);
          expect(post.id).to.equal(newPost.id);
          expect(post.created).to.equal(post.created);

          return BlogPost.count();
        })
        .then(function(_count) {
          expect(_count).to.equal(count + 1);
        });
    });
  });

  describe('DELETE /posts/:id endpoint', function() {
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

  describe('PUT /posts/:id endpoint', function() {
    it('should update the fields of a post by id', function() {

    });
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