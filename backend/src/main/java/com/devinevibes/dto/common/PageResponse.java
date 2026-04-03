package com.devinevibes.dto.common;

import java.util.List;

public record PageResponse<T>(
    List<T> content,
    int pageNumber,
    int pageSize,
    long totalElements,
    int totalPages,
    boolean last
) {
    public static <T, R> PageResponse<R> from(org.springframework.data.domain.Page<T> page, List<R> transformedContent) {
        return new PageResponse<>(
            transformedContent,
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isLast()
        );
    }
}
