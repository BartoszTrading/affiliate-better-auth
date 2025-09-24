# affiliate-better-auth

A tiny affiliate/referral plugin for Better Auth.

## Install

```bash
pnpm add affiliate-better-auth better-auth
# or
npm i affiliate-better-auth better-auth
# or
yarn add affiliate-better-auth better-auth
```

## Server usage

```ts
import { betterAuth } from "better-auth";
import { affiliatePlugin } from "affiliate-better-auth";

export const auth = betterAuth({
	plugins: [affiliatePlugin()],
});
```

- Adds endpoints and hooks to handle simple referral tracking.
- Automatically creates minimal schema for `affiliate_code` and `affiliate` models via Better Auth adapter.

## Client usage

```ts
import { createAuthClient } from "better-auth/client";
import { affiliateClientPlugin } from "affiliate-better-auth";

export const auth = createAuthClient({
	plugins: [affiliateClientPlugin()],
});
```

## Endpoints

- `GET /affiliate/generate-link`
  - Requires an authenticated session
  - Returns `{ link: string }` where `link` is the user’s referral code
  - Example: build a URL like `https://yourapp.com/?ref=<code>`

- `POST /affiliate/issue-cookie`
  - Body: `{ code: string }`
  - Sets an `affiliate` cookie with the provided code

When a new user is created while an `affiliate` cookie is present, the plugin records a referral entry using the configured Better Auth adapter.

## Notes

- Peer dependency: `better-auth` (see package.json for supported versions)
- Cookie name: `affiliate`
- Codes are short random strings generated server-side.
