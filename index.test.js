const request = require("supertest");
// express app
const app = require("./index");

// db setup
const { sequelize, Dog } = require("./db");
const seed = require("./db/seedFn");
const { dogs } = require("./db/seedData");
const { response } = require("./index");

describe("Endpoints", () => {
  // to be used in POST test
  const testDogData = {
    breed: "Poodle",
    name: "Sasha",
    color: "black",
    description:
      "Sasha is a beautiful black pooodle mix.  She is a great companion for her family.",
  };

  beforeAll(async () => {
    // rebuild db before the test suite runs
    await seed();
  });

  describe("GET /dogs", () => {
    it("should return list of dogs with correct data", async () => {
      // make a request
      const response = await request(app).get("/dogs");
      // assert a response code
      expect(response.status).toBe(200);
      // expect a response
      expect(response.body).toBeDefined();
      // toEqual checks deep equality in objects
      expect(response.body[0]).toEqual(expect.objectContaining(dogs[0]));
    });
  });

  describe("POST /dogs", () => {
    let response;
    beforeEach(async () => {
      // make a request
      response = await request(app).post("/dogs").send(testDogData);
    });
    it("should return the sent data", async () => {
      // assert a response
      expect(response.body).toEqual(expect.objectContaining(testDogData));
    });
    it("returned dog should match database entry", async () => {
      // make a request
      const dogInDb = await Dog.findOne({ where: { id: response.body.id } });
      // assert a response
      expect(dogInDb.id).toEqual(response.body.id);
      expect(dogInDb.name).toEqual(response.body.name);
      expect(dogInDb.breed).toEqual(response.body.breed);
      expect(dogInDb.color).toEqual(response.body.color);
      expect(dogInDb.description).toEqual(response.body.description);
    });
  });

  describe("DELETE /dogs/:id", () => {
    it("should delete the dog matching the given id", async () => {
      // make a request
      await request(app).delete("/dogs/1");
      expect(await Dog.findOne({ where: { id: 1 } })).toBeNull();
    });
  });
});
