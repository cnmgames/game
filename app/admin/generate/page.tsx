"use client";
import Link from "next/link";
import React from "react";
import { generateCode, TYPE_NAMES } from "../../../lib/license";

export default class GeneratePage extends React.Component {
  constructor(props: {}) {
    super(props);
    this.state = {
      type: 3,
      count: 1,
      codes: [] as string[],
      copied: false,
    };
  }

  state: {
    type: number;
    count: number;
    codes: string[];
    copied: boolean;
  };

  handleGenerate = () => {
    const newCodes: string[] = [];
    for (let i = 0; i < this.state.count; i++) {
      newCodes.push(generateCode(this.state.type));
    }
    this.setState({ codes: newCodes, copied: false });
  };

  handleCopy = async () => {
    const text = this.state.codes.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch {
      // 降级方案
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    }
  };

  handleDownload = () => {
    const text = this.state.codes.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `激活码_${TYPE_NAMES[this.state.type]}_${this.state.codes.length}个.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  render() {
    const { type, count, codes, copied } = this.state;
    const typeOptions = [
      { value: 1, label: "天卡", desc: "1天有效期" },
      { value: 2, label: "周卡", desc: "7天有效期" },
      { value: 3, label: "月卡", desc: "30天有效期" },
      { value: 4, label: "季卡", desc: "90天有效期" },
    ];

    return (
      <>
        <div className="bg-aurora" />
        <div className="relative z-10 mx-auto min-h-screen w-full max-w-2xl px-4 py-8">
          <div className="mb-6">
            <Link href="/" className="back-btn inline-flex">← 返回首页</Link>
          </div>

          <div className="game-container">
            <div className="text-center mb-6">
              <h1 className="game-title">激活码生成器</h1>
              <div className="game-title-underline" />
              <p className="mt-3 text-sm text-white/60">生成天卡 / 周卡 / 月卡 / 季卡激活码</p>
            </div>

            {/* 类型选择 */}
            <div className="mb-6">
              <label className="block text-sm text-white/70 mb-3">选择卡类型</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {typeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => this.setState({ type: opt.value })}
                    className={`rounded-xl border p-3 text-center transition ${
                      type === opt.value
                        ? "border-pink-400/60 bg-pink-500/20 ring-2 ring-pink-400/30"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="text-base font-semibold">{opt.label}</div>
                    <div className="text-xs text-white/50 mt-1">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 数量选择 */}
            <div className="mb-6">
              <label className="block text-sm text-white/70 mb-2">生成数量：{count} 个</label>
              <input
                type="range"
                min="1"
                max="50"
                value={count}
                onChange={(e) => this.setState({ count: parseInt(e.target.value) })}
                className="w-full accent-pink-500"
              />
              <div className="flex justify-between text-xs text-white/40 mt-1">
                <span>1</span>
                <span>50</span>
              </div>
            </div>

            {/* 生成按钮 */}
            <button
              onClick={this.handleGenerate}
              className="w-full rounded-full bg-pink-500 py-3 text-base font-semibold text-white shadow-lg shadow-pink-500/40 hover:bg-pink-400 transition mb-6"
            >
              🎫 生成激活码
            </button>

            {/* 生成结果 */}
            {codes.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">已生成 {codes.length} 个{TYPE_NAMES[type]}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={this.handleCopy}
                      className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs text-white/70 hover:bg-white/10 transition"
                    >
                      {copied ? "✓ 已复制" : "复制全部"}
                    </button>
                    <button
                      onClick={this.handleDownload}
                      className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs text-white/70 hover:bg-white/10 transition"
                    >
                      下载TXT
                    </button>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-black/30 p-3">
                  <div className="space-y-2">
                    {codes.map((code, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
                      >
                        <span className="font-mono text-sm text-pink-200">{code}</span>
                        <button
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(code);
                            } catch {}
                          }}
                          className="text-xs text-white/40 hover:text-white/70"
                        >
                          复制
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 text-center text-xs text-white/40">
              <p>激活码格式：XXXX-XXXX-XXXXX</p>
              <p className="mt-1">用户在 /activate 页面输入激活码即可解锁</p>
            </div>
          </div>
        </div>
      </>
    );
  }
}
