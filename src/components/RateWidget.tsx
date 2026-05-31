import { Card, CardContent } from "@/components/ui/card";
import { getUsdToArsRate } from "@/lib/exchange-rate";
import { formatArs, formatDateTime } from "@/lib/format";

export async function RateWidget() {
  let body: React.ReactNode;
  try {
    const r = await getUsdToArsRate();
    body = (
      <>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-4xl font-light tabular-nums text-frost">
            {formatArs(r.rate)}
          </span>
          <span className="text-xs text-muted-foreground/80">/ USD</span>
        </div>
        <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
          cripto · dolarapi · {r.cached ? "cache" : "live"} · {formatDateTime(r.fetchedAt)}
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
      <CardContent>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
          Cotización USD → ARS
        </p>
        {body}
      </CardContent>
    </Card>
  );
}
