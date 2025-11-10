package br.com.sampaiollo.pzsmp.dto;

import lombok.Data;
import java.util.List;

@Data
public class ItemPedidoDto {
    private List<Integer> idsSabores;
    private int quantidade;
}