<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center py-8">
      <h1 class="text-4xl font-bold text-surface-900 dark:text-surface-100 mb-4">
        PrimeVue Forms Examples
      </h1>
      <p class="text-lg text-surface-600 dark:text-surface-400">
        Comprehensive form patterns using PrimeVue Forms library
      </p>
    </div>

    <!-- Contact Form Example -->
    <AppCard elevation="low">
      <template #title>
        <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-100 flex items-center">
          <i class="pi pi-sparkles mr-3 text-primary"></i>
          Contact Form with PrimeVue Forms
        </h2>
      </template>

      <Form
        v-slot="$form"
        :initialValues="contactInitialValues"
        :resolver="contactResolver"
        @submit="onContactSubmit"
        class="space-y-6"
      >
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
            :invalid="$form.message?.invalid"
          />
          <span v-if="$form.message?.invalid" class="text-red-500 text-sm">
            {{ $form.message.error?.message }}
          </span>
          <span v-else class="text-surface-600 dark:text-surface-400 text-sm">
            Tell us how we can help you
          </span>
        </div>

        <div class="flex gap-4">
          <AppButton type="submit" variant="primary" size="large" :loading="contactSubmitting">
            <template #icon><i class="pi pi-send"></i></template>
            Send Message
          </AppButton>
          <AppButton
            type="button"
            variant="secondary"
            @click="resetContactForm"
            :disabled="!isContactFormDirty($form)"
          >
            Reset
          </AppButton>
        </div>

        <!-- Form State Debug Info -->
        <div v-if="showDebug" class="mt-4 p-4 bg-surface-100 dark:bg-surface-800 rounded-lg">
          <h3 class="font-semibold mb-2">Form State:</h3>
          <pre class="text-sm">{{ getFormDebugInfo($form) }}</pre>
        </div>
      </Form>
    </AppCard>

    <!-- Password Validation Example -->
    <AppCard elevation="low">
      <template #title>
        <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-100 flex items-center">
          <i class="pi pi-lock mr-3 text-primary"></i>
          Password Validation
        </h2>
      </template>

      <Form
        v-slot="$form"
        :initialValues="passwordInitialValues"
        :resolver="passwordResolver"
        @submit="onPasswordSubmit"
        class="space-y-6"
      >
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
            :disabled="!$form.password?.value || !$form.confirmPassword?.value"
          >
            Validate Passwords
          </AppButton>
          <AppButton type="button" variant="secondary" @click="resetPasswordForm">
            Reset
          </AppButton>
        </div>
      </Form>
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
          <Form
            v-slot="$form"
            :initialValues="{ username: '' }"
            :resolver="usernameResolver"
            class="space-y-4"
          >
            <AppInput
              name="username"
              label="Username"
              placeholder="Choose a username"
              :help-text="$form.username?.value ? 'Checking availability...' : 'Must be unique'"
            />
            <div
              v-if="$form.username?.value && !$form.username?.invalid"
              class="text-green-500 text-sm"
            >
              <i class="pi pi-check mr-1"></i>Username is available!
            </div>
          </Form>
        </div>

        <!-- Conditional Validation -->
        <div>
          <h3 class="font-semibold text-lg mb-4">Conditional Validation</h3>
          <Form
            v-slot="$form"
            :initialValues="addressInitialValues"
            :resolver="addressResolver"
            class="space-y-4"
          >
            <div class="flex items-center gap-3 mb-4">
              <Checkbox name="requireShipping" input-id="req-ship" />
              <label for="req-ship">Require shipping address</label>
            </div>
            <AppInput
              name="address"
              label="Shipping Address"
              placeholder="Enter your address"
              :disabled="!$form.requireShipping?.value"
            />
          </Form>
        </div>
      </div>
    </AppCard>

    <!-- Validation with FormField -->
    <AppCard elevation="low">
      <template #title>
        <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-100 flex items-center">
          <i class="pi pi-sliders-h mr-3 text-primary"></i>
          Using FormField Component
        </h2>
      </template>

      <Form :resolver="fieldExampleResolver" @submit="onFieldExampleSubmit">
        <div class="space-y-4">
          <FormField v-slot="$field" name="businessEmail" initialValue="">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-300">
                Business Email <span class="text-red-500">*</span>
              </label>
              <InputText
                type="email"
                placeholder="company@example.com"
                class="w-full"
                :invalid="$field?.invalid"
              />
              <Message v-if="$field?.invalid" severity="error" variant="simple">
                {{ $field.error?.message }}
              </Message>
            </div>
          </FormField>

          <FormField v-slot="$field" name="website" initialValue="">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-300">
                Website
              </label>
              <InputText
                type="url"
                placeholder="https://example.com"
                class="w-full"
                :invalid="$field?.invalid"
              />
              <Message v-if="$field?.invalid" severity="error" variant="simple">
                {{ $field.error?.message }}
              </Message>
            </div>
          </FormField>

          <Button type="submit" label="Submit" severity="secondary" />
        </div>
      </Form>
    </AppCard>

    <!-- Validation Rules Reference -->
    <AppCard elevation="low">
      <template #title>
        <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-100 flex items-center">
          <i class="pi pi-book mr-3 text-primary"></i>
          Zod Validation Examples
        </h2>
      </template>

      <div class="grid md:grid-cols-3 gap-6">
        <div>
          <h3 class="font-semibold mb-3">String Validators</h3>
          <ul class="space-y-2">
            <li class="text-sm text-surface-600 dark:text-surface-400">
              <code class="bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded">
                z.string().min(1)
              </code>
            </li>
            <li class="text-sm text-surface-600 dark:text-surface-400">
              <code class="bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded">
                z.string().email()
              </code>
            </li>
            <li class="text-sm text-surface-600 dark:text-surface-400">
              <code class="bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded">
                z.string().url()
              </code>
            </li>
            <li class="text-sm text-surface-600 dark:text-surface-400">
              <code class="bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded">
                z.string().regex()
              </code>
            </li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold mb-3">Number Validators</h3>
          <ul class="space-y-2">
            <li class="text-sm text-surface-600 dark:text-surface-400">
              <code class="bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded">
                z.number().min(0)
              </code>
            </li>
            <li class="text-sm text-surface-600 dark:text-surface-400">
              <code class="bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded">
                z.number().max(100)
              </code>
            </li>
            <li class="text-sm text-surface-600 dark:text-surface-400">
              <code class="bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded">
                z.number().int()
              </code>
            </li>
            <li class="text-sm text-surface-600 dark:text-surface-400">
              <code class="bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded">
                z.number().positive()
              </code>
            </li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold mb-3">Advanced</h3>
          <ul class="space-y-2">
            <li class="text-sm text-surface-600 dark:text-surface-400">
              <code class="bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded"> .refine() </code>
            </li>
            <li class="text-sm text-surface-600 dark:text-surface-400">
              <code class="bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded">
                .optional()
              </code>
            </li>
            <li class="text-sm text-surface-600 dark:text-surface-400">
              <code class="bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded"> z.union() </code>
            </li>
            <li class="text-sm text-surface-600 dark:text-surface-400">
              <code class="bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded"> z.object() </code>
            </li>
          </ul>
        </div>
      </div>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AppButton, AppCard } from '@/components/ui'
