<script setup lang="ts">
import { onMounted, onUnmounted, useId, useTemplateRef } from "vue";
import { useRotate, type AnimHandle } from "../../lib/gsap";

const props = defineProps<{ words: string }>();

const svg = useTemplateRef<SVGSVGElement>("svg");
const pathId = `badge-ring-${useId()}`;
let handle: AnimHandle | null = null;

onMounted(() => {
  if (svg.value) handle = useRotate(svg.value, { duration: 28 });
});
onUnmounted(() => handle?.kill());
</script>

<template>
  <div class="relative grid place-items-center" aria-hidden="true">
    <svg ref="svg" viewBox="0 0 100 100" class="h-full w-full">
      <defs>
        <path
          :id="pathId"
          d="M50,50 m-41,0 a41,41 0 1,1 82,0 a41,41 0 1,1 -82,0"
          fill="none"
        />
      </defs>
      <text class="ring-text">
        <textPath :href="`#${pathId}`">{{ props.words }}</textPath>
      </text>
    </svg>
    <span class="absolute h-1.5 w-1.5 rounded-full bg-accent"></span>
  </div>
</template>

<style scoped>
.ring-text {
  font-family: var(--font-sans);
  font-size: 7.4px;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  fill: var(--color-accent);
  opacity: 0.85;
}
</style>
