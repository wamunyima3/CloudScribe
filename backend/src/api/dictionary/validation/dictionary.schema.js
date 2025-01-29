const Joi = require('joi');

const wordSchema = Joi.object({
  text: Joi.string().required().min(1).max(100),
  definition: Joi.string().required().min(1).max(1000),
  languageId: Joi.string().required(),
  tags: Joi.array().items(Joi.string()),
  examples: Joi.array().items(Joi.string()),
  translations: Joi.array().items(
    Joi.object({
      text: Joi.string().required(),
      languageId: Joi.string().required()
    })
  ),
  synonyms: Joi.array().items(Joi.string()),
  antonyms: Joi.array().items(Joi.string())
});

module.exports = {
  wordSchema
}; 