import { version as uuidVersion } from "uuid";

import orchestrator from "tests/orchestrator";
import session from "models/session";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.dropAllTables();
  await orchestrator.runPendingMigrations();
});

describe("GET to /api/v1/data", () => {
  describe("No user", () => {
    test("Retrieving information", async () => {
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
        }
      );
      const testUser = await testUserRes.json();

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
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          cookie: `token=${sessionResBody.token}`,
        },
      });

      const resBody = await res.json();

      console.log(resBody);
    });
  });
});
