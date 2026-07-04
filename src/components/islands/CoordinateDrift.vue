<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useScrollProgress, type AnimHandle } from "../../lib/gsap";

/**
 * Local → global, literally: the coordinates drift from Jakarta across the
 * Pacific to San Francisco as the story scrolls.
 */
const JAKARTA = { lat: -6.2088, lon: 106.8456, label: "Jakarta" };
const SAN_FRANCISCO = { lat: 37.7749, lon: -122.4194, label: "San Francisco" };
// travel east across the date line, not backwards over Europe
const LON_EAST = 360 + SAN_FRANCISCO.lon;

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

const coords = ref(`${fmt(JAKARTA.lat, "lat")} ${fmt(JAKARTA.lon, "lon")}`);
const place = ref(JAKARTA.label);

let handle: AnimHandle | null = null;

onMounted(() => {
  handle = useScrollProgress((p) => {
    const lat = JAKARTA.lat + (SAN_FRANCISCO.lat - JAKARTA.lat) * p;
    const lon = JAKARTA.lon + (LON_EAST - JAKARTA.lon) * p;
    coords.value = `${fmt(lat, "lat")} ${fmt(lon, "lon")}`;
    place.value = p < 0.5 ? JAKARTA.label : SAN_FRANCISCO.label;
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
