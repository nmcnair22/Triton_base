<template>
  <div class="dialog-showcase">
    <div class="showcase-section">
      <h5>Dialog Examples</h5>
      <div class="showcase-grid">
        <div class="showcase-item">
          <label>Basic Dialog</label>
          <Button 
            label="Show Dialog" 
            @click="showBasic = true"
            :size="size"
          />
        </div>
        
        <div class="showcase-item">
          <label>Modal Dialog</label>
          <Button 
            label="Show Modal" 
            @click="showModal = true"
            :size="size"
            severity="secondary"
          />
        </div>
        
        <div class="showcase-item">
          <label>Confirmation</label>
          <Button 
            label="Show Confirm" 
            @click="showConfirm = true"
            :size="size"
            severity="warning"
          />
        </div>
        
        <div class="showcase-item">
          <label>Maximizable</label>
          <Button 
            label="Show Maximizable" 
            @click="showMaximizable = true"
            :size="size"
            severity="info"
          />
        </div>
      </div>
    </div>

    <!-- Basic Dialog -->
    <Dialog 
      v-model:visible="showBasic" 
      header="Basic Dialog"
      :style="{ width: '50vw' }"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
      :draggable="false"
      @show="onDialogShow"
      @hide="onDialogHide"
    >
      <div @mouseenter="onHover('dialog.content.padding')" @mouseleave="onLeave">
        <p>
          This is a basic dialog with a header and content area. 
          The dialog can be closed by clicking the close button or pressing escape.
        </p>
        <p class="mt-3">
          Dialog components use various design tokens for styling:
        </p>
        <ul class="mt-2">
          <li>Header styling with background and text colors</li>
          <li>Content area with proper padding and typography</li>
          <li>Footer area for action buttons</li>
          <li>Overlay background for modal behavior</li>
        </ul>
      </div>
      
      <template #footer>
        <div @mouseenter="onHover('dialog.footer.padding')" @mouseleave="onLeave">
          <Button label="Cancel" severity="secondary" text @click="showBasic = false" />
          <Button label="Save" @click="showBasic = false" />
        </div>
      </template>
    </Dialog>

    <!-- Modal Dialog -->
    <Dialog 
      v-model:visible="showModal" 
      header="Modal Dialog"
      :modal="true"
      :style="{ width: '50vw' }"
      :closable="true"
    >
      <div class="modal-content">
        <div class="flex align-items-center mb-3">
          <i class="pi pi-exclamation-triangle text-warning text-3xl mr-3"></i>
          <span>This is a modal dialog that requires user interaction.</span>
        </div>
        <p>
          Modal dialogs prevent interaction with the page content until dismissed.
          The overlay background dims the underlying content.
        </p>
      </div>
      
      <template #footer>
        <Button label="Decline" severity="secondary" text @click="showModal = false" />
        <Button label="Accept" severity="primary" @click="showModal = false" />
      </template>
    </Dialog>

    <!-- Confirmation Dialog -->
    <Dialog 
      v-model:visible="showConfirm" 
      header="Confirmation"
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem; color: var(--p-warning-500)"></i>
        <span>Are you sure you want to proceed?</span>
      </div>
      
      <template #footer>
        <Button label="No" severity="secondary" text @click="showConfirm = false" />
        <Button label="Yes" severity="danger" @click="showConfirm = false" />
      </template>
    </Dialog>

    <!-- Maximizable Dialog -->
    <Dialog 
      v-model:visible="showMaximizable" 
      header="Maximizable Dialog"
      :maximizable="true"
      :modal="true"
      :style="{ width: '50vw' }"
      @mouseenter="onHover('dialog.header.background')" 
      @mouseleave="onLeave"
    >
      <p>
        This dialog can be maximized to fill the entire viewport.
        Click the maximize button in the header to expand it.
      </p>
      <p class="mt-3">
        Maximizable dialogs are useful for displaying large amounts of content
        or providing a focused workspace within the application.
      </p>
    </Dialog>

    <!-- Dialog Showcase Options -->
    <div class="showcase-section mt-4">
      <h5>Dialog Positions</h5>
      <div class="showcase-grid">
        <div class="showcase-item">
          <label>Top</label>
          <Button 
            label="Top Position" 
            @click="showPosition('top')"
            :size="size"
            severity="secondary"
            outlined
          />
        </div>
        <div class="showcase-item">
          <label>Bottom</label>
          <Button 
            label="Bottom Position" 
            @click="showPosition('bottom')"
            :size="size"
            severity="secondary"
            outlined
          />
        </div>
        <div class="showcase-item">
          <label>Left</label>
          <Button 
            label="Left Position" 
            @click="showPosition('left')"
            :size="size"
            severity="secondary"
            outlined
          />
        </div>
        <div class="showcase-item">
          <label>Right</label>
          <Button 
            label="Right Position" 
            @click="showPosition('right')"
            :size="size"
            severity="secondary"
            outlined
          />
        </div>
      </div>
    </div>

    <!-- Position Dialog -->
    <Dialog 
      v-model:visible="showPositioned" 
      :header="`${position} Position`"
      :position="position"
      :modal="true"
      :style="positionStyle"
    >
      <p>This dialog is positioned at the {{ position }} of the viewport.</p>
    </Dialog>

    <!-- Token Mapping Info -->
    <div class="token-info-panel" v-if="showTokenInfo">
      <h6>Dialog Token Mappings</h6>
      <ul class="token-list">
        <li><code>dialog.background</code> - Dialog background</li>
        <li><code>dialog.borderRadius</code> - Corner radius</li>
        <li><code>dialog.shadow</code> - Box shadow</li>
        <li><code>dialog.header.background</code> - Header background</li>
        <li><code>dialog.header.color</code> - Header text color</li>
        <li><code>dialog.header.padding</code> - Header padding</li>
        <li><code>dialog.header.borderColor</code> - Header border</li>
        <li><code>dialog.content.padding</code> - Content padding</li>
        <li><code>dialog.footer.padding</code> - Footer padding</li>
        <li><code>dialog.footer.borderColor</code> - Footer border</li>
        <li><code>dialog.mask.background</code> - Overlay background</li>
        <li><code>dialog.closeButton.*</code> - Close button tokens</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DesignToken } from '@/themes/presets/preset.types'

