import { defineConfig } from 'vite'
import path from 'path'
import { globSync } from 'glob'
import { generateUpdates, UPDATES_SOURCE_DIR, DETAIL_TEMPLATE_PATH } from './scripts/generate-updates.mjs'

// Generate updates on build start
try {
    generateUpdates({ silent: true })
} catch (error) {
    console.warn('⚠️  Unable to generate updates:', error.message)
}

// Collect all HTML entry points
const inputFiles = {}
globSync('**/*.html', {
    ignore: ['dist/**', 'node_modules/**', '**/tests/**', '**/test/**', '**/fixtures/**', 'updates/detail-template.html']
}).forEach(file => {
    inputFiles[file] = path.resolve(process.cwd(), file)
})

// Vite plugin to watch for markdown changes
function updatesWatcherPlugin() {
    const sourceDir = path.resolve(UPDATES_SOURCE_DIR)
    const sourceDirWithSep = sourceDir.endsWith(path.sep) ? sourceDir : `${sourceDir}${path.sep}`
    const templatePath = path.resolve(DETAIL_TEMPLATE_PATH)

    const shouldRegenerate = (file) => {
        if (!file) return false
        const target = path.resolve(file)
        if (target === templatePath) return true
        return target.startsWith(sourceDirWithSep) && target.endsWith('.md')
    }

    return {
        name: 'updates-generator',
        configureServer(server) {
            const trigger = () => {
                try {
                    generateUpdates({ silent: true })
                    server.ws.send({ type: 'full-reload' })
                } catch (error) {
                    console.warn('⚠️  Update generation failed:', error.message)
                }
            }
            const debounced = (() => {
                let timer = null
                return (file) => {
                    if (!shouldRegenerate(file)) return
                    clearTimeout(timer)
                    timer = setTimeout(trigger, 120)
                }
            })()

            server.watcher.add(UPDATES_SOURCE_DIR)
            server.watcher.add(DETAIL_TEMPLATE_PATH)
            server.watcher.on('add', debounced)
            server.watcher.on('change', debounced)
            server.watcher.on('unlink', debounced)
        }
    }
}

export default defineConfig({
    base: '/l-feed-updates/',
    build: {
        rollupOptions: {
            input: inputFiles
        },
        outDir: 'dist',
        emptyOutDir: true
    },
    publicDir: 'public',
    plugins: [
        updatesWatcherPlugin()
    ],
    server: {
        port: 5173,
        open: '/updates/'
    }
})
