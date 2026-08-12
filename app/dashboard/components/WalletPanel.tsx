import { useEffect, useMemo, useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api-client";
import { activityAmount, activityDescription, activityTitle, formatDate, fullActivityDescription, money, nbPoints } from "./format";
import { TrialClaimControl, type TrialActionResult } from "./TrialClaimControl";
import { downloadInvoicePdf, type InvoiceData } from "./invoicePdf";
import type { PaymentGateway, PointPackage, RecentNote, TrialStatus, WalletOverview } from "./types";

// How long the in-modal success receipt stays up before the modal closes.
const RECEIPT_SECONDS = 5;

export type RechargeReceipt = {
  order_id: string;
  amount_paise: number;
  currency: string;
  base_points: number;
  bonus_points: number;
  total_points: number;
};

// What the recharge attempt wants the modal to do next. "stay" keeps the form up
// so a cancelled or failed payment can be retried without re-picking a pack;
// "close" is for gateways that navigate away; "receipt" shows the success card
// in place of the form — Razorpay Standard Checkout finishes without leaving the
// page, so it has somewhere to report back to.
export type RechargeOutcome =
  | { status: "stay" }
  | { status: "close" }
  | { status: "receipt"; receipt: RechargeReceipt };

type WalletPanelProps = {
  phoneVerified: boolean;
  phone?: string | null;
  trial: TrialStatus | null;
  walletError: string;
  walletLoading: boolean;
  walletOverview: WalletOverview | null;
  notes: RecentNote[];
  otpVisible: boolean;
  rechargePackages: PointPackage[];
  paymentGateways: PaymentGateway[];
  rechargePackagesLoading: boolean;
  rechargeLoading: boolean;
  // Which phase of the payment we are in, so the button can say what is
  // actually happening instead of "Processing..." for the whole flow.
  rechargeStatus?: string;
  onActivityPageChange: (page: number) => void;
  onRefresh: () => void;
  onRecharge: (packageCode: string, gateway: string, couponCode?: string) => Promise<RechargeOutcome>;
  onClaimCoupon: (code: string) => Promise<boolean>;
  onSendOtp: (event: FormEvent<HTMLFormElement>) => Promise<TrialActionResult>;
  onVerifyOtp: (event: FormEvent<HTMLFormElement>) => Promise<TrialActionResult>;
};

type CouponPreview =
  | { kind: "free_points"; requires_payment: false; free_points: number }
  | {
      kind: "percent_off";
      requires_payment: true;
      percent_off: number;
      package_code: string;
      currency: string;
      original_amount_paise: number;
      discounted_amount_paise: number;
      original_total_points: number;
      total_points: number;
    };

type AppliedCoupon = {
  code: string;
  kind: "percent_off" | "free_points";
  description: string;
  preview: CouponPreview;
};

export function WalletPanel({
  phoneVerified,
  phone,
  trial,
  walletError,
  walletLoading,
  walletOverview,
  notes,
  otpVisible,
  rechargePackages,
  paymentGateways,
  rechargePackagesLoading,
  rechargeLoading,
  rechargeStatus,
  onActivityPageChange,
  onRefresh,
  onRecharge,
  onClaimCoupon,
  onSendOtp,
  onVerifyOtp
}: WalletPanelProps) {
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [receipt, setReceipt] = useState<RechargeReceipt | null>(null);
  const [receiptSeconds, setReceiptSeconds] = useState(RECEIPT_SECONDS);
  const [selectedPackageCode, setSelectedPackageCode] = useState("");
  const [gateway, setGateway] = useState("");
  // Per-row invoice download state, keyed by payment order id.
  const [invoiceBusyId, setInvoiceBusyId] = useState("");
  const [invoiceError, setInvoiceError] = useState<{ id: string; message: string } | null>(null);

  async function downloadInvoice(paymentOrderId: string) {
    if (invoiceBusyId) {
      return;
    }
    setInvoiceBusyId(paymentOrderId);
    setInvoiceError(null);
    try {
      const response = await apiFetch(`/api/billing/invoice/${encodeURIComponent(paymentOrderId)}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok === false) {
        throw new Error(data.message || "Could not load the invoice.");
      }
      await downloadInvoicePdf(data as InvoiceData);
    } catch (error) {
      setInvoiceError({
        id: paymentOrderId,
        message: error instanceof Error ? error.message : "Could not download the invoice."
      });
    } finally {
      setInvoiceBusyId("");
    }
  }
  const [couponCode, setCouponCode] = useState("");
  const [couponChecking, setCouponChecking] = useState(false);
  const [couponClaiming, setCouponClaiming] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponApplied, setCouponApplied] = useState<AppliedCoupon | null>(null);
  const wallet = walletOverview?.wallet;
  const totalPoints = wallet?.balance_points || 0;
  const packageOptions = Array.isArray(rechargePackages) ? rechargePackages : [];
  const gatewayOptions = Array.isArray(paymentGateways) ? paymentGateways : [];
  const hasRechargePackages = packageOptions.length > 0;
  const hasPaymentGateways = gatewayOptions.length > 0;
  const pagination = walletOverview?.pagination;
  const page = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const totalActivities = pagination?.total || 0;
  const notesById = useMemo(() => {
    return new Map(notes.map((note) => [note.id, note]));
  }, [notes]);

  useEffect(() => {
    if (!packageOptions.some((item) => item.code === selectedPackageCode)) {
      setSelectedPackageCode(packageOptions[0]?.code || "");
    }
  }, [packageOptions, selectedPackageCode]);

  useEffect(() => {
    if (!gatewayOptions.some((item) => item.code === gateway)) {
      setGateway(gatewayOptions[0]?.code || "");
    }
  }, [gatewayOptions, gateway]);

  // A percentage coupon's discount depends on the chosen pack, so drop it if the
  // pack changes. Free-points coupons are pack-independent and stay applied.
  useEffect(() => {
    if (couponApplied?.kind === "percent_off") {
      setCouponApplied(null);
      setCouponError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPackageCode]);

  function clearCoupon() {
    setCouponApplied(null);
    setCouponError("");
    setCouponCode("");
  }

  async function applyCoupon() {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      return;
    }
    setCouponChecking(true);
    setCouponError("");
    try {
      const response = await apiFetch("/api/wallet/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, package_code: selectedPackageCode })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok === false) {
        throw new Error(data.message || "Could not apply this coupon.");
      }
      setCouponApplied({
        code: data.coupon.code,
        kind: data.coupon.kind,
        description: data.coupon.description || "",
        preview: data.preview as CouponPreview
      });
    } catch (error) {
      setCouponApplied(null);
      setCouponError(error instanceof Error ? error.message : "Could not apply this coupon.");
    } finally {
      setCouponChecking(false);
    }
  }

  async function claimFreeCoupon() {
    if (!couponApplied || couponApplied.kind !== "free_points") {
      return;
    }
    setCouponClaiming(true);
    const ok = await onClaimCoupon(couponApplied.code);
    setCouponClaiming(false);
    if (ok) {
      clearCoupon();
      setRechargeOpen(false);
    }
  }

  async function submitRecharge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPackageCode || !gateway) {
      return;
    }
    const percentCoupon = couponApplied?.kind === "percent_off" ? couponApplied.code : undefined;
    const outcome = await onRecharge(selectedPackageCode, gateway, percentCoupon);
    if (outcome.status === "stay") {
      // Cancelled or failed — keep the form up so the same pack can be retried.
      return;
    }
    clearCoupon();
    if (outcome.status === "receipt") {
      // Seed the countdown here rather than in the effect, so the effect only
      // owns the interval and never sets state synchronously in its body.
      setReceiptSeconds(RECEIPT_SECONDS);
      setReceipt(outcome.receipt);
      return;
    }
    setRechargeOpen(false);
  }

  function dismissReceipt() {
    setReceipt(null);
    setRechargeOpen(false);
  }

  // Auto-close the success card. The balance behind the modal is already
  // refreshed by the time this fires, so closing lands on an up-to-date
  // NB Points panel without any navigation.
  useEffect(() => {
    if (!receipt) {
      return;
    }
    const intervalId = window.setInterval(() => {
      setReceiptSeconds((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(intervalId);
          setReceipt(null);
          setRechargeOpen(false);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [receipt]);

  // Narrow on preview.kind (the discriminant of the CouponPreview union) so the
  // preview fields below are correctly typed.
  const freeCouponApplied = couponApplied && couponApplied.preview.kind === "free_points"
    ? { ...couponApplied, preview: couponApplied.preview }
    : null;
  const percentCouponApplied = couponApplied && couponApplied.preview.kind === "percent_off"
    ? { ...couponApplied, preview: couponApplied.preview }
    : null;

  const selectedPackage = packageOptions.find((item) => item.code === selectedPackageCode) || null;
  const payAmountLabel = percentCouponApplied
    ? money(percentCouponApplied.preview.discounted_amount_paise, percentCouponApplied.preview.currency)
    : selectedPackage
    ? money(selectedPackage.price_paise, selectedPackage.currency || "INR")
    : "";
  const receivePointsLabel = percentCouponApplied
    ? nbPoints(percentCouponApplied.preview.total_points)
    : selectedPackage
    ? nbPoints(selectedPackage.total_points)
    : "";

  return (
    <div className="wallet-panel">
      {walletError ? <p className="message error">{walletError}</p> : null}

      <div className="wallet-grid">
        <section className="points-card">
          <span>Available NB Points</span>
          <strong>{wallet ? nbPoints(totalPoints) : walletLoading ? "Loading..." : "--"}</strong>
          <small>Use NB Points to generate notes from longer recordings.</small>
          <button className="primary points-recharge" type="button" onClick={() => setRechargeOpen(true)}>
            Recharge NB Points
          </button>
        </section>
        <section className="points-context">
          <TrialClaimControl
            otpVisible={otpVisible}
            phoneVerified={phoneVerified}
            phone={phone}
            trial={trial}
            onSendOtp={onSendOtp}
            onVerifyOtp={onVerifyOtp}
          />
        </section>

        <section className="table-panel">
          <div className="panel-header compact">
            <div>
              <h3>Recent activity</h3>
              <span className="activity-count">
                {totalActivities ? `Page ${page} of ${totalPages} - ${totalActivities} activities` : "Latest NB Points activity"}
              </span>
            </div>
            <div className="activity-actions">
              <button className="glass-link" type="button" onClick={() => onActivityPageChange(Math.max(1, page - 1))} disabled={walletLoading || page <= 1}>
                Previous
              </button>
              <button className="glass-link" type="button" onClick={() => onActivityPageChange(Math.min(totalPages, page + 1))} disabled={walletLoading || page >= totalPages}>
                Next
              </button>
              <button className="glass-link" type="button" onClick={onRefresh} disabled={walletLoading}>
                Refresh
              </button>
            </div>
          </div>
          {!walletOverview?.activities.length ? (
            <p className="empty-state">{walletLoading ? "Loading NB Points activity..." : "No NB Points activity yet."}</p>
          ) : (
            <div className="ledger-list">
              {walletOverview.activities.map((activity) => {
                const linkedNote = activity.reference_id ? notesById.get(activity.reference_id) : null;
                const description = activityDescription(activity, linkedNote);
                const fullDescription = fullActivityDescription(activity, linkedNote);
                // Bills exist only where money changed hands: paid recharges.
                // Coupon, trial and referral points have no invoice by design.
                // NOTE: activity.id is prefixed ("payment:<orderId>") for feed
                // uniqueness — the raw payment order id lives in source_id.
                const invoiceable = activity.type === "payment" && activity.status === "paid";
                const orderId = activity.source_id;
                return (
                  <div className={`ledger-row ${activity.type === "payment" ? `payment-${activity.status}` : ""}`} key={activity.id}>
                    <div className="ledger-copy">
                      <strong>{activityTitle(activity)}</strong>
                      <span title={fullDescription}>{description}</span>
                      {invoiceError?.id === orderId && (
                        <span className="invoice-link-error">{invoiceError.message}</span>
                      )}
                    </div>
                    <span className="ledger-date">
                      {invoiceable && (
                        <button
                          aria-label="Download invoice"
                          className="invoice-icon"
                          disabled={invoiceBusyId !== ""}
                          onClick={() => downloadInvoice(orderId)}
                          title="Download invoice"
                          type="button"
                        >
                          {invoiceBusyId === orderId ? (
                            <span className="invoice-icon-busy">…</span>
                          ) : (
                            <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16">
                              <path d="M8 2.2v7.6M4.8 6.9 8 10.1l3.2-3.2M3 13.2h10" />
                            </svg>
                          )}
                        </button>
                      )}
                      {formatDate(activity.created_at)}
                    </span>
                    <div className={activity.type === "point" && Number(activity.points_delta || 0) < 0 ? "amount negative" : "amount positive"}>
                      {activityAmount(activity)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {rechargeOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="recharge-title">
            <div className="modal-header">
              <div>
                <p className="eyebrow">Recharge</p>
                <h3 id="recharge-title">{receipt ? "Recharge complete" : "Add NB Points"}</h3>
              </div>
              <button aria-label="Close" className="ghost modal-close" type="button" onClick={receipt ? dismissReceipt : () => setRechargeOpen(false)}>
                &times;
              </button>
            </div>
            {receipt ? (
              <div className="recharge-form">
                <div className="recharge-summary">
                  <span>NB Points added</span>
                  <strong>{nbPoints(receipt.total_points)}</strong>
                </div>
                <dl className="payment-return-details">
                  <div>
                    <dt>Amount paid</dt>
                    <dd>{money(receipt.amount_paise, receipt.currency)}</dd>
                  </div>
                  <div>
                    <dt>NB Points</dt>
                    <dd>
                      {nbPoints(receipt.total_points)}
                      {receipt.bonus_points > 0 ? (
                        <small className="staff-muted-block">
                          {nbPoints(receipt.base_points)} + {nbPoints(receipt.bonus_points)} bonus
                        </small>
                      ) : null}
                    </dd>
                  </div>
                  <div>
                    <dt>Order ID</dt>
                    <dd>{receipt.order_id}</dd>
                  </div>
                </dl>
                <p className="payment-return-countdown">Closing in {receiptSeconds} seconds.</p>
                <button className="primary" onClick={dismissReceipt} type="button">
                  Done
                </button>
              </div>
            ) : (
            <form className="recharge-form" onSubmit={submitRecharge}>
              <fieldset>
                <legend>Recharge pack</legend>
                <div className="amount-options">
                  {packageOptions.map((item) => (
                    <label className={selectedPackageCode === item.code ? "amount-option active" : "amount-option"} key={item.code}>
                      <input
                        checked={selectedPackageCode === item.code}
                        name="rechargePackage"
                        onChange={() => setSelectedPackageCode(item.code)}
                        type="radio"
                        value={item.code}
                      />
                      <span className="recharge-pack-price">
                        <strong>{money(item.price_paise, item.currency || "INR")}</strong>
                      </span>
                      <span className="recharge-pack-points">
                        <strong>{nbPoints(item.total_points)} NB Points</strong>
                        <small>
                          {item.bonus_points > 0
                            ? `${nbPoints(item.base_points)} + ${nbPoints(item.bonus_points)} bonus`
                            : nbPoints(item.base_points)}
                        </small>
                      </span>
                    </label>
                  ))}
                  {!hasRechargePackages && (
                    <p className="empty-state">
                      {rechargePackagesLoading ? "Loading recharge options..." : "No recharge options available."}
                    </p>
                  )}
                </div>
              </fieldset>
              <div className="coupon-box">
                <span className="coupon-label">Have a coupon?</span>
                <div className="coupon-input-row">
                  <input
                    aria-label="Coupon code"
                    className="coupon-input"
                    disabled={Boolean(couponApplied)}
                    onChange={(event) => setCouponCode(event.currentTarget.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    value={couponCode}
                  />
                  {couponApplied ? (
                    <button className="ghost" onClick={clearCoupon} type="button">Remove</button>
                  ) : (
                    <button
                      className="secondary"
                      disabled={couponChecking || !couponCode.trim()}
                      onClick={applyCoupon}
                      type="button"
                    >
                      {couponChecking ? "Checking..." : "Apply"}
                    </button>
                  )}
                </div>
                {couponError ? <p className="coupon-message error">{couponError}</p> : null}
                {percentCouponApplied ? (
                  <p className="coupon-message success">
                    {percentCouponApplied.preview.percent_off}% off applied
                    {percentCouponApplied.description ? ` - ${percentCouponApplied.description}` : ""}. Pay{" "}
                    <strong>{money(percentCouponApplied.preview.discounted_amount_paise, percentCouponApplied.preview.currency)}</strong>{" "}
                    instead of {money(percentCouponApplied.preview.original_amount_paise, percentCouponApplied.preview.currency)} and get{" "}
                    <strong>{nbPoints(percentCouponApplied.preview.total_points)}</strong>.
                  </p>
                ) : null}
                {freeCouponApplied ? (
                  <p className="coupon-message success">
                    Free coupon applied
                    {freeCouponApplied.description ? ` - ${freeCouponApplied.description}` : ""}. Claim{" "}
                    <strong>{nbPoints(freeCouponApplied.preview.free_points)}</strong> with no payment required.
                  </p>
                ) : null}
              </div>

              {freeCouponApplied ? (
                <button className="primary" disabled={couponClaiming} onClick={claimFreeCoupon} type="button">
                  {couponClaiming ? "Claiming..." : `Claim ${nbPoints(freeCouponApplied.preview.free_points)}`}
                </button>
              ) : (
                <>
                  <fieldset>
                    <legend>Payment option</legend>
                    <div className="gateway-options" role="radiogroup" aria-label="Payment option">
                      {gatewayOptions.map((item) => (
                        <label className={gateway === item.code ? "gateway-option active" : "gateway-option"} key={item.code}>
                          <input
                            checked={gateway === item.code}
                            name="rechargeGateway"
                            onChange={() => setGateway(item.code)}
                            type="radio"
                            value={item.code}
                          />
                          <span className="option-radio" aria-hidden="true" />
                          <span className="gateway-name">{item.display_name}</span>
                        </label>
                      ))}
                    </div>
                    {!hasPaymentGateways ? <p className="empty-state">No payment gateway available.</p> : null}
                  </fieldset>
                  {selectedPackage ? (
                    <div className="recharge-summary">
                      <span>You will receive</span>
                      <strong>{receivePointsLabel} NB Points</strong>
                    </div>
                  ) : null}
                  <button className="primary" disabled={rechargeLoading || !hasRechargePackages || !hasPaymentGateways} type="submit">
                    {rechargeLoading ? (rechargeStatus || "Processing...") : payAmountLabel ? `Pay ${payAmountLabel}` : "Recharge Now"}
                  </button>
                </>
              )}
            </form>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
