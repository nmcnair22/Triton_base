<template>
  <div class="color-token-editor">
    <div class="flex items-center justify-between p-3 border border-surface-200 rounded">
      <div class="flex items-center gap-3">
        <div
          class="w-6 h-6 rounded border border-surface-300 cursor-pointer"
          :style="{ backgroundColor: value }"
          @click.stop="openColorPicker"
        />
        
        <div>
          <div class="font-medium text-sm">{{ token.label }}</div>
          <div class="text-xs text-muted">{{ value }}</div>
        </div>
        
        <Badge 
          v-if="isEdited" 
          value="●" 
          severity="info" 
          size="small"
          v-tooltip="'Modified from default'"
        />
      </div>
      
      <div class="flex items-center gap-1">
        <Button
          icon="pi pi-copy"
          size="small"
          text
          @click="copyValue"
          v-tooltip="'Copy color value'"
        />
        
        <Button
          icon="pi pi-refresh"
          size="small"
          text
          severity="secondary"
          @click="resetToDefault"
          v-tooltip="'Reset to default'"
          :disabled="!isEdited"
        />
        
        <Button
          icon="pi pi-pencil"
          size="small"
          text
          @click="startEditing"
          v-tooltip="'Edit color'"
        />
      </div>
    </div>
    
    <!-- Enhanced Color picker overlay -->
    <Popover 
      ref="colorPickerPanel"
      @show="onColorPickerShow"
      @hide="onColorPickerHide"
      :style="{ width: '320px' }"
      @click.stop
    >
      <div class="p-4">
        <!-- Color Input -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Color Value</label>
          <div class="flex gap-2">
            <InputText
              v-model="localValue"
              class="flex-1"
              @input="onColorChange"
              @keyup.enter="applyColor"
              placeholder="#000000"
            />
            <div
              class="w-10 h-10 rounded border border-surface-300 dark:border-surface-600"
              :style="{ backgroundColor: localValue }"
            />
          </div>
          <div v-if="colorError" class="text-xs text-danger mt-1">
            {{ colorError }}
          </div>
        </div>

        <!-- Format Tabs -->
        <Tabs value="hex" class="mb-4">
          <TabList>
            <Tab value="hex">Hex</Tab>
            <Tab value="rgb">RGB</Tab>
            <Tab value="hsl">HSL</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="hex">
              <InputText
                v-model="hexValue"
                class="w-full"
                @input="updateFromHex"
                placeholder="#000000"
              />
            </TabPanel>
            <TabPanel value="rgb">
              <div class="grid grid-cols-3 gap-2">
                <InputText
                  v-model="rgbValue.r"
                  @input="updateFromRgb"
                  placeholder="R"
                  type="number"
                  min="0"
                  max="255"
                />
                <InputText
                  v-model="rgbValue.g"
                  @input="updateFromRgb"
                  placeholder="G"
                  type="number"
                  min="0"
                  max="255"
                />
                <InputText
                  v-model="rgbValue.b"
                  @input="updateFromRgb"
                  placeholder="B"
                  type="number"
                  min="0"
                  max="255"
                />
              </div>
            </TabPanel>
            <TabPanel value="hsl">
              <div class="grid grid-cols-3 gap-2">
                <InputText
                  v-model="hslValue.h"
                  @input="updateFromHsl"
                  placeholder="H"
                  type="number"
                  min="0"
                  max="360"
                />
                <InputText
                  v-model="hslValue.s"
                  @input="updateFromHsl"
                  placeholder="S%"
                  type="number"
                  min="0"
                  max="100"
                />
                <InputText
                  v-model="hslValue.l"
                  @input="updateFromHsl"
                  placeholder="L%"
                  type="number"
                  min="0"
                  max="100"
                />
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>

        <!-- Quick Color Presets -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Quick Colors</label>
          <div class="grid grid-cols-8 gap-1">
            <div
              v-for="quickColor in quickColors"
              :key="quickColor"
              class="w-6 h-6 rounded border border-surface-300 dark:border-surface-600 cursor-pointer hover:scale-110 transition-transform"
              :style="{ backgroundColor: quickColor }"
              @click="selectQuickColor(quickColor)"
              :title="quickColor"
            />
          </div>
        </div>

        <!-- Color Variations -->
        <div v-if="colorVariations.length > 0" class="mb-4">
          <label class="block text-sm font-medium mb-2">Variations</label>
          <div class="grid grid-cols-5 gap-1">
            <div
              v-for="variation in colorVariations"
              :key="variation.value"
              class="flex flex-col items-center cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800 p-1 rounded"
              @click.stop="selectQuickColor(variation.value)"
            >
              <div
                class="w-6 h-6 rounded border border-surface-300 dark:border-surface-600"
                :style="{ backgroundColor: variation.value }"
              />
              <span class="text-xs text-muted mt-1">{{ variation.name }}</span>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end gap-2">
          <Button
            label="Cancel"
            size="small"
            severity="secondary"
            @click.stop="closeColorPicker"
          />
          <Button
            label="Apply"
            size="small"
            @click.stop="applyColor"
            :disabled="!!colorError"
          />
        </div>
      </div>
    </Popover>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { ColorToken } from '@/themes/presets/preset.types'
import { useToast } from 'primevue/usetoast'
import { 
  isValidColor, 
  darkenColor, 
  lightenColor, 
  parseColor, 
  rgbToHex, 
  rgbToHsl 
} from '@/themes/utils/color-utils'

