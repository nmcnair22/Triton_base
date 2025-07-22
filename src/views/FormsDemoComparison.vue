<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center py-8">
      <h1 class="text-4xl font-bold text-surface-900 dark:text-surface-100 mb-4">
        Forms Migration Comparison
      </h1>
      <p class="text-lg text-surface-600 dark:text-surface-400">
        Side-by-side comparison of current forms vs PrimeVue Forms
      </p>
    </div>

    <!-- Comparison Grid -->
    <div class="grid lg:grid-cols-2 gap-8">
      <!-- Current Forms System -->
      <AppCard elevation="low">
        <template #title>
          <h2
            class="text-xl font-semibold text-surface-900 dark:text-surface-100 flex items-center"
          >
            <i class="pi pi-code mr-2 text-orange-500"></i>
            Current Forms System
          </h2>
        </template>

        <form @submit="currentForm.handleSubmit" class="space-y-4">
          <AppInput
            v-bind="
              resolveFieldProps(
                currentForm.getFieldProps('username', {
                  validators: [
                    validators.required('Username is required'),
                    validators.minLength(3, 'Must be at least 3 characters'),
                  ],
                })
              )
            "
            label="Username"
            placeholder="Enter username"
            required
          />

          <AppInput
            v-bind="
              resolveFieldProps(
                currentForm.getFieldProps('email', {
                  validators: [
                    validators.required('Email is required'),
                    validators.email('Please enter a valid email'),
                  ],
                })
              )
            "
            label="Email"
            placeholder="Enter email"
            required
          />

          <AppInput
            v-bind="
              resolveFieldProps(
                currentForm.getFieldProps('password', {
                  validators: [
                    validators.required('Password is required'),
                    validators.minLength(8, 'Must be at least 8 characters'),
                    validators.pattern(/[A-Z]/, 'Must contain uppercase letter'),
                    validators.pattern(/[0-9]/, 'Must contain a number'),
                  ],
                })
              )
            "
            label="Password"
            placeholder="Enter password"
            type="password"
            required
          />

          <div class="flex gap-4 pt-4">
            <Button
              type="submit"
              label="Submit"
              severity="secondary"
              :loading="currentForm.isSubmitting.value"
              :disabled="!currentForm.isValid.value || currentForm.isSubmitting.value"
            />
            <Button
              type="button"
              label="Reset"
              severity="secondary"
              variant="outlined"
              @click="currentForm.reset"
              :disabled="!currentForm.isDirty.value"
            />
          </div>

          <div v-if="currentFormResult" class="mt-4 p-3 bg-green-100 dark:bg-green-900 rounded">
            <p class="text-sm">Form submitted successfully!</p>
            <pre class="text-xs mt-2">{{ JSON.stringify(currentFormResult, null, 2) }}</pre>
          </div>
        </form>
      </AppCard>

      <!-- PrimeVue Forms System -->
      <AppCard elevation="low">
        <template #title>
          <h2
            class="text-xl font-semibold text-surface-900 dark:text-surface-100 flex items-center"
          >
            <i class="pi pi-sparkles mr-2 text-primary"></i>
            PrimeVue Forms (New)
          </h2>
        </template>

        <Form
          v-slot="$form"
          :initialValues="primeVueInitialValues"
          :resolver="resolver"
          @submit="onPrimeVueSubmit"
          class="space-y-4"
        >
          <AppInputEnhanced
            name="username"
            label="Username"
            placeholder="Enter username"
            required
            :error-message="$form.username?.error?.message"
            :state="$form.username?.invalid ? 'error' : 'default'"
          />

          <AppInputEnhanced
            name="email"
            label="Email"
            placeholder="Enter email"
            type="email"
            required
            :error-message="$form.email?.error?.message"
            :state="$form.email?.invalid ? 'error' : 'default'"
          />

          <AppInputEnhanced
            name="password"
            label="Password"
            placeholder="Enter password"
            type="password"
            required
            :error-message="$form.password?.error?.message"
            :state="$form.password?.invalid ? 'error' : 'default'"
          />

          <div class="flex gap-4 pt-4">
            <Button
              type="submit"
              label="Submit"
              severity="secondary"
              :loading="primeVueSubmitting"
            />
            <Button
              type="button"
              label="Reset"
              severity="secondary"
              variant="outlined"
              @click="resetPrimeVueForm"
              :disabled="!Object.keys($form).some(key => $form[key]?.dirty)"
            />
          </div>

          <div v-if="primeVueFormResult" class="mt-4 p-3 bg-green-100 dark:bg-green-900 rounded">
            <p class="text-sm">Form submitted successfully!</p>
            <pre class="text-xs mt-2">{{ JSON.stringify(primeVueFormResult, null, 2) }}</pre>
          </div>
        </Form>
      </AppCard>
    </div>

    <!-- Feature Comparison -->
    <AppCard elevation="low">
      <template #title>
        <h2 class="text-xl font-semibold text-surface-900 dark:text-surface-100">
          Feature Comparison
        </h2>
      </template>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-surface-200 dark:border-surface-700">
              <th class="text-left py-3 px-4">Feature</th>
              <th class="text-center py-3 px-4">Current System</th>
              <th class="text-center py-3 px-4">PrimeVue Forms</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="feature in features"
              :key="feature.name"
              class="border-b border-surface-100 dark:border-surface-800"
            >
              <td class="py-3 px-4">{{ feature.name }}</td>
              <td class="text-center py-3 px-4">
                <i v-if="feature.current" class="pi pi-check text-green-500"></i>
                <i v-else class="pi pi-times text-red-500"></i>
              </td>
              <td class="text-center py-3 px-4">
                <i v-if="feature.primeVue" class="pi pi-check text-green-500"></i>
                <i v-else class="pi pi-times text-red-500"></i>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useForm, validators } from '@/composables/forms'
