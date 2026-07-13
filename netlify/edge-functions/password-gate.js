const COOKIE_NAME = "nw_access";
const SESSION_SECONDS = 60 * 60 * 24;

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}

function bytesToHex(bytes) {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256(value) {
  return bytesToHex(await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  ));
}

function constantTimeEqual(left, right) {
  if (left.length !== right.length) return false;

  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

async function sessionToken(password) {
  return sha256(`waltham-session-v1:${password}`);
}

function page(message = "", unavailable = false) {
  const safeMessage = escapeHtml(message);
  const status = unavailable ? 503 : 401;
  const form = unavailable
    ? ""
    : `<form method="post" action="/">
        <input type="password" name="password" placeholder="Password" autocomplete="current-password" required autofocus>
        <button type="submit">Enter</button>
      </form>`;

  return new Response(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow, noarchive">
  <title>Private site · Nikolai Waltham</title>
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #0d0d0b; color: #fff; font-family: Arial, sans-serif; }
    main { width: min(420px, calc(100% - 40px)); text-align: center; }
    .logo { margin: 0 0 38px; font-family: Georgia, serif; font-size: 30px; font-weight: 400; letter-spacing: .06em; }
    .logo span { color: #b5986a; }
    .label { margin-bottom: 24px; color: rgba(255,255,255,.42); font-size: 12px; letter-spacing: .16em; text-transform: uppercase; }
    input, button { width: 100%; min-height: 48px; border: 1px solid rgba(181,152,106,.5); font: inherit; }
    input { margin-bottom: 12px; padding: 0 16px; background: transparent; color: #fff; text-align: center; }
    button { background: transparent; color: #b5986a; cursor: pointer; letter-spacing: .1em; text-transform: uppercase; }
    button:hover { background: rgba(181,152,106,.1); color: #fff; }
    .message { min-height: 20px; margin: 18px 0 0; color: ${unavailable ? "#d7b77d" : "#c87878"}; font-size: 13px; line-height: 1.5; }
    .hint { margin-top: 30px; color: rgba(255,255,255,.2); font-size: 11px; letter-spacing: .06em; }
  </style>
</head>
<body>
  <main>
    <p class="logo">Nikolai<span>.</span></p>
    <p class="label">Private site</p>
    ${form}
    <p class="message" role="alert">${safeMessage}</p>
    <p class="hint">Access is by invitation.</p>
  </main>
</body>
</html>`, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY",
      "referrer-policy": "no-referrer",
      "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    },
  });
}

export default async (request, context) => {
  const password = Netlify.env.get("PROTECTED_PAGE_PASSWORD");
  if (!password) {
    return page("This page is not yet configured. The site owner needs to set the PROTECTED_PAGE_PASSWORD environment variable.", true);
  }

  const url = new URL(request.url);
  if (url.searchParams.get("logout") === "1") {
    context.cookies.delete(COOKIE_NAME);
    return Response.redirect(new URL("/", url), 303);
  }

  const expectedToken = await sessionToken(password);
  const suppliedToken = context.cookies.get(COOKIE_NAME) ?? "";
  if (constantTimeEqual(suppliedToken, expectedToken)) {
    return context.next();
  }

  if (request.method === "POST") {
    const formData = await request.formData();
    const submittedPassword = String(formData.get("password") ?? "");
    const [submittedHash, expectedHash] = await Promise.all([
      sha256(submittedPassword),
      sha256(password),
    ]);

    if (constantTimeEqual(submittedHash, expectedHash)) {
      context.cookies.set({
        name: COOKIE_NAME,
        value: expectedToken,
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: SESSION_SECONDS,
      });
      return Response.redirect(new URL("/", url), 303);
    }

    return page("Incorrect password.");
  }

  return page();
};

