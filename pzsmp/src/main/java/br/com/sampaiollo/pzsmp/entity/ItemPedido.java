package br.com.sampaiollo.pzsmp.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "itempedido")
@Data
public class ItemPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_item;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(name = "preco_calculado", nullable = false, precision = 10, scale = 2)
    private BigDecimal precoCalculado;

    
    @ManyToMany
    @JoinTable(
        name = "item_pedido_sabores", // Nome da nova tabela de ligação
        joinColumns = @JoinColumn(name = "item_pedido_id"),
        inverseJoinColumns = @JoinColumn(name = "produto_id")
    )
    private List<Produto> sabores;

    // Muitos ItemPedidos podem se referir ao mesmo Produto
    @ManyToOne
    @JoinColumn(name = "id_pedido", nullable = false)
    @JsonBackReference("pedido-itens")
    private Pedido pedido;
}
