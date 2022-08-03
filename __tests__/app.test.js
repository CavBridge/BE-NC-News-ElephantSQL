const app = require("../app");
const request = require("supertest");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const data = require("../db/data/test-data/index");

afterAll(() => {
  return db.end();
});

beforeEach(() => {
  return seed(data);
});

describe("TOPICS", () => {
  describe("GET /api/topics", () => {
    test("returns a status of 200", () => {
      return request(app).get("/api/topics").expect(200);
    });
    test("status:200 returns with array of topic objects containing slug and description", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
          const { topics } = body;
          expect(topics).toHaveLength(3);
          topics.forEach((topic) => {
            expect(topic).toEqual(
              expect.objectContaining({
                description: expect.any(String),
                slug: expect.any(String),
              })
            );
          });
        });
    });
    test("status:404 returns not found status code if the endpoint is not valid", () => {
      return request(app)
        .get("/api/apple")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("path not found");
        });
    });
  });
});
describe("ARTICLES", () => {
  describe("GET /api/articles/:article_id", () => {
    test("returns a status of 200", () => {
      const article_id = 4;
      return request(app).get(`/api/articles/${article_id}`).expect(200);
    });
    test("status:200 returns a single article object", () => {
      const article_id = 4;
      return request(app)
        .get(`/api/articles/${article_id}`)
        .expect(200)
        .then(({ body }) => {
          expect(body.article).toEqual({
            article_id: article_id,
            title: "Student SUES Mitch!",
            topic: "mitch",
            author: "rogersop",
            body: "We all love Mitch and his wonderful, unique typing style. However, the volume of his typing has ALLEGEDLY burst another students eardrums, and they are now suing for damages",
            created_at: "2020-05-06T01:14:00.000Z",
            votes: 0,
          });
        });
    });
    test("status:404 returns not found status code if the article does not exist", () => {
      const article_id = 48933;
      return request(app)
        .get(`/api/articles/${article_id}`)
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("article not found");
        });
    });
    test("status:400 returns invalid input status code if the endpoint is not valid", () => {
      const article_id = "not-an-id";
      return request(app)
        .get(`/api/articles/${article_id}`)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("invalid input");
        });
    });
  });
  describe("PATCH /api/articles/:article_id", () => {
    test("status:200 patch and return the updated article with incremented votes", () => {
      const article_id = 4;
      return request(app)
        .patch(`/api/articles/${article_id}`)
        .send({
          inc_votes: 46,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.article).toEqual({
            article_id: article_id,
            title: "Student SUES Mitch!",
            topic: "mitch",
            author: "rogersop",
            body: "We all love Mitch and his wonderful, unique typing style. However, the volume of his typing has ALLEGEDLY burst another students eardrums, and they are now suing for damages",
            created_at: "2020-05-06T01:14:00.000Z",
            votes: 46,
          });
        });
    });
    test("status:200 patch and return the updated article with decremented votes", () => {
      const article_id = 4;
      return request(app)
        .patch(`/api/articles/${article_id}`)
        .send({
          inc_votes: -79,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.article).toEqual({
            article_id: article_id,
            title: "Student SUES Mitch!",
            topic: "mitch",
            author: "rogersop",
            body: "We all love Mitch and his wonderful, unique typing style. However, the volume of his typing has ALLEGEDLY burst another students eardrums, and they are now suing for damages",
            created_at: "2020-05-06T01:14:00.000Z",
            votes: -79,
          });
        });
    });
    test("status:200 returns invalid input status code if object is empty", () => {
      const article_id = 4;
      return request(app)
        .patch(`/api/articles/${article_id}`)
        .send({})
        .expect(200)
        .then(({ body }) => {
          expect(body.article).toEqual({
            article_id: article_id,
            title: "Student SUES Mitch!",
            topic: "mitch",
            author: "rogersop",
            body: "We all love Mitch and his wonderful, unique typing style. However, the volume of his typing has ALLEGEDLY burst another students eardrums, and they are now suing for damages",
            created_at: "2020-05-06T01:14:00.000Z",
            votes: 0,
          });
        });
    });
    test("status:400 returns invalid input status code if votes is not a number", () => {
      const article_id = 4;
      return request(app)
        .patch(`/api/articles/${article_id}`)
        .send({
          inc_votes: "hello",
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("invalid input");
        });
    });
    test("status:404 returns not found status code if the article does not exist", () => {
      const article_id = 56743;
      return request(app)
        .patch(`/api/articles/${article_id}`)
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("article not found");
        });
    });
  });
});
describe("USERS", () => {
  describe("GET /api/users", () => {
    test("returns a status of 200", () => {
      return request(app).get("/api/users").expect(200);
    });
    test("status:200 returns with array of user objects containing username, name and avatar_url", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({ body }) => {
          const { users } = body;
          expect(users).toHaveLength(4);
          users.forEach((user) => {
            expect(user).toEqual(
              expect.objectContaining({
                username: expect.any(String),
                name: expect.any(String),
                avatar_url: expect.any(String),
              })
            );
          });
        });
    });
    test.only("status:404 returns not found status code if the endpoint is not valid", () => {
      return request(app)
        .get("/api/grape")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("path not found");
        });
    });
  });
});
