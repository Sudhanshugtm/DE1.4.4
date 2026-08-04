<template>
  <div class="cdx-toolbar">
    <div class="cdx-toolbar__lhs">
      <CdxButton
        class="cdx-toolbar__btn cdx-toolbar__btn--close"
        weight="quiet"
        aria-label="Close"
        @click="emit('close')"
      >
        <CdxIcon :icon="cdxIconClose" />
      </CdxButton>
      <CdxButton class="cdx-toolbar__btn" weight="quiet" aria-label="Undo">
        <CdxIcon :icon="cdxIconUndo" />
      </CdxButton>
      <CdxButton
        class="cdx-toolbar__btn cdx-toolbar__btn--dropdown"
        weight="quiet"
        aria-label="Style text"
      >
        <CdxIcon :icon="cdxIconTextStyle" />
        <CdxIcon :icon="cdxIconExpand" class="cdx-toolbar__indicator" />
      </CdxButton>
      <CdxButton
        v-if="showCite"
        class="cdx-toolbar__btn"
        weight="quiet"
        aria-label="Cite"
        @click="emit('cite')"
      >
        <CdxIcon :icon="cdxIconQuotes" />
      </CdxButton>
      <CdxButton class="cdx-toolbar__btn" weight="quiet" aria-label="Link" @click="emit('link')">
        <CdxIcon :icon="cdxIconLink" />
      </CdxButton>
      <CdxButton
        v-if="showOutlineEntry"
        ref="insertButtonRef"
        class="cdx-toolbar__btn cdx-toolbar__btn--outline"
        weight="quiet"
        aria-label="Insert"
        :aria-expanded="insertMenuOpen"
        @click.stop="toggleInsertMenu"
      >
        <CdxIcon :icon="cdxIconAdd" />
        <!-- Marks where the suggestions went once the sheet is dismissed. It has
             done its job once the menu is open, so it steps aside. -->
        <span
          v-if="highlightOutlineEntry && !insertMenuOpen"
          class="mw-pulsating-dot"
          aria-hidden="true"
        ></span>
      </CdxButton>
      <CdxButton
        class="cdx-toolbar__btn cdx-toolbar__btn--dropdown"
        weight="quiet"
        aria-label="Switch editor"
      >
        <CdxIcon :icon="cdxIconEdit" />
        <CdxIcon :icon="cdxIconExpand" class="cdx-toolbar__indicator" />
      </CdxButton>
    </div>
    <div class="cdx-toolbar__rhs">
      <!-- Publishing stays out of reach until the editor has written something. -->
      <CdxButton
        class="cdx-toolbar__btn cdx-toolbar__btn--publish"
        action="progressive"
        weight="primary"
        :disabled="!canPublish"
        aria-label="Publish"
        @click="emit('publish')"
      >
        <CdxIcon :icon="cdxIconNext" />
      </CdxButton>
    </div>

    <!-- Insert menu, matching the tool list the + opens in production. -->
    <div
      v-if="insertMenuOpen"
      class="cdx-toolbar__insert-menu"
      :style="{ left: insertMenuLeft }"
      role="menu"
      @click.stop
    >
      <button
        class="cdx-toolbar__insert-item"
        role="menuitem"
        type="button"
        @click="onInsertSuggestedSections"
      >
        <CdxIcon :icon="cdxIconListBullet" size="small" />
        <span>Suggested sections</span>
      </button>
      <button
        v-if="showVerifiedFacts"
        class="cdx-toolbar__insert-item cdx-toolbar__insert-item--verified"
        role="menuitem"
        type="button"
        data-testid="insert-verified-facts"
        @click="onInsertVerifiedFacts"
      >
        <CdxIcon :icon="cdxIconCheckAll" size="small" />
        <span>Verified facts</span>
      </button>
      <div class="cdx-toolbar__insert-group">
        <button
          v-for="tool in nativeInsertTools"
          :key="tool.label"
          class="cdx-toolbar__insert-item"
          role="menuitem"
          type="button"
        >
          <CdxIcon :icon="tool.icon" size="small" />
          <span>{{ tool.label }}</span>
        </button>
        <button
          v-for="tool in moreInsertTools"
          v-show="moreExpanded"
          :key="tool.label"
          class="cdx-toolbar__insert-item"
          role="menuitem"
          type="button"
        >
          <CdxIcon :icon="tool.icon" size="small" />
          <span>{{ tool.label }}</span>
        </button>
      </div>
      <button
        class="cdx-toolbar__insert-item cdx-toolbar__insert-item--more"
        role="menuitem"
        type="button"
        :aria-expanded="moreExpanded"
        @click.stop="toggleMoreTools"
      >
        <CdxIcon :icon="moreExpanded ? cdxIconCollapse : cdxIconExpand" size="small" />
        <span>{{ moreExpanded ? 'Fewer' : 'More' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  showOutlineEntry: {
    type: Boolean,
    default: false,
  },
  showVerifiedFacts: {
    type: Boolean,
    default: false,
  },
  showCite: {
    type: Boolean,
    default: true,
  },
  highlightOutlineEntry: {
    type: Boolean,
    default: false,
  },
  canPublish: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'cite',
  'close',
  'link',
  'open-outline',
  'open-verified-facts',
  'publish',
  'insert-menu-opened',
])
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { CdxButton, CdxIcon } from '@wikimedia/codex'
import {
  cdxIconClose,
  cdxIconUndo,
  cdxIconTextStyle,
  cdxIconLink,
  cdxIconQuotes,
  cdxIconAdd,
  cdxIconEdit,
  cdxIconExpand,
  cdxIconCollapse,
  cdxIconNext,
  cdxIconListBullet,
  cdxIconCheckAll,
  cdxIconImage,
  cdxIconImageGallery,
  cdxIconTable,
  cdxIconPuzzle,
  cdxIconSpeechBubbleAdd,
  cdxIconMathematics,
  cdxIconReferences,
  cdxIconSpecialCharacter,
  cdxIconCode,
} from '@wikimedia/codex-icons'

