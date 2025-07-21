<template>
  <div class="theme-preview">
    <h4 class="text-sm font-medium mb-3">Live Preview</h4>

    <div class="border border-surface-200 rounded p-4 space-y-3">
      <!-- Sample UI elements to show theme changes -->
      <div class="flex gap-2">
        <Button label="Primary" size="small" />
        <Button label="Secondary" severity="secondary" size="small" />
        <Button label="Success" severity="success" size="small" />
      </div>

      <div class="flex gap-2">
        <Button label="Info" severity="info" size="small" />
        <Button label="Warning" severity="warning" size="small" />
        <Button label="Danger" severity="danger" size="small" />
      </div>

      <div class="text-center text-sm text-muted">
        Preview shows how your theme changes affect components
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No logic needed for basic preview
</script>

<style scoped>
.space-y-3 > * + * {
  margin-top: 0.75rem;
}
</style>
