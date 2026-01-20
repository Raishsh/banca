package br.com.sampaiollo.pzsmp.dto;

import java.math.BigDecimal;

public record EstatisticaProdutoDto(
    String nomeProduto,
    Long quantidadeTotal,
    BigDecimal valorTotal
) {}