<template>
  <div class="token-value-editor">
    <!-- Color Token Editor -->
    <div v-if="token.type === 'color'" class="color-editor">
      <div class="color-input-group">
        <div 
          class="color-swatch"
          :style="{ backgroundColor: currentValue }"
          @click="showColorPicker = !showColorPicker"
          v-tooltip="'Click to edit'"
        />
        <InputText
          v-model="currentValue"
          :placeholder="token.defaultValue"
          @input="handleValueChange"
          @blur="validateColor"
          class="color-input"
          :class="{ 'p-invalid': validationError }"
        />
        <Button
          icon="pi pi-eye-slash"
          v-if="isColorOpaque"
          @click="toggleOpacity"
          v-tooltip="'Add transparency'"
          severity="secondary"
          text
          size="small"
        />
      </div>
      
      <!-- Color Picker Popover -->
      <Popover
        v-if="showColorPicker"
        :visible="showColorPicker"
        @update:visible="showColorPicker = $event"
        :pt="{
          root: { class: 'color-picker-popover' }
        }"
      >
        <div class="color-picker-container">
          <div class="color-format-tabs">
            <Button
              v-for="format in ['hex', 'rgb', 'hsl']"
              :key="format"
              :label="format.toUpperCase()"
              :severity="colorFormat === format ? 'primary' : 'secondary'"
              text
              size="small"
              @click="colorFormat = format as 'hex' | 'rgb' | 'hsl'"
            />
          </div>
          
          <!-- Color Palette -->
          <div class="color-palette">
            <div class="preset-colors">
              <div
                v-for="color in presetColors"
                :key="color"
                class="preset-color"
                :style="{ backgroundColor: color }"
                @click="setColor(color)"
                v-tooltip="color"
              />
            </div>
            
            <!-- HSL Sliders -->
            <div v-if="colorFormat === 'hsl'" class="color-sliders">
              <div class="slider-group">
                <label>Hue</label>
                <Slider :modelValue="hslValues.h" @update:modelValue="val => hslValues.h = typeof val === 'number' ? val : val[0]" :min="0" :max="360" />
                <span>{{ hslValues.h }}°</span>
              </div>
              <div class="slider-group">
                <label>Saturation</label>
                <Slider :modelValue="hslValues.s" @update:modelValue="val => hslValues.s = typeof val === 'number' ? val : val[0]" :min="0" :max="100" />
                <span>{{ hslValues.s }}%</span>
              </div>
              <div class="slider-group">
                <label>Lightness</label>
                <Slider :modelValue="hslValues.l" @update:modelValue="val => hslValues.l = typeof val === 'number' ? val : val[0]" :min="0" :max="100" />
                <span>{{ hslValues.l }}%</span>
              </div>
              <div class="slider-group" v-if="!isColorOpaque">
                <label>Alpha</label>
                <Slider :modelValue="hslValues.a" @update:modelValue="val => hslValues.a = typeof val === 'number' ? val : val[0]" :min="0" :max="1" :step="0.01" />
                <span>{{ Math.round(hslValues.a * 100) }}%</span>
              </div>
            </div>
            
            <!-- RGB Inputs -->
            <div v-else-if="colorFormat === 'rgb'" class="color-inputs">
              <div class="input-group">
                <label>R</label>
                <InputText :modelValue="String(rgbValues.r)" @update:modelValue="val => rgbValues.r = Number(val)" type="number" :min="0" :max="255" />
              </div>
              <div class="input-group">
                <label>G</label>
                <InputText :modelValue="String(rgbValues.g)" @update:modelValue="val => rgbValues.g = Number(val)" type="number" :min="0" :max="255" />
              </div>
              <div class="input-group">
                <label>B</label>
                <InputText :modelValue="String(rgbValues.b)" @update:modelValue="val => rgbValues.b = Number(val)" type="number" :min="0" :max="255" />
              </div>
              <div class="input-group" v-if="!isColorOpaque">
                <label>A</label>
                <InputText :modelValue="String(rgbValues.a)" @update:modelValue="val => rgbValues.a = Number(val)" type="number" :min="0" :max="1" :step="0.01" />
              </div>
            </div>
          </div>
          
          <div class="color-picker-footer">
            <Button label="Apply" severity="primary" size="small" @click="applyColor" />
            <Button label="Cancel" severity="secondary" text size="small" @click="showColorPicker = false" />
          </div>
        </div>
      </Popover>
    </div>
    
    <!-- Size Token Editor -->
    <div v-else-if="token.type === 'size'" class="size-editor">
      <div class="size-input-group">
        <InputText
          :modelValue="String(sizeValue)"
          @update:modelValue="val => { sizeValue = Number(val); handleSizeChange() }"
          type="number"
          :placeholder="token.defaultValue"
          :class="{ 'p-invalid': validationError }"
        />
        <Select
          v-model="sizeUnit"
          :options="sizeUnits"
          optionLabel="label"
          optionValue="value"
          @change="handleSizeChange"
          class="size-unit-select"
        />
      </div>
      <div class="size-preview" v-if="showSizePreview">
        <div class="preview-box" :style="{ width: currentValue, height: currentValue }">
          {{ currentValue }}
        </div>
      </div>
    </div>
    
    <!-- Spacing Token Editor -->
    <div v-else-if="token.type === 'spacing'" class="spacing-editor">
      <div class="spacing-scale">
        <Button
          v-for="scale in spacingScale"
          :key="scale.value"
          :label="scale.label"
          :severity="currentValue === scale.value ? 'primary' : 'secondary'"
          @click="setSpacing(scale.value)"
          size="small"
          class="spacing-option"
        />
      </div>
      <InputText
        v-model="currentValue"
        :placeholder="token.defaultValue"
        @input="handleValueChange"
        class="spacing-input"
        :class="{ 'p-invalid': validationError }"
      />
    </div>
    
    <!-- Border Radius Token Editor -->
    <div v-else-if="token.type === 'borderRadius'" class="radius-editor">
      <div class="radius-presets">
        <div
          v-for="preset in radiusPresets"
          :key="preset.value"
          class="radius-preset"
          :class="{ active: currentValue === preset.value }"
          @click="setBorderRadius(preset.value)"
          v-tooltip="preset.label"
        >
          <div class="radius-preview" :style="{ borderRadius: preset.value }" />
        </div>
      </div>
      <InputText
        v-model="currentValue"
        :placeholder="token.defaultValue"
        @input="handleValueChange"
        class="radius-input"
        :class="{ 'p-invalid': validationError }"
      />
    </div>
    
    <!-- Shadow Token Editor -->
    <div v-else-if="token.type === 'shadow'" class="shadow-editor">
      <div class="shadow-controls">
        <div class="control-group">
          <label>X Offset</label>
          <InputText :modelValue="String(shadowValues.x)" @update:modelValue="val => { shadowValues.x = Number(val); updateShadow() }" type="number" />
        </div>
        <div class="control-group">
          <label>Y Offset</label>
          <InputText :modelValue="String(shadowValues.y)" @update:modelValue="val => { shadowValues.y = Number(val); updateShadow() }" type="number" />
        </div>
        <div class="control-group">
          <label>Blur</label>
          <InputText :modelValue="String(shadowValues.blur)" @update:modelValue="val => { shadowValues.blur = Number(val); updateShadow() }" type="number" :min="0" />
        </div>
        <div class="control-group">
          <label>Spread</label>
          <InputText :modelValue="String(shadowValues.spread)" @update:modelValue="val => { shadowValues.spread = Number(val); updateShadow() }" type="number" />
        </div>
        <div class="control-group">
          <label>Color</label>
          <div class="shadow-color-input">
            <div 
              class="color-swatch small"
              :style="{ backgroundColor: shadowValues.color }"
              @click="showShadowColorPicker = !showShadowColorPicker"
            />
            <InputText v-model="shadowValues.color" @input="updateShadow" />
          </div>
        </div>
      </div>
      <div class="shadow-preview">
        <div class="preview-box" :style="{ boxShadow: currentValue }">
          Shadow Preview
        </div>
      </div>
    </div>
    
    <!-- Typography Token Editor -->
    <div v-else-if="token.type === 'typography'" class="typography-editor">
      <div class="typography-controls">
        <div class="control-group">
          <label>Font Family</label>
          <Select
            v-model="typographyValues.fontFamily"
            :options="fontFamilies"
            optionLabel="label"
            optionValue="value"
            @change="updateTypography"
            placeholder="Select font"
          />
        </div>
        <div class="control-group">
          <label>Font Size</label>
          <InputText 
            v-model="typographyValues.fontSize" 
            @input="updateTypography"
            placeholder="e.g., 16px"
          />
        </div>
        <div class="control-group">
          <label>Font Weight</label>
          <Select
            v-model="typographyValues.fontWeight"
            :options="fontWeights"
            optionLabel="label"
            optionValue="value"
            @change="updateTypography"
          />
        </div>
        <div class="control-group">
          <label>Line Height</label>
          <InputText 
            v-model="typographyValues.lineHeight" 
            @input="updateTypography"
            placeholder="e.g., 1.5"
          />
        </div>
      </div>
      <div class="typography-preview">
        <p :style="typographyStyle">
          The quick brown fox jumps over the lazy dog
        </p>
      </div>
    </div>
    
    <!-- Generic/Fallback Editor -->
    <div v-else class="generic-editor">
      <InputText
        v-model="currentValue"
        :placeholder="token.defaultValue"
        @input="handleValueChange"
        class="generic-input"
        :class="{ 'p-invalid': validationError }"
      />
    </div>
    
    <!-- Validation Message -->
    <small v-if="validationError" class="p-error">{{ validationError }}</small>
    
    <!-- Token Info -->
    <div v-if="showTokenInfo" class="token-info">
      <div class="info-item">
        <span class="info-label">Default:</span>
        <code>{{ token.defaultValue }}</code>
      </div>
      <div class="info-item" v-if="token.description">
        <span class="info-label">Description:</span>
        <span>{{ token.description }}</span>
      </div>
      <div class="info-item" v-if="token.affects?.length">
        <span class="info-label">Affects:</span>
        <div class="affects-list">
          <Tag 
            v-for="component in token.affects" 
            :key="component"
            :value="component"
            severity="secondary"
            size="small"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { DesignToken } from '@/themes/presets/preset.types'
