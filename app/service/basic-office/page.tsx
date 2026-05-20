import type { Metadata } from "next";
import BasicOfficeClient from "./BasicOfficeClient";

export const metadata: Metadata = {
  title: "BASIC OFFICE Service | NovolBa",
  description: "5〜30人用の一社占有家具付きオフィス。渋谷・新宿・五反田・東日本橋エリアを中心に展開。",
};

export default function BasicOfficePage() {
  return <BasicOfficeClient />;
}
