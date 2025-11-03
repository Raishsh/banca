package br.com.sampaiollo.pzsmp.repository;

import br.com.sampaiollo.pzsmp.entity.Aporte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Repository
public interface AporteRepository extends JpaRepository<Aporte, Long> {
    @Query("SELECT COALESCE(SUM(a.valor), 0) FROM Aporte a WHERE a.data BETWEEN :inicioDoDia AND :fimDoDia")
    BigDecimal sumValorByDataBetween(@Param("inicioDoDia") LocalDateTime inicioDoDia, @Param("fimDoDia") LocalDateTime fimDoDia);
}
