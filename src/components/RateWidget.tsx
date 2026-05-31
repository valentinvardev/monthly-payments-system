import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUsdToArsRate } from "@/lib/exchange-rate";
import { formatArs, formatDateTime } from "@/lib/format";

export async function RateWidget() {
  let body: React.ReactNode;
  try {
    const r = await getUsdToArsRate();
    body = (
      <>
        <p className="text-3xl font-semibold tabular-nums">{formatArs(r.rate)}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          1 USD · {r.source} · {r.cached ? "cache" : "fresco"} ·{" "}
          {formatDateTime(r.fetchedAt)}
        </p>
      </>
    );
  } catch {
    body = (
      <p className="text-sm text-muted-foreground">
        No pudimos obtener la cotización. Reintentá en unos minutos.
      </p>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Cotización USD → ARS (cripto)
        </CardTitle>
      </CardHeader>
      <CardContent>{body}</CardContent>
    </Card>
  );
}
