import { useRef, useState } from "react";
import { CheckCircle2, FileSignature, Loader2, Upload, AlertTriangle } from "lucide-react";

type Props = {
  initialUploadedAt: string | null;
  onUploaded: (uploadedAt: string) => void;
};

const ACCEPT =
  ".pdf,.png,.jpg,.jpeg,.heic,.heif,application/pdf,image/png,image/jpeg,image/heic,image/heif";

export function WaiverPanel({ initialUploadedAt, onUploaded }: Props) {
  const [uploadedAt, setUploadedAt] = useState<string | null>(initialUploadedAt);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePick = () => inputRef.current?.click();

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const prepRes = await fetch("/api/firehacks/waiver/prepare", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type,
        }),
      });
      const prep = await prepRes.json().catch(() => ({}));
      if (!prepRes.ok) {
        throw new Error(prep.error || `Could not start upload (${prepRes.status})`);
      }

      const uploadRes = await fetch(prep.signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });
      if (!uploadRes.ok) {
        throw new Error("Upload failed. Try a smaller PDF or photo.");
      }

      const completeRes = await fetch("/api/firehacks/waiver/complete", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: prep.path }),
      });
      const json = await completeRes.json().catch(() => ({}));
      if (!completeRes.ok) {
        throw new Error(json.error || `Could not finish upload (${completeRes.status})`);
      }

      setUploadedAt(json.waiver_uploaded_at);
      onUploaded(json.waiver_uploaded_at);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const formattedDate = uploadedAt
    ? new Date(uploadedAt).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#161616] p-6 md:p-7">
      <div className="flex items-center gap-2 mb-5">
        <FileSignature className="w-4 h-4 text-red-500" />
        <p
          className="text-[0.65rem] tracking-[0.25em] text-red-500 uppercase"
          style={{ fontFamily: "var(--font-fh-heading), monospace" }}
        >
          Waiver
        </p>
      </div>

      <input ref={inputRef} type="file" accept={ACCEPT} onChange={onChange} className="hidden" />

      {uploadedAt ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-emerald-300 font-semibold">Waiver on file</p>
              <p className="text-emerald-200/70 mt-0.5">Uploaded {formattedDate}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handlePick}
            disabled={uploading}
            className="w-full h-11 rounded-xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300 text-sm transition-colors disabled:opacity-60 disabled:pointer-events-none inline-flex items-center justify-center gap-2"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Replace waiver
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-zinc-400 text-sm leading-relaxed">
            Upload your signed waiver to finish check-in. PDF, PNG, JPG, or HEIC up to 15&nbsp;MB.
          </p>
          <button
            type="button"
            onClick={handlePick}
            disabled={uploading}
            className="w-full h-12 rounded-xl bg-red-500 hover:bg-red-400 text-white font-semibold transition-colors disabled:opacity-60 disabled:pointer-events-none inline-flex items-center justify-center gap-2"
            style={{ fontFamily: "var(--font-fh-heading), monospace" }}
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            {uploading ? "Uploading…" : "Upload Waiver"}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2 text-sm">
          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-red-300">{error}</p>
        </div>
      )}
    </div>
  );
}
