<template>
  <div class="editor-page">
    <CdxToolbar
      :show-outline-entry="isToolbarOutlineVariant"
      :show-cite="!isToolbarOutlineVariant"
      :highlight-outline-entry="highlightOutlineEntry"
      :can-publish="hasAuthoredText"
      @open-outline="onOpenOutline"
      @cite="onOpenCiteDefault"
      @close="onClose"
      @publish="onPublish"
    />
    <div
      class="editor-wrapper"
      :class="{
        'rail-open': isRailOpen,
        'editor-wrapper--full-width': isToolbarOutlineVariant,
      }"
    >
      <div class="editor-main" @click="isRailOpen && (isRailOpen = false)">
        <TextEditor
          :key="activeOutlineId"
          :show-outline-entry="!isToolbarOutlineVariant"
          :show-placeholder="isToolbarOutlineVariant"
          :suppress-auto-focus="isToolbarOutlineVariant"
          @open-outline="onOpenOutline"
          @open-settings="settingsDialogOpen = true"
          @open-source-context="onOpenSourceContext"
          @outline-sections-changed="onOutlineSectionsChanged"
          @authored="hasAuthoredText = true"
          @pasted="onPasted"
        />
      </div>
      <div v-if="!isToolbarOutlineVariant" class="editor-rail-column">
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
      v-if="effectiveOutlineLocation === 'popover'"
      v-model:open="isPopoverOpen"
      v-model:added-items="addedOutlineItems"
      :initial-view="initialView"
      :selectable-outlines="isToolbarOutlineVariant"
      @content-inserted="onContentInserted"
      @open-cite-discover="onOpenCiteDiscover"
    />
    <EditCheckRail
      :checks="pendingChecks"
      :index="activeCheckIndex"
      @act="onCheckAction"
      @dismiss="onDismissChecks"
      @navigate="onNavigateChecks"
    />
    <SourceContextSheet v-model:open="sourceContextOpen" @add-citation="onAddCitationFromSource" />
    <SettingsDialog v-model:open="settingsDialogOpen" @outline-selected="onOutlineSelected" />
    <CiteDialog
      v-model:open="citeDialogOpen"
      :initial-tab="citeDialogInitialTab"
      @citation-created="onCitationCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { isNavigationFailure, useRoute, useRouter } from 'vue-router'
import { CdxIcon } from '@wikimedia/codex'
import { cdxIconAdd } from '@wikimedia/codex-icons'
import TextEditor from '@/components/TextEditor.vue'
import EditorRail from '@/components/EditorRail.vue'
import CdxToolbar from '@/components/CdxToolbar.vue'
import SettingsDialog from '@/components/SettingsDialog.vue'
import CiteDialog from '@/components/CiteDialog.vue'
import OutlinePopover from '@/components/OutlinePopover.vue'
import SourceContextSheet from '@/components/SourceContextSheet.vue'
import EditCheckRail from '@/components/EditCheckRail.vue'
import { findScaffoldFields } from '@/utils/scaffoldFields'
import { scaffoldFieldHighlightKey } from '@/extensions/scaffoldFieldHighlight'
import { useEditorSettings } from '@/composables/useEditorSettings'
import { useEditorInstance } from '@/composables/useEditorInstance'
import { useCursorRect } from '@/composables/useCursorRect'
import { simpleEnglishOutlinesById } from '@/config/outlines/simpleEnglish'

const route = useRoute()
const router = useRouter()
const { settings } = useEditorSettings()
const isToolbarOutlineVariant = computed(() => route.query.variant === 'toolbar-outline')
const outlineLocation = computed(() => settings.value.outline.location)
const effectiveOutlineLocation = computed(() =>
  isToolbarOutlineVariant.value ? 'popover' : outlineLocation.value,
)
const outlinePersistence = computed(() => settings.value.outline.persistence)
const entryPointStyle = computed(() => settings.value.entryPoint.style)
const activeOutlineId = computed(() => {
  const outlineId = route.query.outline
  return typeof outlineId === 'string' && Object.hasOwn(simpleEnglishOutlinesById, outlineId)
    ? outlineId
    : 'person'
})

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

