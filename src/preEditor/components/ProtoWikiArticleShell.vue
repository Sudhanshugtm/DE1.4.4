<!-- ABOUTME: Renders deterministic article fixture content inside a semantic Wikipedia-style shell. -->
<!-- ABOUTME: Emits activation of the single native missing-article link without fetching content. -->

<template>
  <div class="proto-wiki">
    <header class="proto-wiki__site-header">
      <div class="proto-wiki__chrome">
        <CdxButton
          class="proto-wiki__chrome-button"
          weight="quiet"
          type="button"
          aria-label="Main menu unavailable in this prototype"
          disabled
        >
          <CdxIcon :icon="cdxIconMenu" />
        </CdxButton>

        <router-link :to="{ name: 'hub' }" class="proto-wiki__wordmark">
          <span class="proto-wiki__wordmark-name">Wikipedia</span>
          <span class="proto-wiki__wordmark-tagline">The Free Encyclopedia</span>
        </router-link>

        <div class="proto-wiki__chrome-actions">
          <CdxButton
            class="proto-wiki__chrome-button"
            weight="quiet"
            type="button"
            aria-label="Search unavailable in this prototype"
            disabled
          >
            <CdxIcon :icon="cdxIconSearch" />
          </CdxButton>
          <CdxButton
            class="proto-wiki__chrome-button"
            weight="quiet"
            type="button"
            aria-label="User menu unavailable in this prototype"
            disabled
          >
            <CdxIcon :icon="cdxIconUserAvatar" />
          </CdxButton>
        </div>
      </div>
    </header>

    <main class="proto-wiki__main">
      <article class="proto-wiki__article">
        <header class="proto-wiki__article-header">
          <h1 class="proto-wiki__article-title">{{ article.title }}</h1>
          <p class="proto-wiki__article-description">{{ article.description }}</p>
        </header>

        <section
          v-for="(section, sectionIndex) in article.sections"
          :key="`${section.heading}-${sectionIndex}`"
          class="proto-wiki__section"
          :aria-labelledby="section.heading ? `article-section-${sectionIndex}` : undefined"
          :aria-label="section.heading ? undefined : 'Introduction'"
        >
          <h2
            v-if="section.heading"
            :id="`article-section-${sectionIndex}`"
            class="proto-wiki__section-heading"
          >
            {{ section.heading }}
          </h2>

          <p
            v-for="(paragraph, paragraphIndex) in section.paragraphs"
            :key="paragraphIndex"
            class="proto-wiki__paragraph"
          >
            <template v-for="(segment, segmentIndex) in paragraph" :key="segmentIndex">
              <a
                v-if="segment.missingLink"
                class="proto-wiki__missing-link"
                :href="missingLinkHref"
                :aria-label="`${segment.text} — article does not exist`"
                @click.prevent="emit('activate-missing-link', segment.text)"
              >
                {{ segment.text }}
              </a>
              <template v-else>{{ segment.text }}</template>
            </template>
          </p>
        </section>
      </article>
    </main>

    <footer class="proto-wiki__footer">
      <p>Text is available under the Creative Commons Attribution-ShareAlike License.</p>
    </footer>
  </div>
</template>

<script setup>
import { CdxButton, CdxIcon } from '@wikimedia/codex'
import { cdxIconMenu, cdxIconSearch, cdxIconUserAvatar } from '@wikimedia/codex-icons'

defineProps({
  article: {
    type: Object,
    required: true,
  },
  missingLinkHref: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['activate-missing-link'])
</script>

<style scoped>
.proto-wiki {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--background-color-base);
  color: var(--color-base);
}

.proto-wiki__site-header {
  border-bottom: var(--border-subtle);
}

.proto-wiki__chrome {
  width: 100%;
  max-width: 72rem;
  min-height: var(--min-size-interactive-touch);
  margin: 0 auto;
  padding: var(--spacing-50) var(--spacing-100);
  display: flex;
  align-items: center;
  gap: var(--spacing-50);
}

