<template>
  <div class="editor-page">
    <CdxToolbar
      ref="toolbarRef"
      :show-outline-entry="isToolbarOutlineVariant"
      :show-verified-facts="isVerifiedFactsDemoEnabled"
      :show-cite="!isToolbarOutlineVariant"
      :highlight-outline-entry="highlightOutlineEntry"
      :can-publish="hasAuthoredText"
      @open-outline="onOpenOutline"
      @open-verified-facts="onOpenVerifiedFacts"
      @insert-menu-opened="hasOpenedInsertMenu = true"
      @cite="onOpenCiteDefault"
      @link="onOpenLink"
      @close="onClose"
      @publish="onPublish"
    />
    <div
      class="editor-wrapper"
      :class="{
        'rail-open': isRailOpen,
        'editor-wrapper--full-width': isToolbarOutlineVariant,
        'editor-wrapper--check-gutter': pendingChecks.length > 0,
      }"
    >
      <div class="editor-main" @click="isRailOpen && (isRailOpen = false)">
        <TextEditor
          :key="editorSessionRevision"
          :show-outline-entry="!isToolbarOutlineVariant"
          :show-placeholder="isToolbarOutlineVariant"
          :suppress-auto-focus="isToolbarOutlineVariant"
          @open-outline="onOpenOutline"
          @open-settings="settingsDialogOpen = true"
          @open-source-context="onOpenSourceContext"
          @outline-sections-changed="onOutlineSectionsChanged"
          @authored="onAuthored"
          @editor-focused="onEditorFocused"
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
      :verified-facts="reviewedVerifiedFacts"
      :outline-label="activeOutlineLabel"
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
    <!-- The community's tips ride the same bottom-sheet pattern as the
         suggested sections: guidance shares one shape, checks another. -->
    <CommunityTipsSheet
      v-model:open="tipSheetOpen"
      :title="tipSuggestion?.title ?? ''"
      :attribution="tipSuggestion?.intro ?? ''"
      :bullets="tipSuggestion?.bullets ?? []"
    />
    <SourceContextSheet v-model:open="sourceContextOpen" @add-citation="onAddCitationFromSource" />
    <SettingsDialog
      v-model:open="settingsDialogOpen"
      :demo-launch-pending="isOpeningVerifiedFactsDemo"
      @outline-selected="onOutlineSelected"
      @open-verified-facts-demo="onOpenVerifiedFactsDemo"
    />
    <CiteDialog
      v-model:open="citeDialogOpen"
      :initial-tab="citeDialogInitialTab"
      :reusable-sources="arrivalSources"
      :outline-id="activeOutlineId"
      :outline-label="activeOutlineLabel"
      @citation-created="onCitationCreated"
    />
    <LinkDialog
      v-model:open="linkDialogOpen"
      :outline-id="activeOutlineId"
      :outline-label="activeOutlineLabel"
      @link-created="onLinkCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
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
import CommunityTipsSheet from '@/components/CommunityTipsSheet.vue'
import LinkDialog from '@/components/LinkDialog.vue'
import { findIncompleteSentences, findScaffoldFields } from '@/utils/scaffoldFields'
import { findReferencesList } from '@/extensions/referencesList'
import { communityTipsByOutline } from '@/config/outlines/communityTips'
import { useEditorSettings } from '@/composables/useEditorSettings'
import { useEditorInstance } from '@/composables/useEditorInstance'
import { useCursorRect } from '@/composables/useCursorRect'
import { simpleEnglishOutlinesById } from '@/config/outlines/simpleEnglish'
import { getReviewedVerifiedFacts } from '@/config/reviewedVerifiedFacts'
import {
  VERIFIED_FACTS_DEMO_ROUTE,
  isExactVerifiedFactsDemoRoute,
} from '@/config/verifiedFactsDemo'

