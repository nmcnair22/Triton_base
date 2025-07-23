<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center py-8">
      <h1 class="text-4xl font-bold text-surface-900 dark:text-surface-100 mb-4">Form Examples</h1>
      <p class="text-lg text-surface-600 dark:text-surface-400">
        Comprehensive form patterns using PrimeVue Forms and Zod validation
      </p>
    </div>

    <!-- Contact Form Example -->
    <AppCard elevation="low">
      <template #title>
        <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-100 flex items-center">
          <i class="pi pi-envelope mr-3 text-primary"></i>
          Contact Form with PrimeVue Forms
        </h2>
      </template>

      <AppForm
        :initialValues="contactInitialValues"
        :resolver="contactResolver"
        @submit="onContactSubmit"
      >
        <template v-slot="{ form }">
          <div class="space-y-6">
            <div class="grid md:grid-cols-2 gap-6">
              <AppInput
                name="firstName"
                label="First Name"
                placeholder="Enter your first name"
                required
              />

              <AppInput
                name="lastName"
                label="Last Name"
                placeholder="Enter your last name"
                required
              />
            </div>

            <AppInput
              name="email"
              label="Email Address"
              placeholder="Enter your email"
              type="email"
              required
            />

            <AppInput
              name="phone"
              label="Phone Number"
              placeholder="(555) 123-4567"
              help-text="Optional - we'll only call if necessary"
            />

            <div class="space-y-2">
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-300">
                Message <span class="text-red-500 ml-1">*</span>
              </label>
              <Textarea
                name="message"
                placeholder="Enter your message..."
                rows="4"
                class="w-full"
                :invalid="form.message?.invalid"
              />
              <span v-if="form.message?.invalid" class="text-red-500 text-sm">
                {{ form.message.error?.message }}
              </span>
              <span v-else class="text-surface-600 dark:text-surface-400 text-sm">
                Tell us how we can help you
              </span>
            </div>

            <div class="flex gap-4">
              <AppButton
                type="submit"
                variant="primary"
                size="large"
                :loading="contactSubmitting"
              >
                <template #icon><i class="pi pi-send"></i></template>
                Send Message
              </AppButton>
              <AppButton
                type="button"
                variant="secondary"
                @click="resetContactForm"
                :disabled="!isFormDirty(form)"
              >
                Reset
              </AppButton>
            </div>

            <!-- Form State Debug Info -->
            <div v-if="showDebug" class="mt-4 p-4 bg-surface-100 dark:bg-surface-800 rounded-lg">
              <h3 class="font-semibold mb-2">Form State:</h3>
              <pre class="text-sm">{{ getFormDebugInfo(form) }}</pre>
            </div>
          </div>
        </template>
      </AppForm>
    </AppCard>

    <!-- Password Validation Example -->
    <AppCard elevation="low">
      <template #title>
        <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-100 flex items-center">
          <i class="pi pi-lock mr-3 text-primary"></i>
          Password Validation Pattern
        </h2>
      </template>

      <AppForm
        :initialValues="passwordInitialValues"
        :resolver="passwordResolver"
        @submit="onPasswordSubmit"
      >
        <template v-slot="{ form }">
          <div class="space-y-6">
            <AppInput
              name="password"
              label="Password"
              type="password"
              placeholder="Enter a strong password"
              help-text="Must be at least 8 characters with uppercase, lowercase, and numbers"
            />

            <AppInput
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
            />

            <div class="flex gap-4">
              <AppButton
                type="submit"
                variant="primary"
                :disabled="!form.password?.value || !form.confirmPassword?.value"
              >
                Validate Passwords
              </AppButton>
              <AppButton
                type="button"
                variant="secondary"
                @click="resetPasswordForm"
              >
                Reset
              </AppButton>
            </div>
          </div>
        </template>
      </AppForm>
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
        <div>
          <h3 class="font-semibold text-lg mb-4">Async Validation</h3>
          <AppForm
            :initialValues="{ username: '' }"
            :resolver="usernameResolver"
          >
            <template v-slot="{ form }">
              <div class="space-y-4">
                <AppInput
                  name="username"
                  label="Username"
                  placeholder="Choose a username"
                  :help-text="form.username?.value ? 'Checking availability...' : 'Must be unique'"
                />
                <div v-if="form.username?.value && !form.username?.invalid" class="text-green-500 text-sm">
                  <i class="pi pi-check mr-1"></i>Username is available!
                </div>
              </div>
            </template>
          </AppForm>
        </div>

        <!-- Conditional Validation -->
        <div>
          <h3 class="font-semibold text-lg mb-4">Conditional Validation</h3>
          <AppForm
            :initialValues="addressInitialValues"
            :resolver="addressResolver"
          >
            <template v-slot="{ form }">
              <div class="space-y-4">
                <div class="flex items-center gap-3 mb-4">
                  <Checkbox name="requireShipping" input-id="req-ship" />
                  <label for="req-ship">Require shipping address</label>
                </div>
                <AppInput
                  name="address"
                  label="Shipping Address"
                  placeholder="Enter your address"
                  :disabled="!form.requireShipping?.value"
                />
              </div>
            </template>
          </AppForm>
        </div>
      </div>
    </AppCard>

    <!-- Validation Patterns Reference -->
    <AppCard elevation="low">
      <template #title>
        <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-100 flex items-center">
          <i class="pi pi-book mr-3 text-primary"></i>
          PrimeVue Forms & Zod Patterns
        </h2>
      </template>

      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <h3 class="font-semibold mb-3">Common Zod Validators</h3>
          <pre class="bg-surface-100 dark:bg-surface-800 p-4 rounded text-sm overflow-x-auto">
