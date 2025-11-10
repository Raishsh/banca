package br.com.sampaiollo.pzsmp.repository;

import br.com.sampaiollo.pzsmp.entity.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Integer> {
    // A mágica do Spring Data JPA acontece aqui!
    // Métodos como save(), findById(), findAll() já estão prontos para uso.
    boolean existsByNome(String nome);
    Optional<Produto> findByNome(String nome);
}