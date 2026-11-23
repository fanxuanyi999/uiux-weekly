import { readdir, readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'

const directory = new URL('../content/issues/', import.meta.url)
const files = (await readdir(directory)).filter(name => name.endsWith('.json'))
assert(files.length, 'No weekly issues found')

const internalReference = /chatgpt-conversation:||chatgpt-content-reference|file:\/\/|内部链接|未公开路线图|精兵强将/u
const nonArticlePaths = new Set(['/articles', '/blog', '/topic', '/videos'])
function checkText(value, field) {
  assert(typeof value === 'string' && value.trim(), field + ' is empty')
  assert(!internalReference.test(value), field + ' contains an internal reference')
}

for (const filename of files) {
  const issue = JSON.parse(await readFile(new URL(filename, directory), 'utf8'))
  try {
    assert.match(issue.date, /^\d{4}-\d{2}-\d{2}$/)
    assert.equal(new Date(issue.date).toISOString().slice(0, 10), issue.date)
    assert.equal(filename, issue.date + '.json')
    for (const field of ['title', 'summary', 'focus']) checkText(issue[field], field)
    assert(Array.isArray(issue.tags) && issue.tags.length, 'Issue has no tags')
    for (const tag of issue.tags) checkText(tag, 'tag')
    assert(Array.isArray(issue.items) && issue.items.length, 'Issue has no stories')
    for (const item of issue.items) {
      for (const field of ['title', 'publisher', 'url', 'change', 'insight', 'action']) {
        checkText(item[field], 'item.' + field)
      }
      const url = new URL(item.url)
      const path = url.pathname.replace(/\/$/, '')
      assert(url.protocol === 'https:' && !url.username && !url.password, 'Invalid source URL')
      assert(path && !nonArticlePaths.has(path), 'Source must link to a specific article, video or course')
    }
  } catch (error) {
    throw new Error(filename + ' · ' + error.message, { cause: error })
  }
}

console.log('Validated ' + files.length + ' weekly issues.')
