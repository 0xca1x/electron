import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

if (process.platform !== 'linux' || !['x64', 'arm64'].includes(process.arch)) {
  throw new Error('Snap builds require Linux x64 or ARM64 with Snapcraft and LXD installed')
}

const root = fileURLToPath(new URL('../apps/desktop/', import.meta.url))
const { name, productName = name, version, description, build } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const executable = build.linux?.executableName ?? build.executableName ?? name

if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name) || name.length > 40) {
  throw new Error('package.json name must be a valid Snap name (lowercase letters, digits and single hyphens, at most 40 characters)')
}
if (!/^[A-Za-z0-9._-]+$/.test(executable)) {
  throw new Error('The Linux executable name must contain only letters, digits, dots, underscores or hyphens')
}

const output = resolve(root, build.directories?.output ?? 'dist')
const unpacked = join(output, process.arch === 'x64' ? 'linux-unpacked' : 'linux-arm64-unpacked')
const project = mkdtempSync(join(output, 'snap-'))
const gui = join(project, 'snap/gui')
mkdirSync(gui, { recursive: true })
cpSync(unpacked, join(project, 'app'), { recursive: true })
cpSync(resolve(root, build.directories?.buildResources ?? 'build', 'icon.png'), join(gui, 'icon.png'))

const config = {
  name,
  title: productName,
  version,
  summary: productName,
  description,
  base: 'core24',
  grade: 'stable',
  confinement: 'strict',
  apps: {
    [name]: {
      command: `app/${executable} --no-sandbox`,
      extensions: ['gnome'],
      plugs: ['browser-support', 'network', 'audio-playback'],
      environment: { TMPDIR: '$XDG_RUNTIME_DIR' }
    }
  },
  parts: {
    app: {
      plugin: 'dump',
      source: 'app',
      organize: { '*': 'app/' },
      prime: ['-app/chrome-sandbox']
    },
    'runtime-libraries': {
      plugin: 'nil',
      'stage-packages': ['libnspr4', 'libnss3', 'libxss1', 'libasound2t64']
    }
  }
}

const escapeEntry = value => value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\r/g, '\\r')
const desktop = [
  '[Desktop Entry]',
  'Type=Application',
  `Name=${escapeEntry(productName)}`,
  `Comment=${escapeEntry(description)}`,
  `Exec=${name} %U`,
  'Icon=${SNAP}/meta/gui/icon.png',
  'Terminal=false',
  `Categories=${build.linux?.category ?? 'Utility'};`,
  ''
].join('\n')

// JSON is valid YAML; generating it avoids a separate YAML dependency or template.
writeFileSync(join(project, 'snap/snapcraft.yaml'), JSON.stringify(config, null, 2) + '\n')
writeFileSync(join(gui, `${name}.desktop`), desktop)

const result = spawnSync('snapcraft', ['pack', '--use-lxd'], { cwd: project, stdio: 'inherit' })
if (result.error) throw result.error
process.exitCode = result.status ?? 1
if (result.status === 0) {
  const packages = readdirSync(project).filter(file => file.endsWith('.snap'))
  if (packages.length !== 1) throw new Error('Expected exactly one Snap package')
  renameSync(join(project, packages[0]), join(output, packages[0]))
}
