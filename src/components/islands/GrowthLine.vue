<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef } from "vue";
import { useGrowthLine, type AnimHandle } from "../../lib/gsap";

const path = useTemplateRef<SVGPathElement>("path");
let handle: AnimHandle | null = null;

onMounted(() => {
  if (path.value) handle = useGrowthLine(path.value);
});
onUnmounted(() => handle?.kill());
</script>

<template>
  <div
    class="growth-line pointer-events-none absolute inset-y-0 left-6 z-10 w-px md:left-[7vw]"
    aria-hidden="true"
  >
    <svg
      class="h-full w-full overflow-visible"
      viewBox="0 0 2 100"
      preserveAspectRatio="none"
      fill="none"
    >
      <defs>
        <linearGradient
          id="growth-grad"
          gradientUnits="userSpaceOnUse"
          x1="1"
          y1="0"
          x2="1"
          y2="100"
        >
          <stop offset="0" stop-color="var(--color-gold-800)" />
          <stop offset="0.55" stop-color="var(--color-gold-500)" />
          <stop offset="1" stop-color="var(--color-gold-200)" />
        </linearGradient>
      </defs>
      <path
        ref="path"
        d="M1 0 V100"
        stroke="url(#growth-grad)"
        stroke-width="1.5"
        vector-effect="non-scaling-stroke"
      />
    </svg>
  </div>
</template>
