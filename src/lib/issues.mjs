const files = import.meta.glob('../../content/issues/*.json', { eager: true, import: 'default' })
export const issues = Object.values(files).sort((a, b) => b.date.localeCompare(a.date))
export const tags = [...new Set(issues.flatMap(issue => issue.tags))]
export const base = import.meta.env.BASE_URL.replace(/\/$/, '')
export const issueUrl = date => base + '/issues/' + date + '/'
export const formatDate = date => date.replaceAll('-', '.')
