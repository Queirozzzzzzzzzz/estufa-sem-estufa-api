import { Client } from "pg";
import snakeize from "snakeize";

import webserver from "infra/webserver";
import { ServiceError } from "errors";
import logger from "infra/logger";

async function query(queryObject) {
  let client;

  try {
    client = await getNewClient();
    const result = await client.query(queryObject);
    return result;
  } catch (err) {
    throw parseQueryErrorAndLog(err, query);
  } finally {
    await client.end();
  }
}

async function getNewClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: process.env.NODE_ENV == "production",
  });

  await client.connect();
  return client;
}

const UNIQUE_CONSTRAINT_VIOLATION = "23505";
const SERIALIZATION_FAILURE = "40001";
const UNDEFINED_FUNCTION = "42883";

function parseQueryErrorAndLog(err, query) {
  const expectedErrorsCode = [
    UNIQUE_CONSTRAINT_VIOLATION,
    SERIALIZATION_FAILURE,
  ];

  if (!webserver.isServerlessRuntime) {
    expectedErrorsCode.push(UNDEFINED_FUNCTION);
  }

  const errorToReturn = new ServiceError({
    message: err.message,
    context: {
      query: query,
    },
    errorLocationCode: "INFRA:DATABASE:QUERY",
    databaseErrorCode: err.code,
  });

  if (!expectedErrorsCode.includes(err.code)) {
    logger.error(snakeize(errorToReturn));
  }

  return errorToReturn;
}

export default {
  query,
  getNewClient,
};
