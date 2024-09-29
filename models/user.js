import db from "infra/database";
import authentication from "models/authentication";

import { NotFoundError, ValidationError } from "errors";

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

async function findByEmail(email) {
  const query = {
    text: `
    SELECT * 
    FROM users 
    WHERE LOWER(email) = LOWER($1) 
    LIMIT 1;`,
    values: [email],
  };

  const results = await db.query(query);

  if (results.rowCount === 0) {
    throw new NotFoundError({
      message: `O email informado não foi encontrado no sistema.`,
      action: 'Verifique se o "email" está digitado corretamente.',
      stack: new Error().stack,
      errorLocationCode: "MODEL:USER:FIND_BY_EMAIL:NOT_FOUND",
      key: "email",
    });
  }

  return results.rows[0];
}

async function findByToken(token) {
  const query = {
    text: `
    SELECT s.*, u.id AS user_id, u.* 
    FROM sessions s
    LEFT JOIN users u ON s.user_id = u.id
    WHERE s.token = $1;`,
    values: [token],
  };

  const results = await db.query(query);

  if (results.rowCount === 0) {
    throw new NotFoundError({
      message: `O token informado não foi encontrado no sistema.`,
      action: "Logue novamente.",
      stack: new Error().stack,
      errorLocationCode: "MODEL:USER:FIND_BY_TOKEN:NOT_FOUND",
      key: "token",
    });
  }

  return results.rows[0];
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
  findByEmail,
  findByToken,
};

export default user;
