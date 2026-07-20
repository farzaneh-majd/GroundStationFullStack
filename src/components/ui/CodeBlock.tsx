export default function CodeBlock({ value }: { value: unknown }) {
  return (
    <pre className="gs-scrollbar max-h-[360px] overflow-auto rounded bg-black p-4 text-sm text-green-400">
      {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
    </pre>
  );
}
