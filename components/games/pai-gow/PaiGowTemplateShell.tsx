"use client";

import React, { useCallback, useRef, useState } from "react";

import GameWindow from "@/components/shared/GameWindow";
import { paiGow } from "./paiGowConfig";
import PaiGowTable, { type PaiGowTableHandle, type PaiGowTableStatus } from "./PaiGowTable";

// Pai Gow runs inside the platform GameWindow so results + lifecycle controls
// behave consistently on the submissions preview site.
export default function PaiGowTemplateShell() {
  const tableRef = useRef<PaiGowTableHandle | null>(null);
  const [status, setStatus] = useState<PaiGowTableStatus | null>(null);
  const [gameId, setGameId] = useState<bigint>(() => BigInt(Date.now()));

  const onStatusChange = useCallback((s: PaiGowTableStatus) => {
    setStatus(s);
  }, []);

  const onReset = useCallback(() => {
    tableRef.current?.reset();
    setGameId(BigInt(Date.now()));
  }, []);

  const onPlayAgain = useCallback(() => {
    tableRef.current?.playAgain();
    setGameId(BigInt(Date.now()));
  }, []);

  const onRewatch = useCallback(() => {
    tableRef.current?.rewatch();
    setGameId(BigInt(Date.now()));
  }, []);

  const betAmount = status?.betAmount ?? 0;
  const payout = status?.payout ?? 0;

  const showResults = !!status?.isGameFinished;
  const breakdown = status?.breakdown;

  const format = (n: number | undefined) => (Number.isFinite(n as number) ? String(n) : "0");

  return (
    <div className="pgShell">
      <GameWindow
        game={paiGow}
        isLoading={!!status?.isLoading}
        // We show our own Pai Gow breakdown modal (includes side bet hit + multiplier).
        isGameFinished={false}
        betAmount={betAmount}
        payout={payout}
        inReplayMode={false}
        isUserOriginalPlayer={true}
        showPNL={false}
        onReset={onReset}
        onPlayAgain={onPlayAgain}
        onRewatch={onRewatch}
        currentGameId={gameId}
        disableBuiltInSong={true}
      >
        {/* GameWindow renders a background image; mount Pai Gow UI as an overlay on top of it. */}
        <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
          <PaiGowTable ref={tableRef} onStatusChange={onStatusChange} />
        </div>

        {showResults ? (
          <div
            role="dialog"
            aria-label="Pai Gow results"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 40,
              display: "grid",
              placeItems: "center",
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              style={{
                width: "min(560px, calc(100vw - 28px))",
                borderRadius: 18,
                border: "1px solid rgba(215,225,230,0.16)",
                background: "linear-gradient(180deg, rgba(18,18,18,0.96), rgba(10,10,10,0.88))",
                boxShadow: "0 20px 80px rgba(0,0,0,0.65)",
                padding: 14,
                color: "rgba(255,255,255,0.92)",
                fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
                <div>
                  <div style={{ fontWeight: 950, letterSpacing: 1.4, opacity: 0.9 }}>RESULT</div>
                  <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>Pai Gow (Face Up)</div>
                </div>
                <div style={{ fontSize: 26, fontWeight: 950, letterSpacing: 0.6 }}>
                  {payout >= 0 ? "+" : ""}{format(payout)} APE
                </div>
              </div>

              <div style={{ marginTop: 12, padding: 12, borderRadius: 16, border: "1px solid rgba(215,225,230,0.12)", background: "rgba(0,0,0,0.18)" }}>
                <div style={{ display: "grid", gap: 8, fontSize: 13 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontWeight: 900, opacity: 0.8 }}>Main bet</div>
                    <div>{format(breakdown?.main.wager)} → <strong>{format(breakdown?.main.payout)}</strong></div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontWeight: 900, opacity: 0.8 }}>Bonus bet</div>
                    <div>
                      {format(breakdown?.bonus.wager)} → <strong>{format(breakdown?.bonus.payout)}</strong>
                      {breakdown?.bonus.hit ? (
                        <span style={{ opacity: 0.75, marginLeft: 8 }}>
                          ({breakdown.bonus.hit.name} x{breakdown.bonus.hit.multiplier})
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontWeight: 900, opacity: 0.8 }}>Push bet</div>
                    <div>
                      {format(breakdown?.push.wager)} → <strong>{format(breakdown?.push.payout)}</strong>
                      {breakdown?.push.hit ? (
                        <span style={{ opacity: 0.75, marginLeft: 8 }}>
                          ({breakdown.push.hit.name} x{breakdown.push.hit.multiplier})
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {breakdown?.outcome ? (
                    <div style={{ marginTop: 2, fontSize: 12, opacity: 0.7 }}>
                      Outcome: {breakdown.outcome}{breakdown.dealerAceHighPaiGow ? " • Dealer Ace High Pai Gow" : ""}
                    </div>
                  ) : null}
                </div>
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
                <button
                  className="btn"
                  onClick={onRewatch}
                  style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(215,225,230,0.18)", background: "rgba(20,20,20,0.80)" }}
                >
                  Rewatch
                </button>
                <button
                  className="btn"
                  onClick={onReset}
                  style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(215,225,230,0.18)", background: "rgba(20,20,20,0.80)" }}
                >
                  Change bet
                </button>
                <button
                  className="btn"
                  onClick={onPlayAgain}
                  style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(140,255,0,0.22)", background: "rgba(10,12,10,0.92)" }}
                >
                  Play again
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </GameWindow>
    </div>
  );
}
