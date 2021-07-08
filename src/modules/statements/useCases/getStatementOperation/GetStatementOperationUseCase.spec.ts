import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "@modules/users/useCases/authenticateUser/AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "@modules/users/useCases/authenticateUser/IncorrectEmailOrPasswordError";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "@modules/users/useCases/createUser/ICreateUserDTO";
import { AppError } from "@shared/errors/AppError";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

interface IRequest {
  user_id: string;
  statement_id: string;
}

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Search a statement operation by using ID as filter", () => {
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
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to list a specific operation by id", async () => {
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

    // Passo o deposito e o id da operação para o getStatmentOperation
    const operation = await getStatementOperationUseCase.execute({
      user_id: result.user.id,
      statement_id: statementDeposit.id,
    });

    expect(operation).toHaveProperty("id");
  });

  it("should not be able to list a specific operation by id if statment not found", async () => {
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

      expect(async () => {
      // Passo o deposito e o id da operação para o getStatmentOperation
      await getStatementOperationUseCase.execute({
        user_id: result.user.id!,
        statement_id: "123",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });

  it("should not be able to list a specific operation by id if user not found", async () => {
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

    const request : IRequest = {
      user_id:"12345",
      statement_id: statementDeposit.id,
    }

    expect(async () => {
      await getStatementOperationUseCase.execute(request);
    }).rejects.toBeInstanceOf(AppError)
  });
});
