// i18n configuration and language switcher
const translations = {
    zh: {
        // 列表页 - List Page
        'hero.eyebrow': '更新日志 · 产品日记',
        'hero.title': '更新',
        'hero.summary': '我们发布的所有功能，帮助你重新爱上英语阅读。',
        'back.to.lfeed': '← 返回 L-feed',
        'hero.publish': '几分钟内发布：',
        'hero.step1': '创建 updates/YYYY-MM-DD-slug.md',
        'hero.step2': '填写标题、日期、摘要',
        'hero.step3': '提交并部署',
        'hero.step4': '其余的由站点自动完成。',
        'loading': '正在加载更新…',
        'no.updates': '暂无更新。创建你的第一个 Markdown 文件开始吧。',
        'min.read': '分钟阅读',
        'read.update': '阅读更新 →',
        'show.older': '显示更早的更新',
        // SEO部分 - SEO Section
        'seo.title': '为什么要发布更新？',
        'seo.desc': 'L-feed 公开开发。每次发布、改进和实验都会在这里发布，以便学习者可以跟随这个旅程。',
        'seo.seo.title': 'SEO 友好',
        'seo.seo.desc': '每次更新都是可爬取的，具有规范的 URL、元数据和从 Markdown 生成的干净 HTML。',
        'seo.shareable.title': '可分享',
        'seo.shareable.desc': '一键复制链接或发布到社交媒体。更新也可用作发布说明。',
        'seo.maintenance.title': '低维护',
        'seo.maintenance.desc': '无数据库——只需 Markdown 文件和自动构建步骤。',
        // 详情页 - Detail Page
        'back.to.updates': '← 返回所有更新',
        'share.label': '分享给朋友',
        'share.desc': '将此更新分享给你的社区。',
        'copy.link': '复制链接',
        'copied': '已复制！',
        'share.to.x': '分享到 X',
    },
    en: {
        // 列表页 - List Page
        'hero.eyebrow': 'Changelog · Product Journal',
        'hero.title': 'Updates',
        'hero.summary': 'Everything we shipped to help you fall in love with English reading again.',
        'back.to.lfeed': '← Back to L-feed',
        'hero.publish': 'Publish in minutes:',
        'hero.step1': 'Create updates/YYYY-MM-DD-slug.md',
        'hero.step2': 'Write title, date, summary',
        'hero.step3': 'Commit & deploy',
        'hero.step4': 'The site does the rest.',
        'loading': 'Loading updates…',
        'no.updates': 'No updates yet. Create your first Markdown file to get started.',
        'min.read': 'min read',
        'read.update': 'Read update →',
        'show.older': 'Show older updates',
        // SEO部分 - SEO Section
        'seo.title': 'Why publish updates?',
        'seo.desc': 'L-feed builds in public. Every release, improvement, and experiment lands here so learners can follow the journey.',
        'seo.seo.title': 'SEO friendly',
        'seo.seo.desc': 'Each update is crawlable with canonical URLs, metadata, and clean HTML generated from Markdown.',
        'seo.shareable.title': 'Shareable',
        'seo.shareable.desc': 'One click to copy a link or post to social media. Updates double as launch notes.',
        'seo.maintenance.title': 'Low maintenance',
        'seo.maintenance.desc': 'No database—just Markdown files and an automated build step.',
        // 详情页 - Detail Page
        'back.to.updates': '← Back to all updates',
        'share.label': 'Spread the word',
        'share.desc': 'Share this update with your community.',
        'copy.link': 'Copy link',
        'copied': 'Copied!',
        'share.to.x': 'Share to X',
    }
};

// Detect browser language or use saved preference
function getInitialLanguage() {
    const saved = localStorage.getItem('lang');
    if (saved && (saved === 'zh' || saved === 'en')) {
        return saved;
    }
    // Auto-detect based on browser language
    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang.startsWith('zh') ? 'zh' : 'en';
}

// Current language
let currentLang = getInitialLanguage();

// Get translation for a key
function t(key) {
    return translations[currentLang][key] || translations.en[key] || key;
}

// Set language and update all marked elements
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    updatePageLanguage();
    updateLanguageSwitcher();
}

// Update all elements with data-i18n attribute
function updatePageLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = t(key);
        if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
            el.placeholder = translation;
        } else {
            el.textContent = translation;
        }
    });
}

// Update language switcher button text
function updateLanguageSwitcher() {
    const switcher = document.querySelector('[data-lang-switcher]');
    if (switcher) {
        switcher.textContent = currentLang === 'zh' ? 'English' : '中文';
        switcher.setAttribute('aria-label', currentLang === 'zh' ? 'Switch to English' : '切换到中文');
    }
}

// Initialize language switcher
let initialized = false;
function initLanguageSwitcher() {
    if (initialized) return;
    initialized = true;

    updatePageLanguage();
    updateLanguageSwitcher();

    const switcher = document.querySelector('[data-lang-switcher]');
    if (switcher) {
        switcher.addEventListener('click', () => {
            setLanguage(currentLang === 'zh' ? 'en' : 'zh');
        });
        console.log('[i18n] Language switcher initialized');
    } else {
        console.warn('[i18n] Language switcher button not found');
    }
}

// Always wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguageSwitcher);
} else {
    // DOM is already ready, use setTimeout to ensure all elements are rendered
    setTimeout(initLanguageSwitcher, 0);
}

// Export for use in other scripts
export { t, setLanguage, currentLang, initLanguageSwitcher };
