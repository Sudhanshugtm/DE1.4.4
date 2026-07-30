<template>
  <div class="editor-page">
    <CdxToolbar
      :show-outline-entry="isToolbarOutlineVariant"
      @open-outline="onOpenOutline"
      @cite="onOpenCiteDefault"
      @close="onClose"
    />
    <div class="editor-wrapper" :class="{ 'rail-open': isRailOpen }">
      <div class="editor-main" @click="isRailOpen && (isRailOpen = false)">
        <TextEditor
          :show-outline-entry="!isToolbarOutlineVariant"
          :suppress-auto-focus="isToolbarOutlineVariant"
          @open-outline="onOpenOutline"
          @open-settings="settingsDialogOpen = true"
        />
      </div>
      <div class="editor-rail-column">
        <EditorRail
          :is-open="isRailOpen"
          :initial-view="initialView"
          @content-inserted="onContentInserted"
          @close="isRailOpen = false"
          @open-cite-discover="onOpenCiteDiscover"
        />
      </div>
    </div>

    <!-- Force entry point: + button in the 44px rail strip, aligned with cursor -->
    <div
      v-if="isForceButtonVisible"
      class="force-entry-point"
      :style="forceButtonStyle"
      @mousedown.prevent
      @click.stop="onForceButtonClick"
    >
      <CdxIcon :icon="cdxIconAdd" />
    </div>

    <OutlinePopover
      v-if="outlineLocation === 'popover'"
      v-model:open="isPopoverOpen"
      :initial-view="initialView"
      @content-inserted="onContentInserted"
      @open-cite-discover="onOpenCiteDiscover"
    />
    <SettingsDialog v-model:open="settingsDialogOpen" />
    <CiteDialog v-model:open="citeDialogOpen" :initial-tab="citeDialogInitialTab" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CdxIcon } from '@wikimedia/codex'
import { cdxIconAdd } from '@wikimedia/codex-icons'
import TextEditor from '@/components/TextEditor.vue'
import EditorRail from '@/components/EditorRail.vue'
import CdxToolbar from '@/components/CdxToolbar.vue'
import SettingsDialog from '@/components/SettingsDialog.vue'
import CiteDialog from '@/components/CiteDialog.vue'
import OutlinePopover from '@/components/OutlinePopover.vue'
import { useEditorSettings } from '@/composables/useEditorSettings'
import { useEditorInstance } from '@/composables/useEditorInstance'
import { useCursorRect } from '@/composables/useCursorRect'
import { useLocale } from '@/composables/useLocale'

const route = useRoute()
const router = useRouter()
const { lang } = useLocale()
const { settings } = useEditorSettings()
const isToolbarOutlineVariant = computed(() => route.query.variant === 'toolbar-outline')
const outlineLocation = computed(() => settings.value.outline.location)
const outlinePersistence = computed(() => settings.value.outline.persistence)
const entryPointStyle = computed(() => settings.value.entryPoint.style)

// Force entry point
const { getEditor } = useEditorInstance()
const { cursorRect } = useCursorRect()

const isForceButtonVisible = computed(() => {
  if (isToolbarOutlineVariant.value) return false
  if (!['force', 'quiet', 'text', 'floating'].includes(entryPointStyle.value)) return false
  if (isRailOpen.value || isPopoverOpen.value) return false
  if (!cursorRect.value) return false
  return cursorRect.value.visible
})

const forceButtonStyle = computed(() => {
  if (!cursorRect.value) return {}
  const rect = cursorRect.value
  const halfLeading = (rect.lineHeight - rect.glyphHeight) / 2
  return {
    position: 'fixed',
    top: `${rect.top - halfLeading}px`,
    right: '0px',
    width: '44px',
    height: `${rect.lineHeight}px`,
  }
})

const isRailOpen = ref(isToolbarOutlineVariant.value && outlineLocation.value !== 'popover')
const isPopoverOpen = ref(isToolbarOutlineVariant.value && outlineLocation.value === 'popover')
const settingsDialogOpen = ref(false)
const citeDialogOpen = ref(false)
const citeDialogInitialTab = ref('automatic')
const initialView = ref(null)

function onForceButtonClick() {
  getEditor()?.commands.blur()
  onOpenOutline()
}

function onOpenOutline() {
  const editor = getEditor()
  const isPlaceholderSelected = editor?.state.selection.node?.type.name === 'placeholderChip'
  initialView.value = isPlaceholderSelected ? 'verified-facts' : null

  if (outlineLocation.value === 'popover') {
    isPopoverOpen.value = true
  } else {
    isRailOpen.value = true
  }
}

function onClose() {
  const query = { lang: lang.value }
  if (isToolbarOutlineVariant.value) {
    query.variant = 'toolbar-outline'
  }
  router.push({ name: 'article', query })
}

function onOpenCiteDefault() {
  citeDialogInitialTab.value = 'automatic'
  citeDialogOpen.value = true
}

function onOpenCiteDiscover() {
  citeDialogInitialTab.value = 'discover'
  citeDialogOpen.value = true
}

// Track whether the popover/rail should stay open after content insertion
const keepOpenAfterInsert = ref(false)

function onContentInserted() {
  if (outlinePersistence.value === 'close') {
    isRailOpen.value = false
    isPopoverOpen.value = false
  } else {
    // Set flag so the watcher can re-open the popover if focus-loss closes it
    keepOpenAfterInsert.value = true
  }
}

// When the popover closes due to focus moving to the editor after insertion,
// re-open it if the keep-open flag is set
watch(isPopoverOpen, (newVal) => {
  if (!newVal && keepOpenAfterInsert.value) {
    keepOpenAfterInsert.value = false
    isPopoverOpen.value = true
  }
})

watch(outlineLocation, () => {
  isRailOpen.value = false
  isPopoverOpen.value = false
  if (isToolbarOutlineVariant.value) {
    onOpenOutline()
  }
})

watch(isToolbarOutlineVariant, (isEnabled) => {
  isRailOpen.value = false
  isPopoverOpen.value = false
  if (isEnabled) {
    onOpenOutline()
  }
})
</script>

<style scoped>
.editor-page {
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}

.editor-wrapper {
  display: flex;
  padding-top: 48px;
  height: 100%;
  box-sizing: border-box;
  transition: transform 0.3s ease;
}

.editor-wrapper.rail-open {
  transform: translateX(calc(-100vw + 88px));
}

.editor-main {
  flex: 0 0 calc(100vw - 44px);
  display: flex;
  flex-direction: column;
}

.editor-rail-column {
  flex: 0 0 calc(100vw - 44px);
  display: flex;
  flex-direction: column;
}

.force-entry-point {
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 2px solid var(--border-color-interactive);
  box-sizing: border-box;
  cursor: pointer;
  z-index: 2;
}

.force-entry-point :deep(.cdx-icon) {
  color: var(--color-base);
}
</style>
