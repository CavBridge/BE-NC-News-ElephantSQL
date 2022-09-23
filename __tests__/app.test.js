const app = require("../app");
const request = require("supertest");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const data = require("../db/data/test-data/index");
require("jest-sorted");
afterAll(() => {
  return db.end();
});

beforeEach(() => {
  return seed(data);
});
describe("HANDLE INVALID ENDPOINT", () => {
  test("status:404 returns invalid input status code if the endpoint is not valid", () => {
    return request(app)
      .get(`/api/notanendpoint`)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("path not found");
      });
  });
});
describe("API", () => {
  describe("GET /api", () => {
    test("status: 200 returns JSON of all available end points", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then(({ body }) => {
          expect(Object.keys(body.endpoints)).toHaveLength(3);
        });
    });
  });
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
            comment_count: 0,
          });
        });
    });
    test("status:200 returns article object with additional comment count property", () => {
      const article_id = 1;
      return request(app)
        .get(`/api/articles/${article_id}`)
        .expect(200)
        .then(({ body }) => {
          expect(body.article).toEqual({
            article_id: article_id,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: "2020-07-09T20:11:00.000Z",
            votes: 100,
            comment_count: 11,
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
    test("status:400 returns invalid input status code if article id does not exist ", () => {
      const article_id = "not-an-id";
      return request(app)
        .get(`/api/articles/${article_id}`)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("invalid input");
        });
    });
  });
  describe("GET /api/articles", () => {
    test("status:200 returns with article array of article objects", () => {
      return request(app)
        .get(`/api/articles`)
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toHaveLength(12);
          expect(articles).toBeSortedBy("created_at", { descending: true });
          articles.forEach((article) => {
            expect(article).toEqual(
              expect.objectContaining({
                article_id: expect.any(Number),
                title: expect.any(String),
                topic: expect.any(String),
                author: expect.any(String),
                created_at: expect.any(String),
                votes: expect.any(Number),
                comment_count: expect.any(Number),
              })
            );
          });
        });
    });
    test("status:200 returns with article array of article objects sorted by title", () => {
      return request(app)
        .get("/api/articles?sort_by=title")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSortedBy("title", { descending: true });
        });
    });
    test("status:200 returns with article array of article objects of a given topic", () => {
      return request(app)
        .get("/api/articles?topic=mitch")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toHaveLength(11);
          expect(body.articles).toBeSortedBy("created_at", {
            descending: true,
          });
        });
    });
    test("status:200 returns empty article array if topic query exists but with no related content", () => {
      return request(app)
        .get("/api/articles?topic=paper")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toHaveLength(0);
        });
    });
    test("status:400 returns invalid input status code if the column does not exist", () => {
      return request(app)
        .get("/api/articles?sort_by=grape")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid sort by query");
        });
    });
    test("status:400 returns invalid input status code if the order query does not equal asc or desc", () => {
      return request(app)
        .get("/api/articles?order=pear")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid order query");
        });
    });
    test("status:404 returns not found status code if the topic query does not exist", () => {
      return request(app)
        .get("/api/articles?topic=cheese")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Topic not found");
        });
    });
  });
  describe("GET /api/articles/:article_id/comments", () => {
    test("status:200 returns an array of comemnts for the given article_id containing correct properties", () => {
      const article_id = 1;
      return request(app)
        .get(`/api/articles/${article_id}/comments`)
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments).toHaveLength(11);
          comments.forEach((comment) => {
            expect(comment).toEqual(
              expect.objectContaining({
                comment_id: expect.any(Number),
                votes: expect.any(Number),
                created_at: expect.any(String),
                author: expect.any(String),
                body: expect.any(String),
              })
            );
          });
        });
    });
    test("status:200 returns an empty array if the article has no comments", () => {
      const article_id = 2;
      return request(app)
        .get(`/api/articles/${article_id}/comments`)
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments).toHaveLength(0);
        });
    });
    test("status:400 returns invalid input status code if article id does not exist ", () => {
      const article_id = "not-an-id";
      return request(app)
        .get(`/api/articles/${article_id}/comments`)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("invalid input");
        });
    });
    test("status:404 returns not found status code if the article does not exist", () => {
      const article_id = 4859432;
      return request(app)
        .get(`/api/articles/${article_id}/comments`)
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("article not found");
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
  describe("POST /api/articles/:article_id/comments", () => {
    test("status:201 returns an object with the correct properties and the posted comment", () => {
      const postedComment = {
        body: "Dogs cant eat grapes",
        username: "butter_bridge",
      };
      const article_id = 7;
      return request(app)
        .post(`/api/articles/${article_id}/comments`)
        .send(postedComment)
        .expect(201)
        .then(({ body }) => {
          expect(body.comment).toEqual({
            comment_id: 19,
            body: "Dogs cant eat grapes",
            article_id: 7,
            author: "butter_bridge",
            votes: 0,
            created_at: expect.any(String),
          });
        });
    });
    test("status:400 returns invalid input status code if object is empty", () => {
      const postedComment = {};
      const article_id = 7;
      return request(app)
        .post(`/api/articles/${article_id}/comments`)
        .send({ postedComment })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("bad request");
        });
    });
    test("status:400 returns invalid input status code if object is empty", () => {
      const postedComment = { username: 123, body: "fief" };
      const article_id = 7;
      return request(app)
        .post(`/api/articles/${article_id}/comments`)
        .send({ postedComment })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("bad request");
        });
    });
    test("status:404 returns not found status code if the article does not exist", () => {
      const article_id = 56743;
      return request(app)
        .post(`/api/articles/${article_id}/comments`)
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
    test("status:404 returns not found status code if the endpoint is not valid", () => {
      return request(app)
        .get("/api/grape")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("path not found");
        });
    });
  });
});
describe("COMMENTS", () => {
  describe("DELETE /api/comments/:comment_id", () => {
    test("status: 204 returns an empty response body", () => {
      const comment_id = 3;
      return request(app).delete(`/api/comments/${comment_id}`).expect(204);
    });

    test("status: 400 returns invalid input status code if comment is not a number and non existent", () => {
      const comment_id = "apple";
      return request(app)
        .delete(`/api/comments/${comment_id}`)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("invalid input");
        });
    });
    test("status: 404 returns not found status code if comment is a number but non existent", () => {
      const comment_id = 5000;
      return request(app)
        .delete(`/api/comments/${comment_id}`)
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("not found");
        });
    });
  });
});
