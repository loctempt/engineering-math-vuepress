// .vuepress/plugins/test-plugin.ts
import type { Plugin } from '@vuepress/core';

const testPlugin = (options: object) => {
    console.log('[TestPlugin] Plugin loaded with name:', 'plugin-test');
    return {
        name: 'plugin-test',
        onPrepared: () => {
            console.log('[TestPlugin] onPrepared hook called', options);
        },
        onInitialized: () => {
            console.log('[TestPlugin] onInitialized hook called');
        }
    };
};

export default testPlugin;