# PrimeVue Forms Library Migration Plan

## Executive Summary

This document outlines a comprehensive plan to migrate from the current custom forms composables to the new PrimeVue Forms library (@primevue/forms). The migration is low-risk due to limited current usage (only 2 components) but offers significant benefits in terms of standardization, ecosystem support, and reduced maintenance.

## Current State Analysis

### Forms Usage Inventory
- **Primary Components Using Forms:**
  - `src/views/FormsDemo.vue` - Demo showcase
  - `src/components/ui/AppInput.vue` - Core input component
  
- **Form System Files:**
  - `src/composables/forms/useForm.ts` - Form state management
  - `src/composables/forms/useFormField.ts` - Field management
  - `src/composables/forms/useFormEvents.ts` - Event handling
  - `src/composables/forms/validators.ts` - Validation functions

### Current Architecture
- Custom Vue 3 composables with reactive form state
- Built-in validators (required, email, minLength, etc.)
- Support for async validation, debouncing, conditional rules
- Integration through `resolveFieldProps` helper function

## Migration Benefits

1. **Standardization**: Industry-standard solution with extensive documentation
2. **Ecosystem Support**: Built-in resolvers for Zod, Yup, Joi, Valibot
3. **Reduced Maintenance**: No need to maintain custom form logic
4. **Better TypeScript Support**: Improved type inference (coming soon)
5. **PrimeVue Integration**: Seamless integration with PrimeVue components
6. **Performance**: Optimized validation and re-render logic

## Migration Strategy

### Phase 1: Setup & Proof of Concept (Week 1)

#### 1.1 Install Dependencies
```bash
npm install @primevue/forms zod
```

#### 1.2 Create Enhanced AppInput Component
Create a new component that supports both old and new forms:
- Detect if used within PrimeVue Form context
- Fall back to current behavior if not
- This allows gradual migration

#### 1.3 Convert FormsDemo.vue
- Create parallel implementation using PrimeVue Forms
- Compare functionality and behavior
- Document any gaps or differences

### Phase 2: Component Migration (Week 2)

#### 2.1 Migration Wrapper Pattern
Create a composable that provides compatibility layer:
```typescript
// src/composables/forms/usePrimeVueForm.ts
export function usePrimeVueForm(schema, options) {
  // Wrapper that mimics current API but uses PrimeVue Forms
}
```

#### 2.2 Update AppInput Component
- Add support for `name` property (PrimeVue Forms)
- Maintain backward compatibility with v-model
- Handle both validation approaches

#### 2.3 Create Form Component Library
- `AppForm` - Wrapper around PrimeVue Form
- `AppFormField` - Field wrapper with consistent styling
- `AppFormError` - Error display component

### Phase 3: Validator Migration (Week 3)

#### 3.1 Validator Mapping
Map current validators to Zod schema:

| Current Validator | Zod Equivalent |
|------------------|----------------|
| `validators.required()` | `z.string().min(1)` |
| `validators.email()` | `z.string().email()` |
| `validators.minLength(n)` | `z.string().min(n)` |
| `validators.pattern(regex)` | `z.string().regex(regex)` |
| `validators.numeric()` | `z.number()` |
| `validators.when()` | `z.union()` or `.refine()` |

#### 3.2 Custom Validator Support
Create adapter for custom validators:
```typescript
function customToZod(validator) {
  return z.custom((val) => {
    const result = validator(val);
    return result === null; // null means valid
  });
}
```

### Phase 4: Full Migration (Week 4)

#### 4.1 Update All Forms
- Replace `useForm` with PrimeVue Form component
- Convert validators to Zod schemas
- Update form submission handling

#### 4.2 Remove Legacy Code
- Archive old form composables
- Update imports throughout codebase
- Clean up unused dependencies

## Migration Patterns

### Pattern 1: Simple Form Migration

**Before:**
```vue
<script setup>
import { useForm, validators } from '@/composables/forms'

const form = useForm({
  email: '',
  password: ''
}, {
  validateOn: 'blur',
  onSubmit: async (values) => {
    await login(values)
  }
})
</script>

<template>
  <form @submit.prevent="form.handleSubmit">
    <AppInput
      v-bind="resolveFieldProps(
        form.getFieldProps('email', {
          validators: [validators.required(), validators.email()]
        })
      )"
      label="Email"
    />
    <button type="submit">Submit</button>
  </form>
</template>
```

