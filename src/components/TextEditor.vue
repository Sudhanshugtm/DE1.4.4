<template>
  <div
    class="text-editor-wrapper"
    :class="{
      'hide-placeholder': !showPlaceholder && !(entryPointStyle === 'text' && !hasInteracted),
    }"
  >
    <EditorContent ref="editorContentRef" class="text-editor" :editor="editor" />
    <div
      v-show="showOutlineEntry && isButtonVisible"
      ref="floatingElRef"
      class="codex-floating-entry"
      :style="floatingButtonStyle"
      @mousedown.prevent
      @click.stop="onCodexButtonClick"
      @mouseenter="pauseAnimation"
      @mouseleave="resumeAnimation"
    >
      <!-- Style 1: Icon button (default) -->
      <CdxButton
        v-if="entryPointStyle === 'icon'"
        class="codex-floating-btn"
        aria-label="Add content"
      >
        <CdxIcon :icon="cdxIconAdd" />
      </CdxButton>

      <!-- Style 2: Quiet button with cycling label (before interaction) -->
      <CdxButton
        v-else-if="entryPointStyle === 'quiet' && isCycling"
        weight="quiet"
        class="codex-floating-btn-quiet"
        aria-label="Add content"
      >
        <CdxIcon :icon="cdxIconAdd" />
        <span class="typewriter-container">
          <span
            class="typewriter-text"
            :class="{ 'typewriter-mask': animPhase === 'wiping' }"
            :style="animPhase === 'wiping' ? { '--wipe': wipeMaskPercent + '%' } : {}"
            >{{ displayText }}</span
          >
        </span>
      </CdxButton>

      <!-- Style 3: Floating placeholder (initial state only) -->
      <span v-else-if="entryPointStyle === 'floating' && !hasInteracted" class="codex-floating-text">
        Tap here to continue...
      </span>

      <!-- Fallback: icon button for other styles after cycling stops -->
      <CdxButton v-else class="codex-floating-btn" aria-label="Add content">
        <CdxIcon :icon="cdxIconAdd" />
      </CdxButton>
    </div>
    <CdxButton
      weight="quiet"
      class="settings-btn"
      aria-label="Settings"
      @click="$emit('open-settings')"
    >
      <CdxIcon :icon="cdxIconSettings" />
    </CdxButton>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { CdxButton, CdxIcon } from '@wikimedia/codex'
import { cdxIconAdd, cdxIconSettings } from '@wikimedia/codex-icons'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { AnnotationHighlight } from '../extensions/annotationHighlight'
import { PlaceholderChip } from '../extensions/placeholderChip'
import { SourceSuperscript } from '../extensions/sourceSuperscript'
import { useEditorSettings } from '../composables/useEditorSettings'
import { useEditorInstance } from '../composables/useEditorInstance'
import { useCursorRect } from '../composables/useCursorRect'
import { useLocale } from '../composables/useLocale'
import { defaultSettings } from '../config/editorSettings'

const props = defineProps({
  showOutlineEntry: {
    type: Boolean,
    default: true,
  },
  suppressAutoFocus: {
    type: Boolean,
    default: false,
  },
  showPlaceholder: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['open-outline', 'open-settings'])

const { settings } = useEditorSettings()
const { setEditor } = useEditorInstance()
const { setCursorRect, clearCursorRect } = useCursorRect()
const { locale } = useLocale()

const entryPointStyle = computed(
  () => settings.value.entryPoint.style || defaultSettings.entryPoint.style,
)

const hasInteracted = ref(false)

const useForceMode = computed(
  () =>
    entryPointStyle.value === 'force' ||
    (entryPointStyle.value === 'quiet' && !isCycling.value) ||
    ((entryPointStyle.value === 'text' || entryPointStyle.value === 'floating') &&
      hasInteracted.value),
)

const isPlaceholderInitialState = computed(
  () =>
    (entryPointStyle.value === 'text' || entryPointStyle.value === 'floating') &&
    !hasInteracted.value,
)

// ── TipTap editor ──────────────────────────────────────────────────────

const editorContentRef = ref(null)

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: { levels: [2, 3, 4] },
      link: { openOnClick: false },
    }),
    Placeholder.configure({
      placeholder: 'Start writing or tap here to continue...',
    }),
    SourceSuperscript,
    AnnotationHighlight,
    PlaceholderChip,
  ],
  onSelectionUpdate() {
    if (!typingTimer) {
      updateButtonPosition()
    }
  },
  onTransaction({ transaction }) {
    if (transaction.docChanged) {
      if (isPlaceholderInitialState.value) {
        hasInteracted.value = true
      }
      if (useForceMode.value) {
        updateButtonPosition()
      } else {
        stopCycling()
        hideButton()
        scheduleShowButton()
      }
    }
  },
  onFocus() {
    setTimeout(() => updateButtonPosition(), 0)
  },
  onBlur({ event }) {
    if (
      event.relatedTarget &&
      (event.relatedTarget.closest('.codex-floating-entry') ||
        event.relatedTarget.closest('.force-entry-point'))
    ) {
      return
    }
    hideButton()
  },
})

