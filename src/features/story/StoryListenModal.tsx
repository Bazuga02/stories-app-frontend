"use client";

import { Pause, Play, Square, Volume2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { VOICES } from "./story-page-constants";
import type { UseStoryNarrationReturn } from "./useStoryNarration";

type StoryListenModalProps = {
  open: boolean;
  storyTitle: string;
  narration: UseStoryNarrationReturn;
};

export function StoryListenModal({ open, storyTitle, narration }: StoryListenModalProps) {
  const {
    narrating,
    listening,
    audioReady,
    currentSec,
    durationSec,
    voice,
    setVoice,
    speed,
    setSpeed,
    closeAudioModal,
    onPlayPauseNarration,
    onStopNarration,
    onSeek,
    onListenFromScratch,
    formatTime,
    progressPct,
  } = narration;

  return (
    <Modal
      open={open}
      onClose={closeAudioModal}
      title="Listen to Story"
      variant="editorial"
      className="max-w-2xl"
    >
      <p className="-mt-1 mb-6 line-clamp-2 text-sm leading-relaxed text-on-secondary-container">
        {storyTitle || "Untitled"}
      </p>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-surface-container-lowest p-4 editorial-shadow sm:p-5">
          <label className="font-headline text-[0.65rem] font-bold tracking-[0.2em] text-primary uppercase">
            Voice
          </label>
          <select
            className="mt-3 w-full cursor-pointer rounded-xl border border-outline-variant/25 bg-surface-container-high px-3 py-3 text-sm font-medium text-on-background outline-none transition-shadow focus:ring-2 focus:ring-primary/35"
            value={voice}
            onChange={(e) => {
              setVoice(e.target.value);
              onStopNarration();
            }}
          >
            {VOICES.map((v) => (
              <option key={v.label} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
        <div className="rounded-2xl bg-surface-container-lowest p-4 editorial-shadow sm:p-5">
          <label className="font-headline text-[0.65rem] font-bold tracking-[0.2em] text-primary uppercase">
            Pace
          </label>
          <p className="mt-1 text-xs text-on-secondary-container">Speed: {speed}</p>
          <input
            type="range"
            min={-10}
            max={10}
            step={1}
            value={speed}
            onChange={(e) => {
              setSpeed(Number(e.target.value));
              onStopNarration();
            }}
            className="mt-4 w-full accent-primary"
            aria-label="Narration speed"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={narrating}
          onClick={() => {
            void onPlayPauseNarration();
          }}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 font-headline text-sm font-bold text-on-primary editorial-shadow transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-wait disabled:opacity-80 sm:px-10 sm:text-base"
        >
          {narrating ? (
            <span
              className="size-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent"
              aria-hidden
            />
          ) : listening ? (
            <Pause className="size-5 shrink-0 fill-current" strokeWidth={2} />
          ) : (
            <Play className="size-5 shrink-0 fill-current" strokeWidth={2} />
          )}
          {audioReady ? (listening ? "Pause" : "Resume") : "Play narration"}
        </button>
        <button
          type="button"
          onClick={onStopNarration}
          disabled={!audioReady}
          className="inline-flex items-center gap-2 rounded-full border-2 border-outline/35 bg-transparent px-5 py-3 font-headline text-sm font-bold text-on-background transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"
        >
          <Square className="size-4" strokeWidth={2} />
          Stop
        </button>
        {audioReady ? (
          <button
            type="button"
            onClick={onListenFromScratch}
            className="inline-flex items-center gap-2 rounded-full border-2 border-outline/35 bg-transparent px-5 py-3 font-headline text-sm font-bold text-on-background transition-colors hover:border-primary hover:text-primary"
          >
            <Volume2 className="size-4" strokeWidth={2} />
            Replay
          </button>
        ) : null}
      </div>

      <div className="mt-8 rounded-2xl bg-surface-container-high/90 p-4 sm:p-5">
        <div className="mb-2 flex items-center gap-2">
          <Volume2 className="size-4 text-primary" aria-hidden />
          <span className="font-headline text-xs font-bold tracking-widest text-on-secondary-container uppercase">
            Progress
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={0.5}
          value={progressPct}
          onChange={(e) => onSeek(e.target.value)}
          disabled={!audioReady}
          className="w-full cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Narration progress"
        />
        <div className="mt-3 flex items-center justify-between font-login-body text-xs text-on-secondary-container sm:text-sm">
          <span className="font-medium tabular-nums">
            {audioReady ? formatTime(currentSec) : "0:00"}
          </span>
          <span className="max-w-[50%] text-center text-[0.7rem] sm:text-xs">
            {audioReady ? (listening ? "Playing" : "Paused") : "Choose voice & press play"}
          </span>
          <span className="font-medium tabular-nums">
            {audioReady ? formatTime(durationSec) : "0:00"}
          </span>
        </div>
      </div>
    </Modal>
  );
}
