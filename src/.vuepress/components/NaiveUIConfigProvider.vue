<template>
    <ClientOnly>
        <n-config-provider :theme="naiveTheme">
            <slot />
        </n-config-provider>
    </ClientOnly>
</template>

<script setup>
import { NConfigProvider } from 'naive-ui';
import { naiveThemeRef } from '../composables/useNaiveReactiveTheme'
import { watch } from 'vue'

const naiveTheme = naiveThemeRef;
watch(
    naiveThemeRef,
    (newval) => {
        console.log("[NaiveUIConfigProvider] naiveThemeRef: ", newval)
    }
)
</script>