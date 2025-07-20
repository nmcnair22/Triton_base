<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center py-8">
      <h1 class="text-4xl font-bold text-surface-900 dark:text-surface-100 mb-4">Form Examples</h1>
      <p class="text-lg text-surface-600 dark:text-surface-400">
        Comprehensive form patterns using design tokens and validation
      </p>
    </div>

    <!-- Contact Form Example -->
    <AppCard elevation="low">
      <template #title>
        <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-100 flex items-center">
          <i class="pi pi-user mr-3 text-primary"></i>
          Contact Form
        </h2>
      </template>

      <form @submit.prevent="submitForm" class="space-y-6">
        <div class="grid md:grid-cols-2 gap-6">
          <AppInput
            v-model="form.firstName"
            label="First Name"
            placeholder="Enter your first name"
            required
          />

          <AppInput
            v-model="form.lastName"
            label="Last Name"
            placeholder="Enter your last name"
            required
          />
        </div>

        <AppInput
          v-model="form.email"
          label="Email Address"
          placeholder="Enter your email"
          :state="emailState"
          :error-message="emailError"
          required
        />

        <AppInput
          v-model="form.message"
          label="Message"
          placeholder="Enter your message..."
          help-text="Tell us how we can help you"
        />

        <div class="flex gap-4">
          <AppButton type="submit" variant="primary" size="large">
            <template #icon><i class="pi pi-send"></i></template>
            Send Message
          </AppButton>
          <AppButton type="button" variant="secondary" @click="resetForm"> Reset </AppButton>
        </div>
      </form>
    </AppCard>

    <!-- Coming Soon -->
    <AppCard elevation="medium">
      <template #title>
        <h2 class="text-2xl font-semibold text-surface-900 dark:text-surface-100 flex items-center">
          <i class="pi pi-clock mr-3 text-primary"></i>
          More Examples Coming Soon
        </h2>
      </template>

      <div class="text-center py-8">
        <i class="pi pi-wrench text-surface-400 text-4xl mb-4 block"></i>
        <p class="text-surface-600 dark:text-surface-400 mb-4">
          We're working on more comprehensive form examples including:
        </p>
        <ul class="text-left max-w-md mx-auto space-y-2 text-surface-600 dark:text-surface-400">
          <li class="flex items-center">
            <i class="pi pi-check text-green-500 mr-2"></i>Advanced validation patterns
          </li>
          <li class="flex items-center">
            <i class="pi pi-check text-green-500 mr-2"></i>Multi-step forms
          </li>
          <li class="flex items-center">
            <i class="pi pi-check text-green-500 mr-2"></i>Dynamic form generation
          </li>
          <li class="flex items-center">
            <i class="pi pi-check text-green-500 mr-2"></i>File upload examples
          </li>
        </ul>
      </div>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { AppButton, AppCard, AppInput, type InputState } from '@/components/ui'

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  message: '',
})

const emailError = ref('')

const emailState = computed((): InputState => {
  if (!form.value.email) return 'default'

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(form.value.email) ? 'success' : 'error'
})

// Watch email state to update error message
watch(emailState, (newState) => {
  if (newState === 'error' && form.value.email) {
    emailError.value = 'Please enter a valid email address'
  } else {
    emailError.value = ''
  }
})

const submitForm = () => {
  console.log('Form submitted:', form.value)
  // Handle form submission
}

const resetForm = () => {
  form.value = {
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  }
  emailError.value = ''
}
</script>
