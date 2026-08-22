"use client";
import dynamic from "next/dynamic";
import LicenseGate from "../../components/LicenseGate";
import "../../components/flight-chess/flight-chess.css";

const FlightChessApp = dynamic(
  () => import("../../components/flight-chess/FlightChessApp"),
  { ssr: false }
);

export default function FlightProPage() {
  return (
    <LicenseGate gameName="情侣飞行棋Pro">
      <FlightChessApp />
    </LicenseGate>
  );
}
