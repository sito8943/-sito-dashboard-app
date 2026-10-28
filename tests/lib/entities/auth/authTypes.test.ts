import { describe, expectTypeOf, it } from "vitest";

import type { AuthDto } from "@/lib/entities/auth/AuthDto";
import type { BaseAuthDto } from "@/lib/entities/auth/BaseAuthDto";
import type { BaseRegisterDto } from "@/lib/entities/auth/BaseRegisterDto";
import type { RegisterDto } from "@/lib/entities/auth/RegisterDto";

describe("auth entity types", () => {
  it("keeps base auth fields assignable with default generic parameters", () => {
    const auth: AuthDto = {
      email: "user@mail.com",
      password: "secret",
    };
    const baseAuth: BaseAuthDto = {
      email: "user@mail.com",
      password: "secret",
    };

    expectTypeOf(auth.email).toEqualTypeOf<string>();
    expectTypeOf(auth.password).toEqualTypeOf<string>();
    expectTypeOf(baseAuth.email).toEqualTypeOf<string>();
    expectTypeOf(baseAuth.password).toEqualTypeOf<string>();
  });

  it("keeps register fields assignable with default generic parameters", () => {
    const register: RegisterDto = {
      email: "user@mail.com",
      password: "secret",
      rPassword: "secret",
    };
    const baseRegister: BaseRegisterDto = {
      email: "user@mail.com",
      password: "secret",
      rPassword: "secret",
    };

    expectTypeOf(register.email).toEqualTypeOf<string>();
    expectTypeOf(register.password).toEqualTypeOf<string>();
    expectTypeOf(register.rPassword).toEqualTypeOf<string>();
    expectTypeOf(baseRegister.email).toEqualTypeOf<string>();
    expectTypeOf(baseRegister.password).toEqualTypeOf<string>();
    expectTypeOf(baseRegister.rPassword).toEqualTypeOf<string>();
  });
});
