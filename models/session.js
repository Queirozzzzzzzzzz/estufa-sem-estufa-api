import crypto from "node:crypto";

import db from "infra/database";
import { NotFoundError } from "errors";

const SESSION_EXPIRATION_IN_SECONDS = 60 * 60 * 24 * 30; // 30 days

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * SESSION_EXPIRATION_IN_SECONDS);

  const query = {
    text: `INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3) RETURNING *;`,
    values: [token, userId, expiresAt],
  };

  const res = await db.query(query);

  return res.rows[0];
}

async function findById(id) {
  const query = {
    text: `SELECT * FROM sessions WHERE id = $1;`,
    values: [id],
  };

  const results = await db.query(query);
  return results.rows[0];
}

async function checkByToken(token) {
  const query = {
    text: `SELECT * FROM sessions WHERE token = $1;`,
    values: [token],
  };

  const res = await db.query(query);

  if (res.rowCount === 0) {
    throw new NotFoundError({
      message: `A sessão informada não foi encontrada no sistema.`,
      action: "Logue novamente.",
      stack: new Error().stack,
      errorLocationCode: "MODEL:SESSION:CHECK_BY_TOKEN:NOT_FOUND",
      key: "token",
    });
  }

  const authorized = res.rows[0].expires_at >= new Date();

  return authorized;
}

const session = {
  create,
  findById,
  checkByToken,
};

export default session;
