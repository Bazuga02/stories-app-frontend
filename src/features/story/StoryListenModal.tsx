"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Pause, Play, Square, Volume2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/cn";
import { VOICES } from "./story-page-constants";
import type { UseStoryNarrationReturn } from "./useStoryNarration";

type StoryListenModalProps = {
  open: boolean;
  storyTitle: string;
  narration: UseStoryNarrationReturn;
};

function voiceMeta(label: string, value: string) {
  const name = label.replace(/\s*\(.*\)\s*$/, "").replace(/^Default\s*/, "").trim() || "Linda";
  const initial = name.charAt(0).toUpperCase();
  const gender = /male/i.test(label)
    ? "Male"
    : /female/i.test(label) || value === "" || /Linda|Amy|Mary/i.test(name)
      ? "Female"
      : "Voice";
  return { name, initial, gender };
}

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

  const [voiceOpen, setVoiceOpen] = useState(false);
  const voiceMenuRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selected = VOICES.find((v) => v.value === voice) ?? VOICES[0];
  const selectedMeta = voiceMeta(selected.label, selected.value);

  const statusLabel = audioReady ? (listening ? "Playing" : "Paused") : "Ready";

  useEffect(() => {
    if (!open) setVoiceOpen(false);
  }, [open]);

  useEffect(() => {
    if (!voiceOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!voiceMenuRef.current?.contains(e.target as Node)) setVoiceOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVoiceOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [voiceOpen]);

  return (
    <Modal
      open={open}
      onClose={closeAudioModal}
      title="Listen"
      variant="editorial"
      compact
      className="!max-w-xl"
    >
      <p className="-mt-1 mb-3 line-clamp-1 font-login-body text-xs text-secondary">
        {storyTitle || "Untitled"}
      </p>

      {/* Select first: voice + pace */}
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="relative rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-2.5">
          <label className="font-login-label text-[0.6rem] font-bold tracking-[0.14em] text-primary uppercase">
            Voice
          </label>

          <div className="relative mt-1.5" ref={voiceMenuRef}>
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={voiceOpen}
              aria-controls={listboxId}
              onClick={() => setVoiceOpen((o) => !o)}
              className={cn(
                "flex w-full items-center gap-2 rounded-xl border bg-editorial-surface px-2 py-1.5 text-left transition-all",
                voiceOpen
                  ? "border-primary/40 ring-2 ring-primary/15"
                  : "border-outline-variant/35 hover:border-primary/30",
              )}
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary font-headline text-[0.65rem] font-black text-on-primary">
                {selectedMeta.initial}
              </span>
              <span className="min-w-0 flex-1 truncate font-headline text-xs font-bold text-on-surface">
                {selectedMeta.name}
              </span>
              <ChevronDown
                className={cn(
                  "size-3.5 shrink-0 text-secondary transition-transform duration-200",
                  voiceOpen && "rotate-180 text-primary",
                )}
                strokeWidth={2.25}
                aria-hidden
              />
            </button>

            {voiceOpen ? (
              <ul
                id={listboxId}
                role="listbox"
                aria-label="Narration voices"
                className="absolute left-0 right-0 z-20 mt-1.5 max-h-48 overflow-y-auto rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-1 shadow-floating"
              >
                {VOICES.map((v) => {
                  const meta = voiceMeta(v.label, v.value);
                  const active = v.value === voice;
                  return (
                    <li key={v.label} role="option" aria-selected={active}>
                      <button
                        type="button"
                        onClick={() => {
                          setVoice(v.value);
                          onStopNarration();
                          setVoiceOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors",
                          active ? "bg-primary/10" : "hover:bg-surface-container-high",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-full font-headline text-[0.6rem] font-black",
                            active
                              ? "bg-primary text-on-primary"
                              : "bg-surface-container-high text-on-surface",
                          )}
                        >
                          {meta.initial}
                        </span>
                        <span className="min-w-0 flex-1 truncate font-headline text-xs font-bold text-on-surface">
                          {meta.name}
                        </span>
                        <span className="shrink-0 text-[0.6rem] font-medium text-secondary">
                          {meta.gender}
                        </span>
                        {active ? (
                          <Check
                            className="size-3.5 shrink-0 text-primary"
                            strokeWidth={2.5}
                            aria-hidden
                          />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-2.5">
          <div className="flex items-center justify-between gap-2">
            <label className="font-login-label text-[0.6rem] font-bold tracking-[0.14em] text-primary uppercase">
              Pace
            </label>
            <span className="font-login-label text-[0.65rem] font-bold tabular-nums text-on-secondary-container">
              {speed > 0 ? `+${speed}` : speed}
            </span>
          </div>
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
            className="mt-2.5 w-full accent-primary"
            aria-label="Narration speed"
          />
        </div>
      </div>

      {/* Play after selection */}
      <div className="rounded-xl bg-primary p-3.5 text-on-primary shadow-lg shadow-primary/15">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <span className="font-login-label text-[0.6rem] font-bold tracking-[0.14em] text-primary-fixed uppercase">
            Narration
          </span>
          <span className="rounded-full bg-on-primary/15 px-2 py-0.5 font-login-label text-[0.6rem] font-bold text-on-primary">
            {statusLabel}
          </span>
        </div>

        <div className="mb-2.5 flex items-center gap-2.5">
          <button
            type="button"
            disabled={narrating}
            onClick={() => {
              void onPlayPauseNarration();
            }}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest text-primary transition-transform hover:scale-105 disabled:cursor-wait disabled:opacity-70"
            aria-label={
              narrating ? "Loading narration" : listening ? "Pause" : "Play"
            }
          >
            {narrating ? (
              <span
                className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
                aria-hidden
              />
            ) : listening ? (
              <Pause className="size-4 fill-current" strokeWidth={2} />
            ) : (
              <Play className="size-4 fill-current" strokeWidth={2} />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <input
              type="range"
              min={0}
              max={100}
              step={0.5}
              value={progressPct}
              onChange={(e) => onSeek(e.target.value)}
              disabled={!audioReady}
              className="w-full cursor-pointer accent-primary-fixed disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Narration progress"
            />
            <div className="mt-1 flex items-center justify-between font-login-body text-[0.65rem] text-on-primary/80 tabular-nums">
              <span>{audioReady ? formatTime(currentSec) : "0:00"}</span>
              <span>{audioReady ? formatTime(durationSec) : "0:00"}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={onStopNarration}
            disabled={!audioReady}
            className="inline-flex items-center gap-1 rounded-full border border-on-primary/25 bg-on-primary/10 px-2.5 py-1 font-login-label text-[0.65rem] font-bold text-on-primary transition-colors hover:bg-on-primary/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Square className="size-3" strokeWidth={2.25} />
            Stop
          </button>
          {audioReady ? (
            <button
              type="button"
              onClick={onListenFromScratch}
              className="inline-flex items-center gap-1 rounded-full border border-on-primary/25 bg-on-primary/10 px-2.5 py-1 font-login-label text-[0.65rem] font-bold text-on-primary transition-colors hover:bg-on-primary/20"
            >
              <Volume2 className="size-3" strokeWidth={2.25} />
              Replay
            </button>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
