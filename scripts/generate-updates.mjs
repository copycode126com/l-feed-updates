import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
export const UPDATES_SOURCE_DIR = path.join(projectRoot, 'updates');
const PUBLIC_UPDATES_DIR = path.join(projectRoot, 'public', 'updates');
export const DETAIL_TEMPLATE_PATH = path.join(UPDATES_SOURCE_DIR, 'detail-template.html');
const SLUG_PATTERN = /^[a-z0-9-]+$/;

const canonicalByEnv = {
  development: 'http://localhost:5173',
  test: 'https://test.lexifeed.top',
  production: 'https://www.lexifeed.top'
};

const env = process.env.NODE_ENV || 'development';
const canonicalBase = canonicalByEnv[env] || canonicalByEnv.development;

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
});

marked.setOptions({
  gfm: true,
  mangle: false,
  headerIds: true,
  breaks: false
});

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function stripMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]\([^)]*\)/g, '$1')
    .replace(/#+\s([^\n]+)/g, '$1')
    .replace(/>\s([^\n]+)/g, '$1')
    .replace(/[-*+]\s([^\n]+)/g, '$1')
    .replace(/\r?\n+/g, ' ')
    .trim();
}

function summarize(content, fallback) {
  if (fallback) return fallback.trim();
  const stripped = stripMarkdown(content);
  return stripped.slice(0, 140).trim();
}

function computeReadingMinutes(content) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

function parseDate(dateStr, filename) {
  if (!dateStr) return null;
  const date = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    console.warn(`⚠️  无法解析日期 ${dateStr} (${filename})`);
    return null;
  }
  return date;
}

function htmlEscape(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toEntry(fileName) {
  const filePath = path.join(UPDATES_SOURCE_DIR, fileName);
  const stat = fs.statSync(filePath);
  if (!stat.isFile()) return null;
  if (!fileName.endsWith('.md')) return null;
  const match = fileName.match(/^(\d{4}-\d{2}-\d{2})-([a-z0-9-]+)\.md$/);
  if (!match) {
    console.warn(`⚠️  ${fileName} 未按 YYYY-MM-DD-slug.md 规则命名, 已跳过`);
    return null;
  }
  const [, datePrefix, slug] = match;
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(raw);
  const title = (parsed.data.title || '').trim();
  const rawDate = parsed.data.date || datePrefix;
  const dateValue = typeof rawDate === 'string' ? rawDate.trim() : new Date(rawDate).toISOString().split('T')[0];
  if (!title) {
    console.warn(`⚠️  ${fileName} 缺少 title, 已跳过`);
    return null;
  }
  const parsedDate = parseDate(dateValue, fileName);
  if (!parsedDate) return null;
  const summary = summarize(parsed.content, parsed.data.summary);
  const readingMinutes = computeReadingMinutes(parsed.content);
  const formattedDate = dateFormatter.format(parsedDate);
  const isoDate = parsedDate.toISOString().split('T')[0];

  const contentHtml = marked.parse(parsed.content).trim();

  return {
    title,
    date: isoDate,
    summary,
    slug,
    file: fileName,
    readingMinutes,
    formattedDate,
    contentHtml
  };
}

function writeIndex(entries) {
  ensureDir(PUBLIC_UPDATES_DIR);
  const publicEntries = entries.map(({ title, date, summary, slug, file, readingMinutes }) => ({
    title,
    date,
    summary,
    slug,
    file,
    readingMinutes
  }));
  fs.writeFileSync(
    path.join(PUBLIC_UPDATES_DIR, 'index.json'),
    JSON.stringify(publicEntries, null, 2),
    'utf8'
  );
}

function copyMarkdown(entries) {
  for (const entry of entries) {
    fs.copyFileSync(
      path.join(UPDATES_SOURCE_DIR, entry.file),
      path.join(PUBLIC_UPDATES_DIR, entry.file)
    );
  }
}

function cleanupPublicDir() {
  if (fs.existsSync(PUBLIC_UPDATES_DIR)) {
    fs.rmSync(PUBLIC_UPDATES_DIR, { recursive: true, force: true });
  }
  ensureDir(PUBLIC_UPDATES_DIR);
}

function cleanupDetailDirs(slugs) {
  if (!fs.existsSync(UPDATES_SOURCE_DIR)) return;
  const items = fs.readdirSync(UPDATES_SOURCE_DIR, { withFileTypes: true });
  for (const item of items) {
    if (!item.isDirectory()) continue;
    if (!SLUG_PATTERN.test(item.name)) continue;
    if (!slugs.has(item.name)) {
      fs.rmSync(path.join(UPDATES_SOURCE_DIR, item.name), { recursive: true, force: true });
    }
  }
}

function buildDetailPages(entries) {
  if (!fs.existsSync(DETAIL_TEMPLATE_PATH)) {
    console.warn('⚠️  缺少 updates/detail-template.html, 无法生成详情页');
    return;
  }
  const template = fs.readFileSync(DETAIL_TEMPLATE_PATH, 'utf8');
  const slugSet = new Set(entries.map((entry) => entry.slug));
  cleanupDetailDirs(slugSet);

  for (const entry of entries) {
    const detailDir = path.join(UPDATES_SOURCE_DIR, entry.slug);
    ensureDir(detailDir);
    const canonicalUrl = `${canonicalBase.replace(/\/$/, '')}/updates/${entry.slug}`;
    const basePath = env === 'production' ? '/l-feed-updates/' : '/';
    const entryPayload = JSON.stringify({
      title: entry.title,
      date: entry.date,
      summary: entry.summary,
      slug: entry.slug,
      file: entry.file,
      formattedDate: entry.formattedDate,
      readingMinutes: entry.readingMinutes,
      canonicalUrl
    }).replace(/<\/script>/gi, '<\\/script>');
    const filled = template
      .replace(/{{TITLE}}/g, htmlEscape(entry.title))
      .replace(/{{SUMMARY}}/g, htmlEscape(entry.summary))
      .replace(/{{DATE}}/g, htmlEscape(entry.date))
      .replace(/{{DATE_TEXT}}/g, htmlEscape(entry.formattedDate))
      .replace(/{{READING_TIME}}/g, `${entry.readingMinutes} min read`)
      .replace(/{{CANONICAL_URL}}/g, canonicalUrl)
      .replace(/{{CONTENT_HTML}}/, entry.contentHtml)
      .replace(/{{ENTRY_JSON}}/, entryPayload)
      .replace(/{{BASE}}/g, basePath);
    fs.writeFileSync(path.join(detailDir, 'index.html'), filled, 'utf8');
  }
}

export function generateUpdates({ silent = false } = {}) {
  if (!fs.existsSync(UPDATES_SOURCE_DIR)) {
    if (!silent) {
      console.warn('⚠️  未找到 updates 目录, 跳过更新日志生成');
    }
    return [];
  }
  const files = fs.readdirSync(UPDATES_SOURCE_DIR).filter((file) => file.endsWith('.md'));
  const entries = files
    .map((file) => toEntry(file))
    .filter(Boolean)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  cleanupPublicDir();
  writeIndex(entries);
  copyMarkdown(entries);
  buildDetailPages(entries);

  if (!silent) {
    console.log(`📝 已生成 ${entries.length} 条更新日志索引`);
  }

  return entries;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateUpdates();
}
