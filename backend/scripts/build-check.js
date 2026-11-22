import { readdir } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourceFiles = []

const collectJavaScript = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.name === 'node_modules') continue
    const entryPath = join(directory, entry.name)

    if (entry.isDirectory()) {
      await collectJavaScript(entryPath)
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      sourceFiles.push(entryPath)
    }
  }
}

await collectJavaScript(backendRoot)

for (const sourceFile of sourceFiles) {
  const result = spawnSync(process.execPath, ['--check', sourceFile], { stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status || 1)
}

console.log(`Syntax check passed for ${sourceFiles.length} backend JavaScript files.`)
