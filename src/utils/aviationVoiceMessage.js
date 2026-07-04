/** Voice message helpers — aligned with aviation-crew mobile (AAC .m4a). */

const TARGET_SAMPLE_RATE = 44100;
const TARGET_CHANNELS = 1;
const ENCODE_FRAME_SIZE = 1024;
const CREW_VOICE_MIME = "audio/m4a";

export function formatVoiceDuration(ms) {
  const totalSec = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function buildVoiceMessageLabel(durationMs) {
  return formatVoiceDuration(durationMs);
}

export function pickVoiceRecorderMimeType() {
  const candidates = [
    "audio/mp4",
    "audio/mp4;codecs=mp4a.40.2",
    "audio/aac",
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];
  if (typeof MediaRecorder === "undefined") return "";
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function isCrewNativeAudio(mimeType) {
  const mime = String(mimeType || "").toLowerCase();
  return (
    mime.includes("mp4") ||
    mime.includes("m4a") ||
    mime.includes("aac")
  );
}

function createM4aFile(blob) {
  const file = new File([blob], `voice-${Date.now()}.m4a`, { type: CREW_VOICE_MIME });
  return {
    blob,
    file,
    mimeType: CREW_VOICE_MIME,
    fileType: "audio",
  };
}

async function decodeBlobToAudioBuffer(blob) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    throw new Error("This browser cannot process voice recordings.");
  }

  const audioContext = new AudioCtx();
  try {
    const arrayBuffer = await blob.arrayBuffer();
    return audioContext.decodeAudioData(arrayBuffer.slice(0));
  } finally {
    await audioContext.close().catch(() => {});
  }
}

async function resampleToMono(audioBuffer) {
  const length = Math.max(1, Math.ceil(audioBuffer.duration * TARGET_SAMPLE_RATE));
  const offline = new OfflineAudioContext(TARGET_CHANNELS, length, TARGET_SAMPLE_RATE);
  const source = offline.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offline.destination);
  source.start(0);
  return offline.startRendering();
}

async function encodeBufferToM4a(audioBuffer) {
  if (typeof AudioEncoder === "undefined" || typeof AudioData === "undefined") {
    throw new Error(
      "Voice encoding is not supported in this browser. Please use Chrome, Edge, or Safari.",
    );
  }

  const { ArrayBufferTarget, Muxer } = await import("mp4-muxer");

  const config = {
    codec: "mp4a.40.2",
    sampleRate: TARGET_SAMPLE_RATE,
    numberOfChannels: TARGET_CHANNELS,
    bitrate: 64000,
  };

  const support = await AudioEncoder.isConfigSupported(config);
  if (!support.supported) {
    throw new Error("AAC encoding is not supported in this browser.");
  }

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    audio: {
      codec: "aac",
      sampleRate: TARGET_SAMPLE_RATE,
      numberOfChannels: TARGET_CHANNELS,
    },
    fastStart: "in-memory",
  });

  let encodeError = null;
  const encoder = new AudioEncoder({
    output: (chunk, meta) => {
      muxer.addAudioChunk(chunk, meta);
    },
    error: (error) => {
      encodeError = error;
    },
  });

  encoder.configure(config);

  const samples = audioBuffer.getChannelData(0);
  const totalFrames = audioBuffer.length;
  let timestampUs = 0;

  for (let offset = 0; offset < totalFrames; offset += ENCODE_FRAME_SIZE) {
    const frameLength = Math.min(ENCODE_FRAME_SIZE, totalFrames - offset);
    const frameData = samples.subarray(offset, offset + frameLength);

    const audioData = new AudioData({
      format: "f32-planar",
      sampleRate: TARGET_SAMPLE_RATE,
      numberOfFrames: frameLength,
      numberOfChannels: 1,
      timestamp: timestampUs,
      data: frameData,
    });

    encoder.encode(audioData);
    audioData.close();
    timestampUs += Math.round((frameLength / TARGET_SAMPLE_RATE) * 1_000_000);
  }

  await encoder.flush();
  encoder.close();

  if (encodeError) {
    throw encodeError;
  }

  muxer.finalize();
  return new Blob([muxer.target.buffer], { type: "audio/mp4" });
}

/**
 * Crew caches every downloaded voice file as `.m4a` and plays with the native AAC
 * player. WebM/WAV content saved with an `.m4a` extension stops immediately on play.
 * Always upload real AAC-in-M4A, matching crew iOS (44100 Hz mono).
 */
export async function convertRecordingToCrewFormat(blob) {
  const mime = String(blob.type || "").toLowerCase();

  if (isCrewNativeAudio(mime)) {
    return createM4aFile(blob);
  }

  const decoded = await decodeBlobToAudioBuffer(blob);
  const resampled = await resampleToMono(decoded);
  const m4aBlob = await encodeBufferToM4a(resampled);
  return createM4aFile(m4aBlob);
}

export function buildVoiceAttachment({ file, durationMs, localPreview }) {
  return {
    file,
    name: file.name,
    type: file.type,
    fileType: "audio",
    durationMs,
    localPreview,
    uri: localPreview,
  };
}
