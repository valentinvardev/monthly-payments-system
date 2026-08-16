"use client";

import { useState } from "react";
import {
  BtcIcon,
  LtcIcon,
  UsdtIcon,
  UsdcIcon,
  BnbIcon,
  GenericCoinIcon,
} from "@/components/icons/CryptoAssetIcons";

// Known assets with their typical/suggested network.
type KnownAsset = {
  asset: string;
  label: string;
  defaultNetwork: string;
  networkOptions: string[];
  Icon: (p: { size?: number }) => React.ReactElement;
};

const KNOWN: KnownAsset[] = [
  {
    asset: "USDT",
    label: "Tether",
    defaultNetwork: "TRON (TRC20)",
    networkOptions: ["TRON (TRC20)", "BNB Chain (BEP20)", "Ethereum (ERC20)"],
    Icon: UsdtIcon,
  },
  {
    asset: "USDC",
    label: "USD Coin",
    defaultNetwork: "Polygon",
    networkOptions: ["Polygon", "Ethereum (ERC20)", "Solana", "Arbitrum"],
    Icon: UsdcIcon,
  },
  {
    asset: "BTC",
    label: "Bitcoin",
    defaultNetwork: "Bitcoin",
    networkOptions: ["Bitcoin", "Lightning"],
    Icon: BtcIcon,
  },
  {
    asset: "LTC",
    label: "Litecoin",
    defaultNetwork: "Litecoin",
    networkOptions: ["Litecoin"],
    Icon: LtcIcon,
  },
  {
    asset: "BNB",
    label: "BNB",
    defaultNetwork: "BNB Chain (BEP20)",
    networkOptions: ["BNB Chain (BEP20)"],
    Icon: BnbIcon,
  },
];

export function getKnownAsset(asset: string): KnownAsset | null {
  return KNOWN.find((k) => k.asset === asset.toUpperCase()) ?? null;
}

export function CryptoAssetPicker({
  defaultAsset,
  defaultNetwork,
}: {
  defaultAsset?: string;
  defaultNetwork?: string;
}) {
  // Initial state: if defaultAsset matches a known one, use it.
  // Otherwise treat as "OTHER" with the raw string in customAsset.
  const initialKnown = defaultAsset ? getKnownAsset(defaultAsset) : null;
  const [asset, setAsset] = useState<string>(
    initialKnown ? initialKnown.asset : defaultAsset ? "OTHER" : "USDT",
  );
  const [customAsset, setCustomAsset] = useState<string>(
    initialKnown ? "" : defaultAsset ?? "",
  );

  const selectedKnown = asset === "OTHER" ? null : getKnownAsset(asset);
  const effectiveAsset = asset === "OTHER" ? customAsset : asset;
  const [network, setNetwork] = useState<string>(
    defaultNetwork ?? selectedKnown?.defaultNetwork ?? "",
  );

  function pickKnown(a: KnownAsset) {
    setAsset(a.asset);
    setCustomAsset("");
    setNetwork(a.defaultNetwork);
  }

  function pickOther() {
    setAsset("OTHER");
    setNetwork("");
  }

  return (
    <div className="space-y-4">
      {/* Hidden inputs so the parent <form> picks up the final values */}
      <input type="hidden" name="asset" value={effectiveAsset} />
      <input type="hidden" name="network" value={network} />

      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
          Asset <span className="ml-0.5 text-rose-200/70">*</span>
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {KNOWN.map((k) => {
            const active = asset === k.asset;
            const Icon = k.Icon;
            return (
              <button
                key={k.asset}
                type="button"
                onClick={() => pickKnown(k)}
                className={[
                  "flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition",
                  active
                    ? "border-white/22 bg-white/[0.07]"
                    : "border-white/8 bg-white/[0.02] hover:border-white/14 hover:bg-white/[0.04]",
                ].join(" ")}
              >
                <Icon size={32} />
                <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-foreground/90">
                  {k.asset}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={pickOther}
            className={[
              "flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition",
              asset === "OTHER"
                ? "border-white/22 bg-white/[0.07]"
                : "border-white/8 bg-white/[0.02] hover:border-white/14 hover:bg-white/[0.04]",
            ].join(" ")}
          >
            <GenericCoinIcon size={32} />
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-foreground/90">
              Otro
            </span>
          </button>
        </div>
      </div>

      {asset === "OTHER" && (
        <label className="block">
          <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
            Símbolo del asset <span className="ml-0.5 text-rose-200/70">*</span>
          </span>
          <input
            type="text"
            required
            value={customAsset}
            onChange={(e) => setCustomAsset(e.target.value.toUpperCase())}
            placeholder="ETH, SOL, MATIC…"
            className="glass-input focus:glass-input-focus mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground/55"
          />
        </label>
      )}

      <label className="block">
        <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
          Red <span className="ml-0.5 text-rose-200/70">*</span>
        </span>
        {selectedKnown && selectedKnown.networkOptions.length > 1 ? (
          <div className="mt-1.5 space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {selectedKnown.networkOptions.map((opt) => {
                const active = network === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setNetwork(opt)}
                    className={[
                      "rounded-none border px-3 py-1 text-[11px] font-medium transition",
                      active
                        ? "border-white/22 bg-white/[0.08] text-foreground/95"
                        : "border-white/12 bg-[#161616] text-foreground/75 hover:bg-white/[0.06]",
                    ].join(" ")}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              required
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              placeholder="O escribí otra red…"
              className="glass-input focus:glass-input-focus w-full rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground/55"
            />
          </div>
        ) : (
          <input
            type="text"
            required
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            placeholder={
              selectedKnown?.defaultNetwork ?? "Ethereum (ERC20), Polygon, Solana…"
            }
            className="glass-input focus:glass-input-focus mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground/55"
          />
        )}
      </label>
    </div>
  );
}
