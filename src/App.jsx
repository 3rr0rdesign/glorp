"use client";

import { useEffect, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";

/* =========================================================
   MINT TIME

   August 20, 2026
   16:00 UTC

   Date.UTC uses UTC — NOT the user's local timezone.
   ========================================================= */

const MINT_TIME = Date.UTC(
  2026, // year
  7,    // August (January = 0)
  20,   // day
  16,   // 16:00 = 4 PM UTC
  0,
  0,
);
/* =========================================================
   GLOBAL
   ========================================================= */

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: "Xirod";
    src:
      url("/xirod.woff2") format("woff2"),
      url("/xirod.ttf") format("truetype");
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    margin: 0;
    width: 100%;
    min-height: 100%;
    background: #d8ff00;
  }

  body {
    margin: 0;
    background: #d8ff00;
    color: #0a0a0a;
    overflow-x: hidden;
  }

  ::selection {
    background: #0a0a0a;
    color: #d8ff00;
  }
`;

/* =========================================================
   PAGE
   ========================================================= */

const Page = styled.main`
  width: 100%;
  min-height: 100svh;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 32px 20px;

  background: #d8ff00;
  color: #0a0a0a;

  font-family: "Xirod", Arial, sans-serif;

  @media (max-width: 600px) {
    padding: 24px 14px;
  }
`;

const Content = styled.section`
  width: 100%;
  max-width: 1200px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  text-align: center;
`;

/* =========================================================
   TITLE
   ========================================================= */

const Title = styled.h1`
  margin: 0 0 46px;

  font-family: "Xirod", Arial, sans-serif;
  font-size: clamp(30px, 5vw, 72px);
  font-weight: normal;
  line-height: 1;

  text-transform: lowercase;

  @media (max-width: 600px) {
    margin-bottom: 32px;
    font-size: clamp(27px, 9vw, 42px);
  }
`;

/* =========================================================
   COUNTDOWN
   ========================================================= */

const Countdown = styled.div`
  width: 100%;

  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));

  gap: clamp(10px, 2vw, 28px);

  @media (max-width: 600px) {
    gap: 7px;
  }
`;

const TimeBlock = styled.div`
  min-width: 0;

  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Number = styled.div`
  width: 100%;

  font-family: "Xirod", Arial, sans-serif;

  font-size: clamp(43px, 9vw, 120px);
  line-height: 0.95;
  font-weight: normal;

  white-space: nowrap;
  letter-spacing: -0.04em;

  @media (max-width: 600px) {
    font-size: clamp(34px, 12vw, 58px);
  }

  @media (max-width: 390px) {
    font-size: clamp(28px, 11vw, 46px);
  }
`;

const Label = styled.div`
  margin-top: 15px;

  font-family: "Xirod", Arial, sans-serif;

  font-size: clamp(8px, 1.15vw, 15px);
  line-height: 1;

  text-transform: uppercase;

  @media (max-width: 600px) {
    margin-top: 10px;
    font-size: 7px;
  }
`;

/* =========================================================
   MINT LIVE STATE
   ========================================================= */

const MintingNow = styled.div`
  font-family: "Xirod", Arial, sans-serif;

  font-size: clamp(42px, 9vw, 120px);
  line-height: 1;

  text-align: center;
  text-transform: lowercase;
`;

/* =========================================================
   HELPERS
   ========================================================= */

function calculateTimeLeft() {
  const now = Date.now();

  const difference = Math.max(
    0,
    MINT_TIME - now,
  );

  const days = Math.floor(
    difference / (1000 * 60 * 60 * 24),
  );

  const hours = Math.floor(
    (difference / (1000 * 60 * 60)) % 24,
  );

  const minutes = Math.floor(
    (difference / (1000 * 60)) % 60,
  );

  const seconds = Math.floor(
    (difference / 1000) % 60,
  );

  return {
    difference,
    days,
    hours,
    minutes,
    seconds,
  };
}

function formatTime(number) {
  return String(number).padStart(2, "0");
}

/* =========================================================
   COMPONENT
   ========================================================= */

export default function Home() {
  const [timeLeft, setTimeLeft] = useState(
    calculateTimeLeft,
  );

  useEffect(() => {
    const updateCountdown = () => {
      setTimeLeft(calculateTimeLeft());
    };

    updateCountdown();

    const interval = window.setInterval(
      updateCountdown,
      1000,
    );

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const mintIsLive =
    timeLeft.difference <= 0;

  return (
    <>
      <GlobalStyle />

      <Page>
        <Content>
          {!mintIsLive ? (
            <>
              <Title>
                minting in:
              </Title>

              <Countdown
                aria-label="Countdown until mint"
                aria-live="polite"
              >
                <TimeBlock>
                  <Number>
                    {formatTime(timeLeft.days)}
                  </Number>

                  <Label>
                    days
                  </Label>
                </TimeBlock>

                <TimeBlock>
                  <Number>
                    {formatTime(timeLeft.hours)}
                  </Number>

                  <Label>
                    hours
                  </Label>
                </TimeBlock>

                <TimeBlock>
                  <Number>
                    {formatTime(timeLeft.minutes)}
                  </Number>

                  <Label>
                    minutes
                  </Label>
                </TimeBlock>

                <TimeBlock>
                  <Number>
                    {formatTime(timeLeft.seconds)}
                  </Number>

                  <Label>
                    seconds
                  </Label>
                </TimeBlock>
              </Countdown>
            </>
          ) : (
            <MintingNow>
              minting now
            </MintingNow>
          )}
        </Content>
      </Page>
    </>
  );
}