const route = useRoute()
const router = useRouter()
const { settings } = useEditorSettings()
const isToolbarOutlineVariant = computed(() => route.query.variant === 'toolbar-outline')
const outlineLocation = computed(() => settings.value.outline.location)
const effectiveOutlineLocation = computed(() =>
  isToolbarOutlineVariant.value ? 'popover' : outlineLocation.value,
)
const entryPointStyle = computed(() => settings.value.entryPoint.style)
const activeOutlineId = computed(() => {
  const outlineId = route.query.outline
  return typeof outlineId === 'string' && Object.hasOwn(simpleEnglishOutlinesById, outlineId)
    ? outlineId
    : 'person'
})
const activeOutlineLabel = computed(() => simpleEnglishOutlinesById[activeOutlineId.value].label)
const reviewedVerifiedFacts = computed(() => {
  const language = typeof route.query.lang === 'string' ? route.query.lang : 'en'
  const title = typeof route.query.title === 'string' ? route.query.title : ''
  return getReviewedVerifiedFacts({
    language,
    outline: activeOutlineId.value,
    title,
  })
})
const isVerifiedFactsDemoEnabled = computed(
  () => route.query.verifiedfacts === '1' && reviewedVerifiedFacts.value.length > 0,
)
const toolbarRef = ref(null)
const editorSessionRevision = ref(0)
const isOpeningVerifiedFactsDemo = ref(false)

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

// Sources gathered before the editor opened travel in on the URL, the way the
// guidance flow hands them over. They seed the citation flow's Re-use tab.
const arrivalSources = computed(() => {
  const raw = route.query.source
  const urls = typeof raw === 'string' ? [raw] : Array.isArray(raw) ? raw : []
  return urls
    .map((url) => {
      try {
        const parsed = new URL(url)
        return { url: parsed.href, domain: parsed.hostname.replace(/^www\./, '') }
      } catch {
        return null
      }
    })
    .filter(Boolean)
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
async function onPasted({ from }) {
  if (pendingChecks.value.some((check) => check.name === 'paste')) return

  // A check is about to take the rail; guidance does not come back over it.
  dismissTipQuietly()

  // Once the paste has landed, the keyboard steps aside for the card asking
  // about it, which sits where the keyboard was. The selection now rests at
  // the end of what was pasted, closing the range that began where the paste
  // went in: remove acts on exactly that, whatever history did around it.
  await nextTick()
  const editor = getEditor()
  editor?.commands.blur()
  const to = editor?.state.selection.from ?? from

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
      range: { from, to },
    },
    ...pendingChecks.value,
  ]
  activeCheckIndex.value = 0

  // The card asks about the paste, so the paste must be on screen: scroll
  // it up from behind the card before the question is read.
  await nextTick()
  revealPositionAboveCard(getEditor()?.state.selection.from)
}

// Scrolls the article so the given position sits clear above the check card
// instead of hidden behind it at the foot of the screen.
function revealPositionAboveCard(position) {
  const editor = getEditor()
  if (!editor || typeof position !== 'number') return

  const scroller = editor.view.dom
  const card = document.querySelector('.edit-check__card')
  const cardTop = card ? card.getBoundingClientRect().top : window.innerHeight

  try {
    const coords = editor.view.coordsAtPos(Math.min(position, editor.state.doc.content.size))
    const clearance = cardTop - 96
    if (coords.top > clearance) scroller.scrollTop += coords.top - clearance
  } catch {
    // An unresolvable position just stays where it is.
  }
}

function onPublish() {
  const editor = getEditor()
  if (!editor) return

  // Publish is a commit boundary even when the caret has not left the field.
  // Synchronize first so checks scan the current linked values.
  editor.commands.commitFieldBinding()

  // Checks are answered, not typed into, and their card sits at the foot of
  // the screen. The keyboard steps aside so it is not left behind it.
  editor.commands.blur()
  dismissTipQuietly()

  activeCheckIndex.value = 0

  // Anything already waiting stays waiting; publishing adds to the list.
  const carried = pendingChecks.value.filter((check) => check.name !== 'completeSection')
  pendingChecks.value = [...carried, ...buildCompleteSectionChecks(editor.state.doc)]

  if (!pendingChecks.value.length) {
    // Nothing left to resolve; a real editor would save here.
    window.alert('Published')
  }
}

