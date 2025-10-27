// .vuepress/plugins/paragraph-comment.ts
import type { Plugin } from '@vuepress/core';
import MarkdownIt from 'markdown-it';
import { Token } from 'markdown-it/lib/token.mjs';

// 定义插件选项接口 (name 是必需的)
interface ParagraphCommentPluginOptions {
    name: string;
}

// 默认选项
const DEFAULT_OPTIONS: Required<ParagraphCommentPluginOptions> = {
    name: 'paragraph-comment',
};

// 定义一个接口来扩展 Token，以便安全地添加自定义属性
interface ExtendedToken extends Token {
    meta?: Token['meta'] & {
        commentId?: string;
    };
}

// 定义你想要处理的顶级标签
const TOP_LEVEL_TAGS = ['p', 'ul', 'ol', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table'];

const paragraphCommentPlugin = (options: ParagraphCommentPluginOptions = DEFAULT_OPTIONS) => {
    const resolvedOptions = { ...DEFAULT_OPTIONS, ...options };
    const { name } = resolvedOptions;

    const wrapperStartTemplate = (id: string) => `<CommentableParagraph id="${id}">`;
    const wrapperEndTemplate = '</CommentableParagraph>';

    console.log('[ParagraphCommentPlugin] Plugin loaded with options:', resolvedOptions);
    console.log('[ParagraphCommentPlugin] Resolved options (excluding name):', { tags: TOP_LEVEL_TAGS });

    const getPageId = (env: any): string => {
        const pagePath = (env && env.page && env.page.path) ? env.page.path : 'unknown-page';
        return pagePath.replace(/\//g, '_').replace(/[^a-zA-Z0-9_-]/g, '_');
    };

    const pageCounters = new Map<string, number>();

    return {
        name,

        // 使用 extendsMarkdown 钩子来修改 MarkdownIt 实例
        extendsMarkdown: async (md: MarkdownIt) => {
            console.log('[ParagraphCommentPlugin] extendsMarkdown hook called');
            console.log('[ParagraphCommentPlugin] Top-level tags to process:', TOP_LEVEL_TAGS);

            if (!md.renderer) {
                console.error("VuePress plugin: md.renderer is undefined.");
                return;
            }

            // --- 1. 添加 core 规则来为顶级标签添加 comment-stub class 和 id ---
            md.core.ruler.push('add_comment_stub_class', (state) => {
                const tokens = state.tokens;
                const env = state.env; // 可用于获取页面信息
                const pageId = getPageId(env);
                let counter = pageCounters.get(pageId) ?? 0;

                let level = 0;
                for (let i = 0; i < tokens.length; i++) {
                    const token = tokens[i];

                    // --- 检查是否为顶级的指定标签 open token ---
                    // 此时 level 代表的是 token[i-1] 处理后的嵌套层级
                    // 如果当前 token 是顶级的 (level === 0)，且是 open token
                    if (level === 0 && token.nesting === 1) {
                        const tokenType = token.type;
                        let tagToProcess: string | null = null;

                        if (tokenType === 'paragraph_open') {
                            tagToProcess = 'p';
                        } else if (tokenType === 'bullet_list_open') {
                            tagToProcess = 'ul';
                        } else if (tokenType === 'ordered_list_open') {
                            tagToProcess = 'ol';
                        } else if (tokenType === 'heading_open') {
                            tagToProcess = token.tag; // e.g., 'h1', 'h2'
                        } else if (tokenType === 'table_open') {
                            tagToProcess = 'table';
                        }

                        if (tagToProcess && TOP_LEVEL_TAGS.includes(tagToProcess)) {
                            // 添加 comment-stub class 到 open token
                            const existingClass: string = token.attrGet('class');
                            if (existingClass !== null && existingClass.includes('comment-stub')) {
                                continue;
                            }
                            const newClass = existingClass ? `${existingClass} comment-stub` : 'comment-stub';
                            token.attrSet('class', newClass);

                            // 生成并存储序列化的 id
                            const uniqueId = `${tagToProcess}-${pageId}-${counter}`;
                            (token as ExtendedToken).meta = {
                                ...(token as ExtendedToken).meta,
                                commentId: uniqueId,
                            };
                            counter++; // 更新计数器

                            console.log(`[ParagraphCommentPlugin] Added comment-stub class and stored ID "${uniqueId}" in meta for top-level ${tagToProcess} open token at index ${i}`);

                            // 为对应的 close token 设置一个标记（例如，在其 meta 中也存储 ID）
                            // 从 i+1 开始查找，直到找到 nesting === -1 且 type 匹配的 token
                            let closeLevel = 1; // 因为我们刚遇到一个 open token
                            for (let j = i + 1; j < tokens.length; j++) {
                                const currentToken = tokens[j];
                                if (currentToken.nesting === 1) {
                                    closeLevel++;
                                } else if (currentToken.nesting === -1) {
                                    closeLevel--;
                                    if (closeLevel === 0 && currentToken.type === tokenType.replace('_open', '_close')) {
                                        // 找到对应的 close token
                                        (currentToken as ExtendedToken).meta = {
                                            ...(currentToken as ExtendedToken).meta,
                                            commentId: uniqueId, // 将 ID 也存储在 close token 的 meta 中
                                        };
                                        console.log(`[ParagraphCommentPlugin] Stored ID "${uniqueId}" in meta for corresponding ${tagToProcess} close token at index ${j}`);
                                        break; // 找到后退出内层循环
                                    }
                                }
                            }
                        }
                    }

                    // --- 在循环末尾更新 level ---
                    if (token.nesting === 1) {
                        level++;
                    } else if (token.nesting === -1) {
                        level--;
                    }
                    // 注意：level 的计算是在处理完当前 token 的逻辑之后进行的
                    // 这样在下一次循环开始时，level 就代表了当前 token 应该处于的层级
                }
                // 更新计数器
                pageCounters.set(pageId, counter);
            });

            // --- 2. 修改 renderer 规则，检查 token.meta.commentId ---
            const ruleNamesToModify = [
                'paragraph_open', 'paragraph_close',
                'bullet_list_open', 'bullet_list_close',
                'ordered_list_open', 'ordered_list_close',
                'heading_open', 'heading_close',
                'table_open', 'table_close'
            ];

            ruleNamesToModify.forEach(ruleName => {
                const originalRule = md.renderer.rules[ruleName];
                md.renderer.rules[ruleName] = (tokens, idx, options, env, self) => {
                    const token: Token = tokens[idx] as ExtendedToken; // 类型断言
                    // 检查 meta 中是否有 commentId
                    const commentId = token.meta?.commentId;

                    if (commentId) {
                        // 是需要评论的标签
                        if (ruleName.endsWith('_open')) {
                            console.log(`[ParagraphCommentPlugin] Wrapping top-level open token ${token.type} with ID ${commentId} at index ${idx}`);
                            const originalHtml = originalRule
                                ? originalRule(tokens, idx, options, env, self)
                                : self.renderToken(tokens, idx, options);
                            // 确保渲染的 HTML open 标签也包含 comment-stub class
                            const originalHtmlWithClass = originalHtml.replace(
                                /(<\w+\s*(?:[^>]*?\s+)?)/i, // 匹配标签开始
                                (match) => {
                                    if (!/\bclass\s*=\s*["'][^"']*comment-stub/i.test(match)) {
                                        return match.replace(/(<\w+\s*)/, `$1`);
                                    }
                                    return match; // 如果已有 comment-stub，直接返回
                                }
                            );
                            return wrapperStartTemplate(commentId) + originalHtmlWithClass;
                        } else { // _close
                            console.log(`[ParagraphCommentPlugin] Wrapping top-level close token ${token.type} with ID ${commentId} at index ${idx}`);
                            const originalHtml = originalRule
                                ? originalRule(tokens, idx, options, env, self)
                                : self.renderToken(tokens, idx, options);
                            // close 标签本身不带 class，直接返回原 HTML + 结束标签
                            return originalHtml + wrapperEndTemplate;
                        }
                    } else {
                        // 不是需要评论的标签，使用原始规则
                        return originalRule
                            ? originalRule(tokens, idx, options, env, self)
                            : self.renderToken(tokens, idx, options);
                    }
                };
            });

            // --- 3. 移除了 html_block 规则处理 ---
            // 因为 html_block 不涉及 open/close 成对的 meta 逻辑，且可能引入复杂性
            // 如果确实需要处理顶级 html_block <p>，需要单独设计一套不依赖 meta 的逻辑
        },
    };
};

export default paragraphCommentPlugin;