import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { QrCode } from "lucide-react";

type Props = {
  passToken: string;
  fullName: string;
};

export function QrPanel({ passToken, fullName }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(passToken, {
      margin: 1,
      width: 720,
      errorCorrectionLevel: "M",
      color: { dark: "#0a0a0a", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [passToken]);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#161616] p-6 md:p-7">
      <div className="flex items-center gap-2 mb-5">
        <QrCode className="w-4 h-4 text-red-500" />
        <p
          className="text-[0.65rem] tracking-[0.25em] text-red-500 uppercase"
          style={{ fontFamily: "var(--font-fh-heading), monospace" }}
        >
          Your Pass
        </p>
      </div>

      <div className="bg-white rounded-xl p-5 flex items-center justify-center aspect-square w-full max-w-xs mx-auto">
        {dataUrl ? (
          <img src={dataUrl} alt="Fire Hacks pass QR" className="w-full h-full" />
        ) : (
          <div className="w-full h-full bg-zinc-100 animate-pulse rounded" />
        )}
      </div>

      <p
        className="text-zinc-100 text-center mt-5 text-lg"
        style={{ fontFamily: "var(--font-fh-heading), monospace" }}
      >
        {fullName}
      </p>
      <p className="text-zinc-500 text-center text-xs mt-2">
        Show this at check-in and at the food line.
      </p>
    </div>
  );
}