**After:**
```vue
<script setup>
import { Form } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers'
import { z } from 'zod'

const schema = z.object({
  email: z.string().min(1, 'Required').email('Invalid email'),
  password: z.string().min(1, 'Required')
})

const resolver = zodResolver(schema)

const onSubmit = async ({ valid, values }) => {
  if (valid) {
    await login(values)
  }
}
</script>

<template>
  <Form v-slot="$form" :resolver="resolver" @submit="onSubmit">
    <AppInput
      name="email"
      label="Email"
      :error-message="$form.email?.error?.message"
      :state="$form.email?.invalid ? 'error' : 'default'"
    />
    <button type="submit">Submit</button>
  </Form>
</template>
```

### Pattern 2: Complex Validation Migration

**Before:**
```javascript
const passwordField = useFormField('', {
  validators: [
    validators.required('Password is required'),
    validators.minLength(8, 'Minimum 8 characters'),
    validators.pattern(/[A-Z]/, 'Must contain uppercase'),
    validators.pattern(/[0-9]/, 'Must contain number')
  ]
})
```

**After:**
```javascript
const schema = z.object({
  password: z.string()
    .min(1, 'Password is required')
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain number')
})
```

### Pattern 3: Conditional Validation

**Before:**
```javascript
validators.when(
  () => isBusinessAccount.value,
  validators.required('Company name required for business accounts')
)
```

**After:**
```javascript
const schema = z.object({
  accountType: z.enum(['personal', 'business']),
  companyName: z.string().optional()
}).refine(
  (data) => data.accountType !== 'business' || data.companyName,
  {
    message: 'Company name required for business accounts',
    path: ['companyName']
  }
)
```

## Risk Mitigation

1. **Compatibility Mode**: Maintain both systems during transition
2. **Extensive Testing**: Create comprehensive test suite
3. **Gradual Rollout**: Migrate one form at a time
4. **Documentation**: Maintain migration guide for team
5. **Rollback Plan**: Keep old system archived but accessible

## Success Metrics

- [ ] All forms migrated to PrimeVue Forms
- [ ] No regression in functionality
- [ ] Improved form validation performance
- [ ] Reduced bundle size (remove custom code)
- [ ] Team trained on new system
- [ ] Documentation updated

## Timeline

- **Week 1**: Setup and PoC
- **Week 2**: Component migration
- **Week 3**: Validator migration  
- **Week 4**: Full migration and cleanup
- **Week 5**: Testing and documentation
- **Week 6**: Team training and handoff

## Next Steps

1. Get approval for migration plan
2. Install @primevue/forms package
3. Create proof of concept with FormsDemo.vue
4. Review and adjust plan based on findings
5. Begin phased migration

## Appendix: Quick Reference

### PrimeVue Forms Cheat Sheet

```vue
<!-- Basic Form -->
<Form v-slot="$form" :resolver="resolver" @submit="onSubmit">
  <InputText name="fieldName" />
  <Message v-if="$form.fieldName?.invalid" severity="error">
    {{ $form.fieldName.error?.message }}
  </Message>
</Form>

<!-- With FormField -->
<FormField v-slot="$field" name="fieldName">
  <InputText />
  <Message v-if="$field?.invalid" severity="error">
    {{ $field.error?.message }}
  </Message>
</FormField>

<!-- Field State -->
$form.fieldName = {
  value,     // Current value
  invalid,   // Validation failed
  error,     // First error
  errors,    // All errors
  touched,   // User interacted
  dirty      // Value changed
}
```

### Common Zod Patterns

```javascript
// Required field
z.string().min(1, 'Required')

// Email validation
z.string().email('Invalid email')

// Number range
z.number().min(0).max(100)

// Conditional validation
z.object({
  hasPhone: z.boolean(),
  phone: z.string().optional()
}).refine(
  data => !data.hasPhone || data.phone,
  { message: 'Phone required', path: ['phone'] }
)

// Custom validation
z.string().refine(
  async (val) => await checkUsername(val),
  'Username taken'
)
```