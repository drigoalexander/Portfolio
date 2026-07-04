<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useMagnetic, type AnimHandle } from "../../lib/gsap";

const props = withDefaults(defineProps<{ label?: string }>(), { label: "Hover me" });
const el = ref<HTMLButtonElement | null>(null);
let handle: AnimHandle | null = null;

onMounted(() => {
  if (el.value) handle = useMagnetic(el.value, { strength: 0.5 });
});
onUnmounted(() => handle?.kill());
</script>

<template>
  <button
    ref="el"
    class="inline-flex items-center gap-2 rounded-full border border-accent bg-surface px-8 py-4 text-ink"
  >
    {{ props.label }}
  </button>
</template>
