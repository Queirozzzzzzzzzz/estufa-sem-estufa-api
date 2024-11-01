import { version as uuidVersion } from "uuid";

import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.dropAllTables();
  await orchestrator.runPendingMigrations();

  await fetch("http://localhost:3000/api/v1/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "coolemail@example.com",
      password: "coolpassword",
    }),
  });
});

describe("POST to /api/v1/data", () => {
  describe("No user", () => {
    test("Retrieving information", async () => {
      const res = await fetch("http://localhost:3000/api/v1/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const resBody = await res.json();

      expect(res.status).toEqual(400);
      expect(resBody.status_code).toEqual(400);
      expect(resBody.name).toEqual("ValidationError");
      expect(resBody.message).toEqual('"token" é um campo obrigatório.');
      expect(resBody.action).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(uuidVersion(resBody.error_id)).toEqual(4);
      expect(uuidVersion(resBody.request_id)).toEqual(4);
      expect(resBody.error_location_code).toBe("MODEL:VALIDATOR:FINAL_SCHEMA");
      expect(resBody.key).toBe("token");
    });

    test("With invalid token", async () => {
      const res = await fetch("http://localhost:3000/api/v1/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie:
            "token=0a516bbb8660680a369eb495dbedaec5f674d336400b10c3cb49af169de6b79692e32f39ca7208294543257f88b4618b",
        },
        body: JSON.stringify({
          ph: "1",
        }),
      });

      const resBody = await res.json();

      expect(res.status).toEqual(404);
      expect(resBody.status_code).toEqual(404);
      expect(resBody.name).toEqual("NotFoundError");
      expect(resBody.message).toEqual(
        "A sessão informada não foi encontrada no sistema."
      );
      expect(resBody.action).toEqual(`Logue novamente.`);
      expect(resBody.status_code).toEqual(404);
      expect(resBody.error_location_code).toEqual(
        "MODEL:SESSION:CHECK_BY_TOKEN:NOT_FOUND"
      );
      expect(uuidVersion(resBody.error_id)).toEqual(4);
      expect(uuidVersion(resBody.request_id)).toEqual(4);
      expect(resBody.key).toEqual("token");
    });
  });

  describe("Default user", () => {
    test("With full valid data", async () => {
      const sessionRes = await fetch(
        "http://localhost:3000/api/v1/auth/signin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "coolemail@example.com",
            password: "coolpassword",
          }),
        }
      );
      const sessionResBody = await sessionRes.json();
      const res = await fetch("http://localhost:3000/api/v1/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: `token=${sessionResBody.token}`,
        },
        body: JSON.stringify({
          ph: "1",
          humidity: "60",
          temperature: "27",
          light_intensity: "50",
        }),
      });

      const resBody = await res.json();

      expect(res.status).toEqual(200);
      expect(resBody.user_id).toEqual(sessionResBody.user_id);
      expect(resBody.viewed).toBe(false);
      expect(Date.parse(resBody.created_at)).not.toBe(NaN);
      expect(resBody.ph).toBe(1);
      expect(resBody.humidity).toBe(60);
      expect(resBody.temperature).toBe(27);
      expect(resBody.light_intensity).toBe(50);
    });

    test("With only one value", async () => {
      const sessionRes = await fetch(
        "http://localhost:3000/api/v1/auth/signin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "coolemail@example.com",
            password: "coolpassword",
          }),
        }
      );
      const sessionResBody = await sessionRes.json();
      const res = await fetch("http://localhost:3000/api/v1/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: `token=${sessionResBody.token}`,
        },
        body: JSON.stringify({
          ph: "7",
        }),
      });

      const resBody = await res.json();

      expect(res.status).toEqual(200);
      expect(resBody.user_id).toEqual(sessionResBody.user_id);
      expect(resBody.viewed).toBe(false);
      expect(Date.parse(resBody.created_at)).not.toBe(NaN);
      expect(resBody.ph).toBe(7);
      expect(resBody.humidity).toBe(null);
      expect(resBody.temperature).toBe(null);
      expect(resBody.light_intensity).toBe(null);
    });

    test("With invalid value", async () => {
      const sessionRes = await fetch(
        "http://localhost:3000/api/v1/auth/signin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "coolemail@example.com",
            password: "coolpassword",
          }),
        }
      );
      const sessionResBody = await sessionRes.json();
      const res = await fetch("http://localhost:3000/api/v1/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: `token=${sessionResBody.token}`,
        },
        body: JSON.stringify({
          ph: "7.9",
        }),
      });

      const resBody = await res.json();

      expect(res.status).toEqual(400);
      expect(resBody.status_code).toEqual(400);
      expect(resBody.name).toEqual("ValidationError");
      expect(resBody.message).toEqual('"ph" deve ser um Inteiro.');
      expect(resBody.action).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(uuidVersion(resBody.error_id)).toEqual(4);
      expect(uuidVersion(resBody.request_id)).toEqual(4);
      expect(resBody.error_location_code).toEqual(
        "MODEL:VALIDATOR:FINAL_SCHEMA"
      );
      expect(resBody.key).toEqual("ph");
    });

    test("With no values", async () => {
      const sessionRes = await fetch(
        "http://localhost:3000/api/v1/auth/signin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "coolemail@example.com",
            password: "coolpassword",
          }),
        }
      );
      const sessionResBody = await sessionRes.json();
      const res = await fetch("http://localhost:3000/api/v1/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: `token=${sessionResBody.token}`,
        },
        body: JSON.stringify({}),
      });

      const resBody = await res.json();

      expect(res.status).toEqual(400);
      expect(resBody.status_code).toEqual(400);
      expect(resBody.name).toEqual("ValidationError");
      expect(resBody.message).toEqual(
        "Objeto enviado deve ter no mínimo uma chave."
      );
      expect(resBody.action).toEqual(
        "Ajuste os dados enviados e tente novamente."
      );
      expect(uuidVersion(resBody.error_id)).toEqual(4);
      expect(uuidVersion(resBody.request_id)).toEqual(4);
      expect(resBody.error_location_code).toEqual(
        "MODEL:VALIDATOR:FINAL_SCHEMA"
      );
      expect(resBody.key).toEqual("object");
    });
  });
});
