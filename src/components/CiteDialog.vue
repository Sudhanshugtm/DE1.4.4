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
            <p class="cite-dialog__description">Re-use an existing citation</p>
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
import { cdxIconLogoWikidata } from '@wikimedia/codex-icons'

const props = defineProps({
  initialTab: {
    type: String,
    default: 'automatic',
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
</style>