// ── Typewriter animation for the quiet button style ────────────────────

const sectionTitles = computed(() => locale.value.sections.map((s) => s.title))
const currentLabelIndex = ref(0)
const displayText = ref('')
const wipeProgress = ref(0)
const isCycling = ref(true)
const animPhase = ref('typing') // 'typing' | 'holding' | 'wiping'

let charTimer = null
let holdTimer = null
let charIndex = 0
let wipeLen = 0
let wipeTicks = 0
let cyclingStarted = false
let isPaused = false
let holdStartTime = 0
let holdRemainingMs = 0

const CHAR_INTERVAL_MS = 50
const HOLD_DURATION_MS = 3000

// Mask goes from -15% (all visible) to 100% (all hidden)
const wipeMaskPercent = computed(() => -15 + wipeProgress.value * 115)

function typewriterTick() {
  if (animPhase.value === 'typing') {
    const title = sectionTitles.value[currentLabelIndex.value]
    displayText.value += title[charIndex]
    charIndex++
    if (charIndex >= title.length) {
      clearInterval(charTimer)
      charTimer = null
      animPhase.value = 'holding'
      if (isPaused) return
      holdStartTime = Date.now()
      holdTimer = setTimeout(startWipe, HOLD_DURATION_MS)
    }
  } else if (animPhase.value === 'wiping') {
    wipeTicks++
    wipeProgress.value = wipeTicks / wipeLen
    if (wipeTicks >= wipeLen) {
      clearInterval(charTimer)
      charTimer = null
      displayText.value = ''
      currentLabelIndex.value = (currentLabelIndex.value + 1) % sectionTitles.value.length
      charIndex = 0
      animPhase.value = 'typing'
      charTimer = setInterval(typewriterTick, CHAR_INTERVAL_MS)
    }
  }
}

function startWipe() {
  holdTimer = null
  wipeLen = displayText.value.length
  wipeTicks = 0
  wipeProgress.value = 0
  animPhase.value = 'wiping'
  charTimer = setInterval(typewriterTick, CHAR_INTERVAL_MS)
}

function startCycling() {
  if (charTimer) return
  animPhase.value = 'typing'
  charIndex = 0
  displayText.value = ''
  charTimer = setInterval(typewriterTick, CHAR_INTERVAL_MS)
}

function stopCycling() {
  if (!isCycling.value) return
  isCycling.value = false
  clearInterval(charTimer)
  clearTimeout(holdTimer)
  charTimer = null
  holdTimer = null
  displayText.value = ''
}

function pauseAnimation() {
  if (!isCycling.value) return
  isPaused = true

  if (animPhase.value === 'holding') {
    clearTimeout(holdTimer)
    holdTimer = null
    holdRemainingMs = Math.max(0, HOLD_DURATION_MS - (Date.now() - holdStartTime))
  }
}

function resumeAnimation() {
  if (!isCycling.value || !isPaused) return
  isPaused = false

  if (animPhase.value === 'holding') {
    holdStartTime = Date.now()
    holdTimer = setTimeout(startWipe, holdRemainingMs)
  }
}

// ── Floating button positioning ────────────────────────────────────────

const floatingElRef = ref(null)
const isButtonVisible = ref(false)
const buttonTop = ref(0)
const buttonLeft = ref(0)

let typingTimer = null
const TYPING_DEBOUNCE_MS = 1000
const BUTTON_GAP = 4
const ENTRY_POINT_HEIGHT = 32
const ENTRY_POINT_WIDTHS = { icon: 32, quiet: 220, floating: 180 }

const floatingButtonStyle = computed(() => ({
  position: 'absolute',
  top: `${buttonTop.value}px`,
  left: `${buttonLeft.value}px`,
  zIndex: 1,
}))

function getEditorScrollEl() {
  // The EditorContent wrapper is the scrollable element (.text-editor has overflow-y: auto)
  return editorContentRef.value?.$el || null
}

