import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "@modules/users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "@modules/users/useCases/createUser/ICreateUserDTO";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "@modules/statements/useCases/createStatement/ICreateStatementDTO";
import { CreateStatementError } from "./CreateStatementError";
import { AppError } from "@shared/errors/AppError";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe("Create a new deposit or withdraw operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to insert a new deposit", async () => {
    const user: ICreateUserDTO = {
      name: "User_Test",
      email: "user@teste.com",
      password: "123456",
    };

    await createUserUseCase.execute(user);

    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    enum OperationType {
      DEPOSIT = "deposit",
      WITHDRAW = "withdraw",
    }

    // Criar a variavel deposito
    const deposit: ICreateStatementDTO = {
      user_id: result.user.id,
      description: "deposit test",
      amount: 1560,
      type: "deposit" as OperationType,
    };

    // Agora vou passar a estrutura de deposito criada para criar ele efetivamente
    const statementDeposit = await createStatementUseCase.execute(deposit);

    expect(statementDeposit).toHaveProperty("id");
    expect(statementDeposit).toHaveProperty("amount");
  });

  it("should not be able to insert a new deposit to non existent user", async () => {
    expect(async () => {
      enum OperationType {
        DEPOSIT = "deposit",
        WITHDRAW = "withdraw",
      }

      // Criar a variavel deposito
      const deposit: ICreateStatementDTO = {
        user_id: "123",
        description: "deposit test",
        amount: 1560,
        type: "deposit" as OperationType,
      };
      await createStatementUseCase.execute(deposit);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should be able to allow a new withdraw only if the user has sufficient funds available", async () => {
    const user: ICreateUserDTO = {
      name: "User_Test",
      email: "user@teste.com",
      password: "123456",
    };

    await createUserUseCase.execute(user);

    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    enum OperationType {
      DEPOSIT = "deposit",
      WITHDRAW = "withdraw",
    }

    // Criar a variavel deposito
    const deposit: ICreateStatementDTO = {
      user_id: result.user.id,
      description: "deposit test",
      amount: 1560,
      type: "deposit" as OperationType,
    };

    const withdraw: ICreateStatementDTO = {
      user_id: result.user.id,
      description: "withdraw",
      amount: 500,
      type: "withdraw" as OperationType,
    };

    // Agora vou passar a estrutura de deposito criada para criar ele efetivamente
    await createStatementUseCase.execute(deposit);
    const statementWithdraw = await createStatementUseCase.execute(withdraw);

    // console.log(statementDeposit);
    console.log(statementWithdraw);

    expect(statementWithdraw).toHaveProperty("id");
  });

  it("should not be able to allow a new withdraw, if the user has insufficient funds available", async () => {
    const user: ICreateUserDTO = {
      name: "User_Test2",
      email: "user2@teste.com",
      password: "123456",
    };

    await createUserUseCase.execute(user);

    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    enum OperationType {
      DEPOSIT = "deposit",
      WITHDRAW = "withdraw",
    }

    // Criar a variavel deposito
    const deposit2: ICreateStatementDTO = {
      user_id: result.user.id,
      description: "deposit test",
      amount: 50,
      type: "deposit" as OperationType,
    };
    await createStatementUseCase.execute(deposit2);

    expect(async () => {
      const withdraw2: ICreateStatementDTO = {
        user_id: result.user.id,
        description: "withdraw",
        amount: 100,
        type: "withdraw" as OperationType,
      };

      await createStatementUseCase.execute(withdraw2);
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
