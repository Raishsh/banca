package br.com.sampaiollo.pzsmp.dto;

import lombok.Data;
import java.util.List;
import java.math.BigDecimal;

@Data
public class PedidoRequestDto {
    private Integer idCliente;
    private Integer idMesa; // Opcional, para pedidos feitos na mesa
    String nomeClienteTemporario;
    private List<ItemPedidoDto> itens;
    private BigDecimal taxaEntrega;
}