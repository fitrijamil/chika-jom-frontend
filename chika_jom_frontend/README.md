# Chika Jom Consult Frontend

Frontend static portal for Cloudflare Pages.

## Files
- index.html
- apply.html
- admin.html
- agent-management.html
- style.css
- app.js

## Backend
Google Apps Script endpoint should be added inside `app.js`:

```js
const CONFIG = {
  APPS_SCRIPT_URL: "PASTE_APPS_SCRIPT_URL_HERE"
};
```

## Deploy to Cloudflare Pages
Upload the folder or connect to GitHub repository.

## Notes
Current admin dashboard uses dummy data. Connect Apps Script API later.
