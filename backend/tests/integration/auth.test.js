/**
 * Auth API integration tests (all under /api/v1/auth).
 *
 * Exercises the full public + protected auth contract: register, login,
 * refresh-token, verify-email, forgot/reset-password, me, logout and
 * change-password. Uses a unique DB so it never clobbers parallel suites.
 */
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../src/modules/users/user.model");

const { bootApp, resetDB, closeDB, agent } = require("../helpers/app");
const {
  createUser,
  authHeaders,
  makeRefreshToken,
  parseCookies,
  TEST_PASSWORD,
  PASSWORD_HASH_SEED,
} = require("../helpers/factories");

// Strong password that passes the register/reset regex
// /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/ and length>=8.
const STRONG_PW = TEST_PASSWORD;

describe("Auth API", () => {
  beforeAll(async () => {
    await bootApp({ dbName: "lux_hotel_auth" });
  });

  beforeEach(async () => {
    await resetDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  // ─── POST /auth/register ──────────────────────────────────────────────
  describe("POST /api/v1/auth/register", () => {
    test("201 + user object without password/passwordHash leak", async () => {
      const res = await agent()
        .post("/api/v1/auth/register")
        .send({
          name: "Alice Wonder",
          email: "alice_" + Date.now() + "@test.dev",
          phone: "+91 98765 43210",
          password: STRONG_PW,
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.email).toBeDefined();
      expect(res.body.data).not.toHaveProperty("password");
      expect(res.body.data).not.toHaveProperty("password");
      expect(res.body.data).not.toHaveProperty("passwordHash");
      expect(res.body.data.passwordHash).toBeUndefined();
    });

    test("409 on duplicate email", async () => {
      const email = "dup_" + Date.now() + "@test.dev";
      await agent()
        .post("/api/v1/auth/register")
        .send({ name: "First User", email, password: STRONG_PW });
      const res = await agent()
        .post("/api/v1/auth/register")
        .send({ name: "Second User", email, password: STRONG_PW });
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    test("422 on weak password", async () => {
      const res = await agent()
        .post("/api/v1/auth/register")
        .send({ name: "Weak Pass", email: "weak_" + Date.now() + "@test.dev", password: "short1" });
      expect(res.status).toBe(422);
    });

    test("422 on password without uppercase", async () => {
      const res = await agent()
        .post("/api/v1/auth/register")
        .send({
          name: "No Upper",
          email: "noupper_" + Date.now() + "@test.dev",
          password: "alllowercase1x",
        });
      expect(res.status).toBe(422);
    });

    test("422 on missing name/email/password", async () => {
      const res = await agent()
        .post("/api/v1/auth/register")
        .send({});
      expect(res.status).toBe(422);
    });
  });

  // ─── POST /auth/login ─────────────────────────────────────────────────
  describe("POST /api/v1/auth/login", () => {
    test("200 returns user + accessToken + httpOnly refreshToken cookie", async () => {
      const user = await createUser();
      const res = await agent().post("/api/v1/auth/login").send({
        email: user.email,
        password: PASSWORD_HASH_SEED,
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(typeof res.body.data.accessToken).toBe("string");

      const cookies = parseCookies(res.headers["set-cookie"] || []);
      expect(cookies.refreshToken).toBeDefined();
      const setCookie = (res.headers["set-cookie"] || []).join(";");
      expect(setCookie).toContain("HttpOnly");
    });

    test("401 on wrong password", async () => {
      const user = await createUser();
      const res = await agent().post("/api/v1/auth/login").send({
        email: user.email,
        password: "WrongPassword1",
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("401 on nonexistent email", async () => {
      const res = await agent().post("/api/v1/auth/login").send({
        email: "ghost_" + Date.now() + "@test.dev",
        password: STRONG_PW,
      });
      expect(res.status).toBe(401);
    });

    test("403 on deactivated user", async () => {
      const user = await createUser({ isActive: false });
      const res = await agent().post("/api/v1/auth/login").send({
        email: user.email,
        password: PASSWORD_HASH_SEED,
      });
      expect(res.status).toBe(403);
    });
  });

  // ─── Email verification enforcement ────────────────────────────────────
  describe("Email verification enforcement", () => {
    const verifyTokenFor = (user) => {
      const token = jwtVerify(user);
      user.emailVerificationToken = token;
      return token;
    };

    test("403 + no tokens when an unverified user tries to log in", async () => {
      const user = await createUser({ isEmailVerified: false });
      const res = await agent().post("/api/v1/auth/login").send({
        email: user.email,
        password: PASSWORD_HASH_SEED,
      });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/verify your email/i);
      expect(res.body.data).toBeUndefined();
      // No access token, no refresh cookie, no session created.
      expect(res.body.data).toBeUndefined();
      const setCookie = (res.headers["set-cookie"] || []).join(";");
      expect(setCookie).not.toContain("refreshToken=");
    });

    test("200 + tokens when a verified user logs in", async () => {
      const user = await createUser(); // factory defaults isEmailVerified: true
      const res = await agent().post("/api/v1/auth/login").send({
        email: user.email,
        password: PASSWORD_HASH_SEED,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.data.accessToken).toBe("string");
      const cookies = parseCookies(res.headers["set-cookie"] || []);
      expect(cookies.refreshToken).toBeDefined();
    });

    test("403 on a protected route with an old token from an unverified account", async () => {
      const user = await createUser({ isEmailVerified: false });
      const res = await agent()
        .get("/api/v1/auth/me")
        .set(authHeaders(user));

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/verify your email/i);
    });

    test("refresh-token is rejected for an unverified account", async () => {
      const user = await createUser({ isEmailVerified: false });
      const refreshJwt = makeRefreshToken(user._id);
      user.refreshToken = await bcrypt.hash(refreshJwt, 4);
      await user.save({ validateBeforeSave: false });

      const res = await agent()
        .post("/api/v1/auth/refresh-token")
        .set("Cookie", `refreshToken=${refreshJwt}`);
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/verify your email/i);
    });

    test("login succeeds after email verification", async () => {
      const user = await createUser({ isEmailVerified: false });
      const token = verifyTokenFor(user);
      await user.save({ validateBeforeSave: false });

      const verifyRes = await agent().get(`/api/v1/auth/verify-email/${token}`);
      expect(verifyRes.status).toBe(200);

      const loginRes = await agent().post("/api/v1/auth/login").send({
        email: user.email,
        password: PASSWORD_HASH_SEED,
      });
      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);
      expect(typeof loginRes.body.data.accessToken).toBe("string");
    });

    test("resend-verification sends a fresh token that can verify the account", async () => {
      const user = await createUser({ isEmailVerified: false });
      const firstToken = verifyTokenFor(user);
      await user.save({ validateBeforeSave: false });

      const res = await agent()
        .post("/api/v1/auth/resend-verification")
        .send({ email: user.email });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // A new token should now be stored on the user.
      const refreshed = await User.findById(user._id).select("+emailVerificationToken");
      expect(refreshed.emailVerificationToken).toBeDefined();
      expect(refreshed.emailVerificationToken).not.toBe(firstToken);

      // The fresh token verifies the account and login then succeeds.
      const verifyRes = await agent().get(`/api/v1/auth/verify-email/${refreshed.emailVerificationToken}`);
      expect(verifyRes.status).toBe(200);

      const loginRes = await agent().post("/api/v1/auth/login").send({
        email: user.email,
        password: PASSWORD_HASH_SEED,
      });
      expect(loginRes.status).toBe(200);
    });

    test("resend-verification never leaks account existence", async () => {
      const unknown = await agent()
        .post("/api/v1/auth/resend-verification")
        .send({ email: "ghost_" + Date.now() + "@test.dev" });
      expect(unknown.status).toBe(200);
      expect(unknown.body.success).toBe(true);
    });

    test("resend-verification for an already verified email is a silent success", async () => {
      const user = await createUser();
      const res = await agent()
        .post("/api/v1/auth/resend-verification")
        .send({ email: user.email });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ─── POST /auth/refresh-token ─────────────────────────────────────────
  describe("POST /api/v1/auth/refresh-token", () => {
    const seedStoredToken = async (user) => {
      const refreshJwt = makeRefreshToken(user._id);
      user.refreshToken = await bcrypt.hash(refreshJwt, 4);
      await user.save({ validateBeforeSave: false });
      return refreshJwt;
    };

    test("200 with fresh accessToken when cookie holds a valid refresh token", async () => {
      const user = await createUser();
      const refreshJwt = await seedStoredToken(user);
      const res = await agent()
        .post("/api/v1/auth/refresh-token")
        .set("Cookie", `refreshToken=${refreshJwt}`);
      expect(res.status).toBe(200);
      expect(typeof res.body.data.accessToken).toBe("string");
      expect(res.body.data.user).toBeDefined();
    });

    test("401 when no cookie present", async () => {
      const res = await agent().post("/api/v1/auth/refresh-token");
      expect(res.status).toBe(401);
    });

    test("401 on a tampered cookie string", async () => {
      const res = await agent()
        .post("/api/v1/auth/refresh-token")
        .set("Cookie", "refreshToken=this.is.tampered");
      expect(res.status).toBe(401);
    });
  });

  // ─── GET /auth/verify-email/:token ────────────────────────────────────
  describe("GET /api/v1/auth/verify-email/:token", () => {
    test("200 verifies a matching token (sets isEmailVerified)", async () => {
      const user = await createUser({ isEmailVerified: false });
      const token = jwtVerify(user);
      user.emailVerificationToken = token;
      await user.save({ validateBeforeSave: false });

      const res = await agent().get(`/api/v1/auth/verify-email/${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(user.email);
    });

    test("400 on an invalid/random token", async () => {
      const res = await agent().get("/api/v1/auth/verify-email/not-a-real-token");
      expect(res.status).toBe(400);
    });

    test("409 when already verified (calling twice)", async () => {
      const user = await createUser({ isEmailVerified: false });
      const token = jwtVerify(user);
      user.emailVerificationToken = token;
      await user.save({ validateBeforeSave: false });

      await agent().get(`/api/v1/auth/verify-email/${token}`);
      const res = await agent().get(`/api/v1/auth/verify-email/${token}`);
      expect(res.status).toBe(409);
    });
  });

  // ─── POST /auth/forgot-password ───────────────────────────────────────
  describe("POST /api/v1/auth/forgot-password", () => {
    test("200 with no data key for an existing email", async () => {
      const user = await createUser();
      const res = await agent().post("/api/v1/auth/forgot-password").send({ email: user.email });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeUndefined();
    });

    test("200 with no data key for an unknown email (no enumeration)", async () => {
      const res = await agent()
        .post("/api/v1/auth/forgot-password")
        .send({ email: "unknown_" + Date.now() + "@test.dev" });
      expect(res.status).toBe(200);
      expect(res.body.data).toBeUndefined();
    });
  });

  // ─── POST /auth/reset-password/:token ─────────────────────────────────
  describe("POST /api/v1/auth/reset-password/:token", () => {
    const makeResetToken = (user) => {
      const raw = crypto.randomBytes(32).toString("hex");
      const hashed = crypto.createHash("sha256").update(raw).digest("hex");
      user.passwordResetToken = hashed;
      user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000);
      return raw;
    };

    test("200 + data=user, and old password no longer logs in", async () => {
      const user = await createUser();
      const rawToken = makeResetToken(user);
      await user.save({ validateBeforeSave: false });

      const res = await agent()
        .post(`/api/v1/auth/reset-password/${rawToken}`)
        .send({ password: STRONG_PW, confirmPassword: STRONG_PW });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(user.email);

      // Old password rejected, new one accepted.
      const oldLogin = await agent().post("/api/v1/auth/login").send({
        email: user.email,
        password: PASSWORD_HASH_SEED,
      });
      expect(oldLogin.status).toBe(401);
      const newLogin = await agent().post("/api/v1/auth/login").send({
        email: user.email,
        password: STRONG_PW,
      });
      expect(newLogin.status).toBe(200);
    });

    test("400 on an invalid token", async () => {
      await createUser();
      const res = await agent()
        .post("/api/v1/auth/reset-password/nonexistent-token")
        .send({ password: STRONG_PW, confirmPassword: STRONG_PW });
      expect(res.status).toBe(400);
    });

    test("422 when passwords do not match", async () => {
      const user = await createUser();
      const rawToken = makeResetToken(user);
      await user.save({ validateBeforeSave: false });
      const res = await agent()
        .post(`/api/v1/auth/reset-password/${rawToken}`)
        .send({ password: STRONG_PW, confirmPassword: "Different1x" });
      expect(res.status).toBe(422);
    });
  });

  // ─── GET /auth/me ─────────────────────────────────────────────────────
  describe("GET /api/v1/auth/me", () => {
    test("200 returns the authenticated user", async () => {
      const user = await createUser();
      const res = await agent()
        .get("/api/v1/auth/me")
        .set(authHeaders(user));
      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(user.email);
    });

    test("401 with no token", async () => {
      const res = await agent().get("/api/v1/auth/me");
      expect(res.status).toBe(401);
    });

    test("401 with an invalid token", async () => {
      const res = await agent()
        .get("/api/v1/auth/me")
        .set("Authorization", "Bearer not.a.real.token");
      expect(res.status).toBe(401);
    });
  });

  // ─── POST /auth/logout ────────────────────────────────────────────────
  describe("POST /api/v1/auth/logout", () => {
    test("200 with no data, clears refresh cookie", async () => {
      const user = await createUser();
      const res = await agent()
        .post("/api/v1/auth/logout")
        .set(authHeaders(user));
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeUndefined();

      const setCookie = (res.headers["set-cookie"] || []).join(";");
      expect(setCookie).toContain("refreshToken=");
      expect(setCookie).toMatch(/Max-Age=0|delete|Expires=/i);
    });
  });

  // ─── PATCH /auth/change-password ──────────────────────────────────────
  describe("PATCH /api/v1/auth/change-password", () => {
    test("200 with no data on valid current password", async () => {
      const user = await createUser();
      const res = await agent()
        .patch("/api/v1/auth/change-password")
        .set(authHeaders(user))
        .send({ currentPassword: PASSWORD_HASH_SEED, newPassword: STRONG_PW });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeUndefined();
    });

    test("401 on wrong current password", async () => {
      const user = await createUser();
      const res = await agent()
        .patch("/api/v1/auth/change-password")
        .set(authHeaders(user))
        .send({ currentPassword: "WrongPassword1", newPassword: STRONG_PW });
      expect(res.status).toBe(401);
    });

    test("422 on missing / too-short new password", async () => {
      const user = await createUser();
      const noNew = await agent()
        .patch("/api/v1/auth/change-password")
        .set(authHeaders(user))
        .send({ currentPassword: PASSWORD_HASH_SEED });
      expect(noNew.status).toBe(422);

      const tooShort = await agent()
        .patch("/api/v1/auth/change-password")
        .set(authHeaders(user))
        .send({ currentPassword: PASSWORD_HASH_SEED, newPassword: "short1" });
      expect(tooShort.status).toBe(422);
    });
  });
});

/**
 * Sign an email-verification token for a user (helper local to this file).
 */
function jwtVerify(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email },
    process.env.JWT_EMAIL_VERIFY_SECRET
  );
}