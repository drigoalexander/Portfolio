<script setup lang="ts">
import { computed, onMounted, onUnmounted, shallowRef } from "vue";

export interface IndicatorChapter {
  id: string;
  num: string;
  label: string;
  tone: "dark" | "sand";
}

const props = defineProps<{ chapters: IndicatorChapter[] }>();

const active = shallowRef(0);
const current = computed(() => props.chapters[active.value] ?? props.chapters[0]);
/** deterministic waveform silhouette; the active bar stretches +8px via scaleY */
const barBase = (i: number) => 8 + ((i * 5) % 11);
const litScale = (i: number) => ((barBase(i) + 8) / barBase(i)).toFixed(3);

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
      <span
        v-for="(c, i) in props.chapters"
        :key="c.id"
        class="bar w-0.5"
        :class="{ lit: i <= active, tall: i === active }"
        :style="{ height: barBase(i) + 'px', '--lit-scale': litScale(i) }"
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
/* the ground under the HUD lightens before the act flips — a glyph halo
   (same trick as the mobile copy-scrim) keeps the label legible over it */
:root:not([data-ground="sand"]) .indicator p {
  text-shadow:
    0 0 8px rgb(20 17 11 / 0.6),
    0 0 18px rgb(20 17 11 / 0.4);
}
:root[data-ground="sand"] .indicator {
  color: var(--color-sand-ink-soft);
}
.bar {
  background-color: currentColor;
  opacity: 0.25;
  transform-origin: bottom;
  transition:
    transform 200ms var(--ease-hop),
    opacity 200ms ease,
    background-color 200ms ease;
}
.bar.tall {
  transform: scaleY(var(--lit-scale));
}
.bar.lit {
  background-color: var(--color-accent);
  opacity: 1;
}
:root[data-ground="sand"] .bar.lit {
  background-color: var(--color-sand-ink);
}
</style>
