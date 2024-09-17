import nextConnect from "next-connect";

import { UnauthorizedError } from "errors";
import authentication from "models/authentication";
import user from "models/user";
import validator from "models/validator";
import controller from "models/controller";

export default nextConnect({
  attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
})
  .use(controller.injectRequestMetadata)
  .use(controller.logRequest)
  .post(postValidationHandler, postHandler);

async function postValidationHandler(req, res, next) {
  const cleanValues = validator(req.body, {
    email: "required",
    password: "required",
  });

  req.body = cleanValues;

  next();
}

async function postHandler(req, res) {
  const values = req.body;

  let storedUser;
  try {
    storedUser = await user.findByEmail(values.email);
    await authentication.comparePasswords(values.password, storedUser.password);
  } catch (err) {
    throw new UnauthorizedError({
      message: `Dados não conferem.`,
      action: `Verifique se os dados enviados estão corretos.`,
      errorLocationCode: `CONTROLLER:SESSIONS:POST_HANDLER:DATA_MISMATCH`,
    });
  }

  const sessionObj = await authentication.createSession(storedUser.id);

  return res.status(201).json(sessionObj);
}
