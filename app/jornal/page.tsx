import type { Metadata } from "next";
import { JornalEdicao } from "./JornalEdicao";

export const metadata: Metadata = { title: "Jornal do Fólium" };

export default function Jornal() {
  return <JornalEdicao />;
}
