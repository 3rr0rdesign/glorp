export default async function handler(req, context) {
  const handle = (context.params.handle || "")
    .trim()
    .replace(/^@+/, "")
    .toLowerCase();

  if (!/^[a-zA-Z0-9_]{1,15}$/.test(handle)) {
    return new Response("invalid transmission", {
      status: 400,
    });
  }

  const imageUrl =
    `https://zdqpxpqjpqhnnnhclwsf.supabase.co/storage/v1/object/public/glorp-shares/${handle}.png`;

  const pageUrl =
    `https://glorprbh.com/share/${encodeURIComponent(handle)}`;

  const html = `
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">

  <title>GLORP Transmission</title>

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="GLORP">
  <meta name="twitter:description" content="@${handle} sent a transmission to GLORP">
  <meta name="twitter:image" content="${imageUrl}">

  <meta property="og:title" content="GLORP">
  <meta property="og:description" content="@${handle} sent a transmission to GLORP">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${pageUrl}">
</head>

<body>
  <p>GLORP transmission received.</p>
</body>
</html>
`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

export const config = {
  path: "/share/:handle",
};