<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center py-8">
      <h1 class="text-4xl font-bold text-surface-900 dark:text-surface-100 mb-4">Form Examples</h1>
      <p class="text-lg text-surface-600 dark:text-surface-400">
        Comprehensive form patterns using composables and validation
      </p>
    </div>

    <!-- New Form Composables Example -->
    <AppCard elevation="low">
      <template #title>
        <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-100 flex items-center">
          <i class="pi pi-code mr-3 text-primary"></i>
          Form Composables Pattern
        </h2>
      </template>

      <form @submit="contactForm.handleSubmit" class="space-y-6">
        <div class="grid md:grid-cols-2 gap-6">
          <AppInput
            v-bind="
              resolveFieldProps(
                contactForm.getFieldProps('firstName', {
                  validators: [validators.required('First name is required')],
                })
              )
            "
            label="First Name"
            placeholder="Enter your first name"
            required
          />

          <AppInput
            v-bind="
              resolveFieldProps(
                contactForm.getFieldProps('lastName', {
                  validators: [validators.required('Last name is required')],
                })
              )
            "
            label="Last Name"
            placeholder="Enter your last name"
            required
          />
        </div>

        <AppInput
          v-bind="
            resolveFieldProps(
              contactForm.getFieldProps('email', {
                validators: [
                  validators.required('Email is required'),
                  validators.email('Please enter a valid email address'),
                ],
              })
            )
          "
          label="Email Address"
          placeholder="Enter your email"
          required
        />

        <AppInput
          v-bind="
            resolveFieldProps(
              contactForm.getFieldProps('phone', {
                validators: [validators.phone('Please enter a valid phone number')],
              })
            )
          "
          label="Phone Number"
          placeholder="(555) 123-4567"
          help-text="Optional - we'll only call if necessary"
        />

        <AppInput
          v-bind="
            resolveFieldProps(
              contactForm.getFieldProps('message', {
                validators: [
                  validators.required('Message is required'),
                  validators.minLength(10, 'Message must be at least 10 characters'),
                ],
              })
            )
          "
          label="Message"
          placeholder="Enter your message..."
          help-text="Tell us how we can help you"
        />

        <div class="flex gap-4">
          <AppButton
            type="submit"
            variant="primary"
            size="large"
            :loading="contactForm.isSubmitting.value"
            :disabled="!contactForm.isValid.value || contactForm.isSubmitting.value"
          >
            <template #icon><i class="pi pi-send"></i></template>
            Send Message
          </AppButton>
          <AppButton
            type="button"
            variant="secondary"
            @click="contactForm.reset()"
            :disabled="!contactForm.isDirty.value"
          >
            Reset
          </AppButton>
        </div>

        <!-- Form State Debug Info -->
        <div v-if="showDebug" class="mt-4 p-4 bg-surface-100 dark:bg-surface-800 rounded-lg">
          <h3 class="font-semibold mb-2">Form State:</h3>
          <pre class="text-sm">{{ formDebugInfo }}</pre>
        </div>
      </form>
    </AppCard>

    <!-- Individual Field Example -->
    <AppCard elevation="low">
      <template #title>
        <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-100 flex items-center">
          <i class="pi pi-pencil mr-3 text-primary"></i>
          Individual Field Pattern
        </h2>
      </template>

      <div class="space-y-6">
        <AppInput
          v-model="passwordField.value.value"
          label="Password"
          type="password"
          placeholder="Enter a strong password"
          :state="passwordField.state.value"
          :error-message="passwordField.error.value"
          @blur="passwordField.setTouched"
          help-text="Must be at least 8 characters with uppercase, lowercase, and numbers"
        />

        <AppInput
          v-model="confirmPasswordField.value.value"
          label="Confirm Password"
          type="password"
          placeholder="Re-enter your password"
          :state="confirmPasswordField.state.value"
          :error-message="confirmPasswordField.error.value"
          @blur="confirmPasswordField.setTouched"
        />

        <div class="flex gap-4">
          <AppButton
            @click="validatePasswords"
            variant="primary"
            :disabled="!passwordField.dirty.value || !confirmPasswordField.dirty.value"
          >
            Validate Passwords
          </AppButton>
          <AppButton @click="resetPasswords" variant="secondary"> Reset </AppButton>
        </div>
      </div>
    </AppCard>

    <!-- Advanced Validation Examples -->
    <AppCard elevation="medium">
      <template #title>
        <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-100 flex items-center">
          <i class="pi pi-shield mr-3 text-primary"></i>
          Advanced Validation Patterns
        </h2>
      </template>

      <div class="grid md:grid-cols-2 gap-8">
        <!-- Async Validation -->
        <div class="space-y-4">
          <h3 class="font-semibold text-lg">Async Validation</h3>
          <AppInput
            v-model="usernameField.value.value"
            label="Username"
            placeholder="Choose a username"
            :state="usernameField.state.value"
            :error-message="usernameField.error.value"
            :help-text="
              usernameField.isValidating.value ? 'Checking availability...' : 'Must be unique'
            "
            @blur="usernameField.setTouched"
          />
          <div v-if="usernameField.isValidating.value" class="flex items-center gap-2 text-primary">
            <i class="pi pi-spin pi-spinner"></i>
            <span>Checking username availability...</span>
          </div>
        </div>

        <!-- Conditional Validation -->
        <div class="space-y-4">
          <h3 class="font-semibold text-lg">Conditional Validation</h3>
          <div class="flex items-center gap-3 mb-4">
            <Checkbox v-model="requireAddress" input-id="req-addr" />
            <label for="req-addr">Require shipping address</label>
          </div>
          <AppInput
            v-model="addressField.value.value"
            label="Shipping Address"
            placeholder="Enter your address"
            :state="addressField.state.value"
            :error-message="addressField.error.value"
            :disabled="!requireAddress"
            @blur="addressField.setTouched"
          />
        </div>
      </div>
    </AppCard>

    <!-- Validation Rules Reference -->
    <AppCard elevation="low">
      <template #title>
        <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-100 flex items-center">
          <i class="pi pi-book mr-3 text-primary"></i>
          Available Validators
        </h2>
      </template>

      <div class="grid md:grid-cols-3 gap-6">
        <div v-for="category in validatorCategories" :key="category.name">
          <h3 class="font-semibold mb-3">{{ category.name }}</h3>
          <ul class="space-y-2">
            <li
              v-for="validator in category.validators"
              :key="validator"
              class="text-sm text-surface-600 dark:text-surface-400"
            >
              <code class="bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded">{{
                validator
              }}</code>
            </li>
          </ul>
        </div>
      </div>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { AppButton, AppCard, AppInput } from '@/components/ui'
