import express from 'express'
import {
  registerUser,
  loginUser,
} from '../controllers/authController.js'
import { body, validationResult } from 'express-validator'
import { authLimiter } from '../middleware/rateLimiters.js'

const router = express.Router()

const validateRequest = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Please check your submitted details.',
      errors: errors.array().map((error) => ({ field: error.path, message: error.msg })),
    })
  }
  return next()
}

const passwordWithinBcryptLimit = (value) => Buffer.byteLength(value, 'utf8') <= 72

const registerValidation = [
  body('name')
    .isString().withMessage('Name must be text.').bail()
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters.'),
  body('email')
    .isString().withMessage('Email must be text.').bail()
    .trim()
    .isEmail().withMessage('Enter a valid email address.')
    .normalizeEmail(),
  body('password')
    .isString().withMessage('Password must be text.').bail()
    .isLength({ min: 8, max: 128 }).withMessage('Password must contain 8–128 characters.').bail()
    .custom(passwordWithinBcryptLimit).withMessage('Password cannot exceed 72 UTF-8 bytes.'),
]

const loginValidation = [
  body('email')
    .isString().withMessage('Email must be text.').bail()
    .trim()
    .isEmail().withMessage('Enter a valid email address.')
    .normalizeEmail(),
  body('password')
    .isString().withMessage('Password must be text.').bail()
    .notEmpty().withMessage('Password is required.')
    .isLength({ max: 128 }).withMessage('Invalid password length.').bail()
    .custom(passwordWithinBcryptLimit).withMessage('Invalid password length.'),
]

router.post('/register', authLimiter, registerValidation, validateRequest, registerUser)
router.post('/login', authLimiter, loginValidation, validateRequest, loginUser)

export default router
