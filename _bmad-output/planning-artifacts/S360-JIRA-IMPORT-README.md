# S360 Jira Import - Nextiva Discord Integration

Import Epics and Stories for project key **S360**.

## Option A: CSV Import (Recommended)

### File
`S360-Nextiva-Discord-Integration.csv`

### Steps

1. **Import Epics first** (or use a two-pass import):
   - Go to **Jira** → **Project S360** → **Project settings** (gear) → **Import**
   - Or: **Settings** (gear) → **System** → **Import and export** → **External system import** / **CSV**
   - Select the CSV file
   - Map columns:
     - `Summary` → Summary
     - `Issue Type` → Issue Type
     - `Description` → Description
     - `Epic Name` → Epic Name (Epics) / Epic Link (Stories)
     - `Priority` → Priority
     - `Labels` → Labels
   - Set **Project** to **S360**
   - Import

2. **Import order**: The CSV lists Epics first (rows 2–6), then Stories (rows 7–24). If your importer processes top-to-bottom, Epics will be created before Stories link to them.

3. **If Epic Link fails**: Some Jira instances require a two-step import:
   - Import only rows with `Issue Type = Epic`
   - Re-import or use a second CSV with Stories, using the created Epic keys in the Epic Link column

## Option B: Jira REST API Script

Use `S360-jira-import.py` if you have Jira API credentials:

```bash
# Set environment variables
export JIRA_URL="https://your-domain.atlassian.net"
export JIRA_EMAIL="your-email@example.com"
export JIRA_API_TOKEN="your-api-token"

# Install dependency
pip install requests

# Run import
python S360-jira-import.py
```

Create an API token at: https://id.atlassian.com/manage-profile/security/api-tokens

## Contents Summary

| Epic | Stories |
|------|---------|
| Discord Integration Foundation & Security | 4 |
| Discord Admin Configuration Experience | 4 |
| Ticket Creation From Discord Messages | 4 |
| Ticket & Alert Notifications to Discord | 4 |
| Observability Metrics & Operations | 3 |

**Total: 5 Epics, 19 Stories**
