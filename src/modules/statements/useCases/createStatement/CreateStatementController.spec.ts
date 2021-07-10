import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "@database/index";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let connection: Connection;

describe("Performs withdraw operation", () => {
  beforeAll(async () => {
    connection = await createConnection();
    // antes de criar as conexões executar as migrations
    await connection.runMigrations();

    const id = uuidv4();
    const password = await hash("admin", 8);

    await connection.query(
      `INSERT INTO USERS (id, name, email, password, created_at, updated_at)
		VALUES ('${id}','admin4','admin4@admin.com','${password}', 'now()', 'now()')
			 `
    );
  });

  it("should be able to insert a new withdraw", async () => {
    const authenticateUser = await request(app).post("/api/v1/sessions").send({
      email: "admin4@admin.com",
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
      amount: 100,
      type: "deposit" as OperationType,
    };

    await request(app)
      .post("/api/v1/statements/deposit")
      .send(deposit)
      .set({ Authorization: `Bear ${token}` });

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send(withdraw)
      .set({ Authorization: `Bear ${token}` });

    await expect(response.status).toBe(201);
    await expect(response.body).toHaveProperty("type");
    await expect(response.body.type).toEqual("withdraw");
  });

  it("should not be able to allow a new withdraw if the user has sufficient funds available", async () => {
    const authenticateUser = await request(app).post("/api/v1/sessions").send({
      email: "admin4@admin.com",
      password: "admin",
    });

    const { id, token } = authenticateUser.body;

    enum OperationType {
      DEPOSIT = "deposit",
      WITHDRAW = "withdraw",
    }

    const withdraw: ICreateStatementDTO = {
      user_id: id,
      description: "withdraw test",
      amount: 100,
      type: "deposit" as OperationType,
    };

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send(withdraw)
      .set({ Authorization: `Bear ${token}` });

    await expect(response.status).toBe(400);
    await expect(response.body.message).toBe("Insufficient funds");
  });

  it("should not be able to do withdraw to a user without a authenticated token", async () => {

    const withdraw: ICreateStatementDTO = {
      user_id: "123",
      description: "withdraw test",
      amount: 100,
      type: "withdraw" as any,
    };
    const response = await request(app)
    .post("/api/v1/statements/withdraw")
    .send(withdraw)
    .set({ Authorization: `Bear ${123}` });

    // console.log(response.body);

    await expect(response.status).toBe(401);
		await expect(response.body.message).toBe("JWT invalid token!")

  });

  it("should be able to insert a new deposit", async () => {
    const authenticateUser = await request(app).post("/api/v1/sessions").send({
      email: "admin4@admin.com",
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
      amount: 1,
      type: "deposit" as OperationType,
    };

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send(deposit)
      .set({ Authorization: `Bear ${token}` });


    await expect(response.status).toBe(201);
    await expect(response.body).toHaveProperty("type");
    await expect(response.body.type).toEqual("deposit");
  });

  it("should not be able to do deposit to a user without a authenticated token", async () => {

    const withdraw: ICreateStatementDTO = {
      user_id: "123",
      description: "deposit test",
      amount: 10,
      type: "deposit" as any,
    };
    const response = await request(app)
    .post("/api/v1/statements/deposit")
    .send(withdraw)
    .set({ Authorization: `Bear ${123}` });

    // console.log(response.body);

    await expect(response.status).toBe(401);
		await expect(response.body.message).toBe("JWT invalid token!")

  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });
});
