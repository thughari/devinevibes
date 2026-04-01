package com.devinevibes.entity.user;

import com.devinevibes.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "addresses")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Address extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String line1;
    private String line2;
    @Column(nullable = false)
    private String city;
    @Column(nullable = false)
    private String state;
    @Column(nullable = false)
    private String postalCode;
    @Column(nullable = false)
    private String country;
    @Column(nullable = false)
    private boolean isDefault;
}
