# Fix password-only admin access

## What will change
- Replace the broken email sign-in behind `/admin` with a dedicated password-only backend check against the stored `ADMIN_LEADS_PASSWORD` secret.
- Return a short-lived admin session to the browser and use it to securely load leads; the public browser key will never gain read access.
- Add a **Change password** action inside `/admin` that verifies the current password, validates the new password, updates the stored admin password, and signs out other admin sessions.
- Keep CSV export and sign-out behavior intact.

## Security
- Hash the stored password for verification and never return or log the password.
- Rate-limit failed sign-in attempts and use expiring signed session tokens.
- Keep lead data behind the backend function rather than weakening database access rules.

## Verification
- Test incorrect and correct password states, lead loading, CSV export, password reset, old-password rejection, new-password login, and mobile layout.
