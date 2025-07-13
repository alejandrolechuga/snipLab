## Network Interceptor Extension

This repository contains a lightweight Chrome extension that intercepts
`fetch` and `XMLHttpRequest` calls. It can be used to inspect network
traffic or mock API responses during development.

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

### Dev Tools - Modifications to deve tools panel

Added static content to dev tools panel in this case it is an array of strings
and a loop to display the list in the page and changed added a version in the title

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
