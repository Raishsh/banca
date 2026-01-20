package br.com.sampaiollo.pzsmp.repository;

import br.com.sampaiollo.pzsmp.dto.EstatisticaProdutoDto;
import br.com.sampaiollo.pzsmp.entity.ItemPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ItemPedidoRepository extends JpaRepository<ItemPedido, Integer> {
    
   @Query("""
       SELECT new br.com.sampaiollo.pzsmp.dto.EstatisticaProdutoDto(
           p.nome, 
           SUM(i.quantidade), 
           SUM(i.preco * i.quantidade)
       )
       FROM ItemPedido i
       JOIN i.pedido ped
       JOIN i.produto p
       WHERE ped.data BETWEEN :inicio AND :fim
       AND ped.status != 'CANCELADO'
       GROUP BY p.nome
       ORDER BY SUM(i.quantidade) DESC
    """)
    List<EstatisticaProdutoDto> findMaisVendidos(
        @Param("inicio") LocalDateTime inicio, 
        @Param("fim") LocalDateTime fim
    );
    List<ItemPedido> findByPedidoId(Integer pedidoId);
}