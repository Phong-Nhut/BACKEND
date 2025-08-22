// Note: Service xử lý logic upload và quản lý assets cho Graphic Designer
// Đường dẫn API: /api/v1/assets/upload, /api/v1/assets/my-assets, /api/v1/assets/public
package com.gamehub.service;

import com.gamehub.dto.AssetRequest;
import com.gamehub.dto.AssetResponse;
import com.gamehub.exception.AssetException;
import com.gamehub.model.Asset;
import com.gamehub.model.User;
import com.gamehub.model.enums.AssetStatus;
import com.gamehub.model.enums.AssetType;
import com.gamehub.model.enums.UserRole;
import com.gamehub.model.enums.UserStatus;
import com.gamehub.repository.AssetRepository;
import com.gamehub.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional
public class AssetService {

    private static final Logger logger = LoggerFactory.getLogger(AssetService.class);
    private static final List<String> ALLOWED_FILE_TYPES = Arrays.asList("image/eps+xml", "audio/mpeg", "audio/mp3");
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(".eps", ".mp3");

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    public AssetResponse uploadAsset(AssetRequest assetRequest, String userEmail) throws AssetException {
        logger.info("Asset upload attempt by user: {}", userEmail);

        User designer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> {
                    logger.warn("User not found: {}", userEmail);
                    return new AssetException("User not found");
                });

        if (designer.getRole() != UserRole.DESIGNER) {
            logger.warn("Asset upload failed - user is not a DESIGNER: {}", userEmail);
            throw new AssetException("Only DESIGNER accounts can upload assets");
        }

        if (designer.getStatus() != UserStatus.APPROVED) {
            logger.warn("Asset upload failed - user is not approved: {}", userEmail);
            throw new AssetException("Your account is not approved yet");
        }

        // Validate file type
        MultipartFile file = assetRequest.getFile();
        if (!isValidFileType(file)) {
            logger.warn("Invalid file type: {}", file.getContentType());
            throw new AssetException("Only EPS and MP3 files are allowed");
        }

        // Validate price for paid assets
        if (assetRequest.getType() == AssetType.PAID) {
            if (assetRequest.getPrice() == null || assetRequest.getPrice().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                logger.warn("Invalid price for paid asset");
                throw new AssetException("Price must be greater than 0 for paid assets");
            }
        }

        // Upload file to Cloudinary
        String fileUrl = cloudinaryService.uploadFile(file);
        String fileType = getFileExtension(file.getOriginalFilename()).toUpperCase();

        Asset asset = new Asset(
                assetRequest.getName(),
                assetRequest.getDescription(),
                fileUrl,
                assetRequest.getType(),
                assetRequest.getType() == AssetType.PAID ? assetRequest.getPrice() : null,
                assetRequest.getTags(),
                fileType,
                AssetStatus.PENDING,
                designer
        );

        try {
            assetRepository.save(asset);
            logger.info("Asset uploaded successfully: ID={}, Name={}, Type={}",
                    asset.getId(), asset.getName(), asset.getType());
        } catch (Exception e) {
            logger.error("Error saving asset: {}", asset.getName(), e);
            throw new AssetException("Error saving asset");
        }