// One finding per unfinished sentence, the way checks work in the editor:
// the card speaks about the sentence in view, its actions touch only that
// sentence, and pagination moves between findings.
function buildCompleteSectionChecks(doc) {
  const fields = findScaffoldFields(doc)

  return findIncompleteSentences(doc).map((sentence) => ({
    name: 'completeSection',
    type: 'check',
    title: 'Complete section',
    message:
      'This sentence still has unfilled fields. Complete them, or delete the sentence. Empty fields cannot be published.',
    actions: [
      { name: 'complete', label: 'Complete' },
      { name: 'deleteSentence', label: 'Delete sentence' },
    ],
    range: sentence,
    fields: fields.filter((field) => field.from >= sentence.from && field.to <= sentence.to),
  }))
}

function onNavigateChecks(nextIndex) {
  activeCheckIndex.value = Math.max(0, Math.min(nextIndex, pendingChecks.value.length - 1))
}

function onCheckAction({ action, check }) {
  const editor = getEditor()
  if (!editor) return

  if (check?.name === 'paste') {
    // Remove deletes the recorded paste range and nothing else: undo would
    // take back a history entry, whose size depends on what grouping did
    // around the paste. The keyboard stays down and the view stays put.
    if (action === 'remove' && check.range) {
      editor
        .chain()
        .deleteRange({
          from: Math.max(0, Math.min(check.range.from, editor.state.doc.content.size)),
          to: Math.max(0, Math.min(check.range.to, editor.state.doc.content.size)),
        })
        .run()
    }
    pendingChecks.value = pendingChecks.value.filter((pending) => pending.name !== 'paste')
    activeCheckIndex.value = 0
    return
  }

  if (check?.name !== 'completeSection') return

  // Complete hands the sentence back for writing: the first unfilled field is
  // selected the way tapping it would, ready to be typed over.
  if (action === 'complete') {
    const field = check.fields[0]
    if (!field) return
    editor
      .chain()
      .focus()
      .setTextSelection({ from: field.from, to: field.to })
      .scrollIntoView()
      .run()
    return
  }

  // Delete touches only the sentence in view. A field cannot go on its own —
  // "[Full name] was born on [date]." would be left as " was born on ." —
  // so the sentence goes whole, and the other findings stay theirs.
  if (action === 'deleteSentence' && check.range) {
    editor.chain().deleteRange(check.range).run()
  }
}

// The document moved: findings are recomputed from what is actually left, so
// ranges stay true, resolved sentences retire themselves, and the list closes
// when nothing remains.
function refreshChecks() {
  const editor = getEditor()
  if (!editor || !pendingChecks.value.some((check) => check.name === 'completeSection')) return

  const others = pendingChecks.value.filter((check) => check.name !== 'completeSection')
  pendingChecks.value = [...others, ...buildCompleteSectionChecks(editor.state.doc)]
  activeCheckIndex.value = Math.max(
    0,
    Math.min(activeCheckIndex.value, pendingChecks.value.length - 1),
  )
}

function onDismissChecks() {
  pendingChecks.value = []
}

function onOutlineSectionsChanged(sectionKeys, hasLead = true) {
  // The lead has no heading to track, so its presence arrives separately: a
  // hand-cleared Introduction becomes addable in the sheet again.
  const leadKeys = hasLead
    ? [...addedOutlineItems.value].filter((key) => key.endsWith(':lead'))
    : []
  addedOutlineItems.value = new Set([...leadKeys, ...sectionKeys])
  // Fires on every document change, so open findings follow the text they
  // are about — filling a sentence retires its finding without a new publish.
  refreshChecks()
}

