package br.com.sampaiollo.pzsmp.controller;

import org.springframework.http.HttpStatus;
import br.com.sampaiollo.pzsmp.dto.ProdutoRequest;
import br.com.sampaiollo.pzsmp.entity.Produto;
import br.com.sampaiollo.pzsmp.service.ProdutoService;
import java.math.BigDecimal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/produtos")
@CrossOrigin(origins = "*")
public class ProdutoController {

    @Autowired
    private ProdutoService produtoService;

    @GetMapping
    public ResponseEntity<List<Produto>> listarTodosProdutos() {
        List<Produto> produtos = produtoService.listarTodos();
        return ResponseEntity.ok(produtos);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarProdutoPorId(@PathVariable Integer id) {
        return produtoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Produto> cadastrarProduto(
            @RequestParam("nome") String nome,
            @RequestParam("preco") BigDecimal preco,
            @RequestParam("tipo") String tipo,
            @RequestParam(value = "descricao", required = false) String descricao,
            @RequestParam(value = "precoPequeno", required = false) BigDecimal precoPequeno,
            @RequestParam(value = "precoMedio", required = false) BigDecimal precoMedio,
            @RequestParam(value = "precoGrande", required = false) BigDecimal precoGrande,
            @RequestParam(value = "precoFamilia", required = false) BigDecimal precoFamilia, // <--- ADICIONADO
            @RequestParam(value = "imagem", required = false) MultipartFile imagem) {

        // Adicionado precoFamilia no construtor do Request
        ProdutoRequest request = new ProdutoRequest(nome, tipo, preco, descricao, precoPequeno, precoMedio, precoGrande, precoFamilia);

        Produto produtoSalvo = produtoService.cadastrarProduto(request, imagem);
        return ResponseEntity.status(HttpStatus.CREATED).body(produtoSalvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Produto> atualizarProduto(
            @PathVariable Integer id,
            @RequestParam("nome") String nome,
            @RequestParam("preco") BigDecimal preco,
            @RequestParam("tipo") String tipo,
            @RequestParam(value = "descricao", required = false) String descricao,
            @RequestParam(value = "precoPequeno", required = false) BigDecimal precoPequeno,
            @RequestParam(value = "precoMedio", required = false) BigDecimal precoMedio,
            @RequestParam(value = "precoGrande", required = false) BigDecimal precoGrande,
            @RequestParam(value = "precoFamilia", required = false) BigDecimal precoFamilia, // <--- ADICIONADO
            @RequestParam(value = "imagem", required = false) MultipartFile imagem) {

        // Adicionado precoFamilia no construtor do Request
        ProdutoRequest request = new ProdutoRequest(nome, tipo, preco, descricao, precoPequeno, precoMedio, precoGrande, precoFamilia);
        Produto produtoAtualizado = produtoService.atualizarProduto(id, request, imagem);

        return ResponseEntity.ok(produtoAtualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirProduto(@PathVariable Integer id) {
        produtoService.excluirProduto(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        if (ex.getMessage().contains("Já existe um produto") || ex.getMessage().contains("já está em uso")) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("erro", ex.getMessage()));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("erro", ex.getMessage()));
    }
}
