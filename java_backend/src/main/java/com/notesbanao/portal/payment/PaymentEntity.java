package com.notesbanao.portal.payment;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(
        name = "phonepe_payments",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_phonepe_merchant_order_id",
                        columnNames = "merchant_order_id"
                )
        }
)
public class PaymentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "merchant_order_id", nullable = false, unique = true)
    private String merchantOrderId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "package_code", nullable = false)
    private String packageCode;

    @Column(name = "amount_paise", nullable = false)
    private long amountPaise;

    @Column(name = "total_points", nullable = false)
    private int totalPoints;

    @Column(nullable = false)
    private String status;

    @Column(name = "points_credited", nullable = false)
    private boolean pointsCredited;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public String getMerchantOrderId() {
        return merchantOrderId;
    }

    public void setMerchantOrderId(String merchantOrderId) {
        this.merchantOrderId = merchantOrderId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getPackageCode() {
        return packageCode;
    }

    public void setPackageCode(String packageCode) {
        this.packageCode = packageCode;
    }

    public long getAmountPaise() {
        return amountPaise;
    }

    public void setAmountPaise(long amountPaise) {
        this.amountPaise = amountPaise;
    }

    public int getTotalPoints() {
        return totalPoints;
    }

    public void setTotalPoints(int totalPoints) {
        this.totalPoints = totalPoints;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isPointsCredited() {
        return pointsCredited;
    }

    public void setPointsCredited(boolean pointsCredited) {
        this.pointsCredited = pointsCredited;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}