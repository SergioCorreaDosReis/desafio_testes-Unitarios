import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "@database/index";

let connection: Connection;

describe("Create user", () => {
  beforeAll(async () => {
    connection = await createConnection();
    // antes de criar as conexões executar as migrations
    await connection.runMigrations();

  });


  it("Should be able to create a new user", async () => {
    const user = await request(app).post("/api/v1/users").send({
      name: "admin",
      email: "admin@admin.com",
      password: "admin",
    })

    expect(user.status).toBe(201);
  });

  it("should not be able to create a user when user already exists", async () => {
    const user = await request(app).post("/api/v1/users").send({
      name: "admin",
      email: "admin@admin.com",
      password: "admin",
    })

    expect(user.status).toBe(400);
  });

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close();
  });
})
