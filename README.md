## HTTPMocky 🐵

![Image (1)](https://github.com/user-attachments/assets/d12810fd-3677-464b-83be-762b8b638681)

HTTPMocky is a Chrome extension that lets you intercept, inspect, and override fetch and XMLHttpRequest calls directly in the browser. Useful for testing APIs, simulating error states, or mocking responses without touching your backend.

✨ Features
✅ Intercepts both fetch and XHR requests

- ⚙️ Modify request/response payloads, headers, or status codes

- 🔁 Toggle patching on/off in real time

- 🎯 Match requests by URL, method, or regex

- 🔍 Built-in DevTools panel for debugging

🔐 Use cases

- Frontend API mocking and testing

- Simulating slow or failed network responses

- Developing against unstable or unavailable backends

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
