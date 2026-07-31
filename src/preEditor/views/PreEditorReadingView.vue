<!-- ABOUTME: Binds the frozen article fixture to the isolated semantic reading shell. -->
<!-- ABOUTME: Converts the native missing-link activation into the setup route contract. -->

<template>
  <ProtoWikiArticleShell
    :article="personJourney.article"
    :missing-link-href="articleGuidanceHref"
    @activate-missing-link="openArticleGuidance"
  />
</template>

<script setup>
import { useRouter } from 'vue-router'

import ProtoWikiArticleShell from '../components/ProtoWikiArticleShell.vue'
import { personJourney } from '../data/explorationJourneys.js'

const router = useRouter()
const articleGuidanceTarget = {
  name: 'article-guidance',
  query: {
    step: 'subject',
    title: personJourney.subject.title,
    source: 'redlink',
    variant: personJourney.handoff.variant,
  },
}
const articleGuidanceHref = router.resolve(articleGuidanceTarget).href

function openArticleGuidance() {
  router.push(articleGuidanceTarget)
}
</script>
