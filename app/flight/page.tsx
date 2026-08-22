"use client";
import dynamic from "next/dynamic";
import "../../components/flight-chess/flight-chess.css";

const FlightChessApp = dynamic(
  () => import("../../components/flight-chess/FlightChessApp"),
  { ssr: false }
);

export default function FlightPage() {
  return <FlightChessApp />;
}
