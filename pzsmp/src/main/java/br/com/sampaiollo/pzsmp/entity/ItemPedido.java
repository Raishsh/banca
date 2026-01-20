package br.com.sampaiollo.pzsmp.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "itempedido")
@Data
public class ItemPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_item;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(nullable = false, columnDefinition = "NUMERIC(10,2)")
    private BigDecimal preco;

    @Column(length = 1)
    private String tamanho;

    // --- CORREÇÃO AQUI ---
    // Trocamos LONGTEXT (MySQL) por TEXT (PostgreSQL)
    @Column(columnDefinition = "TEXT") 
    private String sabores;

    @ManyToOne
    @JoinColumn(name = "id_pedido", nullable = false)
    @JsonBackReference("pedido-itens")
    private Pedido pedido;

    @ManyToOne
    @JoinColumn(name = "id_produto", nullable = false)
    private Produto produto;
}