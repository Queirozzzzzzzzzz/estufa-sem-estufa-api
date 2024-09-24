import { NotFoundError } from "errors";
import db from "infra/database";

async function create(values) {
  const query = {
    text: `
    INSERT INTO data (user_id, ph, humidity, temperature, light_intensity)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;`,
    values: [
      values.user_id,
      values.ph,
      values.humidity,
      values.temperature,
      values.light_intensity,
    ],
  };

  const res = await db.query(query);

  return res.rows[0];
}

async function getNewByToken(token) {
  try {
    const userId = await findUserIdByToken(token);
    const res = await getNewByUserId(userId);

    return res;
  } catch (err) {
    throw new NotFoundError({
      message: `O usuário informado não foi encontrado no sistema.`,
      action: 'Verifique se o "token" está digitado corretamente.',
      stack: new Error().stack,
      errorLocationCode: "MODEL:DATA:FIND_USER_BY_TOKEN:NOT_FOUND",
      key: "user",
    });
  }
}

async function getAllByToken(token) {
  try {
    const userId = await findUserIdByToken(token);
    const res = await getAllByUserId(userId);

    return res;
  } catch (err) {
    throw new NotFoundError({
      message: `O usuário informado não foi encontrado no sistema.`,
      action: 'Verifique se o "token" está digitado corretamente.',
      stack: new Error().stack,
      errorLocationCode: "MODEL:DATA:FIND_USER_BY_TOKEN:NOT_FOUND",
      key: "user",
    });
  }
}

async function getNewByUserId(userId) {
  const query = {
    text: `
    WITH selectedData AS (
        SELECT * 
        FROM data 
        WHERE user_id = $1 
        AND viewed = false
    )
    UPDATE data
    SET viewed = true
    FROM selectedData
    WHERE data.user_id = selectedData.user_id
    RETURNING *;
    `,
    values: [userId],
  };
  const res = await db.query(query);

  return res.rows;
}

async function getAllByUserId() {
  const query = {
    text: `SELECT * FROM data WHERE user_id = $1;`,
    values: [userId],
  };
  const res = await db.query(query);

  return res.rows;
}

// Functions

async function findUserIdByToken(token) {
  const query = {
    text: `SELECT user_id FROM sessions WHERE token = $1;`,
    values: [token],
  };

  const res = await db.query(query);

  return res.rows[0].user_id;
}

const data = {
  create,
  getNewByUserId,
  getAllByUserId,
  getNewByToken,
  getAllByToken,
};

export default data;