function resetArticleSessionState() {
  addedOutlineItems.value = new Set()
  pendingChecks.value = []
  activeCheckIndex.value = 0
  hasAuthoredText.value = false
  nextCitationNumber.value = 1
  tipSuggestion.value = null
  hasDismissedTip.value = false
}

async function onOutlineSelected(outlineId) {
  if (outlineId === activeOutlineId.value) {
    settingsDialogOpen.value = false
    return
  }

  const targetLocation = {
    name: 'editor',
    query: { ...route.query, outline: outlineId },
    hash: route.hash,
  }
  const expectedFullPath = router.resolve(targetLocation).fullPath

  try {
    const failure = await router.replace(targetLocation)
    if (isNavigationFailure(failure)) return
  } catch {
    return
  }
  if (router.currentRoute.value.fullPath !== expectedFullPath) return

  // A different outline is a different article, so the editor starts clean:
  // the previous article's text, checks and progress all go with it.
  editorSessionRevision.value += 1
  resetArticleSessionState()
  initialView.value = 'outline'
  settingsDialogOpen.value = false
  isPopoverOpen.value = true
}

async function onOpenVerifiedFactsDemo() {
  if (isOpeningVerifiedFactsDemo.value) return
  if (isExactVerifiedFactsDemoRoute(route)) {
    settingsDialogOpen.value = false
    return
  }

  isOpeningVerifiedFactsDemo.value = true
  let launchConfirmed = false
  try {
    const failure = await router.push(VERIFIED_FACTS_DEMO_ROUTE)
    if (isNavigationFailure(failure)) return
    if (!isExactVerifiedFactsDemoRoute(router.currentRoute.value)) return

    launchConfirmed = true
    editorSessionRevision.value += 1
    resetArticleSessionState()
    initialView.value = 'outline'
    settingsDialogOpen.value = false
    isPopoverOpen.value = true
    await nextTick()
    toolbarRef.value?.focusInsertButton()
  } catch {
    // Failed navigation keeps the current editor session intact.
  } finally {
    isOpeningVerifiedFactsDemo.value = false
    if (!launchConfirmed) {
      await nextTick()
      document.querySelector('[data-testid="open-verified-facts-demo"]')?.focus()
    }
  }
}

function onForceButtonClick() {
  getEditor()?.commands.blur()
  onOpenOutline()
}

// After the sheet is dismissed, the toolbar + carries a pulsating dot so the
// suggestions are findable again.
const hasDismissedSheet = ref(false)
// Opening the insert menu even once means the editor knows where guidance
// lives, so the dot has nothing left to say — including after they switch to
// another outline.
const hasOpenedInsertMenu = ref(false)
// Only ever one thing asking to be looked at. With an empty article the + is
// the only move, so the dot points at it; once a section is in, the caret
// waiting in the text is the thing to see.
const highlightOutlineEntry = computed(
  () =>
    isToolbarOutlineVariant.value &&
    hasDismissedSheet.value &&
    !hasOpenedInsertMenu.value &&
    addedOutlineItems.value.size === 0,
)

watch(isPopoverOpen, (isOpen, wasOpen) => {
  if (!isOpen && wasOpen) hasDismissedSheet.value = true
})

function onOpenVerifiedFacts() {
  if (!isVerifiedFactsDemoEnabled.value) return

  dismissTipQuietly()
  initialView.value = 'verified-facts'
  isPopoverOpen.value = true
}

function onOpenOutline() {
  // One sheet at a time: choosing structure puts the tips away.
  dismissTipQuietly()
  if (isToolbarOutlineVariant.value) {
    initialView.value = 'outline'
  } else {
    const editor = getEditor()
    const isPlaceholderSelected = editor?.state.selection.node?.type.name === 'placeholderChip'
    initialView.value = isPlaceholderSelected ? 'verified-facts' : null
  }

  if (effectiveOutlineLocation.value === 'popover') {
    isPopoverOpen.value = true
  } else {
    isRailOpen.value = true
  }
}

function onClose() {
  router.push({ name: 'hub' })
}

