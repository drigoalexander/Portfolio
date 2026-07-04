<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef } from "vue";
import { useCounter, formatStat, type AnimHandle } from "../../lib/gsap";

const props = withDefaults(
  defineProps<{
    value: number;
    suffix?: string;
    label: string;
    duration?: number;
    size?: "md" | "xl";
  }>(),
  { suffix: "", duration: 1.8, size: "md" },
);

const el = useTemplateRef<HTMLSpanElement>("num");
let handle: AnimHandle | null = null;

onMounted(() => {
  if (el.value) {
    handle = useCounter(el.value, {
      to: props.value,
      suffix: props.suffix,
      duration: props.duration,
    });
  }
});
onUnmounted(() => handle?.kill());
</script>

<template>
  <div class="flex flex-col gap-2">
    <span
      ref="num"
      class="font-display leading-none tabular-nums"
      :class="props.size === 'xl' ? 'text-6xl md:text-9xl' : 'text-5xl md:text-7xl'"
      >{{ formatStat(props.value, { suffix: props.suffix }) }}</span
    >
    <span class="font-sans text-[11px] tracking-[0.3em] uppercase opacity-70">
      {{ props.label }}
    </span>
  </div>
</template>
