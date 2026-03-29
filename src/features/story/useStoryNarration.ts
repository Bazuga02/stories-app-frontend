"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { narrateStory } from "@/services/tts.service";
import { getApiErrorMessage } from "@/services/api";
import type { Story, User } from "@/types";

export function useStoryNarration(story: Story | null, user: User | null | undefined) {
  const [narrating, setNarrating] = useState(false);
  const [listening, setListening] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [currentSec, setCurrentSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [voice, setVoice] = useState("");
  const [speed, setSpeed] = useState(0);
  const [audioModalOpen, setAudioModalOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const attachAudioEvents = (audio: HTMLAudioElement) => {
    audio.ontimeupdate = () => {
      setCurrentSec(audio.currentTime || 0);
    };
    audio.onloadedmetadata = () => {
      setDurationSec(Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    audio.onended = () => {
      setListening(false);
      setCurrentSec(0);
    };
  };

  const onStopNarration = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentSec(0);
    setListening(false);
    setAudioReady(false);
    audioRef.current = null;
  }, []);

  const onPlayPauseNarration = useCallback(async () => {
    if (!story) return;
    if (!user) {
      toast.message("You have to sign in to play voice");
      return;
    }
    if (audioRef.current && audioReady) {
      if (listening) {
        audioRef.current.pause();
        setListening(false);
      } else {
        try {
          await audioRef.current.play();
          setListening(true);
        } catch {
          toast.error("Could not play narration");
        }
      }
      return;
    }
    if (narrating) return;

    setNarrating(true);
    try {
      const res = await narrateStory(story.id, {
        hl: "en-us",
        voice: voice || undefined,
        rate: speed,
        codec: "MP3",
      });
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const src = res.audioBase64.startsWith("data:")
        ? res.audioBase64
        : `data:${res.contentType};base64,${res.audioBase64}`;
      const audio = new Audio(src);
      attachAudioEvents(audio);
      audioRef.current = audio;
      await audio.play();
      setAudioReady(true);
      setListening(true);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Could not narrate this story"));
      setListening(false);
      setAudioReady(false);
    } finally {
      setNarrating(false);
    }
  }, [story, user, audioReady, listening, narrating, voice, speed]);

  const formatTime = (sec: number) => {
    if (!Number.isFinite(sec) || sec < 0) return "0:00";
    const total = Math.floor(sec);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const progressPct =
    durationSec > 0 ? Math.min(100, Math.max(0, (currentSec / durationSec) * 100)) : 0;

  const onSeek = (value: string) => {
    if (!audioRef.current || !durationSec) return;
    const pct = Number(value);
    if (!Number.isFinite(pct)) return;
    const nextSec = (pct / 100) * durationSec;
    audioRef.current.currentTime = nextSec;
    setCurrentSec(nextSec);
  };

  const onListenFromScratch = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setListening(false);
      setAudioReady(false);
      audioRef.current = null;
    }
    void onPlayPauseNarration();
  }, [onPlayPauseNarration]);

  const closeAudioModal = useCallback(() => {
    onStopNarration();
    setAudioModalOpen(false);
  }, [onStopNarration]);

  const openListen = useCallback(() => {
    if (!story || !user) return;
    setAudioModalOpen(true);
  }, [story, user]);

  return {
    narrating,
    listening,
    audioReady,
    currentSec,
    durationSec,
    voice,
    setVoice,
    speed,
    setSpeed,
    audioModalOpen,
    openListen,
    closeAudioModal,
    onPlayPauseNarration,
    onStopNarration,
    onSeek,
    onListenFromScratch,
    formatTime,
    progressPct,
  };
}

export type UseStoryNarrationReturn = ReturnType<typeof useStoryNarration>;
