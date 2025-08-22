// Note: Service xử lý business logic cho giao dịch mua bán assets với phí nền tảng 10%
// Đường dẫn: /api/v1/transactions - Quản lý giao dịch, tính phí, chuyển tiền
package com.gamehub.service;

import com.gamehub.dto.PurchaseAssetRequest;
import com.gamehub.dto.PurchasedAssetResponse;
import com.gamehub.dto.TransactionApprovalRequest;
import com.gamehub.dto.TransactionResponse;
import com.gamehub.exception.ResourceNotFoundException;
import com.gamehub.model.Asset;
import com.gamehub.model.Transaction;
import com.gamehub.model.User;
import com.gamehub.model.enums.AssetStatus;
import com.gamehub.model.enums.AssetType;
import com.gamehub.model.enums.TransactionStatus;
import com.gamehub.model.enums.TransactionType;
import com.gamehub.repository.AssetRepository;
import com.gamehub.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private UserService userService;

    private static final BigDecimal PLATFORM_FEE_RATE = new BigDecimal("0.10"); // 10%

    // Developer mua asset
    @Transactional
    public TransactionResponse purchaseAsset(PurchaseAssetRequest request, String buyerEmail) {
        User buyer = userService.findByEmail(buyerEmail);
        Asset asset = assetRepository.findById(request.getAssetId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset không tồn tại"));

        // Kiểm tra asset phải là PAID và đã được duyệt
        if (asset.getType() != AssetType.PAID) {
            throw new IllegalArgumentException("Asset này là miễn phí, không cần mua");
        }
        if (asset.getStatus() != AssetStatus.APPROVED) {
            throw new IllegalArgumentException("Asset chưa được duyệt");
        }

        // Kiểm tra không thể mua asset của chính mình
        if (asset.getDesigner().getId().equals(buyer.getId())) {
            throw new IllegalArgumentException("Không thể mua asset của chính mình");
        }

        // Kiểm tra đã mua asset này chưa
        if (transactionRepository.existsByBuyerAndAssetIdAndStatusApproved(buyer, asset.getId())) {
            throw new IllegalArgumentException("Bạn đã mua asset này rồi");
        }

        // Kiểm tra số dư
        BigDecimal assetPrice = asset.getPrice();
        BigDecimal buyerBalance = buyer.getBalance();
        if (buyerBalance.compareTo(assetPrice) < 0) {
            throw new IllegalArgumentException("Số dư không đủ để mua asset này");
        }

        // Tính phí nền tảng và số tiền designer nhận được
        BigDecimal platformFee = assetPrice.multiply(PLATFORM_FEE_RATE).setScale(0, RoundingMode.HALF_UP);
        BigDecimal designerAmount = assetPrice.subtract(platformFee);

        // Tạo giao dịch
        Transaction transaction = new Transaction(
                TransactionType.ASSET_PURCHASE,
                assetPrice,
                platformFee,
                designerAmount,
                TransactionStatus.PENDING,
                buyer,
                asset.getDesigner(),
                asset,
                asset.getFileUrl() // Lưu fileUrl từ Asset
        );

        // Trừ tiền buyer tạm thời (sẽ hoàn lại nếu bị từ chối)
        buyer.setBalance(buyerBalance.subtract(assetPrice));
        userService.save(buyer);

        transaction = transactionRepository.save(transaction);
        return convertToTransactionResponse(transaction);
    }

    // Admin duyệt giao dịch
    @Transactional
    public TransactionResponse approveTransaction(Long transactionId, String adminEmail) {
        User admin = userService.findByEmail(adminEmail);
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Giao dịch không tồn tại"));

        if (transaction.getStatus() != TransactionStatus.PENDING) {
            throw new IllegalArgumentException("Giao dịch đã được xử lý");
        }

        // Cộng tiền cho designer
        User designer = transaction.getSeller();
        BigDecimal designerBalance = designer.getBalance();
        designer.setBalance(designerBalance.add(transaction.getDesignerAmount()));
        userService.save(designer);

        // Cộng phí nền tảng cho admin
        BigDecimal adminBalance = admin.getBalance();
        admin.setBalance(adminBalance.add(transaction.getPlatformFee()));
        userService.save(admin);

        // Cập nhật trạng thái giao dịch
        transaction.setStatus(TransactionStatus.APPROVED);
        transaction.setApprovedBy(admin);
        transaction.setApprovedAt(LocalDateTime.now());

        transaction = transactionRepository.save(transaction);
        return convertToTransactionResponse(transaction);
    }

    // Admin từ chối giao dịch
    @Transactional
    public TransactionResponse rejectTransaction(Long transactionId, TransactionApprovalRequest request, String adminEmail) {
        User admin = userService.findByEmail(adminEmail);
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Giao dịch không tồn tại"));

        if (transaction.getStatus() != TransactionStatus.PENDING) {
            throw new IllegalArgumentException("Giao dịch đã được xử lý");
        }

        // Hoàn tiền cho buyer
        User buyer = transaction.getBuyer();
        BigDecimal buyerBalance = buyer.getBalance();
        buyer.setBalance(buyerBalance.add(transaction.getAmount()));
        userService.save(buyer);

        // Cập nhật trạng thái giao dịch
        transaction.setStatus(TransactionStatus.REJECTED);
        transaction.setApprovedBy(admin);
        transaction.setApprovedAt(LocalDateTime.now());
        transaction.setRejectionReason(request.getRejectionReason());

        transaction = transactionRepository.save(transaction);
        return convertToTransactionResponse(transaction);
    }

    // Xem giao dịch chờ duyệt (Admin)
    public Page<TransactionResponse> getPendingTransactions(Pageable pageable) {
        Page<Transaction> transactions = transactionRepository.findByStatus(TransactionStatus.PENDING, pageable);
        return transactions.map(this::convertToTransactionResponse);
    }

    // Xem lịch sử mua của developer
    public Page<TransactionResponse> getBuyerTransactions(String buyerEmail, Pageable pageable) {
        User buyer = userService.findByEmail(buyerEmail);
        Page<Transaction> transactions = transactionRepository.findByBuyer(buyer, pageable);
        return transactions.map(this::convertToTransactionResponse);
    }

    // Xem lịch sử bán của designer
    public Page<TransactionResponse> getSellerTransactions(String sellerEmail, Pageable pageable) {
        User seller = userService.findByEmail(sellerEmail);
        Page<Transaction> transactions = transactionRepository.findBySeller(seller, pageable);
        return transactions.map(this::convertToTransactionResponse);
    }

    // Developer xem assets đã mua thành công với fileUrl
    public Page<PurchasedAssetResponse> getPurchasedAssets(String buyerEmail, Pageable pageable) {
        User buyer = userService.findByEmail(buyerEmail);
        Page<Transaction> approvedTransactions = transactionRepository.findByBuyerAndStatus(buyer, TransactionStatus.APPROVED, pageable);
        return approvedTransactions.map(this::convertToPurchasedAssetResponse);
    }

    // Convert entity sang DTO
    private TransactionResponse convertToTransactionResponse(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getType(),
                transaction.getAmount(),
                transaction.getPlatformFee(),
                transaction.getDesignerAmount(),
                transaction.getStatus(),
                transaction.getBuyer().getEmail(),
                transaction.getSeller().getEmail(),
                transaction.getAsset().getName(),
                transaction.getApprovedBy() != null ? transaction.getApprovedBy().getEmail() : null,
                transaction.getApprovedAt(),
                transaction.getRejectionReason(),
                transaction.getCreatedAt()
        );
    }

    private PurchasedAssetResponse convertToPurchasedAssetResponse(Transaction transaction) {
        Asset asset = transaction.getAsset();
        return new PurchasedAssetResponse(
                asset.getId(),
                asset.getName(),
                asset.getDescription(),
                asset.getFileUrl(), // FileUrl để developer có thể download
                asset.getType(),
                asset.getPrice(),
                asset.getTags(),
                asset.getFileType(),
                asset.getDesigner().getEmail(),
                transaction.getApprovedAt(),
                transaction.getId()
        );
    }
}
