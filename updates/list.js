import { t, initLanguageSwitcher } from './i18n.js';

// Get base path for GitHub Pages or default to root
const getBasePath = () => window.__BASE__ || '/';

const grid = document.querySelector('[data-updates-grid]');
const loadingState = document.querySelector('[data-updates-loading]');
const loadMoreBtn = document.querySelector('[data-load-more']);
const template = document.getElementById('update-card-template');

const PER_PAGE = 6;
let entries = [];
let rendered = 0;

const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
});

function formatDate(date) {
    try {
        return dateFormatter.format(new Date(`${date}T00:00:00Z`));
    } catch (err) {
        return date;
    }
}

function trimText(text, limit = 140) {
    if (!text) return '';
    return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
}

function renderBatch() {
    const slice = entries.slice(rendered, rendered + PER_PAGE);
    slice.forEach((entry) => {
        const node = template.content.cloneNode(true);
        node.querySelector('.update-date').textContent = formatDate(entry.date);
        node.querySelector('h2').textContent = entry.title;
        node.querySelector('.update-summary').textContent = trimText(entry.summary || '');
        const pill = node.querySelector('[data-pill]');
        pill.textContent = `${entry.readingMinutes || 1} ${t('min.read')}`;
        const link = node.querySelector('.update-link');
        link.href = `${getBasePath()}updates/${entry.slug}/`;
        link.setAttribute('aria-label', `Read update ${entry.title}`);
        // Update i18n for the link text
        const linkText = node.querySelector('.update-link');
        if (linkText) {
            linkText.textContent = t('read.update');
        }
        grid.appendChild(node);
    });

    rendered += slice.length;
    if (rendered >= entries.length) {
        loadMoreBtn.hidden = true;
    } else {
        loadMoreBtn.hidden = false;
    }
}

async function loadUpdates() {
    try {
        const response = await fetch(`${getBasePath()}updates/index.json?_=${Date.now()}`);
        if (!response.ok) throw new Error('Failed to load updates');
        const data = await response.json();
        entries = Array.isArray(data) ? data : [];
        if (entries.length === 0) {
            loadingState.innerHTML = `<p>${t('no.updates')}</p>`;
            return;
        }
        loadingState.hidden = true;
        grid.hidden = false;
        renderBatch();
    } catch (error) {
        console.error(error);
        loadingState.innerHTML = `<p>Unable to load updates. Please try again.</p>`;
    }
}

loadMoreBtn?.addEventListener('click', renderBatch);

// Wait for i18n to be ready, then load updates
document.addEventListener('DOMContentLoaded', () => {
    initLanguageSwitcher();
    loadUpdates();
});
