// Note: DTO cho request mua asset từ developer
package com.gamehub.dto;

import jakarta.validation.constraints.NotNull;

public class PurchaseAssetRequest {

    @NotNull(message = "Asset ID không được để trống")
    private Long assetId;

    public PurchaseAssetRequest() {}

    public PurchaseAssetRequest(Long assetId) {
        this.assetId = assetId;
    }

    public Long getAssetId() {
        return assetId;
    }

    public void setAssetId(Long assetId) {
        this.assetId = assetId;
    }
}
