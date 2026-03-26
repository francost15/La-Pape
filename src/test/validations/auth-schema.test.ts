import { describe, it, expect } from "vitest";
import { loginSchema, signUpSchema } from "@/lib/validations/auth-schema";

describe("loginSchema", () => {
  it("validates correct email and password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("fails for empty email", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "password123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("El email es requerido");
    }
  });

  it("fails for invalid email format", () => {
    const result = loginSchema.safeParse({
      email: "notanemail",
      password: "password123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("El email no es válido");
    }
  });

  it("fails for empty password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("La contraseña es requerida");
    }
  });

  it("fails for password less than 6 characters", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "12345",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("La contraseña debe tener al menos 6 caracteres");
    }
  });

  it("fails when email is missing", () => {
    const result = loginSchema.safeParse({
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("fails when password is missing", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
    });
    expect(result.success).toBe(false);
  });
});

describe("signUpSchema", () => {
  it("is the same as loginSchema", () => {
    const loginResult = loginSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    const signUpResult = signUpSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(signUpResult.success).toBe(loginResult.success);
  });

  it("validates correct email and password for signup", () => {
    const result = signUpSchema.safeParse({
      email: "newuser@example.com",
      password: "newpassword",
    });
    expect(result.success).toBe(true);
  });
});
