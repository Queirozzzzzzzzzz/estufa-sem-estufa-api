import { version as uuidVersion } from "uuid";

import orchestrator from "tests/orchestrator";
import password from "models/password";
import db from "infra/database";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.dropAllTables();
  await orchestrator.runPendingMigrations();
});

describe("POST to /api/v1/auth/signup", () => {
  describe("No user", () => {
    test("With unique and valid data", async () => {
      const res = await fetch("http://localhost:3000/api/v1/auth/signup", {
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

      expect(res.status).toBe(200);
      expect(resBody.id).toEqual(1);
      expect(resBody.email).toEqual("coolemail@example.com");
      expect(Date.parse(resBody.created_at)).not.toEqual(NaN);
      expect(Date.parse(resBody.updated_at)).not.toEqual(NaN);

      const passwordsMatch = await password.compare(
        "coolpassword",
        resBody.password
      );
      expect(passwordsMatch).toBe(true);
      const userInDb = await db.query({
        text: "SELECT * FROM users WHERE id = $1;",
        values: [resBody.id],
      });
      expect(userInDb.rows[0].email).toEqual(resBody.email);
    });

    test("With non-unique email", async () => {
      const res = await fetch("http://localhost:3000/api/v1/auth/signup", {
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

      expect(res.status).toEqual(400);
      expect(resBody.status_code).toEqual(400);
      expect(resBody.name).toEqual("ValidationError");
      expect(resBody.message).toEqual(
        'O "email" informado já está sendo usado.'
      );
      expect(resBody.action).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(uuidVersion(resBody.error_id)).toEqual(4);
      expect(uuidVersion(resBody.request_id)).toEqual(4);
      expect(resBody.error_location_code).toEqual(
        "MODEL:USER:VALIDATE_UNIQUE_EMAIL:ALREADY_EXISTS"
      );
      expect(resBody.key).toEqual("email");
    });

    test("With invalid email", async () => {
      const res = await fetch("http://localhost:3000/api/v1/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "invalidemail",
          password: "coolpassword",
        }),
      });

      const resBody = await res.json();

      expect(res.status).toEqual(400);
      expect(resBody.status_code).toEqual(400);
      expect(resBody.name).toEqual("ValidationError");
      expect(resBody.message).toEqual('"email" deve conter um email válido.');
      expect(resBody.action).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(uuidVersion(resBody.error_id)).toEqual(4);
      expect(uuidVersion(resBody.request_id)).toEqual(4);
      expect(resBody.error_location_code).toEqual(
        "MODEL:VALIDATOR:FINAL_SCHEMA"
      );
      expect(resBody.key).toEqual("email");
    });
  });
});
