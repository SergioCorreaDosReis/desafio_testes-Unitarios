import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "@database/index";


let connection: Connection;

describe("Authenticate a user", () => {
  beforeAll(async () => {
    connection = await createConnection();
    // antes de criar as conexões executar as migrations
    await connection.runMigrations();

    const id = uuidv4();
    const password = await hash("admin", 8);

    await connection.query(
      `INSERT INTO USERS (id, name, email, password, created_at, updated_at)
		VALUES ('${id}','admin2','admin2@admin.com','${password}', 'now()', 'now()')
			 `
    );
  });

  it("Should be able authenticate a user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin2@admin.com",
      password: "admin",
    });

    expect(response.status).toBe(200);
  });

  it("Should not be able authenticate a user with incorrect email", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "123456",
      password: "admin",
    });

    expect(response.status).toBe(401);
  });


  it("Should not be able authenticate a user with incorrect password", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin2@admin.com",
      password: "12345",
    });

    expect(response.status).toBe(401);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });
});