        return mapToResponse(asset);
    }

    public List<AssetResponse> getMyAssets(String userEmail) throws AssetException {
        logger.info("Fetching assets for designer: {}", userEmail);

        User designer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> {
                    logger.warn("User not found: {}", userEmail);
                    return new AssetException("User not found");
                });

        if (designer.getRole() != UserRole.DESIGNER) {
            logger.warn("Asset fetch failed - user is not a DESIGNER: {}", userEmail);
            throw new AssetException("Only DESIGNER accounts can view assets");
        }

        List<Asset> assets = assetRepository.findByDesignerId(designer.getId());
        return assets.stream()
                .map(this::mapToResponse)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public List<AssetResponse> getPublicAssets() {
        logger.info("Fetching public approved assets");
        List<Asset> assets = assetRepository.findByStatus(AssetStatus.APPROVED);
        return assets.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AssetResponse> getAssetsByType(AssetType type) {
        logger.info("Fetching assets by type: {}", type);
        List<Asset> assets = assetRepository.findByStatusAndType(AssetStatus.APPROVED, type);
        return assets.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AssetResponse> searchAssetsByTag(String tag) {
        logger.info("Searching assets by tag: {}", tag);
        List<Asset> assets = assetRepository.findByTagsContainingIgnoreCase(tag);
        return assets.stream()
                .filter(asset -> asset.getStatus() == AssetStatus.APPROVED)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Admin methods for asset approval management
    public List<AssetResponse> getPendingAssets(String userEmail) throws AssetException {
        logger.info("Admin fetching pending assets: {}", userEmail);

        User admin = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> {
                    logger.warn("User not found: {}", userEmail);
                    return new AssetException("User not found");
                });

        if (admin.getRole() != UserRole.ADMIN) {
            logger.warn("Access denied - user is not an ADMIN: {}", userEmail);
            throw new AssetException("Only ADMIN accounts can view pending assets");
        }

        List<Asset> assets = assetRepository.findByStatus(AssetStatus.PENDING);
        return assets.stream()
                .map(this::mapToResponse)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public AssetResponse approveAsset(Long assetId, String userEmail) throws AssetException {
        logger.info("Admin approving asset ID: {} by user: {}", assetId, userEmail);

        User admin = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> {
                    logger.warn("User not found: {}", userEmail);
                    return new AssetException("User not found");
                });

        if (admin.getRole() != UserRole.ADMIN) {
            logger.warn("Access denied - user is not an ADMIN: {}", userEmail);
            throw new AssetException("Only ADMIN accounts can approve assets");
        }

        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> {
                    logger.warn("Asset not found: {}", assetId);
                    return new AssetException("Asset not found");
                });

        if (asset.getStatus() != AssetStatus.PENDING) {
            logger.warn("Asset is not in PENDING status: {}", assetId);
            throw new AssetException("Asset is not pending approval");
        }

        asset.setStatus(AssetStatus.APPROVED);
        asset.setApprovedBy(admin);
        asset.setApprovedAt(java.time.LocalDateTime.now());

        try {
            assetRepository.save(asset);
            logger.info("Asset approved successfully: ID={}, Name={}", asset.getId(), asset.getName());
        } catch (Exception e) {
            logger.error("Error approving asset: {}", asset.getName(), e);
            throw new AssetException("Error approving asset");
        }

        return mapToResponse(asset);
    }

    public AssetResponse rejectAsset(Long assetId, String reason, String userEmail) throws AssetException {
        logger.info("Admin rejecting asset ID: {} by user: {}", assetId, userEmail);

        User admin = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> {
                    logger.warn("User not found: {}", userEmail);
                    return new AssetException("User not found");
                });

        if (admin.getRole() != UserRole.ADMIN) {
            logger.warn("Access denied - user is not an ADMIN: {}", userEmail);
            throw new AssetException("Only ADMIN accounts can reject assets");
        }

        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> {
                    logger.warn("Asset not found: {}", assetId);
                    return new AssetException("Asset not found");
                });

        if (asset.getStatus() != AssetStatus.PENDING) {
            logger.warn("Asset is not in PENDING status: {}", assetId);
            throw new AssetException("Asset is not pending approval");
        }

        asset.setStatus(AssetStatus.REJECTED);
        asset.setRejectionReason(reason);
        asset.setApprovedBy(admin);
        asset.setApprovedAt(java.time.LocalDateTime.now());

        try {
            assetRepository.save(asset);
            logger.info("Asset rejected successfully: ID={}, Name={}, Reason={}",
                    asset.getId(), asset.getName(), reason);
        } catch (Exception e) {
            logger.error("Error rejecting asset: {}", asset.getName(), e);
            throw new AssetException("Error rejecting asset");
        }

        return mapToResponse(asset);
    }

    private boolean isValidFileType(MultipartFile file) {
        String contentType = file.getContentType();
        String filename = file.getOriginalFilename();

        if (filename == null) return false;

        String extension = getFileExtension(filename).toLowerCase();

        return ALLOWED_FILE_TYPES.contains(contentType) ||
                ALLOWED_EXTENSIONS.contains(extension);
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf('.') == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.'));
    }

    private AssetResponse mapToResponse(Asset asset) {
        if (asset.getDesigner() == null) {
            logger.warn("Asset with ID {} has a null designer reference. Skipping.", asset.getId());
            return null;
        }

        return new AssetResponse(
                asset.getId(),
                asset.getName(),
                asset.getDescription(),
                asset.getFileUrl(),
                asset.getType(),
                asset.getPrice(),
                asset.getTags(),
                asset.getFileType(),
                asset.getStatus(),
                asset.getDesigner().getId(),
                asset.getDesigner().getFullName(),
                asset.getCreatedAt()
        );
    }
}
