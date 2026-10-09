const headers = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Content-Type": "text/plain; charset=utf-8",
};

export default async function onehouseAccess(request, context) {
  const password = Netlify.env.get("ONEHOUSE_PASSWORD");
  if (!password) {
    return new Response("Dette private forslag er midlertidigt lukket.", {
      status: 503, headers,
    });
  }

  let credentials = "";
  const authorization = request.headers.get("authorization") || "";
  if (authorization.startsWith("Basic ")) {
    try { credentials = atob(authorization.slice(6)); } catch {}
  }
  // Compare hashes to avoid leaking the password through early string comparison.
  const digest = async (value) => new Uint8Array(await crypto.subtle.digest(
    "SHA-256", new TextEncoder().encode(value),
  ));
  const supplied = await digest(credentials);
  const expected = await digest(`onehouse:${password}`);
  let difference = 0;
  for (let i = 0; i < expected.length; i++) difference |= supplied[i] ^ expected[i];
  if (difference !== 0) {
    return new Response("Indtast brugernavn og adgangskode for at se det private OneHouse-forslag.", {
      status: 401,
      headers: { ...headers, "WWW-Authenticate": 'Basic realm="Privat OneHouse-forslag", charset="UTF-8"' },
    });
  }
  const response = await context.next();
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}
