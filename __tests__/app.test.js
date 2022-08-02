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
  describe.only("GET /api/topics", () => {
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

//error test to check if incorrect spelling
