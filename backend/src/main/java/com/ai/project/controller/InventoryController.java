package com.ai.project.controller;

import com.ai.project.entity.Product;
import com.ai.project.repository.ProductRepository;
import com.ai.project.service.CleanupService;
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
    private final CleanupService cleanupService;

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
                
                // ✅ [수정] 문자열 더하기(+) 대신 인자를 2개 받는 생성자 사용
                File file = new File(uploadDir, fileName); 
                
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
                
                // ✅ [수정] 경로와 파일명을 안전하게 결합
                File dest = new File(uploadDir, fileName);
                
                // ✅ [추가] 실제 시도하는 경로를 로그로 찍어 확인 가능하게 함
                log.info("📂 파일 저장 시도 경로: {}", dest.getAbsolutePath());

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
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("파일 저장 중 오류가 발생했습니다.");
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
                product.setName(details.getName());
                product.setCategory(details.getCategory());
                product.setLocation(details.getLocation());
                product.setStock(details.getStock());
                product.setStatus(details.getStatus());
                product.setDescription(details.getDescription());
                product.setTimeType(details.getTimeType());
                product.setReferenceDate(details.getReferenceDate());
                product.setExpiryDate(details.getExpiryDate());
                product.setAutoDelete(details.isAutoDelete());
                product.setQrCodeData(details.getQrCodeData());
                product.setServiceName(details.getServiceName());
                product.setServiceType(details.getServiceType());
                product.setCustomUrl(details.getCustomUrl());

                if (file != null && !file.isEmpty()) {
                    try {
                        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                        
                        // ✅ [수정] 업데이트 시에도 안전한 경로 생성 방식 적용
                        File dest = new File(uploadDir, fileName);
                        
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
