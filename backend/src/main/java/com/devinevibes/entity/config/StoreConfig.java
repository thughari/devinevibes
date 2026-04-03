package com.devinevibes.entity.config;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "store_config")
@Getter
@Setter
public class StoreConfig {

    @Id
    private Integer id = 1;

    @Column(nullable = false)
    private BigDecimal freeShippingThreshold;

    @Column(nullable = false)
    private BigDecimal standardShippingCost;

    private BigDecimal codFee = BigDecimal.valueOf(50);

    public BigDecimal getCodFee() {
        return codFee != null ? codFee : BigDecimal.valueOf(50);
    }
}
