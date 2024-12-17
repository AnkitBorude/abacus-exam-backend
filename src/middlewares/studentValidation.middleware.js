import Joi from "joi";

const studentValidationschema=Joi.object({
        fullname: Joi.string()
          .pattern(/^[a-zA-Z\s]+$/) // Allows only letters and spaces
          .min(3)
          .max(50)
          .optional()
          .messages({
            'string.pattern.base': 'fullname must only contain alphabets and spaces.',
          }),
        email: Joi.string().email().optional(),
        username: Joi.string().alphanum().min(3).max(30).optional(),
        level: Joi.number().integer().min(1).max(10).optional().messages({
          'number.base': 'level must be a number.',
          'number.min': 'level must be at least 1.',
          'number.max': 'level must not exceed 10.',
        }),
        sclass: Joi.number().integer().min(1).max(10).optional().messages({
          'number.base': 'sclass must be a number.',
          'number.min': 'sclass must be at least 1.',
          'number.max': 'sclass must not exceed 10.',
        }),
        phone_no: Joi.string()
          .pattern(/^\d{10}$/) // Matches a 10-digit phone number
          .optional()
          .messages({
            'string.pattern.base': 'phone_no must be a valid 10-digit number.',
          }),
        password: Joi.string()
          .min(8)
          .max(128)
          .optional()
          .messages({
            'string.min': 'password must be at least 8 characters long.',
            'string.max': 'password must not exceed 128 characters.',
          }),
      }).options({ allowUnknown: false }

      );

const studentValidation=(req,res,next)=>{

    const {error}=studentValidationschema.validate(req.body);
    if(error)
    {
        //attaching the error message to req object
        req.validationError=error.details[0].message;
    }
    next();
}

export {studentValidation};