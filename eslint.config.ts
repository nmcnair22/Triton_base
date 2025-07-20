import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

// Auto-import globals from unplugin-auto-import
import autoImportGlobals from './.eslintrc-auto-import.json'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/node_modules/**', 'auto-imports.d.ts', 'components.d.ts']),

  // Base Vue configuration
  pluginVue.configs['flat/essential'],
  
  // TypeScript configuration
  vueTsConfigs.recommended,

  // Auto-import globals support
  {
    name: 'app/auto-imports',
    languageOptions: {
      globals: {
        ...autoImportGlobals.globals
      }
    }
  },

  // Custom rules configuration
  {
    name: 'app/custom-rules',
    rules: {
      // Vue 3 specific rules
      'vue/multi-word-component-names': 'off',
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/define-macros-order': ['error', {
        order: ['defineOptions', 'defineProps', 'defineEmits', 'defineSlots']
      }],
      'vue/no-unused-vars': 'error',
      'vue/require-default-prop': 'off', // Not needed with TypeScript
      'vue/prefer-define-options': 'error',
      'vue/block-order': 'off', // Allow flexible block ordering
      
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        disallowTypeAnnotations: false
      }],
      
      // General rules
      'prefer-const': 'error',
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-unused-vars': 'off', // Handled by TypeScript
      'no-undef': 'off', // Handled by TypeScript and auto-imports
    }
  },

  skipFormatting,
)
