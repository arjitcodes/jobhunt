import bcrypt from 'bcryptjs'
import { isStrongPassword } from './validator.js'

export const hashPassword = async (otp: string): Promise<string> => {
  const hashedOtp = await bcrypt.hash(otp, 10)
  return hashedOtp
}

export const verifyHashedPassword = async (assword: string, hashedPassword: string): Promise<boolean> => {
  const isPasswordMatched = await bcrypt.compare(assword, hashedPassword)
  return isPasswordMatched
}

export const isPasswordStrong = (password: string): boolean => {
  const isPasswordStrong = isStrongPassword(password)
  return isPasswordStrong
}