<template>
  <div ref="anchorRef" class="outline-popover-anchor"></div>
  <CdxPopover
    v-model:open="open"
    :anchor="anchorRef"
    placement="top-start"
    :use-bottom-sheet="true"
    :hide-backdrop="true"
  >
    <div class="outline-popover-header">
      <span class="outline-popover-header__title">
        <CdxIcon :icon="currentItem.icon" size="small" />
        {{ currentItem.label }}
      </span>
      <CdxButton weight="quiet" aria-label="Close" @click="open = false">
        <CdxIcon :icon="cdxIconClose" />
      </CdxButton>
    </div>
    <p
      v-if="selectableOutlines && selectedView === 'outline'"
      class="outline-popover-header__attribution"
    >
      {{ currentItem.description }}
    </p>
    <div class="outline-popover-body">
      <template v-if="selectableOutlines">
        <OutlineStructureList
          v-show="selectedView === 'outline'"
          v-model:added-items="addedItems"
          :outline="selectedOutline"
          @content-inserted="$emit('content-inserted')"
        />
      </template>
      <OutlineAccordionList
        v-else-if="selectedView === 'outline'"
        @content-inserted="$emit('content-inserted')"
      />
      <VerifiedFactsList
        v-if="selectedView === 'verified-facts'"
        @content-inserted="$emit('content-inserted')"
      />
      <ReferenceSourcesList
        v-if="selectedView === 'references'"
        @open-cite-discover="$emit('open-cite-discover')"
      />
    </div>
  </CdxPopover>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { CdxPopover, CdxButton, CdxIcon } from '@wikimedia/codex'
import {
  cdxIconListBullet,
  cdxIconCheckAll,
  cdxIconReference,
  cdxIconClose,
} from '@wikimedia/codex-icons'
import OutlineAccordionList from './OutlineAccordionList.vue'
import OutlineStructureList from './OutlineStructureList.vue'
import VerifiedFactsList from './VerifiedFactsList.vue'
import ReferenceSourcesList from './ReferenceSourcesList.vue'
import { simpleEnglishOutlinesById } from '../config/outlines/simpleEnglish.js'

defineEmits(['content-inserted', 'open-cite-discover'])
const props = defineProps({
  initialView: {
    type: String,
    default: null,
  },
  selectableOutlines: {
    type: Boolean,
    default: false,
  },
})
const open = defineModel('open', { type: Boolean, default: false })
const addedItems = defineModel('addedItems', {
  type: Set,
  required: true,
})
const route = useRoute()
const anchorRef = ref(null)
const selectedView = ref('outline')
const pendingOutlineScrollReset = ref(false)
// Default topic type for the prototype. Switching outlines lives in Settings,
// mirroring the real flow where the topic is known before the editor opens.
const DEFAULT_OUTLINE_ID = 'person'
const selectedOutline = computed(() => {
  if (!props.selectableOutlines) return null
  const outlineId = route.query.outline
  if (typeof outlineId === 'string' && Object.hasOwn(simpleEnglishOutlinesById, outlineId)) {
    return simpleEnglishOutlinesById[outlineId]
  }
  return simpleEnglishOutlinesById[DEFAULT_OUTLINE_ID]
})

watch(open, (isOpen) => {
  if (isOpen) {
    selectedView.value = props.initialView || 'outline'
  }
})

const menuItems = [
  {
    value: 'outline',
    label: 'Suggested sections',
    description: 'From Simple English editors',
    icon: cdxIconListBullet,
  },
  {
    value: 'verified-facts',
    label: 'Verified facts',
    description: 'From Wikidata',
    icon: cdxIconCheckAll,
  },
  {
    value: 'references',
    label: 'References',
    description: 'In other projects',
    icon: cdxIconReference,
  },
]

const currentItem = computed(
  () => menuItems.find((item) => item.value === selectedView.value) || menuItems[0],
)

let bodyEl = null
let resizeObserver = null

function getBodyEl() {
  if (!anchorRef.value) return null
  const popover = anchorRef.value.nextElementSibling
  return popover?.querySelector('.outline-popover-body') ?? null
}

function checkScrollable() {
  if (!bodyEl) return
  const scrollable = bodyEl.scrollHeight > bodyEl.clientHeight
  bodyEl.classList.toggle('is-scrollable', scrollable)
}

function onBodyScroll() {
  if (!bodyEl) return
  bodyEl.classList.toggle('is-scrolled', bodyEl.scrollTop > 0)
}

function attachObserver() {
  detachObserver()
  bodyEl = getBodyEl()
  if (!bodyEl) return
  bodyEl.addEventListener('scroll', onBodyScroll)
  resizeObserver = new ResizeObserver(checkScrollable)
  resizeObserver.observe(bodyEl)
  checkScrollable()
}

function detachObserver() {
  bodyEl?.removeEventListener('scroll', onBodyScroll)
  bodyEl?.classList.remove('is-scrollable', 'is-scrolled')
  resizeObserver?.disconnect()
  bodyEl = null
}

function resetBodyScroll() {
  if (!bodyEl) return false
  bodyEl.scrollTop = 0
  bodyEl.classList.remove('is-scrolled')
  checkScrollable()
  return true
}

function applyPendingOutlineScrollReset() {
  if (!pendingOutlineScrollReset.value || !bodyEl) return
  if (resetBodyScroll()) {
    pendingOutlineScrollReset.value = false
  }
}

watch(selectedView, resetBodyScroll)
watch(selectedOutline, () => {
  selectedView.value = 'outline'
  pendingOutlineScrollReset.value = true
  applyPendingOutlineScrollReset()
})

watch(open, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    await nextTick()
    attachObserver()
    applyPendingOutlineScrollReset()
  } else {
    detachObserver()
  }
})

onMounted(async () => {
  if (open.value) {
    await nextTick()
    attachObserver()
  }
})

onBeforeUnmount(() => {
  detachObserver()
})
</script>

<style scoped>
.outline-popover-anchor {
  width: 0;
  height: 0;
}

.outline-popover-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-50, 8px);
  padding: var(--spacing-50, 8px) var(--spacing-100, 16px);
}

.outline-popover-header__title {
  display: flex;
  align-items: center;
  gap: var(--spacing-50, 8px);
  min-width: 0;
  color: var(--color-base);
  font-size: var(--font-size-large);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-large);
}

.outline-popover-header__attribution {
  margin: 0;
  padding: 0 var(--spacing-100, 16px) var(--spacing-50, 8px);
  color: var(--color-subtle);
  font-size: var(--font-size-small);
  line-height: var(--line-height-small);
}

.outline-popover-body {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  padding: var(--spacing-100, 16px) var(--spacing-100, 16px) 0;
  border-top: 1px solid var(--border-color-transparent);
  transition-property: var(--transition-property-base);
  transition-duration: var(--transition-duration-medium);
  transition-timing-function: var(--transition-timing-function-user);
}

.outline-popover-body.is-scrollable {
  padding-bottom: var(--spacing-100);
}

.outline-popover-body.is-scrolled {
  border-top: 1px solid var(--border-color-subtle, #c8ccd1);
}

.outline-popover-body :deep(.cdx-accordion__content) {
  font-family: var(--font-family-system-sans);
}
</style>

<!-- Codex places and sizes the bottom sheet itself; these are the two things
     the design asks for on top of that. The popover is rendered outside this
     component, so the rules cannot be scoped. -->
<style>
.cdx-popover--bottom-sheet {
  max-height: 50dvh;
  background-color: var(--background-color-neutral-subtle, #f8f9fa);
}

.cdx-popover--bottom-sheet .cdx-popover__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 0;
}
</style>
