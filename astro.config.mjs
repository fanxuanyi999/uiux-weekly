import { defineConfig } from 'astro/config'

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1]
const defaultBase = repository && !repository.endsWith('.github.io') ? '/' + repository : '/'

export default defineConfig({
  base: process.env.SITE_BASE || defaultBase,
  trailingSlash: 'always',
})
