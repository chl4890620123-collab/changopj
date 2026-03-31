package com.ai.project.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "product")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    private String name;
    private String category;
    private String location;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String size;
    private String weight;
    private int stock;
    private String status;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "time_type")
    private String timeType;

    @Column(name = "reference_date")
    private String referenceDate;

    @Column(name = "expiry_date")
    private String expiryDate;

    @Column(name = "auto_delete")
    private boolean autoDelete;

    @Column(name = "service_name")
    private String serviceName;

    @Column(name = "service_type")
    private String serviceType;

    @Column(name = "custom_url")
    private String customUrl;

    @Column(name = "qr_code_data", unique = true)
    private String qrCodeData;
}