---
name: CRLF line endings
description: Some admin component files have CRLF line endings that break the edit tool
---

# CRLF line endings in admin files

## The rule
Some admin component files use Windows-style CRLF (`\r\n`) line endings in parts of the file. The `edit` tool's `old_string` matching silently fails on CRLF lines.

**Why:** Files were likely created or edited in a Windows environment.

**Known affected files (as of last check):**
- `src/components/admin/AdminBanners.tsx` — CRLF in the data object block
- `src/components/admin/AdminFeaturedCollection.tsx` — CRLF in the data object block

## How to apply
Before editing a file that fails with "did not appear verbatim", check with:
```bash
cat -A src/components/admin/SomeFile.tsx | grep '\^M'
```
If `^M` appears, strip CRLF first:
```bash
sed -i 's/\r//' src/components/admin/SomeFile.tsx
```
Then proceed with the edit tool normally.
