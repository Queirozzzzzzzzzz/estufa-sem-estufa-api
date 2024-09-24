import { version as uuidVersion } from "uuid";

import orchestrator from "tests/orchestrator";
import session from "models/session";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.dropAllTables();
  await orchestrator.runPendingMigrations();
});

describe("POST to /api/v1/auth/signin", () => {
  describe("No user", () => {
    test("With valid data", async () => {
      const testUserRes = await fetch(
        "http://localhost:3000/api/v1/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "coolemail@example.com",
            password: "coolpassword",
          }),
        },
      );
      const testUser = await testUserRes.json();

      const res = await fetch("http://localhost:3000/api/v1/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "coolemail@example.com",
          password: "coolpassword",
        }),
      });

      const resBody = await res.json();

      expect(res.status).toBe(201);
      expect(resBody.id).toEqual(1);
      expect(resBody.token.length).toEqual(96);
      expect(resBody.user_id).toEqual(testUser.id);
      expect(Date.parse(resBody.expires_at)).not.toEqual(NaN);
      expect(Date.parse(resBody.created_at)).not.toEqual(NaN);

      const sessionObjInDb = await session.findById(resBody.id);
      expect(sessionObjInDb.user_id).toEqual(testUser.id);
    });

    test("With invalid email", async () => {
      const res = await fetch("http://localhost:3000/api/v1/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "wrongemail@example.com",
          password: "coolpassword",
        }),
      });

      const resBody = await res.json();

      expect(res.status).toBe(401);
      expect(resBody.name).toEqual("UnauthorizedError");
      expect(resBody.message).toEqual("Dados não conferem.");
      expect(resBody.action).toEqual(
        "Verifique se os dados enviados estão corretos.",
      );
      expect(resBody.status_code).toEqual(401);
      expect(uuidVersion(resBody.error_id)).toEqual(4);
      expect(uuidVersion(resBody.request_id)).toEqual(4);
      expect(resBody.error_location_code).toEqual(
        "CONTROLLER:SESSIONS:POST_HANDLER:DATA_MISMATCH",
      );
    });

    test("With invalid password", async () => {
      const res = await fetch("http://localhost:3000/api/v1/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "coolemail@example.com",
          password: "wrongpassword",
        }),
      });

      const resBody = await res.json();

      expect(res.status).toBe(401);
      expect(resBody.name).toEqual("UnauthorizedError");
      expect(resBody.message).toEqual("Dados não conferem.");
      expect(resBody.action).toEqual(
        "Verifique se os dados enviados estão corretos.",
      );
      expect(resBody.status_code).toEqual(401);
      expect(uuidVersion(resBody.error_id)).toEqual(4);
      expect(uuidVersion(resBody.request_id)).toEqual(4);
      expect(resBody.error_location_code).toEqual(
        "CONTROLLER:SESSIONS:POST_HANDLER:DATA_MISMATCH",
      );
    });
  });
});
