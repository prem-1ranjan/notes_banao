package com.notesbanao.portal.wallet.dto;

/**
 * One NB Points movement, newest first in the activity list.
 *
 * Two flavours share this shape:
 * type "payment" means a recharge, so read status along with base_points and
 * bonus_points; type "point" means a points movement, so read kind (reserve,
 * capture, release or grant) along with points_delta.
 *
 * Money is in paise. Nulls are normal here, since no single row uses every field.
 */
public record ActivityDto(
        String id,
        String type,
        String kind,
        String point_type,
        long amount_paise,
        Integer base_points,
        Integer bonus_points,
        Integer total_points,
        Integer points_delta,
        Integer balance_after_points,
        Integer reserved_after_points,
        String currency,
        String status,
        String provider,
        String provider_order_id,
        String source_id,
        String reference_id,
        String note_title,
        Integer duration_seconds,
        String created_at) {
}
