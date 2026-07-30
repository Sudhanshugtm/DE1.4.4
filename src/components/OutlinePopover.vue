<template>
  <div ref="anchorRef" class="outline-popover-anchor"></div>
  <CdxPopover v-model:open="open" :anchor="anchorRef" placement="top-start" :render-in-place="true">
    <div class="outline-popover-header">
      <CdxMenuButton v-model:selected="selectedView" :menu-items="menuItems">
        <CdxIcon :icon="currentItem.icon" />
        {{ currentItem.label }}
      </CdxMenuButton>
      <CdxButton weight="quiet" aria-label="Close" @click="open = false">
        <CdxIcon :icon="cdxIconClose" />
      </CdxButton>
    </div>
    <div class="outline-popover-body">
      <template v-if="selectableOutlines">
        <OutlineSelector
          v-if="!selectedOutline"
          v-show="selectedView === 'outline'"
          @select="onSelectOutline"
        />
        <OutlineStructureList
          v-else
          v-show="selectedView === 'outline'"
          v-model:added-items="addedOutlineItems"
          :outline="selectedOutline"
          @change-outline="onChangeOutline"
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
import { useRoute, useRouter } from 'vue-router'
import { CdxPopover, CdxMenuButton, CdxButton, CdxIcon } from '@wikimedia/codex'
import {
  cdxIconListBullet,
  cdxIconCheckAll,
  cdxIconReference,
  cdxIconClose,
} from '@wikimedia/codex-icons'
import OutlineAccordionList from './OutlineAccordionList.vue'
import OutlineSelector from './OutlineSelector.vue'
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
const route = useRoute()
const router = useRouter()
const anchorRef = ref(null)
const selectedView = ref('outline')
const addedOutlineItems = ref(new Set())
const selectedOutline = computed(() => {
  if (!props.selectableOutlines) return null
  const outlineId = route.query.outline
  if (typeof outlineId !== 'string' || !Object.hasOwn(simpleEnglishOutlinesById, outlineId)) {
    return null
  }
  return simpleEnglishOutlinesById[outlineId]
})

function onSelectOutline(outlineId) {
  router.replace({
    query: {
      ...route.query,
      outline: outlineId,
    },
  })
}

function onChangeOutline() {
  const query = { ...route.query }
  delete query.outline
  router.replace({ query })
}

watch(open, (isOpen) => {
  if (isOpen) {
    selectedView.value = props.initialView || 'outline'
  }
})

const menuItems = [
  {
    value: 'outline',
    label: 'Outline',
    description: 'Build off similar articles',
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

async function resetBodyScroll() {
  if (bodyEl) {
    await nextTick()
    bodyEl.scrollTop = 0
    bodyEl.classList.remove('is-scrolled')
    checkScrollable()
  }
}

watch(selectedView, resetBodyScroll)
watch(selectedOutline, resetBodyScroll)

watch(open, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    await nextTick()
    attachObserver()
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
  padding: var(--spacing-100, 16px);
}

.outline-popover-header :deep(.cdx-menu-button__menu) {
  min-width: 256px;
}

.outline-popover-header :deep(.cdx-menu-button > .cdx-button.cdx-button--weight-quiet) {
  border-color: var(--border-color-interactive);
  background-color: var(--background-color-interactive-subtle);
  font-weight: var(--font-weight-bold);
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
  border-bottom: 1px solid var(--border-color-subtle, #c8ccd1);
  padding-bottom: var(--spacing-100);
}

.outline-popover-body.is-scrolled {
  border-top: 1px solid var(--border-color-subtle, #c8ccd1);
}

.outline-popover-anchor + :deep(.cdx-popover .cdx-popover__body) {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.outline-popover-anchor + :deep(.cdx-popover) {
  min-height: 50vh !important;
  max-height: 50vh !important;
  min-height: 50dvh !important;
  max-height: 50dvh !important;
  display: flex;
  flex-direction: column;
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  top: auto !important;
  width: 100% !important;
  max-width: 100% !important;
  transform: none !important;
  border-radius: 0 !important;
  border: none !important;
  border-top: 1px solid var(--border-color-base, #a2a9b1) !important;
  padding: 0 0 env(safe-area-inset-bottom, 0) !important;
  box-sizing: border-box;
}

.outline-popover-body :deep(.cdx-accordion__content) {
  font-family: var(--font-family-system-sans);
}
</style>
