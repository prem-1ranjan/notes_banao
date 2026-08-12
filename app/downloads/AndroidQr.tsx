"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/**
 * "Scan with your phone" QR for the Android install link, shown in a modal so
 * the card stays compact. Hidden on phones via CSS (.downloads-qr-link), where
 * the install button itself is the direct path.
 */
export function AndroidQr({ url, note }: { url: string; note?: string }) {
  const [open, setOpen] = useState(false);
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(url, { width: 180, margin: 1, color: { dark: "#1e2330", light: "#ffffff" } })
      .then((rendered) => {
        if (alive) {
          setDataUrl(rendered);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [url]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!dataUrl) {
    return null;
  }
  return (
    <>
      <button type="button" className="downloads-sublink" onClick={() => setOpen(true)}>
        Installing on your phone? Scan a QR code
      </button>
      {open ? (
        <div
          className="downloads-qr-overlay"
          // Inline: the CSS bundler's default browser targets strip
          // backdrop-filter from the stylesheet; inline styles bypass it.
          style={{ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
          role="dialog"
          aria-modal="true"
          aria-label="Android install QR code"
          onClick={() => setOpen(false)}
        >
          <div className="downloads-qr-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="downloads-qr-close" aria-label="Close" onClick={() => setOpen(false)}>
              ×
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL, no optimization needed */}
            <img src={dataUrl} alt="QR code for the Android app download link" width={180} height={180} />
            <p className="downloads-qr-caption">Scan with your phone to install</p>
            {note ? <p className="downloads-qr-note">{note}</p> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