import { useToast } from 'primevue/usetoast'

const props = defineProps<{
  token: DesignToken
  value?: any
  compact?: boolean
  showTokenInfo?: boolean
}>()

const emit = defineEmits<{
  update: [value: any]
  validate: [valid: boolean, error?: string]
}>()

const toast = useToast()

// State
const currentValue = ref<any>(props.value || props.token.value)
const validationError = ref<string>('')
const showColorPicker = ref(false)
const showShadowColorPicker = ref(false)
const colorFormat = ref<'hex' | 'rgb' | 'hsl'>('hex')

// Color editor state
const rgbValues = ref({ r: 0, g: 0, b: 0, a: 1 })
const hslValues = ref({ h: 0, s: 0, l: 0, a: 1 })

// Size editor state
const sizeValue = ref<number>(0)
const sizeUnit = ref<string>('px')
const showSizePreview = ref(true)

// Shadow editor state
const shadowValues = ref({
  x: 0,
  y: 2,
  blur: 4,
  spread: 0,
  color: 'rgba(0, 0, 0, 0.1)'
})

// Typography editor state
const typographyValues = ref({
  fontFamily: '',
  fontSize: '',
  fontWeight: '',
  lineHeight: ''
})

// Constants
const presetColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
  '#000000', '#FFFFFF', '#6B7280', '#374151', '#1F2937'
]

