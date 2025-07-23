# Forms System Documentation

This project uses **PrimeVue Forms** with **Zod** for form validation.

## Overview

PrimeVue Forms provides a powerful, type-safe form management system that integrates seamlessly with PrimeVue components.

## Basic Usage

### Simple Form

```vue
<script setup>
import { z } from 'zod'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { AppForm } from '@/components/forms'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(1, 'Password is required').min(8, 'Too short')
})

const resolver = zodResolver(schema)

const onSubmit = ({ valid, values }) => {
  if (valid) {
    // Handle form submission
    console.log('Form data:', values)
  }
}
</script>

<template>
  <AppForm :resolver="resolver" @submit="onSubmit">
    <AppInput name="email" label="Email" type="email" required />
    <AppInput name="password" label="Password" type="password" required />
    <Button type="submit">Submit</Button>
  </AppForm>
</template>
```

## Components

### AppForm
Wrapper around PrimeVue Form component:
- `resolver` - Zod resolver for validation
- `initialValues` - Default form values
- `@submit` - Form submission handler

### AppInput
Enhanced input component that works with PrimeVue Forms:
- `name` - Field name (required for form binding)
- `label` - Field label
- `helpText` - Helper text below input
- `required` - Shows required indicator
- Automatically displays validation errors

### AppFormField
Flexible field wrapper for custom components:
```vue
<AppFormField name="bio" label="Biography">
  <template v-slot="{ id, invalid }">
    <Textarea :id="id" name="bio" :invalid="invalid" />
  </template>
</AppFormField>
```

### AppFormError
Animated error message component:
```vue
<AppFormError :message="errorMessage" severity="error" />
```

## Validation with Zod

### Common Patterns

```javascript
// Required field
z.string().min(1, 'This field is required')

// Email validation
z.string().email('Please enter a valid email')

// Password with multiple rules
z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[0-9]/, 'Must contain a number')

// Optional field
z.string().optional()

// Numeric validation
z.number().min(0).max(100)

// Custom validation
z.string().refine(
  async (val) => await checkAvailability(val),
  'This value is already taken'
)
```

### Cross-field Validation

```javascript
const schema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string()
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  }
)
```

### Conditional Validation

```javascript
const schema = z.object({
  hasPhone: z.boolean(),
  phone: z.string().optional()
}).refine(
  (data) => !data.hasPhone || data.phone,
  {
    message: "Phone is required when selected",
    path: ["phone"]
  }
)
```

## Form State

Access form state in templates:

```vue
<AppForm v-slot="{ form }">
  <!-- Check if field is invalid -->
  <div v-if="form.email?.invalid">
    {{ form.email.error?.message }}
  </div>
  
  <!-- Check if field is dirty -->
  <div v-if="form.email?.dirty">
    Field has been modified
  </div>
  
  <!-- Get field value -->
  Current value: {{ form.email?.value }}
</AppForm>
```

## Examples

See `/src/views/FormsDemo.vue` for comprehensive examples including:
- Contact form with multiple fields
- Password validation with confirmation
- Async username validation
- Conditional field validation

## Resources

- [PrimeVue Forms Documentation](https://primevue.org/forms/)
- [Zod Documentation](https://zod.dev/)
- [Form Examples](/forms)