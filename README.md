# 🚀 Triton Design System

A modern, production-ready design system built with **PrimeVue 4**, **Tailwind CSS 4**, and **Vue 3** + **TypeScript**.

## ✨ Features

- 🎨 **PrimeVue 4** with styled mode and design tokens (`dt`)
- 🔧 **Tailwind CSS 4** with CSS-first configuration
- ⚡ **Vue 3.5+** with Composition API and TypeScript
- 🏗️ **Vite 6.3.5** with performance optimizations
- 🌓 **Dark Mode** support with VueUse composables
- 📦 **Auto-imports** for components and composables
- 🎯 **Design System Components** with theme-aware styling
- 🧪 **Demo Pages** showcasing components, forms, and tables
- 🚀 **Production-ready** build configuration

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Vue 3 | 3.5+ | Frontend framework |
| TypeScript | 5.6+ | Type safety |
| PrimeVue | 4.2+ | UI component library |
| Tailwind CSS | 4.0+ | Utility-first CSS |
| Vite | 6.3.5 | Build tool & dev server |
| VueUse | 12+ | Vue composition utilities |
| Vue Router | 4.5+ | Client-side routing |
| Pinia | 2.2+ | State management |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 8+ (or yarn/pnpm)

### Installation

```bash
# Clone the repository
git clone https://github.com/nmcnair22/Triton_base.git
cd Triton_base

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint with auto-fix
npm run lint:check   # Check ESLint without fixing
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking

# Utilities
npm run clean        # Clean build artifacts
npm run reinstall    # Fresh install dependencies
```

## 🎨 Design System

### Components

The design system includes theme-aware components built with PrimeVue and customized using design tokens:

- **AppButton** - Various variants (primary, secondary, success, warning, danger, ghost)
- **AppCard** - Different elevations (flat, low, medium, high)
- **AppInput** - Form inputs with validation states

### Design Tokens (`dt`)

Components use PrimeVue's design token system for consistent theming:

```vue
<template>
  <AppButton 
    variant="primary" 
    size="large"
    :dt="customTokens"
  >
    Custom Button
  </AppButton>
</template>

<script setup>
import { TokenFactory } from '@/themes/token-factory'

const customTokens = TokenFactory.button('primary', 'large')
</script>
```

### Dark Mode

Automatic dark mode with system preference detection:

```vue
<script setup>
import { useDarkMode } from '@/composables'

const { isDark, toggleDarkMode } = useDarkMode()
</script>
```

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                    # Design system components
│   │   ├── AppButton.vue
│   │   ├── AppCard.vue
│   │   └── AppInput.vue
│   └── layout/                # Layout components
│       └── AppLayout.vue
├── composables/               # Vue composables
│   └── useDarkMode.ts
├── themes/                    # Theme system
│   ├── custom-preset.ts       # PrimeVue theme preset
│   └── token-factory.ts       # Design token factory
├── views/                     # Page components
│   ├── HomeView.vue
│   ├── ComponentsDemo.vue
│   ├── FormsDemo.vue
│   └── TablesDemo.vue
├── assets/
│   └── main.css              # Tailwind CSS configuration
└── main.ts                   # App entry point
```

## 🔧 Configuration

### Tailwind CSS 4

CSS-first configuration in `src/assets/main.css`:

```css
@theme {
  --color-brand-500: oklch(0.62 0.25 250);
  --font-sans: "Inter", system-ui, sans-serif;
}
```

### PrimeVue Theme

Custom preset in `src/themes/custom-preset.ts`:

```typescript
export const CustomPreset = definePreset(Aura, {
  semantic: {
    primary: {
      500: '{brand.500}',
      // ... other tokens
    }
  }
})
```

### TypeScript

Strict TypeScript configuration with path aliases:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 📖 Usage Examples

### Creating Custom Components

```vue
<!-- MyComponent.vue -->
<template>
  <AppCard elevation="medium">
    <template #title>My Component</template>
    <p>Component content here</p>
    
    <template #footer>
      <AppButton variant="primary" @click="handleAction">
        Take Action
      </AppButton>
    </template>
  </AppCard>
</template>

<script setup lang="ts">
import { AppCard, AppButton } from '@/components/ui'

const handleAction = () => {
  console.log('Action taken!')
}
</script>
```

### Form Example

```vue
<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <AppInput
      v-model="form.email"
      label="Email"
      type="email"
      :state="emailError ? 'error' : 'default'"
      :error-message="emailError"
      required
    />
    
    <AppInput
      v-model="form.password"
      label="Password"
      type="password"
      :state="passwordError ? 'error' : 'default'"
      :error-message="passwordError"
      required
    />
    
    <AppButton 
      type="submit" 
      variant="primary" 
      full-width
      :loading="isSubmitting"
    >
      Sign In
    </AppButton>
  </form>
</template>
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The `dist/` folder contains the production build ready for deployment.

### Environment Variables

Create `.env.local` for local environment variables:

```bash
VITE_APP_TITLE=Triton Design System
VITE_API_URL=https://api.example.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style (ESLint + Prettier)
- Write TypeScript with strict typing
- Use the design token system for styling
- Test components in the demo pages
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [PrimeVue](https://primevue.org/) - Vue UI component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
- [VueUse](https://vueuse.org/) - Collection of Vue composition utilities
- [Vite](https://vitejs.dev/) - Next generation frontend tooling

---

Built with ❤️ using modern web technologies
