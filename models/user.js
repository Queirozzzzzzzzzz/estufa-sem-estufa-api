import db from "infra/database";
import authentication from "models/authentication";

import { ValidationError } from "errors";

async function create(data) {
  await validateUniqueEmail(data.email);
  await hashPasswordInObject(data);

  const query = {
    text: `
    INSERT INTO 
    users (email, password)
    VALUES ($1, $2)
    RETURNING *;`,
    values: [data.email, data.password],
  };

  const res = await db.query(query);

  return res.rows[0];
}

// functions

async function hashPasswordInObject(obj) {
  obj.password = await authentication.hashPassword(obj.password);
  return obj;
}

async function validateUniqueEmail(email, options) {
  const query = {
    text: `
    SELECT 
      email 
    FROM 
      users 
    WHERE 
      LOWER(email) = LOWER($1)
    ;`,
    values: [email],
  };

  const results = await db.query(query, options);

  if (results.rowCount > 0) {
    throw new ValidationError({
      message: `O "email" informado já está sendo usado.`,
      stack: new Error().stack,
      errorLocationCode: "MODEL:USER:VALIDATE_UNIQUE_EMAIL:ALREADY_EXISTS",
      key: "email",
    });
  }
}

const user = {
  create,
};

export default user;
