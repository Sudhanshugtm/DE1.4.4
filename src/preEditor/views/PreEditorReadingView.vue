<!-- ABOUTME: Binds the frozen article fixture to the isolated semantic reading shell. -->
<!-- ABOUTME: Converts the native missing-link activation into the setup route contract. -->

<template>
  <ProtoWikiArticleShell
    :article="personJourney.article"
    @activate-missing-link="openArticleGuidance"
  />
</template>

<script setup>
import { useRouter } from 'vue-router'

import ProtoWikiArticleShell from '../components/ProtoWikiArticleShell.vue'
import { personJourney } from '../data/personJourney.js'

const router = useRouter()

function openArticleGuidance() {
  router.push({
    name: 'article-guidance',
    query: {
      step: 'subject',
      title: personJourney.subject.title,
      source: 'redlink',
      variant: personJourney.handoff.variant,
    },
  })
}
</script>
