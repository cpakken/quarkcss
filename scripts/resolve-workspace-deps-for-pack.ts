import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'

type PackageJson = {
  name?: string
  version?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
}

const dependencyFields = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
] as const

const packageDir = process.cwd()
const packageJsonPath = join(packageDir, 'package.json')
const backupPath = join(packageDir, 'node_modules', '.quarkcss-pack', 'package.json')

function resolveWorkspaceRange(range: string, version: string) {
  const workspaceRange = range.replace(/^workspace:/, '')

  if (workspaceRange === '*' || workspaceRange === '') {
    return version
  }

  if (workspaceRange === '^' || workspaceRange === '~') {
    return `${workspaceRange}${version}`
  }

  return workspaceRange
}

async function getWorkspaceVersions() {
  const root = resolve(packageDir, '../..')
  const packagesDir = join(root, 'packages')
  const entries = await readdir(packagesDir, { withFileTypes: true })
  const versionsByName = new Map<string, string>()

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue
    }

    const packageJson = JSON.parse(
      await readFile(join(packagesDir, entry.name, 'package.json'), 'utf8'),
    ) as PackageJson

    if (packageJson.name && packageJson.version) {
      versionsByName.set(packageJson.name, packageJson.version)
    }
  }

  return versionsByName
}

const original = await readFile(packageJsonPath, 'utf8')
const packageJson = JSON.parse(original) as PackageJson
const versionsByName = await getWorkspaceVersions()
let changed = false

for (const field of dependencyFields) {
  const dependencies = packageJson[field]

  if (!dependencies) {
    continue
  }

  for (const [name, range] of Object.entries(dependencies)) {
    const version = versionsByName.get(name)

    if (!version || !range.startsWith('workspace:')) {
      continue
    }

    dependencies[name] = resolveWorkspaceRange(range, version)
    changed = true
  }
}

if (changed) {
  await mkdir(dirname(backupPath), { recursive: true })
  await writeFile(backupPath, original)
  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`)
}
