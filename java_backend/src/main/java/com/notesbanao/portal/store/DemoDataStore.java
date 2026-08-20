package com.notesbanao.portal.store;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Repository;

import com.fasterxml.jackson.databind.JsonNode;
import com.notesbanao.portal.account.dto.DeletionRequestDto;
import com.notesbanao.portal.auth.dto.UserDto;
import com.notesbanao.portal.billing.dto.DurationRuleDto;
import com.notesbanao.portal.billing.dto.PaymentGatewayDto;
import com.notesbanao.portal.billing.dto.PointPackageDto;
import com.notesbanao.portal.billing.dto.ReferralRewardDto;
import com.notesbanao.portal.billing.dto.RuleSetDto;
import com.notesbanao.portal.common.Ids;
import com.notesbanao.portal.notes.dto.NoteDto;
import com.notesbanao.portal.notes.dto.NoteJobDto;
import com.notesbanao.portal.transcript.dto.TranscriptSessionDto;
import com.notesbanao.portal.wallet.dto.ActivityDto;
import com.notesbanao.portal.wallet.dto.OrderDto;
import com.notesbanao.portal.wallet.dto.WalletDto;

/**
 * Where the data lives, for now: memory.
 *
 * This is the seam. Every service in this project talks to this class and to
 * nothing else persistent, so giving the application a real database means
 * replacing this one file with repositories and leaving the controllers, the
 * API interfaces and the front end untouched.
 *
 * What it is not: a database. Nothing is written to disk, there is a single
 * account, and restarting the service puts the sample data back.
 *
 * It holds the DTO records directly rather than separate entities. A real
 * implementation would keep entities and map them, but for a fixture that
 * would be ceremony with no payoff.
 */
@Repository
public class DemoDataStore {

    /** A coupon exactly as the seed file describes it. */
    public record Coupon(String code, String kind, String description, int percent_off, int free_points,
            boolean active) {
    }

    private final SampleData seed = new SampleData();

    private UserDto user;
    private int balancePoints;
    private int reservedPoints;
    private int trialPoints;
    private boolean trialClaimed;

    private final List<ActivityDto> activities = new ArrayList<>();
    private final List<NoteDto> notes = new ArrayList<>();
    private final Map<String, String> markdownByNoteId = new LinkedHashMap<>();
    private final List<NoteJobDto> jobs = new ArrayList<>();
    private final List<TranscriptSessionDto> transcripts = new ArrayList<>();
    private final List<OrderDto> orders = new ArrayList<>();
    private final Set<String> redeemedCoupons = new HashSet<>();
    private final Map<String, Coupon> coupons = new LinkedHashMap<>();

    private List<PointPackageDto> packages = List.of();
    private List<PaymentGatewayDto> gateways = List.of();
    private List<RuleSetDto> ruleSets = List.of();
    private List<DurationRuleDto> durationRules = List.of();
    private ReferralRewardDto referralReward;

    private int retentionDays = 30;
    private int maxRecordingMinutes = 180;

    private String pendingOtpPhone;
    private String pendingOtpCode;
    private DeletionRequestDto deletionRequest;

    public DemoDataStore() {
        reset();
    }

    /* --------------------------------------------------------- lifecycle --- */

