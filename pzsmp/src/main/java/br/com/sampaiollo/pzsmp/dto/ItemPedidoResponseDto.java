package br.com.sampaiollo.pzsmp.dto;

import br.com.sampaiollo.pzsmp.entity.ItemPedido;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

public record ItemPedidoResponseDto(
        String nomeProduto,
        int quantidade,
        BigDecimal precoUnitario,
        String tamanho,
        List<String> sabores
) {
    // Construtor que converte a entidade para o DTO
    public ItemPedidoResponseDto(ItemPedido item) {
        this(
            item.getProduto().getNome(),
            item.getQuantidade(),
            item.getPreco(),
            item.getTamanho(),
            item.getSabores() != null && !item.getSabores().isEmpty()
                ? Arrays.asList(item.getSabores().split(","))
                : null
        );
    }
}
