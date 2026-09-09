"use client";
import Link from "next/link";

export default function ServiceTermsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)", padding: "20px 16px 40px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
          <Link href="/register" style={{ display: "inline-flex", alignItems: "center", padding: "6px 14px", borderRadius: "9999px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.85)", fontSize: "13px", textDecoration: "none", backdropFilter: "blur(10px)", fontWeight: 500 }}>
            返回
          </Link>
        </div>
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "28px 24px", backdropFilter: "blur(10px)" }}>
          <h1 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: "700", marginBottom: "8px", textAlign: "center" }}>服务协议</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", textAlign: "center", marginBottom: "24px" }}>最后更新：2026年9月9日</p>

          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9rem", lineHeight: "1.8" }}>
            <h2 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600", margin: "24px 0 12px" }}>一、服务说明</h2>
            <p>欢迎使用情侣游戏平台（以下简称"本平台"）。本平台为成年情侣提供互动小游戏服务，包括但不限于情侣飞行棋、真心话大冒险、情趣骰子等多种游戏内容。</p>

            <h2 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600", margin: "24px 0 12px" }}>二、账号注册与使用</h2>
            <p>1. 用户需年满18周岁方可注册和使用本平台服务。</p>
            <p>2. 用户注册时需提供真实有效的邮箱地址，并完成邮箱验证。</p>
            <p>3. 用户应妥善保管账号密码，因用户自身原因导致的账号泄露或损失，本平台不承担责任。</p>
            <p>4. 每个账号最多支持3台设备同时登录，超出限制将无法在新设备登录。</p>

            <h2 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600", margin: "24px 0 12px" }}>三、激活码与付费服务</h2>
            <p>1. 本平台部分游戏需要激活码解锁，用户可通过官方渠道购买激活码。</p>
            <p>2. 激活码分为周卡（7天有效）和永久卡（永久有效）两种类型。</p>
            <p>3. 激活码一经使用，不支持退换。</p>
            <p>4. 禁止共享、转卖激活码，一经发现将禁用该激活码。</p>

            <h2 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600", margin: "24px 0 12px" }}>四、用户行为规范</h2>
            <p>1. 用户在使用本平台时应遵守法律法规，不得利用本平台从事任何违法活动。</p>
            <p>2. 禁止传播淫秽、色情、暴力、反动等违法违规内容。</p>
            <p>3. 禁止攻击、入侵本平台系统，干扰平台正常运行。</p>
            <p>4. 违反上述规定的，本平台有权封禁用户账号，并保留追究法律责任的权利。</p>

            <h2 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600", margin: "24px 0 12px" }}>五、服务变更与终止</h2>
            <p>1. 本平台有权根据业务发展需要，变更、暂停或终止部分或全部服务。</p>
            <p>2. 如遇不可抗力（包括但不限于自然灾害、网络故障、政策变化等）导致服务中断，本平台不承担责任。</p>

            <h2 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600", margin: "24px 0 12px" }}>六、免责声明</h2>
            <p>1. 本平台提供的游戏内容仅供娱乐，用户应根据自身情况合理使用。</p>
            <p>2. 用户在使用本平台游戏过程中发生的任何人身伤害或财产损失，本平台不承担责任。</p>
            <p>3. 本平台不对服务的连续性、及时性、安全性做任何明示或暗示的保证。</p>

            <h2 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600", margin: "24px 0 12px" }}>七、协议修改</h2>
            <p>本平台有权随时修改本协议内容，修改后的协议将在平台上公布。用户继续使用本平台服务即视为同意修改后的协议。</p>

            <h2 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600", margin: "24px 0 12px" }}>八、联系我们</h2>
            <p>如对本协议有任何疑问，可通过以下方式联系我们：</p>
            <p>客服微信：nbioss</p>
          </div>
        </div>
      </div>
    </div>
  );
}
