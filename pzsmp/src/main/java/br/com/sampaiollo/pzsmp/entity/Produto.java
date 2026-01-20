package br.com.sampaiollo.pzsmp.entity;

import jakarta.persistence.*;
import lombok.Data; 
import java.math.BigDecimal;

@Entity
@Table(name = "produto")
@Data
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_produto;

    @Column(nullable = false, unique = true)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoProduto tipo;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal preco; // Preço padrão (Geralmente usamos o Grande aqui)

    @Column(precision = 10, scale = 2)
    private BigDecimal precoPequeno; // Broto

    @Column(precision = 10, scale = 2)
    private BigDecimal precoMedio;

    @Column(precision = 10, scale = 2)
    private BigDecimal precoGrande;

    // --- NOVO CAMPO ADICIONADO ---
    @Column(precision = 10, scale = 2)
    private BigDecimal precoFamilia; 

    private String imagemUrl;

    @Column(length = 500)
    private String descricao;
}