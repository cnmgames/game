"use client";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)", padding: "20px 16px 40px" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
          <Link href="/register" style={{ display: "inline-flex", alignItems: "center", padding: "6px 14px", borderRadius: "9999px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.85)", fontSize: "13px", textDecoration: "none", backdropFilter: "blur(10px)", fontWeight: 500 }}>
            返回
          </Link>
        </div>
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "28px 24px", backdropFilter: "blur(10px)" }}>
          <h1 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: "700", marginBottom: "8px", textAlign: "center" }}>隐私声明</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", textAlign: "center", marginBottom: "24px" }}>最后更新：2026年9月9日</p>

          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9rem", lineHeight: "1.8" }}>
            <h2 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600", margin: "24px 0 12px" }}>一、信息收集</h2>
            <p>我们仅收集为您提供服务所必需的信息：</p>
            <p>1. 注册信息：邮箱地址、密码（加密存储）。</p>
            <p>2. 设备信息：设备标识、IP地址、浏览器类型（用于设备绑定和安全防护）。</p>
            <p>3. 使用记录：访问页面、访问时间（用于统计和优化服务）。</p>
            <p>4. 激活码信息：您使用的激活码及激活时间。</p>

            <h2 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600", margin: "24px 0 12px" }}>二、信息使用</h2>
            <p>我们收集的信息仅用于以下目的：</p>
            <p>1. 提供和维护本平台的正常服务。</p>
            <p>2. 验证用户身份，保障账号安全。</p>
            <p>3. 设备绑定，防止账号共享和滥用。</p>
            <p>4. 统计分析，优化用户体验。</p>
            <p>5. 发送重要通知（如服务变更、安全提醒）。</p>

            <h2 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600", margin: "24px 0 12px" }}>三、信息存储与保护</h2>
            <p>1. 您的密码采用加密方式存储，我们无法查看您的明文密码。</p>
            <p>2. 我们采取合理的技术措施保护您的个人信息安全，包括但不限于数据加密、访问控制、安全审计等。</p>
            <p>3. 我们不会将您的个人信息出售、出租或分享给任何第三方，法律法规要求的除外。</p>
            <p>4. 您的个人信息存储在中国大陆境内的服务器上。</p>

            <h2 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600", margin: "24px 0 12px" }}>四、信息共享</h2>
            <p>在以下情况下，我们可能会共享您的信息：</p>
            <p>1. 获得您的明确同意。</p>
            <p>2. 根据法律法规要求，或应政府主管部门的要求。</p>
            <p>3. 为维护本平台及用户的合法权益。</p>

            <h2 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600", margin: "24px 0 12px" }}>五、Cookie使用</h2>
            <p>1. 本平台使用Cookie和本地存储技术，用于保持登录状态和提升用户体验。</p>
            <p>2. 您可以通过浏览器设置禁用Cookie，但这可能影响部分功能的正常使用。</p>

            <h2 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600", margin: "24px 0 12px" }}>六、您的权利</h2>
            <p>1. 您有权访问、更正、删除您的个人信息。</p>
            <p>2. 您有权注销账号，注销后我们将删除您的个人信息（法律法规要求保留的除外）。</p>
            <p>3. 您有权撤回对个人信息处理的同意。</p>
            <p>4. 如需行使上述权利，请联系客服微信：nbioss。</p>

            <h2 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600", margin: "24px 0 12px" }}>七、未成年人保护</h2>
            <p>本平台仅面向18周岁以上成年人。我们不会主动收集未成年人的个人信息。如您是未成年人，请在监护人陪同下阅读本声明，并在监护人同意后使用本平台。</p>

            <h2 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600", margin: "24px 0 12px" }}>八、声明更新</h2>
            <p>我们可能会适时更新本隐私声明，更新后的声明将在平台上公布。请您定期查阅本声明以了解最新内容。</p>

            <h2 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: "600", margin: "24px 0 12px" }}>九、联系我们</h2>
            <p>如对本隐私声明有任何疑问，可通过以下方式联系我们：</p>
            <p>客服微信：nbioss</p>
          </div>
        </div>
      </div>
    </div>
  );
}
