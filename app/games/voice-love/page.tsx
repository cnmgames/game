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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setRecordings(prev => [...prev, { url, time: new Date().toLocaleTimeString() }]);
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      setRecording(true);
    } catch (e) {
      alert("无法访问麦克风，请检查权限设置");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
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
      recordings.forEach(r => URL.revokeObjectURL(r.url));
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
