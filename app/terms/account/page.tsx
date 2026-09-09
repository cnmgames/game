"use client";
import Link from "next/link";

export default function AccountTermsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)", padding: "20px 16px 40px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
          <Link href="/register" style={{ display: "inline-flex", alignItems: "center", padding: "6px 14px", borderRadius: "9999px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.85)", fontSize: "13px", textDecoration: "none", backdropFilter: "blur(10px)", fontWeight: 500 }}>
            返回
          </Link>
        </div>
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "28px 24px", backdropFilter: "blur(10px)" }}>
          <h1 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: "700", marginBottom: "8px", textAlign: "center" }}>账号协议</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", textAlign: "center", marginBottom: "24px" }}>最后更新：2026年9月9日</p>

          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9rem", lineHeight: "1.8" }}>
            <h2 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600", margin: "24px 0 12px" }}>一、账号归属</h2>
            <p>1. 用户通过邮箱注册获得本平台账号使用权，账号所有权归本平台所有。</p>
            <p>2. 用户不得将账号转让、出借、出售给他人使用。</p>
            <p>3. 因用户转让、出借账号导致的任何损失，由用户自行承担。</p>

            <h2 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600", margin: "24px 0 12px" }}>二、设备绑定规则</h2>
            <p>1. 每个账号最多支持同时绑定3台设备。</p>
            <p>2. 设备绑定基于设备唯一标识，同一设备重复登录不增加绑定数量。</p>
            <p>3. 超过30天未活跃的设备将自动解除绑定。</p>
            <p>4. 当绑定设备达到3台时，新设备将无法登录，需在已绑定设备上使用或联系客服解绑。</p>
            <p>5. 清理浏览器缓存可能导致设备标识变化，被识别为新设备，请谨慎操作。</p>

            <h2 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600", margin: "24px 0 12px" }}>三、激活码使用规则</h2>
            <p>1. 激活码用于解锁付费游戏内容，分为周卡（7天）和永久卡（永久）。</p>
            <p>2. 激活码一经使用即与账号绑定，不可转移。</p>
            <p>3. 激活码仅限本人使用，禁止共享、转卖。</p>
            <p>4. 发现激活码被共享或滥用的，本平台有权禁用该激活码及关联账号。</p>
            <p>5. 激活码有效期自激活之日起计算，周卡到期后需重新激活。</p>

            <h2 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600", margin: "24px 0 12px" }}>四、账号安全</h2>
            <p>1. 用户应妥善保管账号密码，建议使用强密码并定期更换。</p>
            <p>2. 用户发现账号被盗或异常登录时，应立即修改密码并联系客服。</p>
            <p>3. 因用户自身原因（如密码泄露、设备丢失）导致的账号损失，本平台不承担责任。</p>
            <p>4. 本平台不会以任何理由向用户索要密码，请勿向他人透露密码。</p>

            <h2 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600", margin: "24px 0 12px" }}>五、账号封禁</h2>
            <p>用户有以下行为之一的，本平台有权封禁账号：</p>
            <p>1. 违反服务协议或用户行为规范。</p>
            <p>2. 共享、转卖账号或激活码。</p>
            <p>3. 利用系统漏洞获取不正当利益。</p>
            <p>4. 攻击、入侵平台系统。</p>
            <p>5. 传播违法违规内容。</p>
            <p>账号被封禁后，已激活的付费内容将无法使用，且不支持退款。</p>

            <h2 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600", margin: "24px 0 12px" }}>六、账号注销</h2>
            <p>1. 用户有权申请注销账号，注销后账号将无法恢复。</p>
            <p>2. 账号注销后，已激活的付费内容将同时失效，不支持退款。</p>
            <p>3. 注销账号后，我们将删除您的个人信息（法律法规要求保留的除外）。</p>
            <p>4. 如需注销账号，请联系客服微信：nbioss。</p>

            <h2 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600", margin: "24px 0 12px" }}>七、付费与退款</h2>
            <p>1. 本平台付费服务为虚拟商品，一经购买或激活，不支持退款。</p>
            <p>2. 如因平台系统故障导致无法正常使用服务，可联系客服协商解决。</p>
            <p>3. 购买激活码请通过官方渠道，非官方渠道购买的激活码本平台不保证有效性。</p>

            <h2 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600", margin: "24px 0 12px" }}>八、协议变更</h2>
            <p>本平台有权随时修改本账号协议，修改后的协议将在平台上公布。用户继续使用账号即视为同意修改后的协议。</p>

            <h2 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600", margin: "24px 0 12px" }}>九、联系我们</h2>
            <p>如对本账号协议有任何疑问，可通过以下方式联系我们：</p>
            <p>客服微信：nbioss</p>
          </div>
        </div>
      </div>
    </div>
  );
}
