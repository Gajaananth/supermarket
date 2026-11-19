# BuyMe web portal links

The web app opens on the public customer storefront. Each user type has a separate sign-in page:

| Portal | Local link | Sign-in method |
|---|---|---|
| Customer | `/customer/login` | One-time code to the registered Sri Lankan mobile number |
| Rider | `/rider/login` | One-time code to the registered phone number or email |
| Store Admin | `/store-admin/login` | Work email and password |
| Super Admin | `/admin/login` | Work email, password, and Super Admin two-factor code |

`/login` remains an alias for `/admin/login`; `/shop` redirects to the public storefront at `/`.

## Important

- These pages use the live API. There are no one-click or mock login buttons, and no demo credentials are embedded in the web app.
- OTP delivery and staging demo codes depend on the API's configured OTP provider and seeded demo accounts.
- Customer account details and order history, as well as rider delivery operations, are still implementation gates after sign-in.
- Authentication uses same-origin web API routes and secure, httpOnly cookies. Role checks apply to protected portal routes.
- The app requires a Next.js server because its authentication endpoints are server routes; a static HTML export or drag-and-drop of an `out` directory will not provide working sign-in.

## Run locally

From `apps\admin_web`, start the web app with:

```powershell
npm run dev -- --webpack --hostname 127.0.0.1
```

Open `http://127.0.0.1:3000`. Configure `BUYME_API_BASE_URL` to point to the running API and set `BUYME_JWT_SECRET` to the same signing secret used by the API. Without the API, the storefront shows an explicit store-unavailable message and sign-in cannot complete.
