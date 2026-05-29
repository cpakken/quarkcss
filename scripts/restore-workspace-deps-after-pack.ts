import { readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const packageDir = process.cwd()
const packageJsonPath = join(packageDir, 'package.json')
const backupPath = join(packageDir, 'node_modules', '.quarkcss-pack', 'package.json')

try {
  const original = await readFile(backupPath, 'utf8')
  await writeFile(packageJsonPath, original)
  await rm(backupPath, { force: true })
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
    throw error
  }
}