function updateButtonPosition() {
  if (!props.showOutlineEntry) {
    isButtonVisible.value = false
    clearCursorRect()
    return
  }

  if (!editor.value) {
    isButtonVisible.value = false
    return
  }

  // In inline placeholder initial state, no button needed — the placeholder is the entry point
  if (entryPointStyle.value === 'text' && !hasInteracted.value) {
    isButtonVisible.value = false
    return
  }

  const { state, view } = editor.value
  const { empty } = state.selection

  // When a placeholderChip has a NodeSelection, align the force button with the chip
  if (!empty && state.selection.node?.type.name === 'placeholderChip') {
    const chipDom = view.nodeDOM(state.selection.from)
    if (chipDom) {
      const chipRect = chipDom.getBoundingClientRect()
      const editorEl = getEditorScrollEl()
      const editorRect = editorEl?.getBoundingClientRect()
      const caretVisible = editorRect
        ? !(chipRect.bottom < editorRect.top || chipRect.top > editorRect.bottom)
        : true
      setCursorRect({
        top: chipRect.top,
        bottom: chipRect.bottom,
        lineHeight: chipRect.height,
        glyphHeight: chipRect.height,
        visible: caretVisible,
      })
    }
    isButtonVisible.value = false
    return
  }

  // Only show button when cursor is collapsed (no text selected)
  if (!empty) {
    isButtonVisible.value = false
    return
  }

  const editorEl = getEditorScrollEl()
  if (!editorEl) {
    isButtonVisible.value = false
    return
  }

  const editorRect = editorEl.getBoundingClientRect()

  // Use ProseMirror's coordsAtPos for precise cursor position
  let coords
  try {
    coords = view.coordsAtPos(state.selection.from)
  } catch {
    isButtonVisible.value = false
    return
  }

  // Handle empty document or empty line: zero-height coords
  const caretHeight = coords.bottom - coords.top
  if (caretHeight === 0) {
    const computedStyle = window.getComputedStyle(view.dom)
    const lineHeight =
      parseFloat(computedStyle.lineHeight) || parseFloat(computedStyle.fontSize) * 1.5
    coords = {
      top: coords.top,
      bottom: coords.top + lineHeight,
      left: coords.left,
      right: coords.right,
    }
  }

  const caretVisible = !(coords.bottom < editorRect.top || coords.top > editorRect.bottom)

  // For force mode, publish cursor rect and don't show the inline floating button
  if (useForceMode.value) {
    const resolvedPos = view.domAtPos(state.selection.from)
    const domEl =
      resolvedPos.node.nodeType === 3 ? resolvedPos.node.parentElement : resolvedPos.node
    const computedLineHeight =
      parseFloat(window.getComputedStyle(domEl).lineHeight) || coords.bottom - coords.top
    setCursorRect({
      top: coords.top,
      bottom: coords.bottom,
      lineHeight: computedLineHeight,
      glyphHeight: coords.bottom - coords.top,
      visible: caretVisible,
    })
    isButtonVisible.value = false
    return
  }

  // Hide if caret is scrolled out of the visible editor area
  if (!caretVisible) {
    isButtonVisible.value = false
    return
  }

  // Convert viewport coords to wrapper-relative coords
  let top = coords.bottom - editorRect.top + BUTTON_GAP
  let left = coords.left - editorRect.left

  const quietWidth = isCycling.value ? ENTRY_POINT_WIDTHS.quiet : ENTRY_POINT_WIDTHS.icon
  const currentWidth =
    entryPointStyle.value === 'quiet' ? quietWidth : ENTRY_POINT_WIDTHS[entryPointStyle.value] || 32

  // Hide if button would extend below visible editor area
  if (top + ENTRY_POINT_HEIGHT > editorEl.clientHeight) {
    isButtonVisible.value = false
    return
  }

  // Right-edge flip: if entry point overflows right, align right edge to cursor
  if (left + currentWidth > editorEl.clientWidth) {
    left = coords.left - editorRect.left - currentWidth
  }

  left = Math.max(0, left)

  buttonTop.value = top
  buttonLeft.value = left
  isButtonVisible.value = true
}

function hideButton() {
  isButtonVisible.value = false
  clearCursorRect()
  clearTimeout(typingTimer)
  typingTimer = null
}

function scheduleShowButton() {
  clearTimeout(typingTimer)
  typingTimer = setTimeout(() => {
    typingTimer = null
    updateButtonPosition()
  }, TYPING_DEBOUNCE_MS)
}

function onScroll() {
  if (isButtonVisible.value || useForceMode.value) {
    updateButtonPosition()
  }
}

function onCodexButtonClick() {
  stopCycling()
  hasInteracted.value = true
  editor.value?.commands.blur()
  emit('open-outline')
}

