<template>
  <div class="cdx-toolbar">
    <div class="cdx-toolbar__lhs">
      <CdxButton class="cdx-toolbar__btn cdx-toolbar__btn--close" weight="quiet" aria-label="Close" @click="emit('close')">
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
      <CdxButton class="cdx-toolbar__btn" weight="quiet" aria-label="Link">
        <CdxIcon :icon="cdxIconLink" />
      </CdxButton>
      <CdxButton
        v-if="showOutlineEntry"
        class="cdx-toolbar__btn"
        weight="quiet"
        aria-label="Open article outline"
        @click="emit('open-outline')"
      >
        <CdxIcon :icon="cdxIconAdd" />
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
      <CdxButton
        class="cdx-toolbar__btn cdx-toolbar__btn--publish"
        action="progressive"
        weight="primary"
        aria-label="Publish"
      >
        <CdxIcon :icon="cdxIconNext" />
      </CdxButton>
    </div>
  </div>
</template>

<script setup>
defineProps({
  showOutlineEntry: {
    type: Boolean,
    default: false,
  },
  showCite: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['cite', 'close', 'open-outline'])
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
  cdxIconNext,
} from '@wikimedia/codex-icons'
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
  overflow: clip;
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

.cdx-toolbar__indicator {
  min-width: 10px;
  min-height: 10px;
  height: 10px;
  width: 10px;
}
</style>
