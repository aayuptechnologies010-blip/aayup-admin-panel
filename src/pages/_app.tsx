import type { AppProps } from "next/app";
import "@/index.css";
import "@/performance-optimizations.css";
import { Providers } from "@/components/Providers";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  );
}