// A citation starts from what the editor already has: sources brought along
// from guidance open on Re-use; with none, Automatic leads as usual.
function defaultCiteTab() {
  return arrivalSources.value.length ? 'reuse' : 'automatic'
}

function onOpenCiteDefault() {
  pendingSourceRange.value = null
  citeDialogInitialTab.value = defaultCiteTab()
  citeDialogOpen.value = true
}

// ── Source prompt → citation, mirroring the citation-needed flow in VE ──

function onOpenSourceContext(range) {
  // The claim is being asked about, not written in. If the keyboard was
  // already up it steps aside, so the context item is not left behind it.
  getEditor()?.commands.blur()
  pendingSourceRange.value = range
  sourceContextOpen.value = true
}

function onAddCitationFromSource() {
  sourceContextOpen.value = false
  citeDialogInitialTab.value = defaultCiteTab()
  citeDialogOpen.value = true
}

// A created citation replaces the Source prompt that asked for it, the way
// Citoid replaces a citation-needed template rather than sitting beside it.
function onCitationCreated({ url }) {
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
  appendReference(url)
}

// References exists because citations exist: the first one brings the section
// (always last), and every citation writes its entry under it.
function appendReference(url) {
  const editor = getEditor()
  if (!editor) return

  let listPosition = findReferencesList(editor.state.doc)

  if (listPosition === null) {
    // Inserted as nodes rather than HTML: an empty ol would otherwise be
    // claimed by the ordinary list schema and dropped.
    editor
      .chain()
      .insertContentAt(editor.state.doc.content.size, [
        {
          type: 'heading',
          attrs: { level: 2, outlineItemKey: `${activeOutlineId.value}:references` },
          content: [{ type: 'text', text: 'References' }],
        },
        { type: 'referencesList', attrs: { entries: [] } },
      ])
      .command(({ tr }) => {
        // The section arrives as a consequence of citing, not as writing.
        tr.setMeta('outlineInsertion', true)
        return true
      })
      .run()
    listPosition = findReferencesList(editor.state.doc)
  }

  if (listPosition === null) return

  const node = editor.state.doc.nodeAt(listPosition)
  const transaction = editor.state.tr.setNodeMarkup(listPosition, undefined, {
    entries: [...node.attrs.entries, { url }],
  })
  transaction.setMeta('outlineInsertion', true)
  editor.view.dispatch(transaction)
}

function onOpenCiteDiscover() {
  citeDialogInitialTab.value = 'discover'
  citeDialogOpen.value = true
}

// ── Link tool: same add-time source rules as citing ──

const linkDialogOpen = ref(false)

function onOpenLink() {
  linkDialogOpen.value = true
}

// A link lands where the caret was: on a selection it links the words, on a
// caret it writes the address as its own link.
function onLinkCreated({ url }) {
  const editor = getEditor()
  if (!editor) return

  const { empty } = editor.state.selection
  if (empty) {
    editor.chain().focus().insertContent(`<a href="${url}">${url}</a> `).run()
  } else {
    editor.chain().focus().setLink({ href: url }).run()
  }
}

// One act at a time after the sheet: the first section's arrival belongs to
// the community's tips, and only when those are put away does the caret take
// the stage with the keyboard. Later sections skip straight to writing.
async function onContentInserted() {
  isRailOpen.value = false
  isPopoverOpen.value = false
  await nextTick()

  if (offerCommunityTip()) {
    // Insertion's own focus can arrive late on mobile; put the keyboard away
    // again once everything has settled so the card has the stage alone.
    await nextTick()
    getEditor()?.commands.blur()
    return
  }
  placeCursorAtFirstField()
}

const tipSuggestion = ref(null)
const hasDismissedTip = ref(false)
const tipShownAt = ref(0)

// The sheet opens while the tips hold the stage, and yields instantly to any
// check. Closing it, by Got it, the X, or Escape, hands the caret over.
const tipSheetOpen = computed({
  get: () => Boolean(tipSuggestion.value?.open) && pendingChecks.value.length === 0,
  set: (value) => {
    if (!value) onDismissTip()
  },
})

