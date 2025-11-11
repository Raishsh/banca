package br.com.sampaiollo.pzsmp.dto;

import lombok.Data;
import java.util.List;

@Data
public class ItemPedidoDto {
    private Integer idProduto;
    private int quantidade;
    private String tamanho;
    private List<String> sabores;
}