function onEditorClick(event) {
  if (!props.showOutlineEntry) return

  if (entryPointStyle.value === 'text' && !hasInteracted.value && editor.value?.isEmpty) {
    event.stopPropagation()
    hasInteracted.value = true
    editor.value?.commands.blur()
    emit('open-outline')
  }
}

// Start typewriter on first button appearance (not on mount)
watch(isButtonVisible, (visible) => {
  if (visible && !cyclingStarted && isCycling.value) {
    cyclingStarted = true
    startCycling()
  }
})

// ── Lifecycle ──────────────────────────────────────────────────────────

let scrollEl = null

onMounted(() => {
  // Register the editor instance globally
  if (editor.value) {
    setEditor(editor.value)
    if (import.meta.env.DEV) window.__editor = editor.value
  }

  // Attach scroll listener to the EditorContent wrapper
  scrollEl = getEditorScrollEl()
  if (scrollEl) {
    scrollEl.addEventListener('scroll', onScroll)
    scrollEl.addEventListener('click', onEditorClick)
  }

  // Auto-focus editor on launch if setting is enabled (default: true)
  if (!props.suppressAutoFocus && settings.value.entryPoint.autoFocus !== 'false') {
    editor.value?.commands.focus()
    // Ensure floating button position is calculated after DOM paint
    if (entryPointStyle.value === 'floating') {
      setTimeout(() => updateButtonPosition(), 50)
    }
  }
})

onBeforeUnmount(() => {
  setEditor(null)
  clearCursorRect()
  if (scrollEl) {
    scrollEl.removeEventListener('scroll', onScroll)
    scrollEl.removeEventListener('click', onEditorClick)
  }
  clearTimeout(typingTimer)
  clearInterval(charTimer)
  clearTimeout(holdTimer)
})

defineExpose({ editor })
</script>

<style scoped>
.text-editor-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.text-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.text-editor :deep(.ProseMirror) {
  flex: 1;
  padding: var(--spacing-100);
  background-color: var(--background-color-base);
  outline: none;
  overflow-y: auto;
}

/* Placeholder */

.text-editor :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  color: var(--color-placeholder);
  pointer-events: none;
  float: left;
  height: 0;
}

.hide-placeholder :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  display: none;
}

/* Text styles */

.text-editor :deep(.ProseMirror h2) {
  font-family: var(--font-family-serif);
  font-size: var(--font-size-xx-large);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-xx-large);
  border-bottom: 1px var(--border-style-base) var(--border-color-muted, #dadde3);
  margin: 0 0 var(--spacing-50) 0;
  padding: var(--spacing-50) 0;
}

.text-editor :deep(.ProseMirror h3) {
  font-size: var(--font-size-x-large);
  line-height: var(--line-height-x-large);
  font-weight: var(--font-weight-bold);
  margin: 0;
  padding: var(--spacing-50) 0;
}

.text-editor :deep(.ProseMirror h4) {
  font-size: var(--font-size-large);
  line-height: var(--line-height-large);
  font-weight: var(--font-weight-bold);
  margin: 0;
  padding: var(--spacing-50) 0;
}

.text-editor :deep(.ProseMirror p) {
  padding-bottom: var(--spacing-50);
  margin: var(--spacing-50) 0 0 0;
  line-height: var(--line-height-medium);
}

.text-editor :deep(.ProseMirror sup.outline-source-prompt) {
  color: var(--color-progressive);
  font-size: var(--font-size-x-small);
  line-height: 0;
  vertical-align: super;
}

.text-editor :deep(.annotation-highlight) {
  background-color: var(--background-color-warning-subtle, #fef6e7);
  border-radius: 2px;
}

.settings-btn {
  position: fixed;
  bottom: var(--spacing-35);
  right: var(--spacing-35);
  z-index: 1;
  opacity: 0.1;
}

.codex-floating-entry {
  position: absolute;
  z-index: 1;
}

.codex-floating-btn {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  min-height: 32px !important;
  padding: 5px !important;
}

.codex-floating-btn-quiet {
  white-space: nowrap;
}

.typewriter-container {
  display: inline-block;
}

.typewriter-text {
  white-space: pre;
}

.typewriter-mask {
  --wipe: -15%;
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0%,
    transparent var(--wipe),
    black calc(var(--wipe) + 15%),
    black 100%
  );
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    transparent var(--wipe),
    black calc(var(--wipe) + 15%),
    black 100%
  );
}

.codex-floating-text {
  white-space: nowrap;
  color: var(--color-subtle);
  cursor: pointer;
}

</style>
