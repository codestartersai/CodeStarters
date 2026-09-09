import Link from "next/link";
import OnboardingFlow from "@/components/OnboardingFlow";

export default function StartPage() {
  return (
    <div>
      <Link href="/" className="text-sm text-slate-400 hover:text-slate-200">
        ← Back
      </Link>
      <div className="mt-6">
        <OnboardingFlow />
      </div>
    </div>
  );
}
