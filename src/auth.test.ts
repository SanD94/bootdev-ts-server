import { Request } from "express";
import { vi, describe, it, expect, beforeAll } from "vitest";
import {
  checkPasswordHash,
  getBearerToken,
  getAPIKey,
  hashPassword,
  makeJWT,
  validateJWT,
  BEAR_TOKEN,
  API_BEAR_TOKEN,
} from "./auth.js";
import { UserNotAuthenticatedError } from "./api/errors.js";

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });

  it("should return false for the wrong password", async () => {
    const result = await checkPasswordHash(password1, hash2);
    expect(result).toBe(false);
  });
});

describe("JWT Utilities", () => {
  const userID = "user-123";
  const secret0 = "super-secret-key";
  const secret1 = "wrong-secret-key";
  let expiresIn = 60;

  describe("makeJWT", () => {
    it("should generate a valid string token", () => {
      const token = makeJWT(userID, expiresIn, secret0);
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });
  });

  describe("validateJWT", () => {
    it("should return the correct userID for a valid token", () => {
      const token = makeJWT(userID, expiresIn, secret0);
      const decodedSub = validateJWT(token, secret0);

      expect(decodedSub).toBe(userID);
    });

    it("should throw UserNotAuthenticatedError for a token signed with the wrong secret", () => {
      const token = makeJWT(userID, expiresIn, secret0);

      expect(() => validateJWT(token, secret1)).toThrow(UserNotAuthenticatedError);
      expect(() => validateJWT(token, secret1)).toThrow(/signature/i);
    });

    it("should throw UserNotAuthenticatedError for an expired token", () => {
      vi.useFakeTimers();

      const shortLife = 1; // 1 second
      const token = makeJWT(userID, shortLife, secret0);

      // Advance time unit is ms
      vi.advanceTimersByTime(2000);

      expect(() => validateJWT(token, secret0)).toThrow(UserNotAuthenticatedError);
      expect(() => validateJWT(token, secret0)).toThrow(/expired/i);

      vi.useRealTimers();
    });
  });

  describe("validate token", () => {
    it("should return the token when a valid authorization header is provided", () => {
      const token = "secret-token";
      const mockRequest = {
        get: vi.fn().mockReturnValue(`${BEAR_TOKEN} ${token}`),
      } as unknown as Request;

      const result = getBearerToken(mockRequest);

      expect(result).toBe(token);
      expect(mockRequest.get).toHaveBeenCalledWith("Authorization");
    });

    it("should throw UserNotAuthenticatedError if authorization header is missing", () => {
      const mockRequest = {
        get: vi.fn().mockReturnValue(undefined),
      } as unknown as Request;

      expect(() => getBearerToken(mockRequest)).toThrow(UserNotAuthenticatedError);
      expect(() => getBearerToken(mockRequest)).toThrow("Token not available");
    });

    it("should throw UserNotAuthenticatedError if the prefix is not the expected BEAR_TOKEN", () => {
      const mockRequest = {
        get: vi.fn().mockReturnValue("Basic secret-token"),
      } as unknown as Request;

      expect(() => getBearerToken(mockRequest)).toThrow(UserNotAuthenticatedError);
      expect(() => getBearerToken(mockRequest)).toThrow("Authorization header is broken");
    });

    it("should throw UserNotAuthenticatedError if the token part is missing after the prefix", () => {
      const mockRequest = {
        get: vi.fn().mockReturnValue("Bearer "),
      } as unknown as Request;

      expect(() => getBearerToken(mockRequest)).toThrow(UserNotAuthenticatedError);
      expect(() => getBearerToken(mockRequest)).toThrow("Authorization header is broken");
    });

    it("should throw UserNotAuthenticatedError if the header contains more than two parts", () => {
      const mockRequest = {
        get: vi.fn().mockReturnValue("Bearer secret-token "),
      } as unknown as Request;

      expect(() => getBearerToken(mockRequest)).toThrow(UserNotAuthenticatedError);
      expect(() => getBearerToken(mockRequest)).toThrow("Authorization header is broken");
    });

    it("should throw UserNotAuthenticatedError if the header is not a string", () => {
      const mockRequest = {
        get: vi.fn().mockReturnValue(12345),
      } as unknown as Request;

      expect(() => getBearerToken(mockRequest)).toThrow(UserNotAuthenticatedError);
      expect(() => getBearerToken(mockRequest)).toThrow("Token not available");
    });

  });
});

describe("Polka API Key", () => {
  it("should return the token when a valid authorization header is provided", () => {
    const apiKey = "api-key";
    const mockRequest = {
      get: vi.fn().mockReturnValue(`${API_BEAR_TOKEN} ${apiKey}`),
    } as unknown as Request;

    const result = getAPIKey(mockRequest);

    expect(result).toBe(apiKey);
    expect(mockRequest.get).toHaveBeenCalledWith("Authorization");
  });

  it("should throw UserNotAuthenticatedError if authorization header is missing", () => {
    const mockRequest = {
      get: vi.fn().mockReturnValue(undefined),
    } as unknown as Request;

    expect(() => getAPIKey(mockRequest)).toThrow(UserNotAuthenticatedError);
    expect(() => getAPIKey(mockRequest)).toThrow("API Key not available");
  });

  it("should throw UserNotAuthenticatedError if the prefix is not the expected API_BEAR_TOKEN", () => {
    const mockRequest = {
      get: vi.fn().mockReturnValue("Basic secret-token"),
    } as unknown as Request;

    expect(() => getAPIKey(mockRequest)).toThrow(UserNotAuthenticatedError);
    expect(() => getAPIKey(mockRequest)).toThrow("Authorization header is broken");
  });


  it("should throw UserNotAuthenticatedError if the header does not have apiKey", () => {
    const mockRequest = {
      get: vi.fn().mockReturnValue(`${API_BEAR_TOKEN} `),
    } as unknown as Request;

    expect(() => getAPIKey(mockRequest)).toThrow(UserNotAuthenticatedError);
    expect(() => getAPIKey(mockRequest)).toThrow("Authorization header is broken");
  });

  it("should throw UserNotAuthenticatedError if the header contains more than three elements", () => {
    const apiKey = "api-key";
    const mockRequest = {
      get: vi.fn().mockReturnValue(`${API_BEAR_TOKEN} ${apiKey} extra`),
    } as unknown as Request;

    expect(() => getAPIKey(mockRequest)).toThrow(UserNotAuthenticatedError);
    expect(() => getAPIKey(mockRequest)).toThrow("Authorization header is broken");
  });

  it("should throw UserNotAuthenticatedError if the header is not a string", () => {
    const mockRequest = {
      get: vi.fn().mockReturnValue(12345),
    } as unknown as Request;

    expect(() => getAPIKey(mockRequest)).toThrow(UserNotAuthenticatedError);
    expect(() => getAPIKey(mockRequest)).toThrow("API Key not available");
  });

});

