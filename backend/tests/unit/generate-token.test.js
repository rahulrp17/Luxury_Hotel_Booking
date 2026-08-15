/**
 * Unit tests for the JWT helpers (src/utils/generateToken.js).
 *
 * Secrets are forced to fixed values *before* the module is required so any
 * signature/expiry behaviour is fully deterministic and never touches real env.
 */
const jwt = require("jsonwebtoken");

const ISS = "luxury-hotel-api";
const AUD = "luxury-hotel-client";

process.env.JWT_ACCESS_SECRET = "unit_test_access_secret_long_enough";
process.env.JWT_REFRESH_SECRET = "unit_test_refresh_secret_long_enough";
process.env.JWT_EMAIL_VERIFY_SECRET = "unit_test_email_secret_long_enough";
process.env.JWT_ACCESS_EXPIRE = "15m";
process.env.JWT_REFRESH_EXPIRE = "7d";

const {
  generateAccessToken,
  generateRefreshToken,
  generateEmailVerificationToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyEmailToken,
} = require("../../src/utils/generateToken");

describe("token generation payload + claims", () => {
  test("generateAccessToken signs with the right payload, issuer and audience", () => {
    const payload = { userId: "abc", role: "USER" };
    const token = generateAccessToken(payload);
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
      issuer: ISS,
      audience: AUD,
    });
    expect(decoded.userId).toBe("abc");
    expect(decoded.role).toBe("USER");
  });

  test("generateRefreshToken signs with the right payload, issuer and audience", () => {
    const token = generateRefreshToken({ userId: "abc" });
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: ISS,
      audience: AUD,
    });
    expect(decoded.userId).toBe("abc");
  });

  test("generateEmailVerificationToken has no issuer/audience claim", () => {
    const token = generateEmailVerificationToken({ email: "a@b.com" });
    const decoded = jwt.verify(token, process.env.JWT_EMAIL_VERIFY_SECRET);
    expect(decoded.email).toBe("a@b.com");
    expect(decoded.iss).toBeUndefined();
    expect(decoded.aud).toBeUndefined();
  });
});

describe("verify helpers round-trip", () => {
  test("verifyAccessToken verifies a generated access token", () => {
    const token = generateAccessToken({ userId: "u1" });
    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe("u1");
  });

  test("verifyRefreshToken verifies a generated refresh token", () => {
    const token = generateRefreshToken({ userId: "u1" });
    const decoded = verifyRefreshToken(token);
    expect(decoded.userId).toBe("u1");
  });

  test("verifyEmailToken verifies a generated email token", () => {
    const token = generateEmailVerificationToken({ email: "x@y.com" });
    const decoded = verifyEmailToken(token);
    expect(decoded.email).toBe("x@y.com");
  });

  test("access token is rejected by the refresh verifier (different secret)", () => {
    const token = generateAccessToken({ userId: 1 });
    expect(() => verifyRefreshToken(token)).toThrow();
  });
});

describe("verification failures", () => {
  test("a token signed with the wrong secret throws", () => {
    const token = jwt.sign({ userId: 1 }, "totally_wrong_secret_value_here", {
      expiresIn: "15m",
      issuer: ISS,
      audience: AUD,
    });
    expect(() => verifyAccessToken(token)).toThrow();
  });

  test("an expired access token throws", async () => {
    process.env.JWT_ACCESS_EXPIRE = "1s";
    const token = generateAccessToken({ userId: 1 });
    // Wait ~1.1s so the token expires before verification.
    await new Promise((r) => setTimeout(r, 1100));
    expect(() => verifyAccessToken(token)).toThrow();
  });

  test("an expired refresh token throws", async () => {
    process.env.JWT_REFRESH_EXPIRE = "1s";
    const token = generateRefreshToken({ userId: 1 });
    await new Promise((r) => setTimeout(r, 1100));
    expect(() => verifyRefreshToken(token)).toThrow();
  });
});