/**
 * Common validators for form fields
 */

export type ValidatorFn<T = any> = (value: T) => string | true | Promise<string | true>

/**
 * Required field validator
 */
export const required = (message = 'This field is required'): ValidatorFn => 
  (value: any) => {
    if (value === null || value === undefined || value === '') {
      return message
    }
    if (typeof value === 'string' && !value.trim()) {
      return message
    }
    if (Array.isArray(value) && value.length === 0) {
      return message
    }
    return true
  }

/**
 * Email validator
 */
export const email = (message = 'Invalid email address'): ValidatorFn<string> => 
  (value: string) => {
    if (!value) return true // Let required validator handle empty values
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || message
  }

/**
 * Minimum length validator
 */
export const minLength = (min: number, message?: string): ValidatorFn<string> => 
  (value: string) => {
    if (!value) return true // Let required validator handle empty values
    const msg = message || `Must be at least ${min} characters`
    return value.length >= min || msg
  }

/**
 * Maximum length validator
 */
export const maxLength = (max: number, message?: string): ValidatorFn<string> => 
  (value: string) => {
    if (!value) return true // Let required validator handle empty values
    const msg = message || `Must be no more than ${max} characters`
    return value.length <= max || msg
  }

/**
 * Pattern validator
 */
export const pattern = (regex: RegExp, message = 'Invalid format'): ValidatorFn<string> => 
  (value: string) => {
    if (!value) return true // Let required validator handle empty values
    return regex.test(value) || message
  }

/**
 * Numeric validator
 */
export const numeric = (message = 'Must be a number'): ValidatorFn => 
  (value: any) => {
    if (!value && value !== 0) return true // Let required validator handle empty values
    return !isNaN(Number(value)) || message
  }

/**
 * Integer validator
 */
export const integer = (message = 'Must be a whole number'): ValidatorFn => 
  (value: any) => {
    if (!value && value !== 0) return true // Let required validator handle empty values
    return Number.isInteger(Number(value)) || message
  }

/**
 * Minimum value validator
 */
export const min = (minValue: number, message?: string): ValidatorFn<number> => 
  (value: number) => {
    if (value === null || value === undefined || value === '') return true
    const msg = message || `Must be at least ${minValue}`
    return Number(value) >= minValue || msg
  }

/**
 * Maximum value validator
 */
export const max = (maxValue: number, message?: string): ValidatorFn<number> => 
  (value: number) => {
    if (value === null || value === undefined || value === '') return true
    const msg = message || `Must be no more than ${maxValue}`
    return Number(value) <= maxValue || msg
  }

/**
 * Range validator
 */
export const between = (minValue: number, maxValue: number, message?: string): ValidatorFn<number> => 
  (value: number) => {
    if (value === null || value === undefined || value === '') return true
    const msg = message || `Must be between ${minValue} and ${maxValue}`
    const numValue = Number(value)
    return (numValue >= minValue && numValue <= maxValue) || msg
  }

/**
 * Match validator - compares with another value
 */
export const match = <T = any>(
  getValue: () => T, 
  message = 'Values must match'
): ValidatorFn<T> => 
  (value: T) => value === getValue() || message

/**
 * URL validator
 */
export const url = (message = 'Invalid URL'): ValidatorFn<string> => 
  (value: string) => {
    if (!value) return true
    try {
      new URL(value)
      return true
    } catch {
      return message
    }
  }

/**
 * Phone number validator (basic)
 */
export const phone = (message = 'Invalid phone number'): ValidatorFn<string> => 
  (value: string) => {
    if (!value) return true
    // Basic phone validation - can be customized for specific formats
    const pattern = /^[\d\s\-\+\(\)]+$/
    return (pattern.test(value) && value.replace(/\D/g, '').length >= 10) || message
  }

/**
 * Alpha validator - only letters
 */
export const alpha = (message = 'Only letters allowed'): ValidatorFn<string> => 
  (value: string) => {
    if (!value) return true
    const pattern = /^[a-zA-Z]+$/
    return pattern.test(value) || message
  }

/**
 * Alphanumeric validator
 */
export const alphanumeric = (message = 'Only letters and numbers allowed'): ValidatorFn<string> => 
  (value: string) => {
    if (!value) return true
    const pattern = /^[a-zA-Z0-9]+$/
    return pattern.test(value) || message
  }

/**
 * Custom validator helper
 */
export const custom = <T = any>(
  validatorFn: (value: T) => boolean | Promise<boolean>,
  message = 'Invalid value'
): ValidatorFn<T> => 
  async (value: T) => {
    const isValid = await validatorFn(value)
    return isValid || message
  }

/**
 * Compose multiple validators
 */
export const compose = <T = any>(...validators: ValidatorFn<T>[]): ValidatorFn<T> => 
  async (value: T) => {
    for (const validator of validators) {
      const result = await validator(value)
      if (result !== true) {
        return result
      }
    }
    return true
  }

/**
 * Conditional validator - only runs if condition is met
 */
export const when = <T = any>(
  condition: (value: T) => boolean,
  validator: ValidatorFn<T>
): ValidatorFn<T> => 
  async (value: T) => {
    if (!condition(value)) {
      return true
    }
    return validator(value)
  }

/**
 * Export all validators as a namespace
 */
export const validators = {
  required,
  email,
  minLength,
  maxLength,
  pattern,
  numeric,
  integer,
  min,
  max,
  between,
  match,
  url,
  phone,
  alpha,
  alphanumeric,
  custom,
  compose,
  when
}