<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useScrollProgress, type AnimHandle } from "../../lib/gsap";

/**
 * Local → global, literally: the coordinates trace the real journey as the
 * story scrolls — Jakarta (Sari Tirta) → Australia (NexLaw) → Hong Kong
 * (Mazecare) → Wyoming (Tesserac), then full circle home for the epilogue.
 * Longitudes keep heading east (past 180°, past 360°) so the drift reads
 * as one trip around the world, never a backtrack. Each stop's `p` matches
 * that chapter's share of the scroll (8 equal sections).
 */
const STOPS = [
  { p: 0.0, lat: -6.2088, lon: 106.8456, label: "Jakarta" }, // 00 · hero
  { p: 0.143, lat: -6.2088, lon: 106.8456, label: "Jakarta" }, // 01 · Sari Tirta
  { p: 0.285, lat: -33.8688, lon: 151.2093, label: "Australia (Remote)" }, // 02 · NexLaw
  { p: 0.428, lat: 22.3193, lon: 114.1694, label: "Hong Kong (Remote)" }, // 03 · Mazecare
  { p: 0.57, lat: 22.3193, lon: 114.1694, label: "Hong Kong (Remote)" }, // 04 · the leap
  { p: 0.713, lat: 41.14, lon: 360 - 104.82, label: "Wyoming (Remote)" }, // 05 · Tesserac
  { p: 0.856, lat: 41.14, lon: 360 - 104.82, label: "Wyoming (Remote)" }, // 06 · ethos
  { p: 1.0, lat: -6.2088, lon: 360 + 106.8456, label: "Anywhere" }, // 07 · home
] as const;

function fmt(deg: number, axis: "lat" | "lon"): string {
  let d = deg;
  if (axis === "lon") d = ((((d + 180) % 360) + 360) % 360) - 180;
  const dir = axis === "lat" ? (d < 0 ? "S" : "N") : d < 0 ? "W" : "E";
  const abs = Math.abs(d);
  let whole = Math.floor(abs);
  let mins = Math.round((abs - whole) * 60);
  if (mins === 60) {
    whole += 1;
    mins = 0;
  }
  return `${String(whole).padStart(2, "0")}°${String(mins).padStart(2, "0")}'${dir}`;
}

const first = STOPS[0]!;
const coords = ref(`${fmt(first.lat, "lat")} ${fmt(first.lon, "lon")}`);
const place = ref<string>(first.label);

let handle: AnimHandle | null = null;

onMounted(() => {
  handle = useScrollProgress((p) => {
    const clamped = Math.min(Math.max(p, 0), 1);
    const next = STOPS.findIndex((s) => s.p >= clamped);
    const i = Math.max(1, next === -1 ? STOPS.length - 1 : next);
    const a = STOPS[i - 1]!;
    const b = STOPS[i]!;
    const t = b.p === a.p ? 0 : (clamped - a.p) / (b.p - a.p);
    const lat = a.lat + (b.lat - a.lat) * t;
    const lon = a.lon + (b.lon - a.lon) * t;
    coords.value = `${fmt(lat, "lat")} ${fmt(lon, "lon")}`;
    place.value = t < 0.5 ? a.label : b.label;
  });
});
onUnmounted(() => handle?.kill());
</script>

<template>
  <p
    class="drift fixed right-6 bottom-6 z-40 hidden items-center gap-3 font-sans text-[10px] tracking-[0.35em] uppercase tabular-nums select-none md:flex md:right-[5vw]"
    aria-hidden="true"
  >
    <span class="pulse inline-block h-1.5 w-1.5 rounded-full bg-current" />
    <span>{{ coords }} — {{ place }}</span>
  </p>
</template>

<style scoped>
.drift {
  color: var(--color-muted);
  transition: color 0.5s ease;
}
:root[data-ground="sand"] .drift {
  color: var(--color-sand-ink-soft);
}
.pulse {
  animation: drift-pulse 2.4s ease-in-out infinite;
}
@keyframes drift-pulse {
  0%,
  100% {
    opacity: 0.35;
  }
  50% {
    opacity: 1;
  }
}
</style>
