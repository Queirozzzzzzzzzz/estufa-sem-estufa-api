import Joi from "joi";

import { ValidationError } from "errors";

const MAX_INTEGER = 2147483647;
const MIN_INTEGER = -2147483648;

const cachedSchemas = {};

const defaultSchema = Joi.object()
  .label("body")
  .required()
  .min(1)
  .messages({
    "any.invalid": '{#label} possui o valor inválido "{#value}".',
    "any.only": "{#label} deve possuir um dos seguintes valores: {#valids}.",
    "any.required": "{#label} é um campo obrigatório.",
    "array.base": "{#label} deve ser do tipo Array.",
    "boolean.base": "{#label} deve ser do tipo Boolean.",
    "date.base": "{#label} deve conter uma data válida.",
    "markdown.empty": "Markdown deve conter algum texto.",
    "number.base": "{#label} deve ser do tipo Number.",
    "number.integer": "{#label} deve ser um Inteiro.",
    "number.max": "{#label} deve possuir um valor máximo de {#limit}.",
    "number.min": "{#label} deve possuir um valor mínimo de {#limit}.",
    "number.unsafe": `{#label} deve possuir um valor entre ${MIN_INTEGER} e ${MAX_INTEGER}.`,
    "object.base": "{#label} enviado deve ser do tipo Object.",
    "object.min": "Objeto enviado deve ter no mínimo uma chave.",
    "string.alphanum": "{#label} deve conter apenas caracteres alfanuméricos.",
    "string.base": "{#label} deve ser do tipo String.",
    "string.email": "{#label} deve conter um email válido.",
    "string.empty": "{#label} não pode estar em branco.",
    "string.length":
      '{#label} deve possuir {#limit} {if(#limit==1, "caractere", "caracteres")}.',
    "string.ip": "{#label} deve possuir um IP válido.",
    "string.guid": "{#label} deve possuir um token UUID na versão 4.",
    "string.max":
      '{#label} deve conter no máximo {#limit} {if(#limit==1, "caractere", "caracteres")}.',
    "string.min":
      '{#label} deve conter no mínimo {#limit} {if(#limit==1, "caractere", "caracteres")}.',
    "tag.reserved": "Esta tag de usuário não está disponível para uso.",
    "username.reserved": "Este nome de usuário não está disponível para uso.",
    "string.pattern.base": "{#label} está no formato errado.",
  });

export default function validator(obj, keys) {
  try {
    obj = JSON.parse(JSON.stringify(obj));
  } catch (err) {
    throw new ValidationError({
      message: "Não foi possível interpretar o valor enviado.",
      action: "Verifique se o valor enviado é um JSON válido.",
      errorLocationCode: "MODEL:VALIDATOR:ERROR_PARSING_JSON",
      stack: new Error().stack,
      key: "object",
    });
  }

  const keysString = Object.keys(keys).join(",");

  if (!cachedSchemas[keysString]) {
    let finalSchema = defaultSchema;

    for (const key of Object.keys(keys)) {
      const keyValidationFunction = schemas[key];
      finalSchema = finalSchema.concat(keyValidationFunction());
    }
    cachedSchemas[keysString] = finalSchema;
  }

  const { error: err, value } = cachedSchemas[keysString].validate(obj, {
    stripUnknown: true,
    context: {
      required: keys,
    },
    errors: {
      escapeHtml: true,
      wrap: {
        array: false,
        string: '"',
      },
    },
  });

  if (err) {
    throw new ValidationError({
      message: err.details[0].message,
      key:
        err.details[0].context.key || err.details[0].context.type || "object",
      errorLocationCode: "MODEL:VALIDATOR:FINAL_SCHEMA",
      stack: new Error().stack,
      type: err.details[0].type,
    });
  }

  return value;
}

const schemas = {
  email: function () {
    return Joi.object({
      email: Joi.string()
        .email()
        .min(7)
        .max(254)
        .lowercase()
        .trim()
        .when("$required.email", {
          is: "required",
          then: Joi.required(),
          otherwise: Joi.optional(),
        }),
    });
  },

  password: function () {
    return Joi.object({
      password: Joi.string().min(8).max(72).trim().when("$required.password", {
        is: "required",
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    });
  },

  token: function () {
    return Joi.object({
      token: Joi.string().length(96).alphanum().when("$required.token", {
        is: "required",
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    });
  },

  ph: function () {
    return Joi.object({
      ph: Joi.number().integer().when("$required.ph", {
        is: "required",
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    });
  },

  soil_humidity: function () {
    return Joi.object({
      soil_humidity: Joi.number().when("$required.soil_humidity", {
        is: "required",
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    });
  },

  air_humidity: function () {
    return Joi.object({
      air_humidity: Joi.number().when("$required.air_humidity", {
        is: "required",
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    });
  },

  air_temperature: function () {
    return Joi.object({
      air_temperature: Joi.number().when("$required.air_temperature", {
        is: "required",
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    });
  },

  light_intensity: function () {
    return Joi.object({
      light_intensity: Joi.number().when("$required.light_intensity", {
        is: "required",
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    });
  },
};
