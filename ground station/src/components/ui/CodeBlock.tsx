export default function CodeBlock({ value }: { value: unknown }) {
  return (
    <pre className="gs-scrollbar max-h-[360px] overflow-auto rounded-[var(--gs-radius)] border border-[var(--gs-border-weak)] bg-[var(--gs-bg-canvas)] p-4 font-mono text-xs leading-relaxed text-[var(--gs-text)]">
      {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
    </pre>
  );
}
