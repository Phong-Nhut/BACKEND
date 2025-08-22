// Note: DTO cho request upload asset từ Graphic Designer
package com.gamehub.dto;

import com.gamehub.model.enums.AssetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

public class AssetRequest {

    @NotBlank(message = "Asset name is required")
    private String name;

    private String description;

    @NotNull(message = "File is required")
    private MultipartFile file;

    @NotNull(message = "Asset type is required")
    private AssetType type;

    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0 for paid assets")
    private BigDecimal price;

    private String tags;

    public AssetRequest() {}

    public AssetRequest(String name, String description, MultipartFile file,
                        AssetType type, BigDecimal price, String tags) {
        this.name = name;
        this.description = description;
        this.file = file;
        this.type = type;
        this.price = price;
        this.tags = tags;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public MultipartFile getFile() {
        return file;
    }

    public void setFile(MultipartFile file) {
        this.file = file;
    }

    public AssetType getType() {
        return type;
    }

    public void setType(AssetType type) {
        this.type = type;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }
}
