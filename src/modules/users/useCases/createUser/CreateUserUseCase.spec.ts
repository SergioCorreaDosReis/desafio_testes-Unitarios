import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able create a user", async () => {
    const user: ICreateUserDTO = {
      name: "User_Test",
      email: "user@teste.com",
      password: "123456",
    };

    await createUserUseCase.execute(user);
    expect(user).toHaveProperty("name");
    expect(user).toHaveProperty("email");
    expect(user).toHaveProperty("password");

  });

  it("Should not be able to create a new user if the e-mail already exists", async () => {
    await expect(async () => {
      await createUserUseCase.execute({
        name: "User_Test",
        email: "user@teste.com",
        password: "123456",
      });
      await createUserUseCase.execute({
        name: "User_Test",
        email: "user@teste.com",
        password: "1234s56",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
