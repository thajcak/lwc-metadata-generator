# Manual QA Checklist

## Target Config Grouping
- Select `lightning__AppPage` and `lightning__HomePage` with identical settings and confirm one grouped `<targetConfig targets="...">` appears when grouping is enabled.
- Disable grouping and confirm separate `<targetConfig>` blocks are emitted.
- Select incompatible targets like `lightning__RecordPage` and `lightning__RecordAction` and confirm they remain separate even when grouping is enabled.

## Validation Warnings
- Select `lightningCommunity__Default` without `lightningCommunity__Page` or `lightningCommunity__Theme_Layout`; confirm dependency warning appears.
- Add unsupported property attributes (for example String placeholder in Experience Builder Default) and confirm warning appears.
- Clear invalid entries and confirm warning panel clears after regeneration.

## XML Correctness
- Verify `supportedFormFactor` uses `type="Small|Large"` format.
- Verify `<property ... />` and `<event ... />` are direct children of `<targetConfig>`.
- Verify unsupported property attributes are not emitted to XML.

## State and Edge Cases
- Add/remove targets repeatedly; ensure matching target config cards are created/removed.
- Add multiple properties/events and ensure remove buttons delete only selected entries.
- Generate XML with no targets selected and confirm only top-level tags are emitted.
