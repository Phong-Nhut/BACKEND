// Note: Controller xử lý các API liên quan đến upload và quản lý assets của Graphic Designer
// Đường dẫn API chi tiết:
// POST /api/v1/assets/upload - Upload asset mới (DESIGNER only)
// GET /api/v1/assets/my-assets - Xem danh sách assets của designer (DESIGNER only)
// GET /api/v1/assets/public - Xem danh sách assets công khai đã được approve (Public)
// GET /api/v1/assets/free - Xem danh sách assets miễn phí (Public)
// GET /api/v1/assets/paid - Xem danh sách assets có phí (Public)
// GET /api/v1/assets/search?tag={tag} - Tìm kiếm assets theo tag (Public)
package com.gamehub.controller;

import com.gamehub.dto.AssetRequest;
import com.gamehub.dto.AssetResponse;
import com.gamehub.exception.AssetException;
import com.gamehub.model.enums.AssetType;
import com.gamehub.service.AssetService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assets")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AssetController {

    private static final Logger logger = LoggerFactory.getLogger(AssetController.class);

    @Autowired
    private AssetService assetService;

    @PostMapping("/upload")
    public ResponseEntity<AssetResponse> uploadAsset(@Valid @ModelAttribute AssetRequest assetRequest,
                                                     Authentication authentication) throws AssetException {
        logger.info("Asset upload request by user: {}", authentication.getName());
        AssetResponse response = assetService.uploadAsset(assetRequest, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-assets")
    public ResponseEntity<List<AssetResponse>> getMyAssets(Authentication authentication) throws AssetException {
        logger.info("Fetching assets for designer: {}", authentication.getName());
        List<AssetResponse> assets = assetService.getMyAssets(authentication.getName());
        return ResponseEntity.ok(assets);
    }

    @GetMapping("/public")
    public ResponseEntity<List<AssetResponse>> getPublicAssets() {
        logger.info("Fetching public approved assets");
        List<AssetResponse> assets = assetService.getPublicAssets();
        return ResponseEntity.ok(assets);
    }

    @GetMapping("/free")
    public ResponseEntity<List<AssetResponse>> getFreeAssets() {
        logger.info("Fetching free assets");
        List<AssetResponse> assets = assetService.getAssetsByType(AssetType.FREE);
        return ResponseEntity.ok(assets);
    }

    @GetMapping("/paid")
    public ResponseEntity<List<AssetResponse>> getPaidAssets() {
        logger.info("Fetching paid assets");
        List<AssetResponse> assets = assetService.getAssetsByType(AssetType.PAID);
        return ResponseEntity.ok(assets);
    }

    @GetMapping("/search")
    public ResponseEntity<List<AssetResponse>> searchAssetsByTag(@RequestParam String tag) {
        logger.info("Searching assets by tag: {}", tag);
        List<AssetResponse> assets = assetService.searchAssetsByTag(tag);
        return ResponseEntity.ok(assets);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<AssetResponse>> getPendingAssets(Authentication authentication) throws AssetException {
        logger.info("Admin fetching pending assets: {}", authentication.getName());
        List<AssetResponse> assets = assetService.getPendingAssets(authentication.getName());
        return ResponseEntity.ok(assets);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<AssetResponse> approveAsset(@PathVariable Long id,
                                                      Authentication authentication) throws AssetException {
        logger.info("Admin approving asset ID: {} by user: {}", id, authentication.getName());
        AssetResponse response = assetService.approveAsset(id, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<AssetResponse> rejectAsset(@PathVariable Long id,
                                                     @RequestParam(required = false) String reason,
                                                     Authentication authentication) throws AssetException {
        logger.info("Admin rejecting asset ID: {} by user: {}", id, authentication.getName());
        AssetResponse response = assetService.rejectAsset(id, reason, authentication.getName());
        return ResponseEntity.ok(response);
    }
}
