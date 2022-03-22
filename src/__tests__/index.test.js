import supertest from "supertest";
import { app } from "../app.js";
import dotenv from "dotenv";

import mongoose from "mongoose";
dotenv.config();
console.log(process.env.MONGO_URL);
const client = supertest(app);
describe("Testing the testing environment", () => {
  test("should check that true is true", () => {
    expect(true).toBe(true);
  });
  test("should check that 1 + 1 is 2", () => {
    expect(1 + 1).toBe(2);
  });
});
describe("Testing the endpoints", () => {
  beforeAll(async () => {
    console.log("Before all tests...");
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to Mongo");
  });
  it("should test that the test endpoint returns a success message", async () => {
    const response = await client.get("/test");
    expect(response.body.message).toBe("Test success");
  });
  const validProduct = {
    name: "Test product 2",
    price: 350,
  };
  it("should test that the POST /products endpoint returns the newly created product", async () => {
    const response = await client.post("/products").send(validProduct);
    expect(response.status).toBe(201);
    expect(response.body._id).toBeDefined();
    console.log(response.body);
  });
  const invalidData = {
    whatever: "something",
  };
  it("should test that POST /products with INVALID data returns 400", async () => {
    const response = await client.post("/products").send(invalidData);
    expect(response.status).toBe(400);
  });
  let createdProductId;

  it("should test that the GET /products endpoint returns the product we just created", async () => {
    const response = await client.get("/products");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    createdProductId = response.body[0]._id;
  });

  it("should test that the GET /products/:createdId endpoint returns the product we just created", async () => {
    const response = await client.get(`/products/${createdProductId}`);

    expect(response.body._id).toBe(createdProductId);
    expect(response.body.name).toBe(validProduct.name);
  });

  it("should test that the GET /products/:invalidId returns 404", async () => {
    const response = await client.get(`/products/777777777777777777777777`);
    expect(response.status).toBe(404);
  });
//   it("should test that the DELETE/products/:createdId endpoint DELETE THE PRODUCT", async () => {
//     const response = await client.get(`/products/${createdProductId}`);
//     expect(response.status).toBe(204);
//     expect(response.body.length).toBe(0);
//     createdProductId = response.body[0]._id;
//   });
//   it("should test that the DELETE /products/:invalidId returns 404", async () => {
//     const response = await client.get(`/products/777777777777777777777777`);
//     expect(response.status).toBe(404);
//   });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    console.log("Closed Mongo connection.");
  });
});
