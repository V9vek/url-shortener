import Joi from "joi"

export const shortenUrlValidation = Joi.object({
    longUrl: Joi.string().uri().required(),
    customAlias: Joi.string().alphanum().min(3).max(15).optional(),
    topic: Joi.string().valid("acquisition", "activation", "retention").optional(),
})