import { Form } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers'
import { z } from 'zod'
import AppCard from '@/components/ui/AppCard.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppInputEnhanced from '@/components/ui/AppInputEnhanced.vue'
import Button from 'primevue/button'

// Helper function for current forms
const resolveFieldProps = (fieldProps: any) => {
  const resolved: any = {}
  for (const key in fieldProps) {
    resolved[key] = typeof fieldProps[key] === 'function' ? fieldProps[key]() : fieldProps[key]
  }
  return resolved
}

// Current Forms System
const currentForm = useForm(
  {
    username: '',
    email: '',
    password: '',
  },
  {
    validateOn: 'blur',
    onSubmit: async values => {
      currentFormResult.value = values
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
    },
  }
)

const currentFormResult = ref<any>(null)

// PrimeVue Forms System
const schema = z.object({
  username: z.string().min(1, 'Username is required').min(3, 'Must be at least 3 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
})

const resolver = zodResolver(schema)

const primeVueInitialValues = {
  username: '',
  email: '',
  password: '',
}

const primeVueSubmitting = ref(false)
const primeVueFormResult = ref<any>(null)
const primeVueFormReset = ref<(() => void) | null>(null)

const onPrimeVueSubmit = async (event: any) => {
  if (event.valid) {
    primeVueSubmitting.value = true
    primeVueFormResult.value = event.values
    // Store reset function
    primeVueFormReset.value = event.reset
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    primeVueSubmitting.value = false
  }
}

const resetPrimeVueForm = () => {
  if (primeVueFormReset.value) {
    primeVueFormReset.value()
    primeVueFormResult.value = null
  }
}

// Feature comparison data
const features = [
  { name: 'Built-in Validation', current: true, primeVue: true },
  { name: 'Async Validation', current: true, primeVue: true },
  { name: 'Field-level Validation', current: true, primeVue: true },
  { name: 'Form-level Validation', current: true, primeVue: true },
  { name: 'Conditional Validation', current: true, primeVue: true },
  { name: 'Validation Triggers', current: true, primeVue: true },
  { name: 'Zod Integration', current: false, primeVue: true },
  { name: 'Yup Integration', current: false, primeVue: true },
  { name: 'Industry Standard', current: false, primeVue: true },
  { name: 'Official PrimeVue Support', current: false, primeVue: true },
  { name: 'TypeScript Support', current: true, primeVue: true },
  { name: 'Custom Validators', current: true, primeVue: true },
  { name: 'Error Messages', current: true, primeVue: true },
  { name: 'Touched/Dirty States', current: true, primeVue: true },
  { name: 'Form Reset', current: true, primeVue: true },
]
</script>
