package br.com.sampaiollo.pzsmp.dto;

import br.com.sampaiollo.pzsmp.entity.Aporte;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AporteResponseDTO(
    Long id,
    LocalDateTime data,
    BigDecimal valor,
    String descricao,
    String nomeFuncionario
) {
    public AporteResponseDTO(Aporte aporte) {
        this(
            aporte.getId(),
            aporte.getData(),
            aporte.getValor(),
            aporte.getDescricao(),
            aporte.getFuncionario().getNome()
        );
    }
}
