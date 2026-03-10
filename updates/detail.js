import { marked } from 'marked';
import { t, initLanguageSwitcher } from './i18n.js';

const entry = window.__UPDATE_ENTRY__ || {};
const contentEl = document.getElementById('update-content');
const shareButtons = document.querySelectorAll('[data-share]');

marked.setOptions({
    gfm: true,
    breaks: false,
    mangle: false,
    headerIds: true
});

function stripFrontMatter(markdown = '') {
    const match = markdown.match(/^---\s*[\r\n]+([\s\S]*?)\r?\n---\s*/);
    if (!match) return markdown;
    return markdown.slice(match[0].length).trimStart();
}

async function refreshContent() {
    if (!entry.file || !contentEl) return;
    try {
        const response = await fetch(`/updates/${entry.file}?_=${Date.now()}`);
        if (!response.ok) throw new Error('Unable to load Markdown file');
        const markdown = await response.text();
        const html = marked.parse(stripFrontMatter(markdown));
        contentEl.innerHTML = html;
    } catch (error) {
        console.warn('Failed to refresh Markdown content', error);
    }
}

async function copyToClipboard(text, button) {
    try {
        await navigator.clipboard.writeText(text);
        const span = button.querySelector('span');
        if (span) {
            const originalText = t('copy.link');
            span.textContent = t('copied');
            setTimeout(() => (span.textContent = originalText), 2000);
        }
    } catch (error) {
        console.warn('Clipboard unavailable', error);
    }
}

function composeShareMessage() {
    return `${entry.title}\n\n${entry.summary || ''}\n${entry.canonicalUrl || window.location.href}`.trim();
}

function handleShare(action, button) {
    const url = entry.canonicalUrl || window.location.href;
    if (action === 'copy') {
        copyToClipboard(url, button);
        return;
    }

    if (action === 'x') {
        const shareUrl = new URL('https://x.com/intent/tweet');
        shareUrl.searchParams.set('text', composeShareMessage());
        window.open(shareUrl.toString(), '_blank', 'noopener');
        return;
    }

    if (navigator.share) {
        navigator.share({
            title: entry.title,
            text: entry.summary,
            url
        }).catch(() => {
            /* no-op */
        });
    }
}

shareButtons.forEach((button) => {
    button.addEventListener('click', () => handleShare(button.dataset.share, button));
});

// Initialize language switcher and refresh content
initLanguageSwitcher();
refreshContent();