    /** Throw everything away and load the seed files again. */
    public final synchronized void reset() {
        activities.clear();
        notes.clear();
        markdownByNoteId.clear();
        jobs.clear();
        transcripts.clear();
        orders.clear();
        redeemedCoupons.clear();
        coupons.clear();
        pendingOtpPhone = null;
        pendingOtpCode = null;
        deletionRequest = null;
        trialClaimed = false;

        JsonNode userNode = seed.read("user.json");
        user = seed.convert(userNode, UserDto.class);

        JsonNode wallet = seed.read("wallet.json");
        balancePoints = wallet.path("balance_points").asInt();
        reservedPoints = wallet.path("reserved_points").asInt();
        trialPoints = wallet.path("trial_points").asInt(30);

        JsonNode notesFile = seed.read("notes.json");
        long shift = SampleData.shiftFrom(newestSeededTimestamp(wallet, notesFile));

        for (JsonNode node : wallet.path("activities")) {
            ActivityDto activity = seed.convert(node, ActivityDto.class);
            activities.add(reTime(activity, SampleData.shift(activity.created_at(), shift)));
        }

        retentionDays = notesFile.path("retentionDays").asInt(30);
        maxRecordingMinutes = notesFile.path("maxRecordingMinutes").asInt(180);

        for (JsonNode node : notesFile.path("notes")) {
            NoteDto note = new NoteDto(
                    node.path("id").asText(),
                    node.path("title").asText(),
                    SampleData.shift(node.path("created_at").asText(), shift),
                    node.path("duration_seconds").asInt(),
                    node.path("billing_mode").asText("duration"),
                    node.path("preview_limited").asBoolean(false),
                    node.hasNonNull("preview_limit_minutes") ? node.path("preview_limit_minutes").asInt() : null);
            notes.add(note);
            markdownByNoteId.put(note.id(), node.path("markdown").asText(""));
        }

        for (JsonNode node : notesFile.path("jobs")) {
            NoteJobDto job = seed.convert(node, NoteJobDto.class);
            jobs.add(new NoteJobDto(job.id(), job.title(), job.status(), job.error_code(), job.error_message(),
                    job.notes_id(), SampleData.shift(job.created_at(), shift),
                    SampleData.shift(job.updated_at(), shift), job.duration_seconds()));
        }

        for (JsonNode node : seed.read("transcripts.json")) {
            TranscriptSessionDto session = seed.convert(node, TranscriptSessionDto.class);
            transcripts.add(new TranscriptSessionDto(session.id(), session.title(), session.status(), session.mode(),
                    session.segmentCount(), session.uploadedDurationMs(), session.totalDurationMs(),
                    session.recoveryReason(), session.recoveryWarning(),
                    session.recoveryAvailableAt() == null ? null
                            : SampleData.shift(session.recoveryAvailableAt(), shift),
                    SampleData.shift(session.updatedAt(), shift)));
        }

        JsonNode packagesFile = seed.read("packages.json");
        packages = List.of(seed.convert(packagesFile.path("packages"), PointPackageDto[].class));
        gateways = List.of(seed.convert(packagesFile.path("payment_gateways"), PaymentGatewayDto[].class));

        JsonNode billing = seed.read("billing.json");
        ruleSets = List.of(seed.convert(billing.path("rule_sets"), RuleSetDto[].class));
        durationRules = List.of(seed.convert(billing.path("duration_rules"), DurationRuleDto[].class));
        referralReward = seed.convert(billing.path("referral_reward"), ReferralRewardDto.class);

        for (Coupon coupon : seed.convert(seed.read("coupons.json"), Coupon[].class)) {
            coupons.put(coupon.code().toUpperCase(), coupon);
        }
    }

    /**
     * The latest moment anywhere in the seed. Every timestamp is shifted
     * relative to this one, so the whole fixture keeps its internal ordering and
     * nothing ends up dated in the future.
     */
    private long newestSeededTimestamp(JsonNode wallet, JsonNode notesFile) {
        long newest = Long.MIN_VALUE;
        for (JsonNode node : wallet.path("activities")) {
            newest = Math.max(newest, SampleData.millis(node.path("created_at").asText()));
        }
        for (JsonNode node : notesFile.path("notes")) {
            newest = Math.max(newest, SampleData.millis(node.path("created_at").asText()));
        }
        for (JsonNode node : notesFile.path("jobs")) {
            newest = Math.max(newest, SampleData.millis(node.path("updated_at").asText()));
        }
        return newest == Long.MIN_VALUE ? System.currentTimeMillis() : newest;
    }

    private ActivityDto reTime(ActivityDto a, String createdAt) {
        return new ActivityDto(a.id(), a.type(), a.kind(), a.point_type(), a.amount_paise(), a.base_points(),
                a.bonus_points(), a.total_points(), a.points_delta(), a.balance_after_points(),
                a.reserved_after_points(), a.currency(), a.status(), a.provider(), a.provider_order_id(),
                a.source_id(), a.reference_id(), a.note_title(), a.duration_seconds(), createdAt);
    }

    /* ------------------------------------------------------ account reads -- */

    public synchronized UserDto user() {
        return user;
    }

    public synchronized WalletDto wallet() {
        return new WalletDto(user.id(), balancePoints, reservedPoints);
    }

    public synchronized int balancePoints() {
        return balancePoints;
    }

    public synchronized int trialPoints() {
        return trialPoints;
    }

    public synchronized boolean trialClaimed() {
        return trialClaimed;
    }

    public synchronized DeletionRequestDto deletionRequest() {
        return deletionRequest;
    }

    public synchronized String pendingOtpPhone() {
        return pendingOtpPhone;
    }

    public synchronized String pendingOtpCode() {
        return pendingOtpCode;
    }

    /* -------------------------------------------------------- list reads --- */

    public synchronized List<ActivityDto> activities() {
        return List.copyOf(activities);
    }

    public synchronized List<NoteDto> notes() {
        return List.copyOf(notes);
    }

    public synchronized List<NoteJobDto> jobs() {
        return List.copyOf(jobs);
    }

    public synchronized List<TranscriptSessionDto> transcripts() {
        return List.copyOf(transcripts);
    }

    public synchronized String markdown(String noteId) {
        return markdownByNoteId.get(noteId);
    }

    public synchronized TranscriptSessionDto transcript(String sessionId) {
        return transcripts.stream().filter(s -> s.id().equals(sessionId)).findFirst().orElse(null);
    }

    public synchronized OrderDto order(String orderId) {
        return orders.stream().filter(o -> o.id().equals(orderId)).findFirst().orElse(null);
    }

