import nextConnect from "next-connect";

import controller from "models/controller";
import authentication from "models/authentication";
import validator from "models/validator";
import data from "models/data";
import user from "models/user";

export default nextConnect({
  attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
})
  .use(controller.injectRequestMetadata)
  .use(controller.logRequest)
  .get(getValidationHandler, authentication.authorize, getHandler)
  .post(postValidationHandler, authentication.authorize, postHandler);

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

async function postValidationHandler(req, res, next) {
  const cleanedCookies = validator(req.cookies, {
    token: "required",
  });

  req.cookies = cleanedCookies;

  const cleanedBody = validator(req.body, {
    ph: "optional",
    humidity: "optional",
    temperature: "optional",
    light_intensity: "optional",
  });

  req.body = cleanedBody;

  next();
}

async function postHandler(req, res) {
  let newData;
  try {
    const reqUser = await user.findByToken(req.cookies.token);
    let values = { ...req.body, user_id: reqUser.id };

    newData = await data.create(values);
  } catch (err) {
    throw err;
  }

  return res.status(200).json(newData);
}
