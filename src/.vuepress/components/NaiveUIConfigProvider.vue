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

const naiveTheme = naiveThemeRef;
</script>