.proto-wiki__chrome-button {
  flex: 0 0 auto;
}

.proto-wiki__wordmark {
  min-width: 0;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  color: var(--color-base);
  text-decoration: none;
}

.proto-wiki__wordmark:hover {
  text-decoration: none;
}

.proto-wiki__wordmark-name {
  font-family: var(--font-family-heading-main);
  font-size: var(--font-size-x-large);
  line-height: var(--line-height-x-large);
}

.proto-wiki__wordmark-tagline {
  font-family: var(--font-family-system-sans);
  font-size: var(--font-size-x-small);
  line-height: var(--line-height-x-small);
}

.proto-wiki__chrome-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-25);
}

.proto-wiki__main {
  width: 100%;
  flex: 1;
  padding: var(--spacing-150) var(--spacing-100) var(--spacing-300);
}

.proto-wiki__article {
  max-width: 44rem;
  margin: 0 auto;
}

.proto-wiki__article-header {
  padding-bottom: var(--spacing-75);
  border-bottom: var(--border-subtle);
}

.proto-wiki__article-title {
  margin: 0;
  font-family: var(--font-family-heading-main);
  font-size: var(--font-size-xxx-large);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-xxx-large);
}

.proto-wiki__article-description {
  margin: var(--spacing-25) 0 0;
  color: var(--color-subtle);
  font-size: var(--font-size-small);
  line-height: var(--line-height-small);
}

.proto-wiki__section {
  margin-top: var(--spacing-150);
}

.proto-wiki__section:first-of-type {
  margin-top: var(--spacing-100);
}

.proto-wiki__section-heading {
  margin: 0 0 var(--spacing-75);
  padding-bottom: var(--spacing-25);
  border-bottom: var(--border-subtle);
  font-family: var(--font-family-heading-main);
  font-size: var(--font-size-xx-large);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-xx-large);
}

.proto-wiki__paragraph {
  margin: 0 0 var(--spacing-100);
  font-family: var(--font-family-serif);
  font-size: var(--font-size-medium);
  line-height: var(--line-height-content);
}

.proto-wiki__missing-link,
.proto-wiki__missing-link:visited {
  color: var(--color-link-red);
  text-decoration: var(--text-decoration-underline);
  text-decoration-thickness: from-font;
  text-underline-offset: var(--spacing-12);
}

.proto-wiki__missing-link:visited {
  color: var(--color-link-red--visited);
}

.proto-wiki__missing-link:hover {
  color: var(--color-link-red--hover);
}

.proto-wiki__missing-link:visited:hover {
  color: var(--color-link-red--visited--hover);
}

.proto-wiki__missing-link:active {
  color: var(--color-link-red--active);
}

.proto-wiki__missing-link:visited:active {
  color: var(--color-link-red--visited--active);
}

.proto-wiki__missing-link:focus {
  color: var(--color-link-red--focus);
}

.proto-wiki__missing-link:focus-visible {
  outline: var(--border-width-thick) var(--border-style-base)
    var(--outline-color-progressive--focus);
  outline-offset: var(--spacing-12);
}

.proto-wiki__footer {
  border-top: var(--border-subtle);
  padding: var(--spacing-150) var(--spacing-100);
  color: var(--color-subtle);
  font-size: var(--font-size-small);
  line-height: var(--line-height-small);
}

.proto-wiki__footer p {
  max-width: 44rem;
  margin: 0 auto;
}

@media (min-width: 640px) {
  .proto-wiki__chrome,
  .proto-wiki__main,
  .proto-wiki__footer {
    padding-right: var(--spacing-200);
    padding-left: var(--spacing-200);
  }

  .proto-wiki__main {
    padding-top: var(--spacing-300);
  }

  .proto-wiki__article-title {
    font-size: var(--font-size-xxx-large);
  }
}
</style>
