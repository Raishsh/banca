package br.com.sampaiollo.pzsmp.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "pedido")
@Data
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(columnDefinition = "NUMERIC(10,2)")
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusPedido status;

    @Column(name = "taxa_entrega", columnDefinition = "NUMERIC(10,2)")
    private BigDecimal taxaEntrega;

    @Column(name = "data", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime data;

    @Column(name = "numero_dia")
    private Integer numeroDia;

    private String nomeClienteTemporario;
    @ManyToOne
    @JoinColumn(name = "id_pessoa", nullable = true)
    @JsonBackReference("cliente-pedidos")
    private Cliente cliente;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL)
    @JsonManagedReference("pedido-itens")
    private List<ItemPedido> itens;
    
    @ManyToOne
    @JoinColumn(name = "id_mesa")
    @JsonBackReference("mesa-pedidos")
    private Mesa mesa;
    
    @ManyToOne
    @JoinColumn(name = "id_balcao")
    private Balcao balcao;
    
    @Column(name = "data_pagamento") // Define o nome da coluna no banco
    private LocalDateTime dataPagamento; 
    
    // <<< LISTA DE PAGAMENTOS ADICIONADA AQUI >>>
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL)
    @JsonManagedReference("pedido-pagamentos")
    private List<Pagamento> pagamentos;
    
     @Transient // Esta anotação diz ao JPA para ignorar este método
    public boolean isPago() {
        return this.status == StatusPedido.PAGO || this.status == StatusPedido.ENTREGUE;
    }
}
