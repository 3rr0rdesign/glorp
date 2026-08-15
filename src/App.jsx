"use client";

import { useEffect, useMemo, useState } from "react";
import styled, { createGlobalStyle, keyframes } from "styled-components";

const SUPABASE_FUNCTION_URL =
  import.meta.env.VITE_SUPABASE_FUNCTION_URL ??
  "https://zdqpxpqjpqhnnnhclwsf.supabase.co/functions/v1/submit-transmission";

/*
  NEW:
  This function will receive the generated PNG and return
  a public URL with Twitter/X card meta tags.
*/
const SUPABASE_SHARE_FUNCTION_URL =
  import.meta.env.VITE_SUPABASE_SHARE_FUNCTION_URL ??
  "https://zdqpxpqjpqhnnnhclwsf.supabase.co/functions/v1/create-share";

const STORAGE_KEY = "glorp-transmission-v1";
const HISTORY_KEY = "glorp-screen";

/* =========================================================
   TICKET HANDLE SETTINGS
   ========================================================= */

const TICKET_HANDLE_X = 50;
const TICKET_HANDLE_Y = 69;
const TICKET_HANDLE_ROTATION = 0;
const TICKET_HANDLE_SIZE = 5.2;
const TICKET_HANDLE_COLOR = "#baff00";
const TICKET_HANDLE_BLEND_MODE = "screen";
const TRANSMISSION_LINES = [
  "dialing glorp...",
  "checking if you're secretly a dog...",
  "saving you a tiny seat...",
];

/* =========================================================
   GLOBAL
   ========================================================= */

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html {
    background: #d8ff00;
  }

  body {
    margin: 0;
    background: #d8ff00;
    color: #0a0a0a;
  }

  button,
  input {
    font: inherit;
  }

  button {
    -webkit-tap-highlight-color: transparent;
  }

  ::selection {
    background: #0a0a0a;
    color: #d8ff00;
  }
`;

const Page = styled.main`
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: 14px;
  background: #d8ff00;
  font-family: "Arial Rounded MT Bold", "Trebuchet MS", Arial, sans-serif;

  @media (min-width: 700px) {
    padding: 32px;
  }
`;

const Shell = styled.section`
  width: min(100%, 470px);
`;

const Topbar = styled.header`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 14px;
`;

const Wordmark = styled.span`
  font-size: 29px;
  font-weight: 1000;
  letter-spacing: -0.09em;
  text-transform: lowercase;
`;

const Card = styled.div`
  width: 100%;
  border: 2px solid #0a0a0a;
  border-radius: 28px;
  background: #fffdf3;
  box-shadow: 5px 5px 0 #0a0a0a;
  overflow: hidden;
