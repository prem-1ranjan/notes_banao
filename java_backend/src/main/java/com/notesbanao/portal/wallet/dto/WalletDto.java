package com.notesbanao.portal.wallet.dto;

/** The balance, as shown in the sidebar and on the NB Points screen. */
public record WalletDto(String user_id, int balance_points, int reserved_points) {
}
