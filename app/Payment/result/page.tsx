"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PaymentResultPage() {
    const [status, setStatus] = useState("Checking payment...");
    const [merchantOrderId, setMerchantOrderId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const orderId = params.get("merchantOrderId");

        setMerchantOrderId(orderId);

        if (!orderId) {
            setStatus("Payment order ID is missing.");
            return;
        }

        async function checkPaymentStatus() {
            try {
                const response = await fetch(
                    `http://127.0.0.1:8080/api/payment/status?gateway=phonepe&merchantOrderId=${encodeURIComponent(orderId)}`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                const data = await response.json();

                console.log("PHONEPE PAYMENT STATUS:", data);

                if (!response.ok) {
                    throw new Error(
                        data?.message || "Unable to check payment status."
                    );
                }
                if (data.state === "COMPLETED") {
                    setStatus("Payment successful! Redirecting to Dashboard...");

                } else if (data.state === "FAILED") {
                    setStatus("Payment failed. Redirecting to Dashboard...");

                } else {
                    setStatus(`Payment status: ${data.state}`);
                    return;
                }

                setTimeout(() => {
                    router.push("/dashboard");
                }, 2000);

            } catch (error) {
                console.error("Payment status error:", error);
                setStatus("Unable to check payment status.");
            }
        }

        checkPaymentStatus();
    }, [router]);

    return (
        <main>
            <h1>Payment Result</h1>

            <p>{status}</p>

            {merchantOrderId && (
                <p>
                    Order ID: {merchantOrderId}
                </p>
            )}
        </main>
    );
}