`;

const FormCard = styled(Card)`
  padding: 28px 20px 22px;

  @media (min-width: 700px) {
    padding: 36px 32px 30px;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(34px, 9.5vw, 46px);
  line-height: 0.95;
  letter-spacing: -0.065em;
  font-weight: 1000;
`;

const Copy = styled.p`
  margin: 13px 0 26px;
  font-size: 16px;
  line-height: 1.35;
  font-weight: 700;
`;

const Form = styled.form`
  display: grid;
  gap: 14px;
`;

const Field = styled.label`
  display: grid;
  gap: 7px;
  font-size: 13px;
  font-weight: 900;
`;

const InputWrap = styled.div`
  position: relative;
`;

const Prefix = styled.span`
  position: absolute;
  left: 16px;
  top: 50%;
  translate: 0 -50%;
  font-size: 16px;
  font-weight: 900;
`;

const Input = styled.input`
  width: 100%;
  min-height: 56px;
  padding: ${({ $prefixed }) =>
    $prefixed ? "0 16px 0 36px" : "0 16px"};
  border: 2px solid #0a0a0a;
  border-radius: 16px;
  outline: none;
  background: #fff;
  color: #0a0a0a;
  font-size: 16px;
  font-weight: 700;

  &::placeholder {
    color: #99978d;
  }

  &:focus {
    box-shadow: 0 0 0 3px #d8ff00;
  }
`;

const Button = styled.button`
  width: 100%;
  min-height: 56px;
  border: 2px solid #0a0a0a;
  border-radius: 16px;
  background: #0a0a0a;
  color: #d8ff00;
  cursor: pointer;
  font-size: 16px;
  font-weight: 1000;

  transition:
    translate 120ms ease,
    box-shadow 120ms ease,
    opacity 120ms ease;

  &:hover:not(:disabled) {
    translate: 0 -2px;
    box-shadow: 0 4px 0 #6a7600;
  }

  &:active:not(:disabled) {
    translate: 0 1px;
    box-shadow: none;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.34;
  }
`;

const ErrorText = styled.p`
  margin: -2px 0 0;
  color: #b42318;
  font-size: 13px;
  line-height: 1.35;
  font-weight: 800;
`;

const loadBar = keyframes`
  from {
    transform: scaleX(0);
  }

  to {
    transform: scaleX(1);
  }
`;

const TransmittingCard = styled(Card)`
  min-height: min(68svh, 570px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 24px;
  padding: 24px 20px 22px;
`;

const UfoStage = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 2px solid #0a0a0a;
  border-radius: 22px;
  background: #efffa8;
`;

const UfoImage = styled.img`
  position: absolute;
  inset: 0;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
`;

const TransmittingTitle = styled.h1`
  min-height: 2.2em;
  margin: 0 0 14px;
  font-size: clamp(27px, 8vw, 38px);
  line-height: 1.05;
  letter-spacing: -0.045em;
  font-weight: 1000;
  text-align: center;
`;

const ProgressTrack = styled.div`
  height: 10px;
  border: 2px solid #0a0a0a;
  border-radius: 999px;
  overflow: hidden;
  background: #fff;
`;

const Progress = styled.div`
  width: 100%;
  height: 100%;
  transform-origin: left center;
  background: #d8ff00;
  animation: ${loadBar} 3s linear forwards;
`;

const TicketCard = styled(Card)`
  padding: 24px 18px 18px;

  @media (min-width: 700px) {
    padding: 30px 26px 24px;
  }
`;

const TicketHeading = styled.h1`
  margin: 0;
  font-size: clamp(36px, 10vw, 48px);
  line-height: 0.95;
  letter-spacing: -0.055em;
  font-weight: 1000;
`;

const TicketCopy = styled.p`
  margin: 10px 0 18px;
  font-size: 15px;
  line-height: 1.35;
  font-weight: 700;
`;

const TicketVisual = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;

  border: 2px solid #0a0a0a;
  border-radius: 20px;
  background: #0a0a0a;
`;

const TicketImage = styled.img`
  position: relative;
  display: block;

  width: 100%;
  height: auto;

  object-fit: contain;
`;

const TicketFallback = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 24px;
  background: #d8ff00;
  color: #0a0a0a;
  text-align: center;
  font-size: clamp(36px, 11vw, 72px);
  line-height: 0.86;
  font-weight: 1000;
  letter-spacing: -0.07em;
  text-transform: uppercase;
`;

const TicketHandle = styled.div`
  position: absolute;
  z-index: 2;

  left: ${TICKET_HANDLE_X}%;
  top: ${TICKET_HANDLE_Y}%;

  transform:
    translate(-50%, -50%)
    rotate(${TICKET_HANDLE_ROTATION}deg);

  width: 88%;

  color: ${TICKET_HANDLE_COLOR};
  mix-blend-mode: ${TICKET_HANDLE_BLEND_MODE};

  text-align: center;

  font-family:
    "Arial Rounded MT Bold",
    "Trebuchet MS",
    Arial,
    sans-serif;

  font-size: clamp(18px, 5vw, 30px);
  line-height: 1;
  font-weight: 900;

  letter-spacing: -0.035em;

  text-shadow: none;
  overflow-wrap: anywhere;
`;

const Actions = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 14px;
`;

/* =========================================================
   HELPERS
   ========================================================= */

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const cleanHandle = (value) =>
  value.trim().replace(/^@+/, "").toLowerCase();

function isEvmAddress(value) {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}

function isXHandle(value) {
  return /^[a-zA-Z0-9_]{1,15}$/.test(cleanHandle(value));
}

function loadImage(source) {
  return new Promise((resolve) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);

    image.src = source;
  });
}

/* =========================================================
   GENERATE FINAL TICKET IMAGE
   ========================================================= */

async function makeTicket(handle) {
  const base = await loadImage("/glorpbg.png");

 const canvas = document.createElement("canvas");

canvas.width = base?.naturalWidth || 1200;
canvas.height = base?.naturalHeight || 600;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Your browser could not build the ticket.");
  }

  if (base) {
    context.drawImage(
      base,
      0,
      0,
      canvas.width,
      canvas.height,
    );
  } else {
    context.fillStyle = "#d8ff00";

    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height,
    );

    context.fillStyle = "#0a0a0a";
    context.textAlign = "center";
    context.textBaseline = "middle";

    context.font =
      `900 ${Math.round(canvas.width * 0.095)}px Arial`;

    context.fillText(
      "GLORP TICKET",
      canvas.width / 2,
      canvas.height * 0.42,
    );
  }

  const fontSize = Math.round(
    canvas.width * (TICKET_HANDLE_SIZE / 100),
  );

  context.textAlign = "center";
  context.textBaseline = "middle";

  context.font =
    `900 ${fontSize}px "Arial Rounded MT Bold", "Trebuchet MS", Arial, sans-serif`;

  context.fillStyle = TICKET_HANDLE_COLOR;

  context.save();

  context.globalCompositeOperation =
    TICKET_HANDLE_BLEND_MODE;

  context.translate(
    canvas.width * (TICKET_HANDLE_X / 100),
    canvas.height * (TICKET_HANDLE_Y / 100),
  );

  context.rotate(
    TICKET_HANDLE_ROTATION * (Math.PI / 180),
  );

  context.fillText(
    `@${handle}`,
    0,
    0,
  );

  context.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(
            new Error(
              "Your ticket could not be exported.",
            ),
          );

          return;
        }

        resolve(
          new File(
            [blob],
            `glorp-ticket-${handle}.png`,
            {
              type: "image/png",
            },
          ),
        );
      },
      "image/png",
      1,
    );
  });
}

/* =========================================================
   NEW — CREATE PUBLIC X SHARE PAGE
   ========================================================= */

async function createSharePage(handle, ticketFile) {
  const formData = new FormData();

  formData.append("handle", handle);
  formData.append("image", ticketFile);

  const response = await fetch(
    SUPABASE_SHARE_FUNCTION_URL,
    {
      method: "POST",
      body: formData,
    },
  );

  const body = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      body.message ||
        "could not prepare your X post.",
    );
  }

  if (!body.shareUrl) {
    throw new Error(
      "share page URL was not returned.",
    );
  }

  return body.shareUrl;
}

/* =========================================================
   COMPONENT
   ========================================================= */

export default function Home() {
  const [screen, setScreen] =
    useState("form");

  const [wallet, setWallet] =
    useState("");

  const [handle, setHandle] =
    useState("");

  const [
    confirmedHandle,
    setConfirmedHandle,
  ] = useState("");

  const [error, setError] =
    useState("");

  const [
    imageMissing,
    setImageMissing,
  ] = useState(false);

  const [
    transmissionLine,
    setTransmissionLine,
  ] = useState(0);

  /*
    NEW:
    This becomes the unique public page X will scrape.
  */
  const [shareUrl, setShareUrl] =
    useState("");

  const [
    ticketPreparing,
    setTicketPreparing,
  ] = useState(false);

  /* =========================================================
     HISTORY
     ========================================================= */

  useEffect(() => {
    const currentState =
      window.history.state ?? {};

    const currentScreen =
      currentState[HISTORY_KEY];

    if (
      currentScreen !== "form" &&
      currentScreen !== "ticket"
    ) {
      window.history.replaceState(
        {
          ...currentState,
          [HISTORY_KEY]: "form",
        },
        "",
      );
    }

    function handlePopState(event) {
      const nextScreen =
        event.state?.[HISTORY_KEY] ===
        "ticket"
          ? "ticket"
          : "form";

      setScreen(nextScreen);
      setError("");

      if (nextScreen === "form") {
        setWallet("");
        setHandle("");
        setShareUrl("");
      }
    }

    window.addEventListener(
      "popstate",
      handlePopState,
    );

    return () =>
      window.removeEventListener(
        "popstate",
        handlePopState,
      );
  }, []);

  /* =========================================================
     TRANSMISSION TEXT
     ========================================================= */

  useEffect(() => {
    if (screen !== "transmitting") {
      return undefined;
    }

    const timer =
      window.setInterval(() => {
        setTransmissionLine(
          (current) =>
            Math.min(
              current + 1,
              TRANSMISSION_LINES.length - 1,
            ),
        );
      }, 950);

    return () =>
      window.clearInterval(timer);
  }, [screen]);

  /* =========================================================
     EXISTING LOCAL TICKET
     ========================================================= */

  useEffect(() => {
    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    try {
      const parsed =
        JSON.parse(saved);

      if (
        parsed.handle &&
        isXHandle(parsed.handle)
      ) {
        const savedHandle =
          cleanHandle(
            parsed.handle,
          );

        queueMicrotask(() => {
          setConfirmedHandle(
            savedHandle,
          );

          if (
            window.history.state?.[
              HISTORY_KEY
            ] !== "ticket"
          ) {
            window.history.pushState(
              {
                ...(window.history
                  .state ?? {}),
                [HISTORY_KEY]:
                  "ticket",
              },
              "",
            );
          }

          setScreen("ticket");
        });
      }
    } catch {
      localStorage.removeItem(
        STORAGE_KEY,
      );
    }
  }, []);

  /* =========================================================
     NEW:
     BUILD IMAGE + SHARE PAGE IN BACKGROUND
     ========================================================= */

  useEffect(() => {
    if (
      screen !== "ticket" ||
      !confirmedHandle
    ) {
      return undefined;
    }

    let cancelled = false;

    setShareUrl("");
    setTicketPreparing(true);

    async function prepareShare() {
      try {
        /*
          1. Generate personalized PNG.
        */
        const ticket =
          await makeTicket(
            confirmedHandle,
          );

        if (cancelled) return;

        /*
          2. Upload it to our Edge Function.
             Function returns the unique
             publicly shareable URL.
        */
        const newShareUrl =
          await createSharePage(
            confirmedHandle,
            ticket,
          );

        if (cancelled) return;

        setShareUrl(
          newShareUrl,
        );
      } catch (caught) {
        if (cancelled) return;

        setError(
          caught instanceof Error
            ? caught.message
            : "could not prepare your X post.",
        );
      } finally {
        if (!cancelled) {
          setTicketPreparing(
            false,
          );
        }
      }
    }

    prepareShare();

    return () => {
      cancelled = true;
    };
  }, [
    screen,
    confirmedHandle,
  ]);

  /* =========================================================
     FORM VALIDATION
     ========================================================= */

  const normalizedHandle =
    useMemo(
      () => cleanHandle(handle),
      [handle],
    );

  const canSubmit =
    isXHandle(normalizedHandle) &&
    isEvmAddress(wallet);

  /* =========================================================
     SUBMIT TO SUPABASE
     ========================================================= */

  async function submitTransmission(
    event,
  ) {
    event.preventDefault();

    setError("");

    if (!canSubmit) {
      setError(
        "add a real X handle and EVM wallet.",
      );

      return;
    }

    setTransmissionLine(0);
    setScreen("transmitting");

    try {
      const request = fetch(
        SUPABASE_FUNCTION_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            wallet: wallet
              .trim()
              .toLowerCase(),

            twitterHandle:
              normalizedHandle,
          }),
        },
      );

      const [response] =
        await Promise.all([
          request,
          sleep(3000),
        ]);

      const body =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        if (
          response.status === 409 &&
          body.code ===
            "TWITTER_EXISTS"
        ) {
          throw new Error(
            "that X account already sent a signal.",
          );
        }

        if (
          response.status === 409
        ) {
          throw new Error(
            "that wallet already sent a signal.",
          );
        }

        throw new Error(
          body.message ||
            "glorp lost the signal. try again.",
        );
      }

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          handle:
            normalizedHandle,
        }),
      );

      setConfirmedHandle(
        normalizedHandle,
      );

      setImageMissing(false);

      if (
        window.history.state?.[
          HISTORY_KEY
        ] !== "ticket"
      ) {
        window.history.pushState(
          {
            ...(window.history
              .state ?? {}),
            [HISTORY_KEY]:
              "ticket",
          },
          "",
        );
      }

      setScreen("ticket");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "glorp lost the signal. try again.",
      );

      setScreen("form");
    }
  }

  /* =========================================================
     NEW — ONE BUTTON X SHARE
     ========================================================= */

 
  function shareTicket() {
  if (!shareUrl) {
    return;
  }

  const text =
    "i have sent my transmission request @glorpRBH 👽";

  const xUrl =
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(
      shareUrl
    )}`;

  window.location.href = xUrl;
}

  /* =========================================================
     UI
     ========================================================= */

  return (
    <>
      <GlobalStyle />

      <Page>
        <Shell>
          <Topbar>
            <Wordmark>
              
            </Wordmark>
          </Topbar>

          {/* FORM */}

          {screen === "form" && (
            <FormCard>
              <Title>
                glorp wants you to
                join his spaceship
              </Title>

              <Copy>
                send your X and
                wallet. he will
                think about it.
              </Copy>

              <Form
                onSubmit={
                  submitTransmission
                }
                noValidate
              >
                <Field>
                  your X

                  <InputWrap>
                    <Prefix>
                      @
                    </Prefix>

                    <Input
                      $prefixed
                      name="twitterHandle"
                      value={handle}
                      onChange={(
                        event,
                      ) =>
                        setHandle(
                          event
                            .target
                            .value,
                        )
                      }
                      placeholder="yourhandle"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={
                        false
                      }
                      maxLength={16}
                      aria-invalid={
                        Boolean(
                          handle,
                        ) &&
                        !isXHandle(
                          handle,
                        )
                      }
                    />
                  </InputWrap>
                </Field>

                <Field>
                  your wallet

                  <Input
                    name="wallet"
                    value={wallet}
                    onChange={(
                      event,
                    ) =>
                      setWallet(
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="0x..."
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={
                      false
                    }
                    maxLength={42}
                    aria-invalid={
                      Boolean(
                        wallet,
                      ) &&
                      !isEvmAddress(
                        wallet,
                      )
                    }
                  />
                </Field>

                {error && (
                  <ErrorText
                    role="alert"
                  >
                    {error}
                  </ErrorText>
                )}

                <Button
                  type="submit"
                  disabled={
                    !canSubmit
                  }
                >
                  send it to glorp
                </Button>
              </Form>
            </FormCard>
          )}

          {/* TRANSMITTING */}

          {screen ===
            "transmitting" && (
            <TransmittingCard
              aria-live="polite"
            >
              <UfoStage>
                <UfoImage
                  src="/ringring.gif"
                  alt="Glorp calling from his spaceship"
                  onError={(
                    event,
                  ) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />
              </UfoStage>

              <div>
                <TransmittingTitle>
                  {
                    TRANSMISSION_LINES[
                      transmissionLine
                    ]
                  }
                </TransmittingTitle>

                <ProgressTrack
                  aria-hidden="true"
                >
                  <Progress />
                </ProgressTrack>
              </div>
            </TransmittingCard>
          )}

          {/* FINAL TICKET */}

          {screen === "ticket" && (
            <TicketCard>
              <TicketHeading>
                glorp said maybe.
              </TicketHeading>

              <TicketCopy>
                post it on X. he
                likes attention.
              </TicketCopy>

              <TicketVisual>
                {imageMissing ? (
                  <TicketFallback>
                    Glorp ticket
                  </TicketFallback>
                ) : (
                  <TicketImage
                    src="/glorpbg.png"
                    alt={`GLORP ticket for @${confirmedHandle}`}
                    onError={() =>
                      setImageMissing(
                        true,
                      )
                    }
                  />
                )}

                <TicketHandle>
                  @{confirmedHandle}
                </TicketHandle>
              </TicketVisual>

              <Actions>
                <Button
                  type="button"
                  onClick={
                    shareTicket
                  }
                  disabled={
                    ticketPreparing ||
                    !shareUrl
                  }
                >
                  {ticketPreparing
                    ? "preparing transmission..."
                    : "post to X"}
                </Button>
              </Actions>

              {error && (
                <ErrorText
                  role="alert"
                  style={{
                    marginTop: 12,
                  }}
                >
                  {error}
                </ErrorText>
              )}
            </TicketCard>
          )}
        </Shell>
      </Page>
    </>
  );
}