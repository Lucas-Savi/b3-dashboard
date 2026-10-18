interface Props {
  label: string;
  value: string;
  ok: boolean | null;
  description?: string;
}

export default function GrahamBadge({ label, value, ok, description }: Props) {
  const color =
    ok === null
      ? "border-gray-700 text-gray-400"
      : ok
      ? "border-green-700 text-green-400 bg-green-950"
      : "border-red-700 text-red-400 bg-red-950";

  return (
    <div className={`rounded-lg border p-4 ${color}`}>
      <div className="text-xs uppercase tracking-wide opacity-70 mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      {description && <div className="text-xs mt-1 opacity-60">{description}</div>}
    </div>
  );
}
