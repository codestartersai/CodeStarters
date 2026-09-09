import { Utensils } from "lucide-react";

export type Redemption = {
  id: string;
  kind: string;
  redeemed_at: string;
};

type Props = {
  redemptions: Redemption[];
};

const KIND_LABEL: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
  meal: "Meal",
};

export function RedemptionsPanel({ redemptions }: Props) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#161616] p-6 md:p-7">
      <div className="flex items-center gap-2 mb-5">
        <Utensils className="w-4 h-4 text-red-500" />
        <p
          className="text-[0.65rem] tracking-[0.25em] text-red-500 uppercase"
          style={{ fontFamily: "var(--font-fh-heading), monospace" }}
        >
          Meals Redeemed
        </p>
      </div>

      {redemptions.length === 0 ? (
        <p className="text-zinc-500 text-sm">
          No meals redeemed yet. Show your QR pass at the food line to claim a meal.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-800">
          {redemptions.map((r) => (
            <li key={r.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <span
                className="text-zinc-100"
                style={{ fontFamily: "var(--font-fh-heading), monospace" }}
              >
                {KIND_LABEL[r.kind] ?? r.kind}
              </span>
              <span className="text-zinc-500 text-sm">
                {new Date(r.redeemed_at).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
