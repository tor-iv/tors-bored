import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface Props {
  params: Promise<{ sku: string }>;
}

export default async function PiecePage({ params }: Props) {
  const { sku } = await params;
  const supabase = await createClient();

  const { data: item } = await supabase
    .from('items')
    .select('*')
    .eq('sku', sku)
    .single();

  if (!item) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <p className="font-mono text-xs text-[var(--ink-muted)] uppercase mb-2">TICKET: {sku}</p>
      <h1 className="text-2xl font-bold text-[var(--ink)]">{item.title}</h1>
      <p className="mt-4 text-[var(--ink-muted)] text-sm">{item.description}</p>
      <p className="mt-8 text-[var(--ink-muted)] text-xs uppercase">Full piece page — coming in Phase 2</p>
    </div>
  );
}
