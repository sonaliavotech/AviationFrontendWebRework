import { useCallback, useEffect, useRef, useState } from "react";
import {
  convertRecordingToCrewFormat,
  pickVoiceRecorderMimeType,
} from "../utils/aviationVoiceMessage";

export function useVoiceRecorder({ onRecorded, onError } = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [durationMs, setDurationMs] = useState(0);
  const [processing, setProcessing] = useState(false);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const startedAtRef = useRef(0);
  const timerRef = useRef(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    clearTimer();
    stopStream();
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    startedAtRef.current = 0;
    setIsRecording(false);
    setDurationMs(0);
    setProcessing(false);
  }, [clearTimer, stopStream]);

  const cancelRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = () => cleanup();
      recorder.stop();
      return;
    }
    cleanup();
  }, [cleanup]);

  const startRecording = useCallback(async () => {
    if (isRecording || processing || mediaRecorderRef.current) return false;

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      onError?.("Microphone is not supported in this browser.");
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
        },
      });
      const mimeType = pickVoiceRecorderMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      streamRef.current = stream;
      chunksRef.current = [];
      startedAtRef.current = Date.now();
      setDurationMs(0);
      setIsRecording(true);

      recorder.ondataavailable = (event) => {
        if (event.data?.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        onError?.("Recording failed. Please try again.");
        cancelRecording();
      };

      recorder.onstop = async () => {
        const elapsed = Date.now() - startedAtRef.current;
        const rawBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType || mimeType || "audio/webm",
        });
        stopStream();
        clearTimer();
        mediaRecorderRef.current = null;
        chunksRef.current = [];
        startedAtRef.current = 0;
        setIsRecording(false);
        setDurationMs(elapsed);

        if (rawBlob.size > 0 && elapsed >= 500) {
          setProcessing(true);
          try {
            const converted = await convertRecordingToCrewFormat(rawBlob);
            const previewUrl = URL.createObjectURL(converted.blob);
            onRecorded?.({
              file: converted.file,
              durationMs: elapsed,
              localPreview: previewUrl,
            });
          } catch (err) {
            onError?.(err?.message || "Could not prepare voice message for sending.");
          } finally {
            setProcessing(false);
            setDurationMs(0);
          }
        } else if (elapsed >= 500) {
          onError?.("Recording was empty. Please try again.");
          setDurationMs(0);
        } else {
          setDurationMs(0);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250);
      timerRef.current = setInterval(() => {
        setDurationMs(Date.now() - startedAtRef.current);
      }, 200);
      return true;
    } catch (err) {
      cleanup();
      const denied = err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError";
      onError?.(
        denied
          ? "Microphone permission denied. Allow access in browser settings."
          : err?.message || "Unable to start recording.",
      );
      return false;
    }
  }, [cancelRecording, cleanup, clearTimer, isRecording, onError, onRecorded, processing, stopStream]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    clearTimer();
    recorder.stop();
  }, [clearTimer]);

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      stopRecording();
      return;
    }
    await startRecording();
  }, [isRecording, startRecording, stopRecording]);

  useEffect(() => () => cancelRecording(), [cancelRecording]);

  return {
    isRecording,
    processing,
    durationMs,
    startRecording,
    stopRecording,
    cancelRecording,
    toggleRecording,
  };
}