const insertMenuOpen = ref(false)
const moreExpanded = ref(false)
const insertButtonRef = ref(null)
const insertMenuLeft = ref('0px')

// The tools a wiki lists in its mobile insert menu. Inert here: this prototype
// is about what article guidance adds to the menu, not the tools themselves.
const nativeInsertTools = [
  { label: 'Images and media', icon: cdxIconImage },
  { label: 'Table', icon: cdxIconTable },
]

// Secondary insert tools, hidden until More expands — same pattern as VE's
// mobile insert ListToolGroup.
const moreInsertTools = [
  { label: 'Template', icon: cdxIconPuzzle },
  { label: 'Comment', icon: cdxIconSpeechBubbleAdd },
  { label: 'Gallery', icon: cdxIconImageGallery },
  { label: 'Formula', icon: cdxIconMathematics },
  { label: 'References list', icon: cdxIconReferences },
  { label: 'Special character', icon: cdxIconSpecialCharacter },
  { label: 'Code block', icon: cdxIconCode },
]

const INSERT_MENU_WIDTH = 200

function toggleInsertMenu() {
  if (!insertMenuOpen.value) {
    emit('insert-menu-opened')
    // The menu hangs to the left of the button that opened it, so it stays
    // clear of the screen edge and reads as belonging to that button.
    const button = insertButtonRef.value?.$el
    if (button) {
      const alignedToButtonEnd = button.offsetLeft + button.offsetWidth - INSERT_MENU_WIDTH
      insertMenuLeft.value = `${Math.max(0, alignedToButtonEnd)}px`
    }
    moreExpanded.value = false
  }
  insertMenuOpen.value = !insertMenuOpen.value
}

function toggleMoreTools() {
  moreExpanded.value = !moreExpanded.value
}

function onInsertSuggestedSections() {
  insertMenuOpen.value = false
  moreExpanded.value = false
  emit('open-outline')
}

function onInsertVerifiedFacts() {
  insertMenuOpen.value = false
  moreExpanded.value = false
  emit('open-verified-facts')
}

function closeInsertMenu() {
  insertMenuOpen.value = false
  moreExpanded.value = false
}

function focusInsertButton() {
  insertButtonRef.value?.$el?.focus()
}

defineExpose({ focusInsertButton })

onMounted(() => document.addEventListener('click', closeInsertMenu))
onBeforeUnmount(() => document.removeEventListener('click', closeInsertMenu))
</script>