interface Props {
  token: ColorToken
  value: string
  isEdited?: boolean
}

interface Emits {
  update: [tokenId: string, value: string]
  reset: [tokenId: string]
  edit: [tokenId: string]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const toast = useToast()

const colorPickerPanel = ref()
const localValue = ref('')
const isColorPickerOpen = ref(false)
const colorError = ref('')

// Color format values  
const hexValue = ref('')
const rgbValue = ref({ r: '0', g: '0', b: '0' })
const hslValue = ref({ h: '0', s: '0', l: '0' })

// Quick color presets
const quickColors = [
  '#FF0000', '#FF8000', '#FFFF00', '#80FF00', '#00FF00', '#00FF80', '#00FFFF', '#0080FF',
  '#0000FF', '#8000FF', '#FF00FF', '#FF0080', '#000000', '#404040', '#808080', '#C0C0C0',
  '#FFFFFF', '#FFE6E6', '#E6F7FF', '#F6FFED', '#FFF7E6', '#FFF1F0', '#F9F0FF', '#E6F4FF'
]

// Color variations based on current color
const colorVariations = computed(() => {
  if (!isValidColor(localValue.value)) return []
  
  try {
    const baseColor = localValue.value
    return [
      { name: 'Darker', value: darkenColor(baseColor, 20) },
      { name: 'Dark', value: darkenColor(baseColor, 10) },
      { name: 'Original', value: baseColor },
      { name: 'Light', value: lightenColor(baseColor, 10) },
      { name: 'Lighter', value: lightenColor(baseColor, 20) }
    ]
  } catch {
    return []
  }
})

// Watch for prop changes
watch(() => props.value, (newValue) => {
  localValue.value = newValue
}, { immediate: true })

function openColorPicker(event: Event) {
  localValue.value = props.value
  colorPickerPanel.value.toggle(event)
}

function closeColorPicker() {
  colorPickerPanel.value.hide()
}

function onColorPickerShow() {
  isColorPickerOpen.value = true
}

function onColorPickerHide() {
  isColorPickerOpen.value = false
}

function onColorChange() {
  validateColor()
  updateFormatValues()
}

function validateColor() {
  colorError.value = ''
  
  if (!localValue.value.trim()) {
    colorError.value = 'Color value is required'
    return
  }
  
  if (!isValidColor(localValue.value)) {
    colorError.value = 'Invalid color format'
    return
  }
}

function updateFormatValues() {
  if (!isValidColor(localValue.value)) return
  
  try {
    const rgb = parseColor(localValue.value)
    if (rgb) {
      hexValue.value = rgbToHex(rgb.r, rgb.g, rgb.b)
      rgbValue.value = {
        r: rgb.r.toString(),
        g: rgb.g.toString(),
        b: rgb.b.toString()
      }
      
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
      hslValue.value = {
        h: Math.round(hsl.h).toString(),
        s: Math.round(hsl.s).toString(),
        l: Math.round(hsl.l).toString()
      }
    }
  } catch (error) {
    console.warn('Failed to update format values:', error)
  }
}

function updateFromHex() {
  if (isValidColor(hexValue.value)) {
    localValue.value = hexValue.value
    onColorChange()
    // Apply immediately for real-time preview
    emit('update', props.token.id, hexValue.value)
  }
}

function updateFromRgb() {
  try {
    const hex = rgbToHex(Number(rgbValue.value.r), Number(rgbValue.value.g), Number(rgbValue.value.b))
    localValue.value = hex
    onColorChange()
    // Apply immediately for real-time preview
    emit('update', props.token.id, hex)
  } catch (error) {
    console.warn('Failed to update from RGB:', error)
  }
}

function updateFromHsl() {
  try {
    // Convert HSL to RGB, then to hex (simplified)
    const h = Number(hslValue.value.h) / 360
    const s = Number(hslValue.value.s) / 100
    const l = Number(hslValue.value.l) / 100
    
    // Basic HSL to RGB conversion
    let r, g, b
    
    if (s === 0) {
      r = g = b = l // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1/6) return p + (q - p) * 6 * t
        if (t < 1/2) return q
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
        return p
      }
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }
    
    const hex = rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255))
    localValue.value = hex
    onColorChange()
    // Apply immediately for real-time preview
    emit('update', props.token.id, hex)
  } catch (error) {
    console.warn('Failed to update from HSL:', error)
  }
}

function selectQuickColor(color: string) {
  localValue.value = color
  onColorChange()
  // Apply the color immediately for real-time preview
  emit('update', props.token.id, color)
}

function applyColor() {
  emit('update', props.token.id, localValue.value)
  closeColorPicker()
}

function resetToDefault() {
  emit('reset', props.token.id)
}

function startEditing() {
  emit('edit', props.token.id)
}

async function copyValue() {
  try {
    await navigator.clipboard.writeText(props.value)
    toast.add({
      severity: 'success',
      summary: 'Copied',
      detail: `${props.token.label} color copied`,
      life: 2000
    })
  } catch (error) {
    console.error('Failed to copy color:', error)
  }
}
</script>

<style scoped>
.color-token-editor {
  transition: all 0.2s ease;
}

.color-token-editor:hover {
  background-color: var(--p-surface-50);
}
</style> 