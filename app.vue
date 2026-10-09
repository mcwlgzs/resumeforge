<script setup lang="ts">
import { TooltipProvider } from 'reka-ui'
</script>

<template>
  <TooltipProvider :delay-duration="220" :skip-delay-duration="300">
    <NuxtPage />
  </TooltipProvider>
</template>
