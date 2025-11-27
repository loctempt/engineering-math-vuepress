<template>
    <div class="auth-view">
        <ClientOnly>
            <!-- avatar view -->
            <div v-if="isLoggedIn" class="auth-view-avatar">
                <NaiveUIConfigProvider>
                    <n-dropdown trigger="hover" :options="avatarDropdownOptions" @select="handleSelect">
                        <n-avatar round size="medium" :src="userStore.user?.value.avatar"
                            fallback-src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg" />
                    </n-dropdown>
                </NaiveUIConfigProvider>
            </div>
            <!-- login view -->
            <div v-else>
                <NaiveUIConfigProvider>
                    <n-button quaternary round @click="handleLogin">
                        登录
                    </n-button>
                </NaiveUIConfigProvider>
            </div>
            <!-- <i-fa6-solid-right-from-bracket /> -->
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue';
import { useUserStore } from '../stores/user'
import authService from '../services/auth'
import { NButton, NAvatar, NDropdown } from 'naive-ui'
import { Icon } from '@iconify/vue';
import NaiveUIConfigProvider from './NaiveUIConfigProvider.vue';

const userStore = useUserStore()
const isLoggedIn = userStore.isLoggedIn

const avatarDropdownOptions = [
    {
        label: '退出登录',
        icon: () => {
            return h(Icon, { icon: "fa6-solid:right-from-bracket" })
        },
        key: 'logout'
    }
];

const handleSelect = (key: string | number) => {
    console.log("[haldleSelect] dropdown selected, key: ", key)
    switch (String(key)) {
        case "logout": handleLogout(); break;
    }
}

const handleLogout = () => {
    userStore.logout()
    location.reload();
}

const handleLogin = async () => {
    try {
        const result = await authService.login()

        // Update user store
        userStore.setUser(result.user, result.token)

        console.log('Login successful:', result.user.display_name)
        location.reload();
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : '登录失败，请重试'
        console.error('Login failed:', error)
    }
}

</script>

<style lang="css">
.auth-view {
    padding-right: 5px;
}

.n-config-provider {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>