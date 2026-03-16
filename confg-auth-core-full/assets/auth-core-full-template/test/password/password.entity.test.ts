import { Password } from "../../src/password/model/password.entity";

test("Deve ter erro pra senha inválida", () => {
  const senha = "123";
  const password = Password.tryCreate({
    content: senha,
  });
  expect(password.isFailure).toBe(true);
});

test("Deve dar certo pra senha válida", () => {
  const senha =
    "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
  const password = Password.create({
    content: senha,
  });
  expect(password.content).toBeDefined();
});