// Insertion's own focus can arrive hundreds of milliseconds late on mobile;
// a person's tap comes seconds later. The window tells them apart.
const TIP_SETTLE_MS = 800

// The tips card shows itself once, in the space the keyboard would take, so
// nothing competes with it. Returns whether it took the moment.
function offerCommunityTip() {
  if (tipSuggestion.value || hasDismissedTip.value) return false

  const bullets = communityTipsByOutline[activeOutlineId.value]
  if (!bullets?.length) return false

  const outline = simpleEnglishOutlinesById[activeOutlineId.value]
  getEditor()?.commands.blur()
  tipSuggestion.value = {
    title: `Tips for ${outline.label} articles`,
    intro: 'From Simple English editors',
    bullets,
    open: true,
  }
  tipShownAt.value = performance.now()
  return true
}

// Putting the tips away hands the stage to writing: caret at the first
// field, keyboard up, nothing else asking to be looked at.
function onDismissTip() {
  tipSuggestion.value = null
  hasDismissedTip.value = true
  placeCursorAtFirstField()
}

// Writing while the tips are up is choosing to write: the card yields
// without stealing the caret. Typing is the signal, not focus — insertion
// itself focuses the editor, and on some platforms that focus arrives late
// enough to kill the card before it is ever seen.
function dismissTipQuietly() {
  if (!tipSuggestion.value) return
  tipSuggestion.value = null
  hasDismissedTip.value = true
}

function onAuthored() {
  hasAuthoredText.value = true
  dismissTipQuietly()
}

function placeCursorAtFirstField() {
  const editor = getEditor()
  if (!editor) return

  // Insertion leaves the caret at the start of the new section, so the first
  // field from there is the one this section is asking for.
  const caret = editor.state.selection.from
  const fields = findScaffoldFields(editor.state.doc)
  const field = fields.find((candidate) => candidate.from >= caret) ?? fields[0]

  // A caret, not a selection: arriving with text already selected reads as
  // something having been picked up, and brings grab handles with it.
  const chain = editor.chain().focus()
  if (field) chain.setTextSelection(field.from)
  chain.scrollIntoView().run()

  // scrollIntoView is minimal: a section added below a long article leaves
  // its caret grazing the bottom edge, which reads as nothing having been
  // added. Bring the landing spot up into comfortable view instead.
  revealPositionNearTop(field ? field.from : editor.state.selection.from)
}

// Scrolls the article so the given position sits in the upper part of the
// view, under the toolbar, where an arrival is seen rather than inferred.
function revealPositionNearTop(position) {
  const editor = getEditor()
  if (!editor || typeof position !== 'number') return

  const scroller = editor.view.dom
  const target = 48 + 96

  try {
    const coords = editor.view.coordsAtPos(Math.min(position, editor.state.doc.content.size))
    if (coords.top > target + 40 || coords.top < 48) {
      scroller.scrollTop += coords.top - target
    }
  } catch {
    // An unresolvable position just stays where it is.
  }
}

// Neither sheet has a backdrop, so the article behind them stays tappable.
// Writing is the whole point, so they give way rather than sitting under the
// keyboard where they cannot be seen.
function onEditorFocused() {
  isPopoverOpen.value = false
  sourceContextOpen.value = false
  // Tapping into the article once the card has settled is choosing to
  // write: the card goes, the keyboard stays, the tap decides the caret.
  if (tipSuggestion.value && performance.now() - tipShownAt.value > TIP_SETTLE_MS) {
    dismissTipQuietly()
  }
}

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

/* While a check is up, the article ends where the gutter begins instead of
   running on behind it, and carries enough foot room that text at the very
   bottom can scroll clear of the card. */
.editor-wrapper--check-gutter .editor-main :deep(.ProseMirror) {
  padding-inline-end: calc(44px + var(--spacing-100, 16px));
  padding-bottom: 360px;
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
