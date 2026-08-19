"use client";

import { useEffect, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";

/* =========================================================
   MINT TIME

   August 20, 2026
   16:00 UTC / 4:00 PM UTC

   This is one fixed worldwide moment.
   Every device counts down to the same timestamp.
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

    font-family: "Xirod", Arial, sans-serif;
    font-weight: 400;

    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
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
  min-height: 100vh;
  min-height: 100svh;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 32px 20px;

  background: #d8ff00;
  color: #0a0a0a;

  font-family: "Xirod", Arial, sans-serif;
  font-weight: 400;

  @media (max-width: 600px) {
    padding: 24px 12px;
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
  font-weight: 400;
  line-height: 1;

  text-transform: lowercase;

  @media (max-width: 600px) {
    margin-bottom: 32px;
    font-size: clamp(26px, 8vw, 42px);
  }

  @media (max-width: 390px) {
    font-size: 25px;
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
    gap: 6px;
  }

  @media (max-width: 390px) {
    gap: 3px;
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
  font-weight: 400;

  font-size: clamp(43px, 9vw, 120px);
  line-height: 0.95;

  white-space: nowrap;
  letter-spacing: -0.04em;

  @media (max-width: 600px) {
    font-size: clamp(30px, 11vw, 54px);
  }

  @media (max-width: 390px) {
    font-size: clamp(25px, 10vw, 40px);
  }
`;

const Label = styled.div`
  margin-top: 15px;

  font-family: "Xirod", Arial, sans-serif;
  font-weight: 400;

  font-size: clamp(8px, 1.15vw, 15px);
  line-height: 1;

  text-transform: uppercase;

  @media (max-width: 600px) {
    margin-top: 10px;
    font-size: 7px;
  }

  @media (max-width: 390px) {
    font-size: 6px;
  }
`;

/* =========================================================
   MINT LIVE STATE
   ========================================================= */

const MintingNow = styled.div`
  font-family: "Xirod", Arial, sans-serif;
  font-weight: 400;

  font-size: clamp(42px, 9vw, 120px);
  line-height: 1;

  text-align: center;
  text-transform: lowercase;

  @media (max-width: 600px) {
    font-size: clamp(30px, 10vw, 60px);
  }
`;

/* =========================================================
   COUNTDOWN HELPERS
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