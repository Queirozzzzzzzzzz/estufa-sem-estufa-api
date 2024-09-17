import { UnauthorizedError } from "errors";
import password from "models/password";
import session from "models/session";

async function hashPassword(unhashedPassword) {
  return await password.hash(unhashedPassword);
}

async function comparePasswords(providedPassword, passwordHash) {
  const passwordMatches = await password.compare(
    providedPassword,
    passwordHash
  );

  if (!passwordMatches) {
    throw new UnauthorizedError({
      message: `A senha informada não confere com a senha do usuário.`,
      action: `Verifique se a senha informada está correta e tente novamente.`,
      errorLocationCode:
        "MODEL:AUTHENTICATION:COMPARE_PASSWORDS:PASSWORD_MISMATCH",
    });
  }
}

async function createSession(userId) {
  const sessionObj = await session.create(userId);

  return sessionObj;
}

async function readSession(session) {
  const sessionInDb = await session.findById(session.id);
  console.log(sessionInDb);
}

async function authorize(req, res, next) {
  const authorized = await session.checkByToken(req.cookies.token);

  if (!authorized) {
    throw new UnauthorizedError({
      message: `A sessão informada não foi encontrada.`,
      action: `Logue novamente.`,
      errorLocationCode: "MODEL:AUTHENTICATION:AUTHORIZE:NOT_FOUND",
    });
  }

  next();
}

export default {
  hashPassword,
  comparePasswords,
  createSession,
  readSession,
  authorize,
};
