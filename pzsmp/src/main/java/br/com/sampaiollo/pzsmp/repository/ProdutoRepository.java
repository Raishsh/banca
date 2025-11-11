package br.com.sampaiollo.pzsmp.repository;

import br.com.sampaiollo.pzsmp.entity.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Integer> {
    // A mágica do Spring Data JPA acontece aqui!
    boolean existsByNome(String nome);
    // Métodos como save(), findById(), findAll() já estão prontos para uso.
    Optional<Produto> findByNome(String nome);
}