<!-- ABOUTME: Binds the frozen article fixture to the isolated semantic reading shell. -->
<!-- ABOUTME: Converts the native missing-link activation into the setup route contract. -->

<template>
  <ProtoWikiArticleShell
    :article="explorationArticle"
    :missing-link-hrefs="articleGuidanceHrefs"
    @activate-missing-link="openArticleGuidance"
  />
</template>

<script setup>
import { useRouter } from 'vue-router'

import ProtoWikiArticleShell from '../components/ProtoWikiArticleShell.vue'
import { explorationArticle, journeysByKey } from '../data/explorationJourneys.js'
import { buildSetupQuery } from '../flow/setupRoute.js'

const router = useRouter()
const targetFor = (journeyKey) => ({
  name: 'article-guidance',
  query: buildSetupQuery(journeysByKey[journeyKey]),
})
const articleGuidanceHrefs = Object.fromEntries(
  Object.keys(journeysByKey).map((key) => [key, router.resolve(targetFor(key)).href]),
)

function openArticleGuidance(journeyKey) {
  router.push(targetFor(journeyKey))
}
</script>