// Required field
z.string().min(1, 'Required')

// Email validation
z.string().email('Invalid email')

// Password with rules
z.string()
  .min(8, 'Too short')
  .regex(/[A-Z]/, 'Need uppercase')
  .regex(/[0-9]/, 'Need number')

// Optional field
z.string().optional()

// Number validation
z.number().min(0).max(100)

// Custom validation
z.string().refine(
  async (val) => await checkAvailability(val),
  'Already taken'
)
          </pre>
        </div>
        <div>
          <h3 class="font-semibold mb-3">Form Patterns</h3>
          <pre class="bg-surface-100 dark:bg-surface-800 p-4 rounded text-sm overflow-x-auto">
// Cross-field validation
z.object({
  password: z.string(),
  confirm: z.string()
}).refine(
  data => data.password === data.confirm,
  { message: "No match", path: ["confirm"] }
)

// Conditional validation
z.object({
  hasPhone: z.boolean(),
  phone: z.string().optional()
}).refine(
  data => !data.hasPhone || data.phone,
  { message: "Required", path: ["phone"] }
)

// Union types
z.union([
  z.string().email(),
  z.string().regex(/^\d{10}$/)
])
          </pre>
        </div>
      </div>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { z } from 'zod'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { AppButton, AppCard, AppInput } from '@/components/ui'
import { AppForm } from '@/components/forms'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const showDebug = ref(false)

// Contact Form
const contactInitialValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  message: ''
}

const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  phone: z.string()
    .optional()
    .refine(
      (val) => !val || /^\(\d{3}\) \d{3}-\d{4}$/.test(val),
      'Please enter a valid phone number'
    ),
  message: z.string()
    .min(1, 'Message is required')
    .min(10, 'Message must be at least 10 characters')
})

const contactResolver = zodResolver(contactSchema)
const contactSubmitting = ref(false)
const contactFormReset = ref<(() => void) | null>(null)

const onContactSubmit = async (event: any) => {
  if (event.valid) {
    contactSubmitting.value = true
    contactFormReset.value = event.reset
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Form submitted successfully!',
      life: 3000
    })
    
    console.log('Contact form submitted:', event.values)
    event.reset()
    contactSubmitting.value = false
  }
}

const resetContactForm = () => {
  if (contactFormReset.value) {
    contactFormReset.value()
  }
}

// Password Form
const passwordInitialValues = {
  password: '',
  confirmPassword: ''
}

const passwordSchema = z.object({
  password: z.string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

const passwordResolver = zodResolver(passwordSchema)
const passwordFormReset = ref<(() => void) | null>(null)

const onPasswordSubmit = async (event: any) => {
  if (event.valid) {
    passwordFormReset.value = event.reset
    
    toast.add({
      severity: 'success',
      summary: 'Valid',
      detail: 'Passwords are valid and match!',
      life: 3000
    })
    
    event.reset()
  }
}

const resetPasswordForm = () => {
  if (passwordFormReset.value) {
    passwordFormReset.value()
  }
}

// Username async validation
const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  const takenUsernames = ['admin', 'user', 'test']
  return !takenUsernames.includes(username.toLowerCase())
}

const usernameSchema = z.object({
  username: z.string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers')
    .refine(
      async (val) => await checkUsernameAvailability(val),
      'Username is already taken'
    )
})

const usernameResolver = zodResolver(usernameSchema)

// Conditional validation
const addressInitialValues = {
  requireShipping: false,
  address: ''
}

const addressSchema = z.object({
  requireShipping: z.boolean(),
  address: z.string().optional()
}).refine(
  (data) => !data.requireShipping || (data.address && data.address.length > 0),
  {
    message: 'Address is required when shipping is selected',
    path: ['address']
  }
)

const addressResolver = zodResolver(addressSchema)

// Helper functions
const isFormDirty = (form: any) => {
  return Object.keys(form).some(key => form[key]?.dirty)
}

const getFormDebugInfo = (form: any) => {
  const debugInfo: any = {}
  Object.keys(form).forEach(key => {
    if (form[key] && typeof form[key] === 'object') {
      debugInfo[key] = {
        value: form[key].value,
        invalid: form[key].invalid,
        dirty: form[key].dirty,
        touched: form[key].touched,
        error: form[key].error?.message
      }
    }
  })
  return debugInfo
}
</script>