import { useForm, useFormField, validators, custom } from '@/composables/forms'
import Checkbox from 'primevue/checkbox'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const showDebug = ref(false)

// Helper to resolve computed refs for v-bind
const resolveFieldProps = (props: any) => ({
  modelValue: props.modelValue?.value,
  errorMessage: props.errorMessage?.value || '',
  state: props.state?.value || 'default',
  onBlur: props.onBlur,
  onChange: props.onChange,
})

// Form composable example
const contactForm = useForm(
  {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  },
  {
    validateOn: 'blur',
    onSubmit: async values => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Form submitted successfully!',
        life: 3000,
      })

      console.log('Form submitted:', values)
      contactForm.reset()
    },
  }
)

// Individual field examples
const passwordField = useFormField('', {
  validators: [
    validators.required('Password is required'),
    validators.minLength(8, 'Password must be at least 8 characters'),
    validators.pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and numbers'
    ),
  ],
  validateOn: 'blur',
})

const confirmPasswordField = useFormField('', {
  validators: [
    validators.required('Please confirm your password'),
    validators.match(() => passwordField.value.value, 'Passwords must match'),
  ],
  validateOn: 'blur',
})

// Async validation example
const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  // Simulate some usernames being taken
  const takenUsernames = ['admin', 'user', 'test']
  return !takenUsernames.includes(username.toLowerCase())
}

const usernameField = useFormField('', {
  validators: [
    validators.required('Username is required'),
    validators.minLength(3, 'Username must be at least 3 characters'),
    validators.alphanumeric('Username can only contain letters and numbers'),
    custom(checkUsernameAvailability, 'Username is already taken'),
  ],
  validateOn: 'blur',
  debounce: 500,
})

// Conditional validation example
const requireAddress = ref(false)
const addressField = useFormField('', {
  validators: [
    validators.when(
      () => requireAddress.value,
      validators.required('Address is required when shipping is selected')
    ),
  ],
  validateOn: 'blur',
})

// Methods
const validatePasswords = async () => {
  const [isPasswordValid, isConfirmValid] = await Promise.all([
    passwordField.validate(),
    confirmPasswordField.validate(),
  ])

  if (isPasswordValid && isConfirmValid) {
    toast.add({
      severity: 'success',
      summary: 'Valid',
      detail: 'Passwords are valid and match!',
      life: 3000,
    })
  }
}

const resetPasswords = () => {
  passwordField.reset()
  confirmPasswordField.reset()
}

// Debug info
const formDebugInfo = computed(() => ({
  isValid: contactForm.isValid.value,
  isDirty: contactForm.isDirty.value,
  isSubmitting: contactForm.isSubmitting.value,
  errors: contactForm.errors.value,
  touched: contactForm.touched.value,
}))

// Validator categories for reference
const validatorCategories = [
  {
    name: 'Basic Validators',
    validators: ['required', 'email', 'url', 'phone'],
  },
  {
    name: 'String Validators',
    validators: ['minLength', 'maxLength', 'pattern', 'alpha', 'alphanumeric'],
  },
  {
    name: 'Number Validators',
    validators: ['numeric', 'integer', 'min', 'max', 'between'],
  },
  {
    name: 'Advanced',
    validators: ['match', 'custom', 'compose', 'when'],
  },
]
</script>
