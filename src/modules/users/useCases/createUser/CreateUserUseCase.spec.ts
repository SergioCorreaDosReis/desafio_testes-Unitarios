import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
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
    console.log(user);
    expect(user).toHaveProperty("name");
  });
});
