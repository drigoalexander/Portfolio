<script setup lang="ts">
import { computed, onMounted, onUnmounted, shallowRef } from "vue";
import { motion } from "motion-v";
import { prefersReducedMotion } from "../../lib/gsap";

export interface IndicatorChapter {
  id: string;
  num: string;
  label: string;
  tone: "dark" | "sand";
}

const props = defineProps<{ chapters: IndicatorChapter[] }>();

const active = shallowRef(0);
const current = computed(() => props.chapters[active.value] ?? props.chapters[0]);
/** deterministic waveform silhouette, tallest at the active chapter */
const barHeight = (i: number) => 8 + ((i * 5) % 11) + (i === active.value ? 8 : 0);
const barTransition = prefersReducedMotion()
  ? { duration: 0 }
  : { type: "spring" as const, stiffness: 260, damping: 22 };

let observer: IntersectionObserver | null = null;

onMounted(() => {
  const sections = document.querySelectorAll<HTMLElement>("[data-chapter]");
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const idx = Number((entry.target as HTMLElement).dataset.chapter);
        if (!Number.isFinite(idx)) continue;
        active.value = idx;
        document.documentElement.dataset.ground = props.chapters[idx]?.tone ?? "dark";
      }
    },
    // a thin band across the viewport's center decides the active chapter
    { rootMargin: "-45% 0px -45% 0px" },
  );
  sections.forEach((s) => observer?.observe(s));
});
onUnmounted(() => observer?.disconnect());
</script>

<template>
  <div
    class="indicator fixed bottom-6 left-10 z-40 hidden items-end gap-4 select-none sm:flex md:left-[calc(7vw+1.5rem)]"
    aria-hidden="true"
  >
    <div class="flex items-end gap-0.75" role="presentation">
      <motion.span
        v-for="(c, i) in props.chapters"
        :key="c.id"
        class="bar w-0.5"
        :class="{ lit: i <= active }"
        :initial="false"
        :animate="{ height: barHeight(i) }"
        :transition="barTransition"
      />
    </div>
    <p class="font-sans text-[10px] tracking-[0.35em] uppercase">
      {{ current?.num }} / {{ props.chapters.at(-1)?.num }} — {{ current?.label }}
    </p>
  </div>
</template>

<style scoped>
.indicator {
  color: var(--color-muted);
}
:root[data-ground="sand"] .indicator {
  color: var(--color-sand-ink-soft);
}
.bar {
  background-color: currentColor;
  opacity: 0.25;
  transition: opacity 0.5s ease, background-color 0.5s ease;
}
.bar.lit {
  background-color: var(--color-accent);
  opacity: 1;
}
:root[data-ground="sand"] .bar.lit {
  background-color: var(--color-sand-ink);
}
</style>
