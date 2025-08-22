// Note: Repository để truy vấn bảng assets trong MySQL
package com.gamehub.repository;

import com.gamehub.model.Asset;
import com.gamehub.model.enums.AssetStatus;
import com.gamehub.model.enums.AssetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    List<Asset> findByDesignerId(Long designerId);

    List<Asset> findByStatus(AssetStatus status);

    List<Asset> findByType(AssetType type);

    List<Asset> findByStatusAndType(AssetStatus status, AssetType type);

    List<Asset> findByTagsContainingIgnoreCase(String tag);
}
