import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "@database/index";
import { JWTTokenMissingError } from "@shared/errors/JWTTokenMissingError";

let connection: Connection;

describe("List a user information", () => {
  beforeAll(async () => {
    connection = await createConnection();
    // antes de criar as conexões executar as migrations
    await connection.runMigrations();

    const id = uuidv4();
    const password = await hash("admin", 8);

    await connection.query(
      `INSERT INTO USERS (id, name, email, password, created_at, updated_at)
		VALUES ('${id}','admin3','admin3@admin.com','${password}', 'now()', 'now()')
			 `
    );
  });

  it("Should be able lits a user information by user id", async () => {
    const authenticateUser = await request(app).post("/api/v1/sessions").send({
      email: "admin3@admin.com",
      password: "admin",
    });

    // console.log(authenticateUser.body);

    const { id, token} = authenticateUser.body;

    const response = await request(app)
    .get("/api/v1/profile")
    .query({ id: id })
    .set({ Authorization: `Bear ${token}` });

    // console.log(response.body);

    await expect(response.status).toBe(200);
		await expect(response.body).toHaveProperty("name");
		await expect(response.body).toHaveProperty("created_at");
		await expect(response.body.name).toEqual("admin3");
  });


  it("Should not be able lits a user without a authenticated token", async () => {
    const response = await request(app)
    .get("/api/v1/profile")
    .query({ id: "123" })
    .set({ Authorization: `Bear ${233}` });

    // console.log(response.body);

    await expect(response.status).toBe(401);
		await expect(response.body.message).toBe("JWT invalid token!")

  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });
})
