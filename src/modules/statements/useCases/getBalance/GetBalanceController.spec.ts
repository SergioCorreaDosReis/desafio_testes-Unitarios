import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "@database/index";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";

let connection: Connection;

describe("List a statement balance", () => {
  beforeAll(async () => {
    connection = await createConnection();
    // antes de criar as conexões executar as migrations
    await connection.runMigrations();

    const id = uuidv4();
    const password = await hash("admin", 8);

    await connection.query(
      `INSERT INTO USERS (id, name, email, password, created_at, updated_at)
		VALUES ('${id}','admin5','admin5@admin.com','${password}', 'now()', 'now()')
			 `
    );
  });

  it("should be able to return a list a statement balance", async () => {
    const authenticateUser = await request(app).post("/api/v1/sessions").send({
      email: "admin5@admin.com",
      password: "admin",
    });

    const { id, token } = authenticateUser.body;

    enum OperationType {
      DEPOSIT = "deposit",
      WITHDRAW = "withdraw",
    }

    // Criar a variavel deposito
    const deposit: ICreateStatementDTO = {
      user_id: id,
      description: "deposit test",
      amount: 100,
      type: "deposit" as OperationType,
    };

    const withdraw: ICreateStatementDTO = {
      user_id: id,
      description: "withdraw test",
      amount: 50,
      type: "deposit" as OperationType,
    };

    // Insere 3 depositos de $ 100
    await request(app)
      .post("/api/v1/statements/deposit")
      .send(deposit)
      .set({ Authorization: `Bear ${token}` });
    await request(app)
      .post("/api/v1/statements/deposit")
      .send(deposit)
      .set({ Authorization: `Bear ${token}` });
    await request(app)
      .post("/api/v1/statements/deposit")
      .send(deposit)
      .set({ Authorization: `Bear ${token}` });

    // Insere 2 saques de $ 50
    await request(app)
      .post("/api/v1/statements/withdraw")
      .send(withdraw)
      .set({ Authorization: `Bear ${token}` });
    await request(app)
      .post("/api/v1/statements/withdraw")
      .send(withdraw)
      .set({ Authorization: `Bear ${token}` });

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({ Authorization: `Bear ${token}` });

    await expect(response.status).toBe(200);
    await expect(response.body).toHaveProperty("statement");
    await expect(response.body).toHaveProperty("balance");
  });

  it("should not be able to return a information to non authenticated user", async () => {
    const authenticateUser = await request(app).post("/api/v1/sessions").send({
      email: "nonexistentUser",
      password: "Non",
    });

      await expect(authenticateUser.status).toBe(401);
      await expect(authenticateUser.body.message).toEqual("Incorrect email or password");
  });

  afterAll(async () => {
    // await connection.dropDatabase();
    await connection.close();
  });
});
