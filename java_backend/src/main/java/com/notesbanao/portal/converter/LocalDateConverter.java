package com.notesbanao.portal.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.time.LocalDate;

@Converter
public class LocalDateConverter implements AttributeConverter<LocalDate, String> {
    @Override
    public String convertToDatabaseColumn(LocalDate date) {
        return date != null ? date.toString() : null;
    }

    @Override
    public LocalDate convertToEntityAttribute(String value) {
        return value != null ? LocalDate.parse(value) : null;
    }
}
