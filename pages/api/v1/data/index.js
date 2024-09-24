import nextConnect from "next-connect";

import controller from "models/controller";
import authentication from "models/authentication";
import validator from "models/validator";
import data from "models/data";

export default nextConnect({
  attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
})
  .use(controller.injectRequestMetadata)
  .use(controller.logRequest)
  .get(getValidationHandler, authentication.authorize, getHandler);

async function getValidationHandler(req, res, next) {
  const cleanedData = validator(req.cookies, {
    token: "required",
  });

  req.cookies = cleanedData;

  next();
}

async function getHandler(req, res) {
  let values;
  try {
    values = await data.getNewByToken(req.cookies.token);
  } catch (err) {
    throw err;
  }

  return res.status(200).json(values);
}
