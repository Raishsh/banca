package br.com.sampaiollo.pzsmp.service;

import br.com.sampaiollo.pzsmp.dto.ProdutoRequest;
import br.com.sampaiollo.pzsmp.entity.Produto;
import br.com.sampaiollo.pzsmp.entity.TipoProduto;
import br.com.sampaiollo.pzsmp.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ProdutoService {

    @Autowired
    private ProdutoRepository produtoRepository;

    public List<Produto> listarTodos() {
        return produtoRepository.findAll();
    }

    public Optional<Produto> buscarPorId(Integer id) {
        return produtoRepository.findById(id);
    }
    
    @Transactional
    public Produto cadastrarProduto(ProdutoRequest request, MultipartFile imagem) {
        Produto novoProduto = new Produto();
        novoProduto.setNome(request.nome());
        novoProduto.setPreco(request.preco());
        novoProduto.setTipo(TipoProduto.valueOf(request.tipo().toUpperCase()));
        novoProduto.setDescricao(request.descricao());
        novoProduto.setPrecoPequeno(request.precoPequeno());
        novoProduto.setPrecoMedio(request.precoMedio());
        novoProduto.setPrecoGrande(request.precoGrande());
        novoProduto.setPrecoFamilia(request.precoFamilia()); // <--- ADICIONADO
        
        if (produtoRepository.existsByNome(request.nome())) {
            throw new RuntimeException("Já existe um produto cadastrado com o nome: " + request.nome());
        }

        if (imagem != null && !imagem.isEmpty()) {
            String nomeArquivo = salvarImagem(imagem);
            novoProduto.setImagemUrl(nomeArquivo);
        }

        return produtoRepository.save(novoProduto);
    }

    private String salvarImagem(MultipartFile imagem) {
        try {
            Path diretorioDeUpload = Paths.get("product-images");
            if (!Files.exists(diretorioDeUpload)) {
                Files.createDirectories(diretorioDeUpload);
            }
            String nomeArquivoOriginal = imagem.getOriginalFilename();
            String extensao = nomeArquivoOriginal.substring(nomeArquivoOriginal.lastIndexOf("."));
            String nomeArquivoUnico = UUID.randomUUID().toString() + extensao;
            Path caminhoDoArquivo = diretorioDeUpload.resolve(nomeArquivoUnico);
            Files.copy(imagem.getInputStream(), caminhoDoArquivo);
            return nomeArquivoUnico;
        } catch (IOException e) {
            throw new RuntimeException("Não foi possível salvar a imagem do produto.", e);
        }
    }

    @Transactional
    public Produto atualizarProduto(Integer id, ProdutoRequest request, MultipartFile imagem) {
        Produto produtoExistente = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado com ID: " + id));

        Optional<Produto> produtoComMesmoNome = produtoRepository.findByNome(request.nome());

        if (produtoComMesmoNome.isPresent() && !produtoComMesmoNome.get().getId_produto().equals(id)) {
            throw new RuntimeException("O nome '" + request.nome() + "' já está em uso por outro produto.");
        }

        if (imagem != null && !imagem.isEmpty()) {
            if (produtoExistente.getImagemUrl() != null && !produtoExistente.getImagemUrl().isEmpty()) {
                try {
                    Path caminhoImagemAntiga = Paths.get("product-images").resolve(produtoExistente.getImagemUrl());
                    Files.deleteIfExists(caminhoImagemAntiga);
                } catch (IOException e) {
                    System.err.println("Erro ao deletar imagem antiga: " + e.getMessage());
                }
            }
            String nomeNovoArquivo = salvarImagem(imagem);
            produtoExistente.setImagemUrl(nomeNovoArquivo);
        }

        produtoExistente.setNome(request.nome());
        produtoExistente.setPreco(request.preco());
        produtoExistente.setTipo(TipoProduto.valueOf(request.tipo().toUpperCase()));
        produtoExistente.setDescricao(request.descricao());
        produtoExistente.setPrecoPequeno(request.precoPequeno());
        produtoExistente.setPrecoMedio(request.precoMedio());
        produtoExistente.setPrecoGrande(request.precoGrande());
        produtoExistente.setPrecoFamilia(request.precoFamilia()); // <--- ADICIONADO

        return produtoRepository.save(produtoExistente);
    }

    @Transactional
    public void excluirProduto(Integer id) {
        if (!produtoRepository.existsById(id)) {
            throw new RuntimeException("Produto não encontrado com ID: " + id);
        }
        produtoRepository.deleteById(id);
    }
}