const sizeUnits = [
  { label: 'px', value: 'px' },
  { label: 'rem', value: 'rem' },
  { label: 'em', value: 'em' },
  { label: '%', value: '%' },
  { label: 'vw', value: 'vw' },
  { label: 'vh', value: 'vh' }
]

const spacingScale = [
  { label: '0', value: '0' },
  { label: 'xs', value: '0.25rem' },
  { label: 'sm', value: '0.5rem' },
  { label: 'md', value: '1rem' },
  { label: 'lg', value: '1.5rem' },
  { label: 'xl', value: '2rem' },
  { label: '2xl', value: '3rem' },
  { label: '3xl', value: '4rem' }
]

const radiusPresets = [
  { label: 'None', value: '0' },
  { label: 'Small', value: '0.25rem' },
  { label: 'Medium', value: '0.5rem' },
  { label: 'Large', value: '0.75rem' },
  { label: 'X-Large', value: '1rem' },
  { label: 'Round', value: '9999px' }
]

const fontFamilies = [
  { label: 'System', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  { label: 'Sans Serif', value: 'sans-serif' },
  { label: 'Serif', value: 'serif' },
  { label: 'Monospace', value: 'monospace' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' }
]

const fontWeights = [
  { label: 'Thin', value: '100' },
  { label: 'Light', value: '300' },
  { label: 'Normal', value: '400' },
  { label: 'Medium', value: '500' },
  { label: 'Semibold', value: '600' },
  { label: 'Bold', value: '700' },
  { label: 'Black', value: '900' }
]

// Computed
const isColorOpaque = computed(() => {
  if (props.token.type !== 'color') return true
  return !currentValue.value.includes('rgba') && !currentValue.value.includes('hsla')
})

const typographyStyle = computed(() => {
  if (props.token.type !== 'typography') return {}
  
  return {
    fontFamily: typographyValues.value.fontFamily,
    fontSize: typographyValues.value.fontSize,
    fontWeight: typographyValues.value.fontWeight,
    lineHeight: typographyValues.value.lineHeight
  }
})

// Methods
function handleValueChange(event?: Event) {
  const value = event ? (event.target as HTMLInputElement).value : currentValue.value
  currentValue.value = value
  validateValue(value)
  emit('update', value)
}

function validateValue(value: any) {
  validationError.value = ''
  
  if (!value && props.token.validation?.required) {
    validationError.value = 'This field is required'
    emit('validate', false, validationError.value)
    return
  }
  
  // Type-specific validation
  switch (props.token.type) {
    case 'color':
      if (!isValidColor(value)) {
        validationError.value = 'Invalid color format'
      }
      break
    case 'size':
    case 'spacing':
    case 'borderRadius':
      if (!isValidSize(value)) {
        validationError.value = 'Invalid size format'
      }
      break
  }
  
  emit('validate', !validationError.value, validationError.value)
}

function isValidColor(color: string): boolean {
  // Basic color validation
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  const rgbRegex = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/
  const rgbaRegex = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/
  const hslRegex = /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/
  const hslaRegex = /^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)$/
  
  return hexRegex.test(color) || 
         rgbRegex.test(color) || 
         rgbaRegex.test(color) || 
         hslRegex.test(color) || 
         hslaRegex.test(color)
}

function isValidSize(size: string): boolean {
  const sizeRegex = /^\d+(\.\d+)?(px|rem|em|%|vw|vh|ch|ex)$/
  return size === '0' || sizeRegex.test(size)
}

function validateColor() {
  validateValue(currentValue.value)
}

function setColor(color: string) {
  currentValue.value = color
  handleValueChange()
  showColorPicker.value = false
}

function applyColor() {
  // Convert from current format to hex/rgba
  let color = currentValue.value
  
  if (colorFormat.value === 'rgb') {
    const { r, g, b, a } = rgbValues.value
    color = a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`
  } else if (colorFormat.value === 'hsl') {
    const { h, s, l, a } = hslValues.value
    color = a < 1 ? `hsla(${h}, ${s}%, ${l}%, ${a})` : `hsl(${h}, ${s}%, ${l}%)`
  }
  
  currentValue.value = color
  handleValueChange()
  showColorPicker.value = false
}

function toggleOpacity() {
  // Convert color to rgba format
  if (currentValue.value.startsWith('#')) {
    const hex = currentValue.value.slice(1)
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    currentValue.value = `rgba(${r}, ${g}, ${b}, 1)`
    handleValueChange()
  }
}

function handleSizeChange() {
  currentValue.value = `${sizeValue.value}${sizeUnit.value}`
  handleValueChange()
}

function setSpacing(value: string) {
  currentValue.value = value
  handleValueChange()
}

function setBorderRadius(value: string) {
  currentValue.value = value
  handleValueChange()
}

function updateShadow() {
  const { x, y, blur, spread, color } = shadowValues.value
  currentValue.value = `${x}px ${y}px ${blur}px ${spread}px ${color}`
  handleValueChange()
}

function updateTypography() {
  // For typography, we might store as JSON or formatted string
  const value = JSON.stringify(typographyValues.value)
  currentValue.value = value
  handleValueChange()
}

function parseTypographyValue(value: string) {
  try {
    const parsed = JSON.parse(value)
    Object.assign(typographyValues.value, parsed)
  } catch {
    // Fallback parsing for simple values
    typographyValues.value.fontSize = value
  }
}

function parseSizeValue(value: string) {
  const match = value.match(/^(\d+(?:\.\d+)?)(px|rem|em|%|vw|vh)?$/)
  if (match) {
    sizeValue.value = parseFloat(match[1])
    sizeUnit.value = match[2] || 'px'
  }
}

function parseShadowValue(value: string) {
  // Parse box-shadow: x y blur spread color
  const parts = value.match(/(-?\d+)px\s+(-?\d+)px\s+(\d+)px\s+(-?\d+)px\s+(.+)/)
  if (parts) {
    shadowValues.value = {
      x: parseInt(parts[1]),
      y: parseInt(parts[2]),
      blur: parseInt(parts[3]),
      spread: parseInt(parts[4]),
      color: parts[5]
    }
  }
}

// Lifecycle
onMounted(() => {
  // Initialize values based on token type
  if (props.token.type === 'size' && currentValue.value) {
    parseSizeValue(currentValue.value)
  } else if (props.token.type === 'shadow' && currentValue.value) {
    parseShadowValue(currentValue.value)
  } else if (props.token.type === 'typography' && currentValue.value) {
    parseTypographyValue(currentValue.value)
  }
})

// Watch for external value changes
watch(() => props.value, (newValue) => {
  currentValue.value = newValue
})
</script>

<style scoped>
.token-value-editor {
  width: 100%;
}

/* Color Editor */
.color-editor {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.color-input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-swatch {
  width: 32px;
  height: 32px;
  border-radius: var(--p-border-radius);
  border: 2px solid var(--p-surface-300);
  cursor: pointer;
  transition: transform 0.2s;
}

.color-swatch:hover {
  transform: scale(1.1);
}

.color-swatch.small {
  width: 24px;
  height: 24px;
}

.color-input {
  flex: 1;
}

.color-picker-container {
  padding: 1rem;
  min-width: 300px;
}

.color-format-tabs {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.color-palette {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preset-colors {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
}

.preset-color {
  width: 40px;
  height: 40px;
  border-radius: var(--p-border-radius);
  border: 2px solid var(--p-surface-300);
  cursor: pointer;
  transition: transform 0.2s;
}

.preset-color:hover {
  transform: scale(1.1);
}

.color-sliders {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.slider-group {
  display: grid;
  grid-template-columns: 80px 1fr 50px;
  align-items: center;
  gap: 0.5rem;
}

.slider-group label {
  font-size: 0.875rem;
  font-weight: 500;
}

.color-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 0.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.input-group label {
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
}

.color-picker-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--p-surface-200);
}

/* Size Editor */
.size-editor {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.size-input-group {
  display: flex;
  gap: 0.5rem;
}

.size-input-group input {
  flex: 1;
}

.size-unit-select {
  width: 100px;
}

.size-preview {
  padding: 1rem;
  background-color: var(--p-surface-50);
  border-radius: var(--p-border-radius);
}

.preview-box {
  background-color: var(--p-primary-500);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: var(--p-border-radius);
  transition: all 0.3s;
}

/* Spacing Editor */
.spacing-editor {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.spacing-scale {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.spacing-option {
  min-width: 60px;
}

/* Border Radius Editor */
.radius-editor {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.radius-presets {
  display: flex;
  gap: 0.5rem;
}

.radius-preset {
  position: relative;
  width: 40px;
  height: 40px;
  border: 2px solid var(--p-surface-300);
  border-radius: var(--p-border-radius);
  cursor: pointer;
  transition: all 0.2s;
}

.radius-preset.active {
  border-color: var(--p-primary-500);
}

.radius-preset:hover {
  border-color: var(--p-primary-400);
}

.radius-preview {
  position: absolute;
  inset: 4px;
  background-color: var(--p-primary-500);
}

/* Shadow Editor */
.shadow-editor {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.shadow-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.control-group label {
  font-size: 0.875rem;
  font-weight: 500;
}

.shadow-color-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.shadow-preview {
  padding: 2rem;
  background-color: var(--p-surface-50);
  border-radius: var(--p-border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
}

.shadow-preview .preview-box {
  padding: 2rem;
  background-color: white;
  border-radius: var(--p-border-radius);
  font-weight: 500;
}

/* Typography Editor */
.typography-editor {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.typography-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
}

.typography-preview {
  padding: 1.5rem;
  background-color: var(--p-surface-50);
  border-radius: var(--p-border-radius);
}

.typography-preview p {
  margin: 0;
}

/* Generic Editor */
.generic-editor {
  width: 100%;
}

.generic-input {
  width: 100%;
}

/* Token Info */
.token-info {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background-color: var(--p-surface-50);
  border-radius: var(--p-border-radius);
  font-size: 0.875rem;
}

.info-item {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 500;
  color: var(--p-text-muted-color);
}

.affects-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

/* Validation */
.p-invalid {
  border-color: var(--p-error-color) !important;
}

.p-error {
  color: var(--p-error-color);
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
}

/* Compact Mode */
.token-value-editor[data-compact="true"] {
  .color-swatch {
    width: 24px;
    height: 24px;
  }
  
  .preview-box {
    padding: 1rem;
  }
  
  .token-info {
    display: none;
  }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .size-preview,
  .shadow-preview,
  .typography-preview,
  .token-info {
    background-color: var(--p-surface-800);
  }
  
  .shadow-preview .preview-box {
    background-color: var(--p-surface-700);
  }
}
</style>