import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(
  SUPABASE_URL,
  SERVICE_ROLE_KEY,
);

const BUCKET = "glorp-shares";
const WEBSITE = "https://glorprbh.com";

function cleanHandle(value: string) {
  return value
    .trim()
    .replace(/^@+/, "")
    .toLowerCase();
}

function validHandle(value: string) {
  return /^[a-zA-Z0-9_]{1,15}$/.test(value);
}

function getImageUrl(handle: string) {
  return supabase.storage
    .from(BUCKET)
    .getPublicUrl(`${handle}.png`)
    .data.publicUrl;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  const url = new URL(req.url);

  /*
   * X OPENS THIS URL TO READ THE IMAGE
   */
  if (req.method === "GET") {
    const handle = cleanHandle(
      url.searchParams.get("handle") || "",
    );

    if (!validHandle(handle)) {
      return new Response("invalid transmission", {
        status: 400,
      });
    }

    const imageUrl = getImageUrl(handle);

    const html = `
<!doctype html>
<html>
<head>

<meta charset="UTF-8">

<title>GLORP Transmission</title>

<meta
  name="twitter:card"
  content="summary_large_image"
/>

<meta
  name="twitter:title"
  content="GLORP"
/>

<meta
  name="twitter:description"
  content="@${handle} sent a transmission to GLORP"
/>

<meta
  name="twitter:image"
  content="${imageUrl}"
/>

<meta
  property="og:title"
  content="GLORP"
/>

<meta
  property="og:description"
  content="@${handle} sent a transmission to GLORP"
/>

<meta
  property="og:image"
  content="${imageUrl}"
/>

<meta
  property="og:type"
  content="website"
/>

<meta
  property="og:url"
  content="${url.toString()}"
/>

</head>

<body>

<p>GLORP transmission received.</p>

<a href="${WEBSITE}">
  enter glorprbh.com
</a>

<script>
  setTimeout(() => {
    window.location.replace("${WEBSITE}");
  }, 300);
</script>

</body>
</html>
`;

    return new Response(html, {
      headers: {
        "Content-Type":
          "text/html; charset=UTF-8",

        "Cache-Control":
          "public, max-age=60",
      },
    });
  }

  /*
   * WEBSITE SENDS THE GENERATED PNG HERE
   */
  if (req.method === "POST") {
    try {
      const formData =
        await req.formData();

      const handle = cleanHandle(
        String(
          formData.get("handle") || "",
        ),
      );

      const image =
        formData.get("image");

      if (!validHandle(handle)) {
        return Response.json(
          {
            message:
              "invalid X handle.",
          },
          {
            status: 400,
            headers: corsHeaders,
          },
        );
      }

      if (!(image instanceof File)) {
        return Response.json(
          {
            message:
              "ticket image missing.",
          },
          {
            status: 400,
            headers: corsHeaders,
          },
        );
      }

      /*
       * Prevent huge/random uploads
       */
      if (image.size > 6_000_000) {
        return Response.json(
          {
            message:
              "ticket image is too large.",
          },
          {
            status: 400,
            headers: corsHeaders,
          },
        );
      }

      const fileBuffer =
        await image.arrayBuffer();

      const {
        error: uploadError,
      } = await supabase.storage
        .from(BUCKET)
        .upload(
          `${handle}.png`,
          fileBuffer,
          {
            contentType: "image/png",
            cacheControl: "3600",
            upsert: true,
          },
        );

      if (uploadError) {
        console.error(uploadError);

        return Response.json(
          {
            message:
              "could not save GLORP ticket.",
          },
          {
            status: 500,
            headers: corsHeaders,
          },
        );
      }

      /*
       * THIS is the URL that gets inserted
       * into the X post.
       */
      const shareUrl =
        `${SUPABASE_URL}/functions/v1/create-share?handle=${encodeURIComponent(
          handle,
        )}`;

      return Response.json(
        {
          shareUrl,
        },
        {
          headers: corsHeaders,
        },
      );
    } catch (error) {
      console.error(error);

      return Response.json(
        {
          message:
            "could not prepare X post.",
        },
        {
          status: 500,
          headers: corsHeaders,
        },
      );
    }
  }

  return new Response(
    "method not allowed",
    {
      status: 405,
      headers: corsHeaders,
    },
  );
});