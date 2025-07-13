# SnipLab

SnipLab is a developer-focused Chrome extension that lets you create, manage,
and run JavaScript snippets directly within any webpage.

It provides:

- A simple interface for writing and editing code snippets
- One-click execution in the context of the active tab
- Script persistence across sessions
- Future support for AI-assisted script generation, sharing across teams, and
  trigger-based automation

SnipLab is designed to boost productivity during debugging, prototyping,
testing, or automation — giving you full control of script execution without
needing external tools or manual injection.

## Installing and Running

### Procedures:

1. Check if your [Node.js](https://nodejs.org/) version is >= **18**.
2. Clone this repository.
3. Run `npm install` to install the dependencies.
4. Run `npm start`
5. Generate certificates. Check below how to generates certificates
6. Load your extension on Chrome following:
   1. Access `chrome://extensions/`
   2. Check `Developer mode`
   3. Click on `Load unpacked extension`
   4. Select the `build` folder.

## Generate a build

`npm run build`

### Generate Certificates

mkcert (easiest)
powershell

```
cd utils/certs/
choco install mkcert -y
mkcert -install && mkcert localhost 127.0.0.1 ::1
```

macbook

```
cd utils/certs/
brew install mkcert
mkcert -install && mkcert localhost 127.0.0.1 ::1
```

## Testing

Run the unit tests using:

```bash
npm test
```

Generate a coverage report with:

```bash
npm run test:coverage
```

## Commit message guidelines

Commits are checked with Commitlint and must follow the
[Conventional Commits](https://github.com/alejandrolechuga/request-interceptor/wiki#git-convetions)
standard.
