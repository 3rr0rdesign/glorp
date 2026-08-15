export default async function handler(request, context) {
  const handle = (context.params.handle || "")
    .trim()
    .replace(/^@+/, "")
    .toLowerCase();

  if (!/^[a-zA-Z0-9_]{1,15}$/.test(handle)) {
    return new Response("invalid transmission", {
      status: 400,
    });
  }

  const url = new URL(request.url);

  const supabaseImage =
    `https://zdqpxpqjpqhnnnhclwsf.supabase.co/storage/v1/object/public/glorp-shares/${handle}.png`;

  /*
   * X FETCHES THE IMAGE FROM OUR DOMAIN
   *
   * /share/test2?image=1
   */
  if (url.searchParams.get("image") === "1") {
    const imageResponse = await fetch(supabaseImage);

    if (!imageResponse.ok) {
      return new Response("image not found", {
        status: 404,
      });
    }

    const image = await imageResponse.arrayBuffer();

    return new Response(image, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  /*
   * X CARD IMAGE
   *
   * Important:
   * image now comes from glorprbh.com,
   * not directly from Supabase.
   */
  const imageUrl =
    `https://glorprbh.com/share/${encodeURIComponent(handle)}?image=1&v=3`;

  const pageUrl =
    `https://glorprbh.com/share/${encodeURIComponent(handle)}`;

  const html = `
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">

  <title>GLORP</title>

  <!-- X CARD -->
  <meta
    name="twitter:card"
    content="summary_large_image"
  >

  <meta
    name="twitter:site"
    content="@glorpRBH"
  >

  <meta
    name="twitter:title"
    content="GLORP"
  >

  <meta
    name="twitter:description"
    content="@${handle} sent a transmission to GLORP"
  >

  <meta
    name="twitter:image"
    content="${imageUrl}"
  >

  <meta
    name="twitter:image:alt"
    content="GLORP transmission from @${handle}"
  >

  <!-- OPEN GRAPH -->
  <meta
    property="og:title"
    content="GLORP"
  >

  <meta
    property="og:description"
    content="@${handle} sent a transmission to GLORP"
  >

  <meta
    property="og:image"
    content="${imageUrl}"
  >

  <meta
    property="og:image:secure_url"
    content="${imageUrl}"
  >

  <meta
    property="og:image:type"
    content="image/png"
  >

  <meta
    property="og:image:width"
    content="1200"
  >

  <meta
    property="og:image:height"
    content="600"
  >

  <meta
    property="og:type"
    content="website"
  >

  <meta
    property="og:url"
    content="${pageUrl}"
  >
</head>

<body>
  GLORP
</body>
</html>
`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",

      /*
       * Don't let Netlify/CDN keep stale card HTML.
       */
      "Cache-Control": "no-store",
    },
  });
}

export const config = {
  path: "/share/:handle",
};