const isRailOpen = ref(false)
// The sheet greets the editor on arrival, so the guidance is seen rather than
// waited for. The toolbar + reopens it once dismissed.
const isPopoverOpen = ref(isToolbarOutlineVariant.value)
const settingsDialogOpen = ref(false)
const citeDialogOpen = ref(false)
const citeDialogInitialTab = ref('automatic')
const initialView = ref(null)
const addedOutlineItems = ref(new Set())
const sourceContextOpen = ref(false)
const pendingSourceRange = ref(null)
const nextCitationNumber = ref(1)

// Publishing opens up once the editor has written something of their own.
// The scaffold they still have to resolve is raised at the publish moment.
const hasAuthoredText = ref(false)
const pendingChecks = ref([])
const activeCheckIndex = ref(0)

// Pasted text is raised as it happens, not held back until publishing:
// the sooner it is asked about, the less there is to unpick.
function onPasted() {
  if (pendingChecks.value.some((check) => check.name === 'paste')) return

  pendingChecks.value = [
    {
      name: 'paste',
      type: 'check',
      title: 'Pasted content',
      message:
        'Please avoid copying text from other sources, even if rephrased or cited. This could be considered copyright violation or plagiarism and may result in your content being removed or your account being blocked.',
      prompt: 'Did you write this text?',
      actions: [
        { name: 'keep', label: 'Yes, keep it' },
        { name: 'remove', label: 'No, remove it' },
      ],
    },
    ...pendingChecks.value,
  ]
  activeCheckIndex.value = 0
}

function setFieldHighlight(on) {
  const editor = getEditor()
  if (!editor) return
  editor.view.dispatch(editor.state.tr.setMeta(scaffoldFieldHighlightKey, on))
}

function onPublish() {
  const editor = getEditor()
  if (!editor) return

  const fields = findScaffoldFields(editor.state.doc)
  activeCheckIndex.value = 0
  setFieldHighlight(fields.length > 0)

  // Anything already waiting stays waiting; publishing adds to the list.
  const carried = pendingChecks.value.filter((check) => check.name !== 'completeSection')

  // Unfilled fields are one thing to put right, however many there are.
  pendingChecks.value = fields.length
    ? [
        ...carried,
        {
          name: 'completeSection',
          type: 'check',
          title: 'Complete section',
          message:
            'Fields in templates cannot be empty. Before publishing, replace them with real content, or delete them.',
          actions: [
            { name: 'review', label: 'Review' },
            { name: 'delete', label: 'Delete' },
          ],
          fields,
        },
      ]
    : carried

  if (!pendingChecks.value.length) {
    // Nothing left to resolve; a real editor would save here.
    window.alert('Published')
  }
}

function onNavigateChecks(nextIndex) {
  activeCheckIndex.value = Math.max(0, Math.min(nextIndex, pendingChecks.value.length - 1))
}

// Review walks the fields one at a time; Delete clears the ones still empty.
const reviewedFieldIndex = ref(0)

function onCheckAction({ action, check }) {
  const editor = getEditor()
  if (!editor) return

  if (check?.name === 'paste') {
    if (action === 'remove') editor.chain().focus().undo().run()
    pendingChecks.value = pendingChecks.value.filter((pending) => pending.name !== 'paste')
    activeCheckIndex.value = 0
    return
  }

  if (!check?.fields?.length) return

  if (action === 'review') {
    const field = check.fields[reviewedFieldIndex.value % check.fields.length]
    reviewedFieldIndex.value += 1
    editor
      .chain()
      .focus()
      .setTextSelection({ from: field.from, to: field.to })
      .scrollIntoView()
      .run()
    return
  }

  // Delete from the end so earlier positions stay valid.
  const chain = editor.chain().focus()
  ;[...check.fields].reverse().forEach((field) => {
    chain.deleteRange({ from: field.from, to: field.to })
  })
  chain.run()

  refreshChecks()
}