<style scoped>
.cdx-toolbar {
  position: fixed;
  z-index: 1;
  display: flex;
  height: 48px;
  background-color: var(--background-color-base, #fff);
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  border-bottom: var(--border-subtle);
  width: 100%;
}

.cdx-toolbar__lhs {
  flex: 1;
  display: flex;
  min-width: 0;
  /* Clip the tools horizontally, but let the pulsating dot hang below the bar. */
  overflow-x: clip;
  overflow-y: visible;
}

.cdx-toolbar__rhs {
  flex: 0 0 44px;
  display: flex;
  overflow: clip;
}

/* Base button overrides */
.cdx-toolbar__btn {
  flex: 1 0 0;
  height: 100%;
  border-radius: 0;
}

.cdx-toolbar__btn:focus {
  border-color: transparent !important;
  box-shadow: none !important;
}

.cdx-toolbar__btn:focus-visible {
  outline: var(--border-width-thick) var(--border-style-base)
    var(--outline-color-progressive--focus);
  outline-offset: calc(-1 * var(--border-width-thick));
}

.cdx-toolbar__btn--close {
  flex: 0 0 44px;
  border-right: 1px solid var(--border-color-subtle) !important;
}

.cdx-toolbar__btn--dropdown {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.cdx-toolbar__btn--publish {
  flex: 0 0 44px;
  width: 44px;
  height: 100%;
}

/* Insert menu — drops from the toolbar as a tool list, the way the mobile
   insert group opens in production. */
.cdx-toolbar__insert-menu {
  position: absolute;
  top: 48px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  min-width: 200px;
  background-color: var(--background-color-base, #fff);
  border: 1px solid var(--border-color-base, #a2a9b1);
  box-shadow:
    0 0 8px 0 rgba(0, 0, 0, 0.06),
    0 4px 4px 0 rgba(0, 0, 0, 0.06);
}

.cdx-toolbar__insert-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-50, 8px);
  min-height: 38px;
  padding: var(--spacing-50, 8px) var(--spacing-75, 12px);
  border: 0;
  background: var(--background-color-transparent);
  color: var(--color-base, #202122);
  font-family: inherit;
  font-size: var(--font-size-medium);
  line-height: var(--line-height-small);
  font-weight: var(--font-weight-normal);
  text-align: start;
  white-space: nowrap;
  cursor: pointer;
}

.cdx-toolbar__insert-item:hover {
  background-color: var(--background-color-interactive-subtle);
}

.cdx-toolbar__insert-item--verified {
  min-height: 44px;
}

/* The wiki's own tools sit together, divided from what guidance adds. */
.cdx-toolbar__insert-group {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--border-color-subtle, #c8ccd1);
  border-bottom: 1px solid var(--border-color-subtle, #c8ccd1);
}

/* Where the suggestions live once the sheet is closed. Geometry and timing
   follow MediaWiki's own pulsating dot (mediawiki.pulsatingdot). */
.cdx-toolbar__btn--outline {
  position: relative;
  /* Codex buttons clip their contents; the dot needs to sit below the bar. */
  overflow: visible;
}

.mw-pulsating-dot {
  position: absolute;
  bottom: -10px;
  left: 50%;
  pointer-events: none;
}

.mw-pulsating-dot::before,
.mw-pulsating-dot::after {
  content: '';
  display: block;
  position: absolute;
  border-radius: var(--border-radius-circle, 50%);
  background-color: var(--background-color-progressive, #36c);
}

.mw-pulsating-dot::before {
  width: 36px;
  height: 36px;
  top: -18px;
  left: -18px;
  opacity: 0;
  animation: mw-pulsating-dot-pulse 3s ease-out infinite;
}

.mw-pulsating-dot::after {
  width: 12px;
  height: 12px;
  top: -6px;
  left: -6px;
}

@keyframes mw-pulsating-dot-pulse {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  25% {
    transform: scale(0);
    opacity: 0.1;
  }
  50% {
    transform: scale(0.1);
    opacity: 0.3;
  }
  75% {
    transform: scale(0.5);
    opacity: 0.5;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mw-pulsating-dot::before {
    animation: none;
  }
}

.cdx-toolbar__indicator {
  min-width: 10px;
  min-height: 10px;
  height: 10px;
  width: 10px;
}
</style>
