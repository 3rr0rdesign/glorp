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

  /*
   * Every generated share URL has:
   *
   * /share/handle?v=TIMESTAMP
   *
   * Keep that same version on the image URL too,
   * so X doesn't reuse an old cached image.
   */
  const version =
    url.searchParams.get("v") ||
    Date.now().toString();

  const supabaseImage =
    `https://zdqpxpqjpqhnnnhclwsf.supabase.co/storage/v1/object/public/glorp-shares/${encodeURIComponent(
      handle
    )}.png?v=${encodeURIComponent(version)}`;

  /* =========================================================
     IMAGE PROXY
     =========================================================

     X requests:

     https://glorprbh.com/share/handle?image=1&v=TIMESTAMP

     Netlify fetches the PNG from Supabase and returns
     the image directly from glorprbh.com.
  */

  if (url.searchParams.get("image") === "1") {
    try {
      const imageResponse = await fetch(
        supabaseImage,
        {
          cache: "no-store",
        }
      );

      if (!imageResponse.ok) {
        console.error(
          "Supabase image fetch failed:",
          imageResponse.status,
          supabaseImage
        );

        return new Response(
          "image not found",
          {
            status: 404,
            headers: {
              "Cache-Control":
                "no-store",
            },
          }
        );
      }

      const image =
        await imageResponse.arrayBuffer();

      return new Response(image, {
        status: 200,

        headers: {
          "Content-Type": "image/png",

          /*
           * Do not cache old generated tickets.
           */
          "Cache-Control":
            "no-store, no-cache, must-revalidate",

          "X-Content-Type-Options":
            "nosniff",
        },
      });
    } catch (error) {
      console.error(
        "GLORP image proxy error:",
        error
      );

      return new Response(
        "image unavailable",
        {
          status: 500,
          headers: {
            "Cache-Control":
              "no-store",
          },
        }
      );
    }
  }

  /* =========================================================
     X CARD PAGE
     ========================================================= */

  const imageUrl =
    `https://glorprbh.com/share/${encodeURIComponent(
      handle
    )}?image=1&v=${encodeURIComponent(
      version
    )}`;

  const pageUrl =
    `https://glorprbh.com/share/${encodeURIComponent(
      handle
    )}?v=${encodeURIComponent(
      version
    )}`;

  const html = `
<!doctype html>
<html lang="en">

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  >

  <title>GLORP</title>


  <!-- ==========================================
       X / TWITTER CARD
       ========================================== -->

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


  <!-- ==========================================
       OPEN GRAPH
       ========================================== -->

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
  <script>
    window.location.replace("https://glorprbh.com");
  </script>

  <noscript>
    <a href="https://glorprbh.com">enter GLORP</a>
  </noscript>
</body>

</html>
`;

  return new Response(html, {
    status: 200,

    headers: {
      "Content-Type":
        "text/html; charset=utf-8",

      /*
       * Important:
       * don't cache failed/old card metadata.
       */
      "Cache-Control":
        "no-store, no-cache, must-revalidate",
    },
  });
}


/* =========================================================
   NETLIFY ROUTE
   ========================================================= */

export const config = {
  path: "/share/:handle",
};