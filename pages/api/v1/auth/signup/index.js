import nextConnect from "next-connect";

import controller from "models/controller";
import user from "models/user";
import validator from "models/validator";

export default nextConnect({
  attachParams: true,
  onNoMatch: controller.onNoMatchHandler,
  onError: controller.onErrorHandler,
})
  .use(controller.injectRequestMetadata)
  .use(controller.logRequest)
  .post(postValidationHandler, postHandler);

async function postValidationHandler(req, res, next) {
  const cleanedData = validator(req.body, {
    email: "required",
    password: "required",
  });

  req.body = cleanedData;

  next();
}

async function postHandler(req, res) {
  try {
    const newUser = await user.create(req.body);

    return res.status(200).json(newUser);
  } catch (err) {
    throw err;
  }
}
