# Changelog

## 0.0.0

### Application

- Replace the static Electron page with the standard Vite React TypeScript example application and assets.
- Add React 19, React DOM, and React Compiler support.
- Move the Electron main process from JavaScript to TypeScript under `src/main`.
- Load the Vite development server during development and the compiled renderer in packaged builds.

### Tooling

- Add Vite 8 and `vite-plugin-electron` for renderer and main-process builds.
- Add TypeScript 7 project references for the renderer, Electron main process, and Vite configuration.
- Type-check referenced projects before each production build.
- Add development, production build, browser preview, Electron start, unpacked application, and distributable package scripts.
- Add Oxlint commands for linting and safe fixes.
- Add Oxfmt commands and configuration for formatting and format checks.
- Declare pnpm 11 as the project package-manager requirement.
- Rebuild native Electron dependencies after dependency installation.

### Packaging

- Add electron-builder configuration and reusable example application metadata.
- Package compiled main-process and renderer output only.
- Add an application icon for generated desktop packages.
- Generate macOS DMG packages for x64, ARM64, and universal architectures.
- Use the product name for mounted DMG volumes and include the version and architecture in DMG filenames.
- Generate Windows NSIS installers for x64 and ARM64 with an installation wizard and selectable installation directory.
- Generate Linux AppImage, DEB, RPM, and Snap packages for x64 and ARM64.
- Build strict core24 Snap packages with Snapcraft and LXD.
- Generate Snapcraft configuration and desktop metadata from `package.json` during the build.

### Release automation

- Add a tag-triggered GitHub Actions workflow for macOS, Windows, and Linux release builds.
- Validate that the release tag matches the application version before starting platform builds.
- Require a matching changelog section and use it as the GitHub Release description.
- Publish generated installers only after every platform build succeeds.
- Exclude generated macOS ZIP archives and Markdown files from GitHub Release assets.
