import Barcode from './Barcode';

/** Bottom-of-paper chrome shared by every receipt page. */
export default function ReceiptFooterChrome({ barcodeSeed }: { barcodeSeed: string }) {
  return (
    <div
      className="text-center"
      style={{ marginTop: 28, paddingTop: 16, borderTop: '1px dashed var(--border)' }}
    >
      <div style={{ fontFamily: 'var(--font-stamp), serif', fontSize: 14, letterSpacing: 1 }}>
        THANK YOU FOR YOUR BUSINESS
      </div>
      <div
        style={{
          fontSize: 10,
          letterSpacing: 2,
          color: 'var(--ink-muted)',
          marginTop: 6,
          lineHeight: 1.9,
        }}
      >
        ALL SALES FINAL
        <br />
        HANDMADE WITH CARE IN BROOKLYN
      </div>
      <Barcode seed={barcodeSeed} className="my-2" />
      <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--ink-muted)' }}>
        © {new Date().getFullYear()} TOR&apos;S BORED POTTERY
      </div>
      <div
        className="receipt-stamp-badge"
        style={{ fontSize: 13, transform: 'rotate(-2deg)', marginTop: 14, opacity: 0.85 }}
      >
        KEEP YOUR RECEIPT
      </div>
    </div>
  );
}
