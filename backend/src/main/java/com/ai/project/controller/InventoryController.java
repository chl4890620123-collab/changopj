package com.ai.project.controller;

import com.ai.project.entity.Product;
import com.ai.project.repository.ProductRepository;
import com.ai.project.service.CleanupService; // 추가
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final ProductRepository productRepository;
    private final CleanupService cleanupService; // 📍 자동 삭제 트리거를 위해 주입

    @Value("${file.upload-dir}")
    private String uploadDir;

    private String getCurrentUserId(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            return null;
        }
        return auth.getName();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Authentication auth) {
        String userId = getCurrentUserId(auth);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        log.info("🗑️ 재고 삭제 요청 - ID: {}, User: {}", id, userId);

        return productRepository.findByIdAndUserId(id, userId).map(product -> {
            if (product.getImageUrl() != null && product.getImageUrl().startsWith("/uploads/")) {
                String fileName = product.getImageUrl().replace("/uploads/", "");
                File file = new File(uploadDir + fileName);
                if (file.exists()) {
                    if (file.delete()) log.info("📁 관련 이미지 파일 삭제 완료: {}", fileName);
                }
            }
            productRepository.delete(product);
            log.info("✅ 재고 데이터 삭제 완료: {}", id);
            return ResponseEntity.ok().body("삭제되었습니다.");
        }).orElseGet(() -> {
            log.warn("⚠️ 삭제 실패: 해당 ID({})의 데이터를 찾을 수 없거나 권한이 없습니다.", id);
            return ResponseEntity.notFound().build();
        });
    }

    @PostMapping("/with-image")
    public ResponseEntity<?> createWithImage(
            @RequestPart(value = "image", required = false) MultipartFile file,
            @RequestPart("data") String productJson,
            Authentication auth) {

        String userId = getCurrentUserId(auth);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        try {
            ObjectMapper mapper = new ObjectMapper();
            Product product = mapper.readValue(productJson, Product.class);
            product.setUserId(userId);

            if (file != null && !file.isEmpty()) {
                String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                File dest = new File(uploadDir + fileName);
                File parent = dest.getParentFile();
                if (parent != null && !parent.exists()) parent.mkdirs();
                file.transferTo(dest);
                product.setImageUrl("/uploads/" + fileName);
            }

            Product savedProduct = productRepository.save(product);
            log.info("✅ 신규 재고 등록 완료: {}", savedProduct.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);

        } catch (IOException e) {
            log.error("❌ 재고 등록 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("데이터 형식이 올바르지 않습니다.");
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchByQr(@RequestParam("qrCode") String qrCode, Authentication auth) {
        String userId = getCurrentUserId(auth);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return productRepository.findByQrCodeDataAndUserId(qrCode, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAll(Authentication auth) {
        String userId = getCurrentUserId(auth);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        // 📍 목록 조회 시점에 만료된 데이터가 있다면 즉시 삭제 처리
        cleanupService.runAutoDelete();

        return ResponseEntity.ok(productRepository.findByUserIdOrderByExpiryDateAsc(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getOne(@PathVariable Long id, Authentication auth) {
        String userId = getCurrentUserId(auth);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return productRepository.findByIdAndUserId(id, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart("product") String productJson,
            Authentication auth) {

        String userId = getCurrentUserId(auth);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        try {
            ObjectMapper mapper = new ObjectMapper();
            Product details = mapper.readValue(productJson, Product.class);

            return productRepository.findByIdAndUserId(id, userId).map(product -> {
                // 📍 1. 기본 정보 업데이트
                product.setName(details.getName());
                product.setCategory(details.getCategory());
                product.setLocation(details.getLocation());
                product.setStock(details.getStock());
                product.setStatus(details.getStatus());
                product.setDescription(details.getDescription());

                // 📍 2. 날짜 및 자동 삭제 관련 핵심 필드 업데이트 (누락되었던 부분)
                product.setTimeType(details.getTimeType());
                product.setReferenceDate(details.getReferenceDate());
                product.setExpiryDate(details.getExpiryDate());
                product.setAutoDelete(details.isAutoDelete()); // Boolean 필드 반영

                // 📍 3. 기타 필드 업데이트
                product.setQrCodeData(details.getQrCodeData());
                product.setServiceName(details.getServiceName());
                product.setServiceType(details.getServiceType());
                product.setCustomUrl(details.getCustomUrl());

                // 4. 이미지 처리
                if (file != null && !file.isEmpty()) {
                    try {
                        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                        File dest = new File(uploadDir + fileName);
                        File parent = dest.getParentFile();
                        if (parent != null && !parent.exists()) parent.mkdirs();
                        file.transferTo(dest);
                        product.setImageUrl("/uploads/" + fileName);
                    } catch (IOException e) {
                        log.error("파일 저장 에러: {}", e.getMessage());
                    }
                }

                Product updatedProduct = productRepository.save(product);
                log.info("✅ 재고 수정 완료: ID {}", id);
                return ResponseEntity.ok(updatedProduct);
            }).orElse(ResponseEntity.notFound().build());

        } catch (IOException e) {
            log.error("JSON 데이터 파싱 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("데이터 형식이 올바르지 않습니다.");
        }
    }
}