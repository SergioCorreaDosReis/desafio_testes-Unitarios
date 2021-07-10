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

    // const id = uuidv4();
    // const password = await hash("admin", 8);

    //   await connection.query(
    //     `INSERT INTO USERS (id, name, email, password, created_at, updated_at)
    //     VALUES ('${id}','admin','admin@admin.com','${password}','now()', 'now()')
    //     `
    //   );
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
