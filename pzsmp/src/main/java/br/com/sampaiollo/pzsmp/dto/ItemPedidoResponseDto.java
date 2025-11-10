package br.com.sampaiollo.pzsmp.dto;

import br.com.sampaiollo.pzsmp.entity.ItemPedido;
import br.com.sampaiollo.pzsmp.entity.Produto;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO que formata um ItemPedido para ser enviado de volta ao Frontend.
 * Ele traduz a lista de sabores em um único nome e usa o preço calculado.
 */
public record ItemPedidoResponseDto(
    Integer quantidade,
    String nomeProduto,     // O frontend espera este nome
    BigDecimal precoUnitario // O frontend espera este nome
) {
    
    public ItemPedidoResponseDto(ItemPedido item) {
        this(
            item.getQuantidade(),
            buildNomeDisplay(item.getSabores()), // Usa a nova função para criar o nome
            item.getPrecoCalculado()            // Usa o novo campo de preço
        );
    }

    /**
     * Função helper que cria o nome de exibição (ex: "Meia Calabresa, Meia 4 Queijos")
     * a partir da lista de produtos (sabores).
     */
    private static String buildNomeDisplay(List<Produto> sabores) {
        if (sabores == null || sabores.isEmpty()) {
            return "Item Inválido";
        }
        
        if (sabores.size() > 1) {
            // Formato: "Meia Calabresa, Meia Quatro Queijos"
            return "Meia " + sabores.stream()
                              .map(Produto::getNome) // Pega o nome de cada sabor
                              .collect(Collectors.joining(", Meia "));
        }
        
        // Se for só 1 sabor (ex: um refrigerante ou pizza de 1 sabor)
        return sabores.get(0).getNome();
    }
}