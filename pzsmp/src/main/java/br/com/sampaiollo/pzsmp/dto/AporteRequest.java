package br.com.sampaiollo.pzsmp.dto;

import java.math.BigDecimal;

public record AporteRequest(BigDecimal valor, String descricao) {}
