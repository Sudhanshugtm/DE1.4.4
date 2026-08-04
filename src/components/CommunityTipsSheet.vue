<!-- ABOUTME: The community's writing tips, presented as a bottom sheet. -->
<!-- ABOUTME: Same shell as suggested sections: header with icon, attribution, body. -->

<template>
  <div ref="anchorRef" class="tips-sheet-anchor"></div>
  <CdxPopover
    v-model:open="open"
    :anchor="anchorRef"
    placement="top-start"
    :use-bottom-sheet="true"
    :hide-backdrop="true"
  >
    <div class="tips-sheet-header">
      <span class="tips-sheet-header__title">
        <CdxIcon :icon="cdxIconInfoFilled" size="small" class="tips-sheet-header__icon" />
        {{ title }}
      </span>
      <CdxButton weight="quiet" aria-label="Close" @click="open = false">
        <CdxIcon :icon="cdxIconClose" />
      </CdxButton>
    </div>
    <p class="tips-sheet-header__attribution">{{ attribution }}</p>
    <div class="tips-sheet-body">
      <ul class="tips-sheet-body__list">
        <li v-for="tip in bullets" :key="tip">{{ tip }}</li>
      </ul>
      <div class="tips-sheet-body__actions">
        <CdxButton @click="open = false">Got it</CdxButton>
      </div>
    </div>
  </CdxPopover>
</template>

<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { CdxButton, CdxIcon, CdxPopover } from '@wikimedia/codex'
import { cdxIconClose, cdxIconInfoFilled } from '@wikimedia/codex-icons'

defineProps({
  title: {
    type: String,
    default: '',
  },
  attribution: {
    type: String,
    default: '',
  },
  bullets: {
    type: Array,
    default: () => [],
  },
})

const open = defineModel('open', { type: Boolean, default: false })
const anchorRef = ref(null)

// Opening the sheet traps focus on its close button so it can be reached by
// keyboard and read out on arrival. The focus stays but its ring waits for a
// keypress, the same treatment the suggested-sections sheet has.
const QUIET_FOCUS_CLASS = 'cdx-popover--quiet-focus'
let popoverEl = null

function quietTrappedFocus() {
  popoverEl =
    document.querySelector('.cdx-popover .tips-sheet-body')?.closest('.cdx-popover') ?? null
  if (!popoverEl) return
  popoverEl.classList.add(QUIET_FOCUS_CLASS)
  popoverEl.addEventListener('keydown', showFocusRing)
}

function showFocusRing() {
  popoverEl?.classList.remove(QUIET_FOCUS_CLASS)
}

function releaseQuietFocus() {
  popoverEl?.removeEventListener('keydown', showFocusRing)
  popoverEl?.classList.remove(QUIET_FOCUS_CLASS)
  popoverEl = null
}

watch(open, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    await nextTick()
    quietTrappedFocus()
    requestAnimationFrame(quietTrappedFocus)
  } else {
    releaseQuietFocus()
  }
})

onBeforeUnmount(releaseQuietFocus)
</script>

<style scoped>
.tips-sheet-anchor {
  width: 0;
  height: 0;
}

.tips-sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-50, 8px);
  padding: var(--spacing-50, 8px) var(--spacing-100, 16px);
}

.tips-sheet-header__title {
  display: flex;
  align-items: center;
  gap: var(--spacing-50, 8px);
  min-width: 0;
  color: var(--color-base);
  font-size: var(--font-size-large);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-large);
}

.tips-sheet-header__icon {
  flex: 0 0 auto;
}

.tips-sheet-header__attribution {
  margin: 0;
  padding: 0 var(--spacing-100, 16px) var(--spacing-50, 8px);
  color: var(--color-subtle);
  font-size: var(--font-size-small);
  line-height: var(--line-height-small);
}

.tips-sheet-body {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  padding: var(--spacing-100, 16px);
  border-top: 1px solid var(--border-color-transparent);
}

.tips-sheet-body__list {
  margin: 0;
  padding-inline-start: var(--spacing-125);
  font-size: var(--font-size-medium);
  line-height: var(--line-height-medium);
}

.tips-sheet-body__list li {
  margin-bottom: var(--spacing-50);
}

.tips-sheet-body__actions {
  display: flex;
  padding-top: var(--spacing-50);
}
</style>
