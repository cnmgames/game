// @ts-nocheck
// v32 remove external Icon import
"use client";
import { useState, useRef, useEffect } from "react";
import GameLayout from "../GameLayout";

const loveWords = [
  "遇见你，是我这辈子最幸运的事。",
  "你是我每天醒来的理由。",
  "和你在一起的每一秒，我都想珍藏。",
  "你笑起来的样子，是我见过最美的风景。",
  "不管未来多难，我都想牵着你的手走下去。",
  "你是我藏在心底最柔软的秘密。",
  "认识你之后，我的世界才有了颜色。",
  "你不用多好，我喜欢就好。",
  "余生很长，请多指教。",
  "你是我所有浪漫的源头。",
  "我爱你，比昨天多一点，比明天少一点。",
  "你是我想跟全世界炫耀的人。",
];

export default function VoiceLoveGame() {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentWord, setCurrentWord] = useState("");
  const [playing, setPlaying] = useState(false);
  const [recordings, setRecordings] = useState<{ url: string; time: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // 检测浏览器支持的录音格式
  const getSupportedMimeType = (): string => {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/ogg;codecs=opus",
      "audio/wav",
    ];
    for (const type of types) {
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return "";
  };

  const startRecording = async () => {
    setError(null);
    try {
      // 检查浏览器支持
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("当前浏览器不支持录音功能，请使用最新版 Chrome、Safari 或 Firefox");
        return;
      }
      if (typeof MediaRecorder === "undefined") {
        setError("当前浏览器不支持 MediaRecorder，请升级浏览器");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const mr = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mr.onstop = () => {
        try {
          const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          setRecordings((prev) => [...prev, { url, time: new Date().toLocaleTimeString() }]);
        } catch (e) {
          setError("录音保存失败，请重试");
        } finally {
          // 停止所有音轨
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
          }
        }
      };

      mr.onerror = (e) => {
        setError("录音过程中出错，请重试");
        setRecording(false);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      };

      mr.start(100); // 每100ms收集一次数据
      setRecording(true);
    } catch (e: any) {
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        setError("麦克风权限被拒绝，请在浏览器设置中允许访问麦克风");
      } else if (e.name === "NotFoundError" || e.name === "DevicesNotFoundError") {
        setError("未检测到麦克风设备，请检查设备连接");
      } else if (e.name === "NotReadableError") {
        setError("麦克风被其他应用占用，请关闭其他使用麦克风的应用");
      } else {
        setError("无法访问麦克风：" + (e.message || "未知错误"));
      }
      setRecording(false);
    }
  };

  const stopRecording = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    } catch (e) {
      setError("停止录音时出错");
    }
    setRecording(false);
  };

  const playWord = () => {
    const word = loveWords[Math.floor(Math.random() * loveWords.length)];
    setCurrentWord(word);
    if ("speechSynthesis" in window) {
      const utter = new SpeechSynthesisUtterance(word);
      utter.lang = "zh-CN";
      utter.rate = 0.9;
      utter.pitch = 1.1;
      utter.onstart = () => setPlaying(true);
      utter.onend = () => setPlaying(false);
      window.speechSynthesis.speak(utter);
    }
  };

  const stopSpeak = () => {
    window.speechSynthesis?.cancel();
    setPlaying(false);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      recordings.forEach((r) => URL.revokeObjectURL(r.url));
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <GameLayout title="语音恋爱">
      <div className="space-y-5">
        {/* 情话播放 */}
        <div className="rounded-2xl border border-pink-400/30 bg-gradient-to-br from-pink-500/10 to-purple-500/10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF375F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            <h3 className="text-sm font-bold text-white">甜蜜情话</h3>
          </div>
          {currentWord && (
            <div className="rounded-xl bg-white/5 p-4 mb-3 fade-in-up">
              <p className="text-base text-white/90 leading-relaxed italic">"{currentWord}"</p>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={playWord}
              disabled={playing}
              className="flex-1 rounded-full py-3 text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #FF375F 0%, #BF5AF2 100%)" }}
            >
              {playing ? "播放中..." : "随机情话"}
            </button>
            {playing && (
              <button
                onClick={stopSpeak}
                className="rounded-full bg-white/10 px-4 py-3 text-sm font-semibold text-white/70 hover:bg-white/20 transition"
              >
                停止
              </button>
            )}
          </div>
        </div>

        {/* 录音区 */}
        <div className="rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
            <h3 className="text-sm font-bold text-white">录音告白</h3>
          </div>
          <div className="text-center py-4">
            <button
              onClick={recording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                recording
                  ? "bg-red-500 animate-pulse scale-110"
                  : "bg-gradient-to-br from-purple-500 to-pink-500 hover:scale-105"
              }`}
            >
              {recording ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
              )}
            </button>
            <p className="mt-3 text-sm text-white/60">
              {recording ? "录音中... 点击停止" : "点击开始录音"}
            </p>
            {error && (
              <div className="mt-3 rounded-lg bg-red-500/20 border border-red-500/40 p-3 text-xs text-red-300">
                {error}
              </div>
            )}
          </div>

          {/* 最新录音 */}
          {audioUrl && (
            <div className="mt-3 rounded-xl bg-white/5 p-3">
              <p className="text-xs text-white/50 mb-2">最新录音</p>
              <audio src={audioUrl} controls className="w-full" />
            </div>
          )}
        </div>

        {/* 录音列表 */}
        {recordings.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-white/40">录音列表 ({recordings.length})</p>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {recordings.map((r, i) => (
                <div key={i} className="rounded-lg bg-white/5 p-2 flex items-center gap-2">
                  <span className="text-xs text-white/40 w-16">{r.time}</span>
                  <audio src={r.url} controls className="flex-1 h-8" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 玩法说明 */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold text-white/60 mb-2">玩法建议</p>
          <ul className="text-xs text-white/50 space-y-1">
            <li>• 轮流播放随机情话，听对方说给你听</li>
            <li>• 录下你想对TA说的话，互相播放</li>
            <li>• 可以录下今天的心情，保存成回忆</li>
            <li>• 真心话时间：录一段不敢当面说的话</li>
          </ul>
        </div>
      </div>
    </GameLayout>
  );
}
