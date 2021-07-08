import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "@modules/users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "@modules/users/useCases/createUser/ICreateUserDTO";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;

describe("lists all deposit and withdrawal operations", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should be able to list all deposit and withdrawal operations of authenticated user", async () => {
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

    // Agora vou passar o id do usuario autenticado para retornar o saldo
    const balance = await getBalanceUseCase.execute({user_id:result.user.id});

    expect(balance).toHaveProperty("statement")
    expect(balance).toHaveProperty("balance")

  })

  it("should not be able to list all deposit and withdrawal of a not found user", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({user_id:"1212152"})

    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});

