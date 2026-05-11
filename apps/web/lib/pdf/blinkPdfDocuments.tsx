import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
  Rect,
  Circle,
  Image as PdfImage,
  pdf,
} from "@react-pdf/renderer";
import type { BlinkRow } from "@/components/dashboard/EmployerSession";
import { formatBlinkDateTime, truncateMiddle } from "@/lib/blinkDisplayFormat";
import { fetchBlinkrLogoPngDataUri } from "@/lib/pdf/fetchBlinkrLogoPng";

const receiptStyles = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 10, color: "#0f172a", padding: 0 },
  hero: {
    backgroundColor: "#1e1b4b",
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 36,
  },
  heroTitle: { color: "#ffffff", fontSize: 22, fontWeight: 700, marginBottom: 4 },
  body: { paddingHorizontal: 36, paddingTop: 22, paddingBottom: 28 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8, borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0", paddingBottom: 6 },
  label: { color: "#64748b", fontSize: 9, width: "38%" },
  value: { color: "#0f172a", fontSize: 10, fontWeight: 600, width: "60%", textAlign: "right" },
  footer: { marginTop: 18, fontSize: 8, color: "#94a3b8", textAlign: "center" },
  brandRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  brandFallback: { color: "#c4b5fd", fontSize: 11, fontWeight: 700 },
  brandSuffix: { color: "#c4b5fd", fontSize: 10, marginLeft: 6 },
  brandImage: { width: 88, height: 28, objectFit: "contain" },
});

function ReceiptHeroIllustration() {
  return (
    <Svg width="200" height="72" viewBox="0 0 200 72">
      <Circle cx="170" cy="18" r="3" fill="#fbbf24" opacity={0.9} />
      <Path
        d="M8 52 Q52 28 96 44 T188 36"
        stroke="#6366f1"
        strokeWidth="1.2"
        fill="none"
        opacity={0.45}
      />
      <Rect x="56" y="22" width="88" height="40" rx="6" stroke="#e0e7ff" strokeWidth="2" fill="none" />
      <Path d="M76 44 L88 56 L124 30" stroke="#fbbf24" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="42" cy="48" r="5" stroke="#c4b5fd" strokeWidth="1.5" fill="none" />
    </Svg>
  );
}

export function BlinkReceiptPdfDocument({
  blink,
  logoPngDataUri,
}: {
  blink: BlinkRow;
  logoPngDataUri?: string;
}) {
  const { dateLine, timeLine } = formatBlinkDateTime(blink.createdAt);
  const refSig = blink.escrowTxSig ?? blink.claimTxSig ?? blink.id;
  return (
    <Document>
      <Page size="A4" style={receiptStyles.page}>
        <View style={receiptStyles.hero}>
          <Text style={receiptStyles.heroTitle}>Payment receipt</Text>
          <View style={receiptStyles.brandRow}>
            {logoPngDataUri ? (
              <PdfImage src={logoPngDataUri} style={receiptStyles.brandImage} />
            ) : (
              <Text style={receiptStyles.brandFallback}>Blinkr</Text>
            )}
            <Text style={receiptStyles.brandSuffix}>Powered by Solana</Text>
          </View>
          <ReceiptHeroIllustration />
        </View>
        <View style={receiptStyles.body}>
          <View style={receiptStyles.row}>
            <Text style={receiptStyles.label}>Contractor</Text>
            <Text style={receiptStyles.value}>{blink.contractorEmail}</Text>
          </View>
          <View style={receiptStyles.row}>
            <Text style={receiptStyles.label}>Blink ID</Text>
            <Text style={receiptStyles.value}>{truncateMiddle(blink.id, 8, 6)}</Text>
          </View>
          <View style={receiptStyles.row}>
            <Text style={receiptStyles.label}>Reference</Text>
            <Text style={receiptStyles.value}>{truncateMiddle(refSig, 10, 6)}</Text>
          </View>
          <View style={receiptStyles.row}>
            <Text style={receiptStyles.label}>Amount</Text>
            <Text style={receiptStyles.value}>{blink.amountUsdc} USDC</Text>
          </View>
          <View style={receiptStyles.row}>
            <Text style={receiptStyles.label}>Status</Text>
            <Text style={receiptStyles.value}>{blink.status}</Text>
          </View>
          <View style={receiptStyles.row}>
            <Text style={receiptStyles.label}>Created</Text>
            <Text style={receiptStyles.value}>
              {dateLine} · {timeLine}
            </Text>
          </View>
          {blink.escrowPDA ? (
            <View style={receiptStyles.row}>
              <Text style={receiptStyles.label}>Escrow PDA</Text>
              <Text style={receiptStyles.value}>{truncateMiddle(blink.escrowPDA, 10, 6)}</Text>
            </View>
          ) : null}
          <Text style={receiptStyles.footer}>
            This document was generated in your Blinkr dashboard for your records. On-chain activity
            remains the source of truth.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function downloadBlinkReceiptPdf(blink: BlinkRow) {
  const logoPngDataUri = await fetchBlinkrLogoPngDataUri();
  const blob = await pdf(<BlinkReceiptPdfDocument blink={blink} logoPngDataUri={logoPngDataUri} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `blinkr-receipt-${blink.id.slice(0, 12)}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
