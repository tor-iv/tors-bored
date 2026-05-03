interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <p className="font-mono text-xs text-[var(--ink-muted)] uppercase mb-2">ORDER: {id}</p>
      <p className="font-mono text-sm text-[var(--ink-muted)] uppercase">Order detail — coming soon</p>
    </div>
  );
}