import { AppInput } from '@/components/ui'
import { Form, FormField } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const showDebug = ref(false)

// Contact Form
const contactInitialValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  message: '',
}

const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  phone: z
    .string()
    .optional()
    .refine(
      val => !val || /^\(\d{3}\) \d{3}-\d{4}$/.test(val),
      'Please enter a valid phone number'
    ),
  message: z
    .string()
    .min(1, 'Message is required')
    .min(10, 'Message must be at least 10 characters'),
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
      life: 3000,
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

const isContactFormDirty = (form: any) => {
  return Object.keys(form).some(key => form[key]?.dirty)
}

// Password Form
const passwordInitialValues = {
  password: '',
  confirmPassword: '',
}

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Password must contain a lowercase letter')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[0-9]/, 'Password must contain a number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
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
      life: 3000,
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
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers')
    .refine(async val => await checkUsernameAvailability(val), 'Username is already taken'),
})

const usernameResolver = zodResolver(usernameSchema)

// Conditional validation
const addressInitialValues = {
  requireShipping: false,
  address: '',
}

const addressSchema = z
  .object({
    requireShipping: z.boolean(),
    address: z.string().optional(),
  })
  .refine(data => !data.requireShipping || (data.address && data.address.length > 0), {
    message: 'Address is required when shipping is selected',
    path: ['address'],
  })

const addressResolver = zodResolver(addressSchema)

// FormField example
const fieldExampleSchema = z.object({
  businessEmail: z
    .string()
    .min(1, 'Business email is required')
    .email('Please enter a valid business email'),
  website: z
    .string()
    .optional()
    .refine(val => !val || z.string().url().safeParse(val).success, 'Please enter a valid URL'),
})

const fieldExampleResolver = zodResolver(fieldExampleSchema)

const onFieldExampleSubmit = (event: any) => {
  if (event.valid) {
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Business info submitted!',
      life: 3000,
    })
    console.log('Field example submitted:', event.values)
  }
}

// Debug helper
const getFormDebugInfo = (form: any) => {
  const debugInfo: any = {}
  Object.keys(form).forEach(key => {
    if (form[key] && typeof form[key] === 'object') {
      debugInfo[key] = {
        value: form[key].value,
        invalid: form[key].invalid,
        dirty: form[key].dirty,
        touched: form[key].touched,
        error: form[key].error?.message,
      }
    }
  })
  return debugInfo
}
</script>