    /* ---------------------------------------------------- catalogue reads -- */

    public synchronized List<PointPackageDto> packages() {
        return packages;
    }

    public synchronized PointPackageDto packageByCode(String code) {
        return packages.stream().filter(p -> p.code().equals(code)).findFirst().orElse(null);
    }

    public synchronized List<PaymentGatewayDto> gateways() {
        return gateways;
    }

    public synchronized List<RuleSetDto> ruleSets() {
        return ruleSets;
    }

    public synchronized List<DurationRuleDto> durationRules() {
        return durationRules;
    }

    public synchronized ReferralRewardDto referralReward() {
        return referralReward;
    }

    public synchronized Coupon coupon(String code) {
        return code == null ? null : coupons.get(code.trim().toUpperCase());
    }

    public synchronized boolean couponRedeemed(String code) {
        return redeemedCoupons.contains(code.toUpperCase());
    }

    public synchronized int retentionDays() {
        return retentionDays;
    }

    public synchronized int maxRecordingMinutes() {
        return maxRecordingMinutes;
    }

    /* ------------------------------------------------------------ writes --- */

    public synchronized void setEmail(String email) {
        user = new UserDto(user.id(), email, user.email_verified(), user.has_password(), user.phone_e164(),
                user.phone_verified(), user.status(), user.terms_accepted_current());
    }

    public synchronized void setHasPassword(boolean hasPassword) {
        user = new UserDto(user.id(), user.email(), user.email_verified(), hasPassword, user.phone_e164(),
                user.phone_verified(), user.status(), user.terms_accepted_current());
    }

    public synchronized void acceptTerms() {
        user = new UserDto(user.id(), user.email(), user.email_verified(), user.has_password(), user.phone_e164(),
                user.phone_verified(), user.status(), true);
    }

    public synchronized void creditPoints(int points) {
        balancePoints += points;
    }

    public synchronized void debitPoints(int points) {
        balancePoints = Math.max(0, balancePoints - points);
    }

    /**
     * Record a points movement. Call this after the balance has moved, because
     * the row snapshots the balance as it stands.
     */
    public synchronized ActivityDto addActivity(ActivityDto activity) {
        ActivityDto row = new ActivityDto(
                Ids.next("act"), activity.type(), activity.kind(), activity.point_type(), activity.amount_paise(),
                activity.base_points(), activity.bonus_points(), activity.total_points(), activity.points_delta(),
                balancePoints, reservedPoints, activity.currency() == null ? "INR" : activity.currency(),
                activity.status(), activity.provider(), activity.provider_order_id(), activity.source_id(),
                activity.reference_id(), activity.note_title(), activity.duration_seconds(),
                Instant.now().toString());
        activities.add(0, row);
        return row;
    }

    public synchronized OrderDto addOrder(OrderDto order) {
        orders.add(0, order);
        return order;
    }

    public synchronized void redeemCoupon(String code) {
        redeemedCoupons.add(code.toUpperCase());
    }

    public synchronized NoteDto addNote(String title, int durationSeconds, String markdown) {
        NoteDto note = new NoteDto(Ids.next("note"), title, Instant.now().toString(), durationSeconds,
                "duration", false, null);
        notes.add(0, note);
        markdownByNoteId.put(note.id(), markdown);
        return note;
    }

    public synchronized boolean deleteNote(String noteId) {
        markdownByNoteId.remove(noteId);
        return notes.removeIf(note -> note.id().equals(noteId));
    }

    public synchronized boolean discardTranscript(String sessionId) {
        return transcripts.removeIf(session -> session.id().equals(sessionId));
    }

    public synchronized void startOtp(String phone, String code) {
        pendingOtpPhone = phone;
        pendingOtpCode = code;
    }

    public synchronized void clearOtp() {
        pendingOtpPhone = null;
        pendingOtpCode = null;
    }

    /** Verify the mobile and credit the trial points, at most once. */
    public synchronized int claimTrial(String phone) {
        user = new UserDto(user.id(), user.email(), user.email_verified(), user.has_password(), phone, true,
                user.status(), user.terms_accepted_current());
        if (trialClaimed) {
            return 0;
        }
        trialClaimed = true;
        balancePoints += trialPoints;
        return trialPoints;
    }

    public synchronized void setDeletionRequest(DeletionRequestDto request) {
        deletionRequest = request;
    }

    /**
     * A cheap fingerprint of the notes list, used as the ETag so an unchanged
     * list can be answered with a 304 and no body.
     */
    public synchronized String notesFingerprint() {
        String newestNote = notes.isEmpty() ? "" : notes.get(0).created_at();
        String newestJob = jobs.isEmpty() ? "" : jobs.get(0).updated_at();
        return "\"" + notes.size() + "-" + jobs.size() + "-" + newestNote + "-" + newestJob + "\"";
    }
}
