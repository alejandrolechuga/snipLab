# override-response-tool

## 1.12.0

### Minor Changes

- 195a9f8: Add GA client ID helper for anonymous telemetry.
- 195a9f8: Add telemetry event tracking helper with GA4 Measurement Protocol.

### Patch Changes

- 195a9f8: Track user views and rule creation via GA4 events.
- 195a9f8: Track additional telemetry events for back button and rule counts.
- 195a9f8: Use real GA4 measurement credentials for telemetry.
- 195a9f8: Add debounced telemetry event tracking with cleanup logic.
- 195a9f8: Track telemetry when a rule is deleted from the list view.

## 1.11.2

### Patch Changes

- 161f9d7: Add button to download request override rules as JSON from coverage test page.
  Rules now use the extension's import schema when downloaded.

## 1.11.1

### Patch Changes

- 8f254b2: Clear request body when saving rules with methods that don't support a body.

## 1.11.0

### Minor Changes

- dd9f59f: Add ability to override request bodies and rename OverrideFields to ResponseOverrideFields.
- 1918981: Add override indicator tags to the rule list table.
- dd9f59f: Add ability to override outgoing request bodies and display request body override fields conditionally based on HTTP method.

### Patch Changes

- dd9f59f: Rename helper method to `methodSupportsRequestBody` and update imports.
- dd9f59f: Add tests verifying that request body overrides are only applied when specified.
- dd9f59f: Handle empty request body in RuleForm.
- dd9f59f: Add requestBody support during rule import and export with corresponding tests.
- 1918981: Update override indicator styling and logic.
- 789e6bf: fix changeset on main pipeline
- dd9f59f: show request body override when method unsupported
- 1918981: Add tooltips to override tags in the rule list table.
- 4462161: fix

## 1.10.0

### Minor Changes

- e6fb593: add feature settings and hide import/export

## 1.9.1

### Patch Changes

- ad8bdb3: Remove stale match entries when a rule is deleted.

## 1.9.0

### Minor Changes

- fda4d06: fix export not including the delay

## 1.8.0

### Minor Changes

- 08397d6: make the form be validated with zod
- 08397d6: Use zod for rule validation

### Patch Changes

- 08397d6: Switch to the official zod package and remove local shim

## 1.7.2

### Patch Changes

- f70890d: Hide bug report button when a rule form is visible.

## 1.7.1

### Patch Changes

- 6b1c4c5: Add floating "Report a Bug" button to the panel UI.

## 1.7.0

### Minor Changes

- 066f765: support importing and exporting rules via json

### Patch Changes

- 066f765: append imported rules when importing
- 066f765: display import/export messages inline
- 066f765: split RuleImportExport into smaller components
- 066f765: style import/export status message below buttons with auto-dismiss
- 066f765: move rule import/export logic into separate component

## 1.6.0

### Minor Changes

- bfac988: add delay to interption

## 1.5.2

### Patch Changes

- 4406257: fix prod build with wrong paths

## 1.5.1

### Patch Changes

- 9daab72: fix using wrong permission in manifest
- 9daab72: fix having tabs perm

## 1.5.0

### Minor Changes

- 7ac16e5: add tagging to versions

## 1.4.3

### Patch Changes

- 71118c6: fix issues with permissions blocking pushing to master

## 1.4.2

### Patch Changes

- 2419911: fix missing bot in github action version bump for manifest sync
- 2419911: fix commit hook on manifest version sync

## 1.4.1

### Patch Changes

- 7e22fe6: fix commit hook on manifest version sync

## 1.4.0

### Minor Changes

- 0e51f92: match the manifest version

## 1.3.0

### Minor Changes

- c039c12: only show the filter bar whenever there is more than 10 rows

## 1.2.0

### Minor Changes

- ee0443b: add version to version bump commit

## 1.1.0

### Minor Changes

- 4b79c12: skip ci version

## 1.0.2

### Patch Changes

- 2b46add: Convert the changeset check script from JavaScript to TypeScript and adjust the configuration accordingly.
- bff7b4d: include version bump post-merge
- 2b46add: package-lock fix, readme update
