<template>
  <div class="cite-dialog">
    <CdxDialog
      v-model:open="open"
      title="Add a citation"
      :use-close-button="true"
      :render-in-place="true"
    >
      <CdxTabs v-model:active="activeTab" :framed="true">
        <CdxTab name="automatic" label="Automatic">
          <div class="cite-dialog__tab-content">
            <p class="cite-dialog__description">
              Enter a link or reference code (ISBN, DOI or other) to create a citation
            </p>
            <CdxSearchInput
              v-model="searchQuery"
              :use-button="true"
              :hide-icon="true"
              button-label="Create"
              placeholder="e.g. http://www.example.com"
              @submit-click="onCreate"
            />
            <div>
              <CdxButton>
                <CdxIcon :icon="cdxIconLogoWikidata" />
                Scan ISBN barcode
              </CdxButton>
            </div>
          </div>
        </CdxTab>
        <CdxTab name="manual" label="Manual">
          <div class="cite-dialog__tab-content">
            <p class="cite-dialog__description">Manual citation entry</p>
          </div>
        </CdxTab>
        <CdxTab name="reuse" label="Re-use">
          <div class="cite-dialog__tab-content">
            <template v-if="reusableSources.length">
              <p class="cite-dialog__description">Sources you added before writing</p>
              <ul class="cite-dialog__reuse-list">
                <li v-for="source in reusableSources" :key="source.url">
                  <button
                    class="cite-dialog__reuse-item"
                    type="button"
                    @click="onReuseSource(source)"
                  >
                    <CdxIcon :icon="cdxIconLink" class="cite-dialog__reuse-icon" />
                    <span class="cite-dialog__reuse-text">
                      <span class="cite-dialog__reuse-domain">{{ source.domain }}</span>
                      <span class="cite-dialog__reuse-url">{{ source.url }}</span>
                    </span>
                  </button>
                </li>
              </ul>
            </template>
            <p v-else class="cite-dialog__description">Re-use an existing citation</p>
          </div>
        </CdxTab>
        <CdxTab name="discover" label="Discover">
          <div class="cite-dialog__tab-content">
            <p class="cite-dialog__description">Discover sources</p>
          </div>
        </CdxTab>
      </CdxTabs>
    </CdxDialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { CdxDialog, CdxTabs, CdxTab, CdxSearchInput, CdxButton, CdxIcon } from '@wikimedia/codex'
import { cdxIconLink, cdxIconLogoWikidata } from '@wikimedia/codex-icons'

const props = defineProps({
  initialTab: {
    type: String,
    default: 'automatic',
  },
  // Sources the editor arrived with from the guidance flow, offered for
  // citing without retyping.
  reusableSources: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['citation-created'])

const open = defineModel('open', { type: Boolean, default: false })
const activeTab = ref(props.initialTab)
const searchQuery = ref('')

watch(open, (isOpen) => {
  if (isOpen) {
    activeTab.value = props.initialTab
  }
})

function onCreate() {
  if (!searchQuery.value.trim()) return
  searchQuery.value = ''
  open.value = false
  emit('citation-created')
}

function onReuseSource() {
  open.value = false
  emit('citation-created')
}
</script>

<style scoped>
.cite-dialog :deep(.cdx-dialog__header) {
  flex-direction: row-reverse;
  align-items: center;
  padding: var(--spacing-50) var(--spacing-100);
  border-bottom: var(--border-width-base) var(--border-style-base) var(--border-color-subtle);
}

.cite-dialog :deep(.cdx-dialog__header__title) {
  font-size: var(--font-size-large);
}

.cite-dialog :deep(.cdx-dialog__header__close-button.cdx-button) {
  margin-right: var(--spacing-100);
}

.cite-dialog :deep(.cdx-dialog__body) {
  padding: 0;
}

.cite-dialog__tab-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-100);
  padding: var(--spacing-100);
}

.cite-dialog__description {
  font-size: var(--font-size-medium);
  line-height: var(--line-height-medium);
  color: var(--color-base);
  margin: 0;
}

.cite-dialog__reuse-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.cite-dialog__reuse-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-75);
  width: 100%;
  padding: var(--spacing-75) var(--spacing-50);
  border: 0;
  border-bottom: var(--border-subtle);
  background: var(--background-color-transparent);
  font-family: inherit;
  text-align: start;
  cursor: pointer;
}

.cite-dialog__reuse-item:hover {
  background-color: var(--background-color-interactive-subtle);
}

.cite-dialog__reuse-icon {
  flex: 0 0 auto;
  color: var(--color-subtle);
}

.cite-dialog__reuse-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.cite-dialog__reuse-domain {
  color: var(--color-base);
  font-size: var(--font-size-medium);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-medium);
}

.cite-dialog__reuse-url {
  color: var(--color-subtle);
  font-size: var(--font-size-small);
  line-height: var(--line-height-small);
  overflow-wrap: anywhere;
}

/* On a phone the citation flow takes the screen, the way the Citoid
   inspector does in the mobile editor, rather than floating over the
   article as a card. */
@media screen and (max-width: 640px) {
  .cite-dialog :deep(.cdx-dialog) {
    width: 100%;
    max-width: none;
    height: 100dvh;
    max-height: none;
    margin: 0;
    border: 0;
    border-radius: 0;
  }

  .cite-dialog :deep(.cdx-dialog__body) {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
}
</style>
