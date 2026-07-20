export default function TextField({
  label,
  value,
  onChange,
  placeholder,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helper?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-xs text-[#9fa7b3]">{label}</div>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded border border-[#2f3240] bg-[#111217] px-3 py-2 text-[#d8d9da] outline-none transition placeholder:text-[#5f6673] focus:border-[#73BF69]"
      />
      {helper && <div className="mt-1 text-xs text-[#6f7785]">{helper}</div>}
    </label>
  );
}
