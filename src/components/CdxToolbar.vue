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
        class="cdx-toolbar__btn cdx-toolbar__btn--outline"
        weight="quiet"
        aria-label="Open article outline"
        @click="emit('open-outline')"
      >
        <CdxIcon :icon="cdxIconAdd" />
        <!-- Marks where the suggestions went once the sheet is dismissed. -->
        <span v-if="highlightOutlineEntry" class="mw-pulsating-dot" aria-hidden="true"></span>
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
      <!-- Publishing stays out of reach until the article has something in it. -->
      <CdxButton
        class="cdx-toolbar__btn cdx-toolbar__btn--publish"
        action="progressive"
        weight="primary"
        :disabled="true"
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
  highlightOutlineEntry: {
    type: Boolean,
    default: false,
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
