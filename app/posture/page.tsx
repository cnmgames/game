"use client";
import LicenseGate from "@/components/LicenseGate";
import PostureCardApp from '@/components/posture-card/PostureCardApp';

export default function PosturePage() {
  return (
    <LicenseGate gameName="姿势大全">
      <PostureCardApp />
    </LicenseGate>
  );
}