const props = defineProps<{
  state?: string
  size?: string
  tokens?: DesignToken[]
  showTokenInfo?: boolean
}>()

const emit = defineEmits<{
  'token-hover': [token: DesignToken | null]
  'token-click': [token: DesignToken]
}>()

// State
const showBasic = ref(false)
const showModal = ref(false)
const showConfirm = ref(false)
const showMaximizable = ref(false)
const showPositioned = ref(false)
const position = ref('center')

// Computed
const positionStyle = computed(() => {
  const styles: Record<string, any> = {
    top: { width: '50vw', margin: '2rem auto' },
    bottom: { width: '50vw', margin: '2rem auto' },
    left: { width: '30vw', height: '70vh', margin: '2rem' },
    right: { width: '30vw', height: '70vh', margin: '2rem' }
  }
  return styles[position.value] || { width: '50vw' }
})

// Methods
function onHover(tokenPath: string) {
  if (!props.tokens) return
  
  const token = props.tokens.find(t => t.path === tokenPath)
  if (token) {
    emit('token-hover', token)
  }
}

function onLeave() {
  emit('token-hover', null)
}

function onDialogShow() {
  onHover('dialog.background')
}

function onDialogHide() {
  onLeave()
}

function showPosition(pos: string) {
  position.value = pos
  showPositioned.value = true
}
</script>

<style scoped>
.dialog-showcase {
  padding: 1rem;
}

.showcase-section {
  margin-bottom: 2rem;
}

.showcase-section h5 {
  margin-bottom: 1rem;
  color: var(--p-text-color);
}

.showcase-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.showcase-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.showcase-item label {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

.modal-content {
  padding: 1rem 0;
}

.confirmation-content {
  display: flex;
  align-items: center;
  padding: 1rem 0;
}

/* Token Info Panel */
.token-info-panel {
  margin-top: 2rem;
  padding: 1rem;
  background-color: var(--p-surface-50);
  border-radius: var(--p-borderRadius);
}

.token-info-panel h6 {
  margin-top: 0;
  margin-bottom: 0.75rem;
}

.token-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.token-list li {
  padding: 0.25rem 0;
  font-size: 0.875rem;
}

.token-list code {
  padding: 0.125rem 0.375rem;
  background-color: var(--p-surface-100);
  border-radius: 3px;
  font-size: 0.75rem;
  margin-right: 0.5rem;
}

/* Dark mode adjustments */
.dark .token-info-panel {
  background-color: var(--p-surface-800);
}

.dark .token-list code {
  background-color: var(--p-surface-700);
}
</style>