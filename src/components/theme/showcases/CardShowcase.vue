<template>
  <div class="card-showcase">
    <div class="showcase-section">
      <h5>Card Variations</h5>
      <div class="showcase-grid">
        <div class="showcase-item">
          <Card 
            @mouseenter="onHover('card.background')"
            @mouseleave="onLeave"
          >
            <template #title>
              <span @mouseenter.stop="onHover('card.title.color')" @mouseleave="onLeave">
                Simple Card
              </span>
            </template>
            <template #content>
              <p @mouseenter.stop="onHover('card.content.padding')" @mouseleave="onLeave">
                This is a basic card with title and content.
              </p>
            </template>
          </Card>
        </div>

        <div class="showcase-item">
          <Card>
            <template #header>
              <img 
                src="https://via.placeholder.com/300x150" 
                alt="Header Image"
                style="width: 100%; border-radius: var(--p-card-border-radius) var(--p-card-border-radius) 0 0;"
                @mouseenter="onHover('card.borderRadius')"
                @mouseleave="onLeave"
              />
            </template>
            <template #title>Card with Image</template>
            <template #subtitle>Subtitle text</template>
            <template #content>
              <p>Cards can include images in the header section.</p>
            </template>
            <template #footer>
              <div 
                class="flex gap-2"
                @mouseenter="onHover('card.footer.padding')"
                @mouseleave="onLeave"
              >
                <Button label="Save" size="small" />
                <Button label="Cancel" size="small" severity="secondary" text />
              </div>
            </template>
          </Card>
        </div>

        <div class="showcase-item">
          <Card class="shadow-4">
            <template #title>Elevated Card</template>
            <template #content>
              <p @mouseenter="onHover('card.shadow')" @mouseleave="onLeave">
                This card has an elevated shadow effect.
              </p>
            </template>
          </Card>
        </div>
      </div>
    </div>

    <div class="showcase-section">
      <h5>Advanced Cards</h5>
      <div class="showcase-grid full-width">
        <Card>
          <template #title>
            <div class="flex align-items-center justify-content-between">
              <span>Product Details</span>
              <Button icon="pi pi-ellipsis-v" text rounded />
            </div>
          </template>
          <template #content>
            <div class="product-card">
              <div class="product-info">
                <h6>Premium Headphones</h6>
                <p class="text-surface-500 mb-3">
                  High-quality wireless headphones with noise cancellation.
                </p>
                <div class="product-meta">
                  <Tag value="Electronics" severity="primary" />
                  <Tag value="In Stock" severity="success" />
                </div>
              </div>
              <div class="product-price">
                <span class="text-2xl font-bold">$299.99</span>
                <span class="text-surface-500 line-through">$399.99</span>
              </div>
              <div class="product-actions mt-3">
                <Button label="Add to Cart" icon="pi pi-shopping-cart" class="w-full" />
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Token Mapping Info -->
    <div class="token-info-panel" v-if="showTokenInfo">
      <h6>Card Token Mappings</h6>
      <ul class="token-list">
        <li><code>card.background</code> - Card background color</li>
        <li><code>card.borderRadius</code> - Corner radius</li>
        <li><code>card.shadow</code> - Box shadow</li>
        <li><code>card.borderColor</code> - Border color</li>
        <li><code>card.title.fontSize</code> - Title text size</li>
        <li><code>card.title.fontWeight</code> - Title font weight</li>
        <li><code>card.title.color</code> - Title text color</li>
        <li><code>card.subtitle.fontSize</code> - Subtitle text size</li>
        <li><code>card.subtitle.color</code> - Subtitle text color</li>
        <li><code>card.content.padding</code> - Content padding</li>
        <li><code>card.footer.padding</code> - Footer padding</li>
        <li><code>card.footer.borderColor</code> - Footer border</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
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
</script>

<style scoped>
.card-showcase {
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.showcase-grid.full-width {
  grid-template-columns: 1fr;
}

.showcase-item {
  display: flex;
  flex-direction: column;
}

.product-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-info h6 {
  margin: 0 0 0.5rem 0;
}

.product-meta {
  display: flex;
  gap: 0.5rem;
}

.product-price {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
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