// The document moved, so the fields still empty are found again.
function refreshChecks() {
  const editor = getEditor()
  const fields = editor ? findScaffoldFields(editor.state.doc) : []
  reviewedFieldIndex.value = 0

  if (!fields.length) {
    pendingChecks.value = []
    setFieldHighlight(false)
    return
  }

  pendingChecks.value = pendingChecks.value.map((check) =>
    check.name === 'completeSection' ? { ...check, fields } : check,
  )
}

function onDismissChecks() {
  pendingChecks.value = []
  setFieldHighlight(false)
}

function onOutlineSectionsChanged(sectionKeys) {
  const leadKeys = [...addedOutlineItems.value].filter((key) => key.endsWith(':lead'))
  addedOutlineItems.value = new Set([...leadKeys, ...sectionKeys])
}

async function onOutlineSelected(outlineId) {
  if (outlineId === activeOutlineId.value) {
    settingsDialogOpen.value = false
    return
  }

  try {
    const failure = await router.replace({
      query: { ...route.query, outline: outlineId },
    })
    if (isNavigationFailure(failure)) return
  } catch {
    return
  }

  addedOutlineItems.value = new Set()
  initialView.value = 'outline'
  settingsDialogOpen.value = false
  isPopoverOpen.value = true
}

function onForceButtonClick() {
  getEditor()?.commands.blur()
  onOpenOutline()
}

// After the sheet is dismissed, the toolbar + carries a pulsating dot so the
// suggestions are findable again. Opening the sheet from there retires it.
const hasDismissedSheet = ref(false)
const hasReopenedSheet = ref(false)
const highlightOutlineEntry = computed(
  () => isToolbarOutlineVariant.value && hasDismissedSheet.value && !hasReopenedSheet.value,
)

watch(isPopoverOpen, (isOpen, wasOpen) => {
  if (!isOpen && wasOpen) {
    hasDismissedSheet.value = true
  } else if (isOpen && hasDismissedSheet.value) {
    hasReopenedSheet.value = true
  }
})

function onOpenOutline() {
  const editor = getEditor()
  const isPlaceholderSelected = editor?.state.selection.node?.type.name === 'placeholderChip'
  initialView.value = isPlaceholderSelected ? 'verified-facts' : null

  if (effectiveOutlineLocation.value === 'popover') {
    isPopoverOpen.value = true
  } else {
    isRailOpen.value = true
  }
}

function onClose() {
  router.push({ name: 'hub' })
}

function onOpenCiteDefault() {
  pendingSourceRange.value = null
  citeDialogInitialTab.value = 'automatic'
  citeDialogOpen.value = true
}

// ── Source prompt → citation, mirroring the citation-needed flow in VE ──

function onOpenSourceContext(range) {
  pendingSourceRange.value = range
  sourceContextOpen.value = true
}

function onAddCitationFromSource() {
  sourceContextOpen.value = false
  citeDialogInitialTab.value = 'automatic'
  citeDialogOpen.value = true
}

// A created citation replaces the Source prompt that asked for it, the way
// Citoid replaces a citation-needed template rather than sitting beside it.
function onCitationCreated() {
  const editor = getEditor()
  const range = pendingSourceRange.value
  pendingSourceRange.value = null
  if (!editor || !range) return

  editor
    .chain()
    .focus()
    .insertContentAt(range, `<sup class="citation-reference">[${nextCitationNumber.value}]</sup>`)
    .run()

  nextCitationNumber.value += 1
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

// The panel never auto-opens: the toolbar + (and the editor's entry points)
// are the only doors. Location/variant changes just reset any open panel.
watch(effectiveOutlineLocation, () => {
  isRailOpen.value = false
  isPopoverOpen.value = false
})

watch(isToolbarOutlineVariant, () => {
  isRailOpen.value = false
  isPopoverOpen.value = false
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

.editor-wrapper--full-width .editor-main {
  flex-basis: 100vw;
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
