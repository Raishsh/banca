package br.com.sampaiollo.pzsmp.service;

import br.com.sampaiollo.pzsmp.dto.AdicionarItensRequest;
import br.com.sampaiollo.pzsmp.dto.PedidoRequestDto;
import br.com.sampaiollo.pzsmp.dto.PedidoResponseDto;
import br.com.sampaiollo.pzsmp.entity.*;
import br.com.sampaiollo.pzsmp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort; 
import jakarta.persistence.EntityManager;
import br.com.sampaiollo.pzsmp.repository.ItemPedidoRepository;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;
    @Autowired
    private ClienteRepository clienteRepository;
    @Autowired
    private ProdutoRepository produtoRepository;
    @Autowired
    private MesaRepository mesaRepository;
    @Autowired
    private RelatorioDiarioRepository relatorioDiarioRepository;
    @Autowired
    private SangriaRepository sangriaRepository;
     @Autowired
    private EntityManager entityManager;
      @Autowired
    private ItemPedidoRepository itemPedidoRepository;
      @Autowired
    private PagamentoRepository pagamentoRepository;
    @Autowired
    private br.com.sampaiollo.pzsmp.repository.SequencienciadorPedidoRepository sequenciadorRepository;

    @Transactional
    public PedidoResponseDto realizarPedido(PedidoRequestDto pedidoDto) {
        Cliente cliente = null;
        if (pedidoDto.getIdCliente() != null) {
            cliente = clienteRepository.findById(pedidoDto.getIdCliente())
                    .orElseThrow(() -> new RuntimeException("Cliente não encontrado com ID: " + pedidoDto.getIdCliente()));
        }

        Pedido pedido = new Pedido();
        pedido.setCliente(cliente);
        LocalDateTime agora = LocalDateTime.now();
        pedido.setData(agora);
        pedido.setStatus(StatusPedido.PREPARANDO);
        pedido.setNomeClienteTemporario(pedidoDto.getNomeClienteTemporario());
        // Define numero do pedido sequencial global controlado por sequenciador
        br.com.sampaiollo.pzsmp.entity.SequenciadorPedido seq = sequenciadorRepository.findById(1L)
                .orElseGet(() -> {
                    br.com.sampaiollo.pzsmp.entity.SequenciadorPedido novo = new br.com.sampaiollo.pzsmp.entity.SequenciadorPedido(1L, 1, LocalDateTime.now());
                    return sequenciadorRepository.save(novo);
                });
        Integer numeroAtual = seq.getProximoNumero();
        pedido.setNumeroDia(numeroAtual);
        seq.setProximoNumero(numeroAtual + 1);
        sequenciadorRepository.save(seq);

        if (pedidoDto.getIdMesa() != null) {
            Mesa mesa = mesaRepository.findById(pedidoDto.getIdMesa())
                    .orElseThrow(() -> new RuntimeException("Mesa não encontrada com número: " + pedidoDto.getIdMesa()));
            pedido.setMesa(mesa);
            mesa.setStatus(StatusMesa.OCUPADA);
            mesaRepository.save(mesa);
        }

        BigDecimal totalPedido = BigDecimal.ZERO;
        List<ItemPedido> itensDoPedido = new ArrayList<>();
        for (var itemDto : pedidoDto.getItens()) {
            
            if (itemDto.getIdsSabores() == null || itemDto.getIdsSabores().isEmpty()) {
                throw new RuntimeException("Pedido recebido com item sem sabores.");
            }
            
            // 1. Busca todos os produtos (sabores) daquele item
            List<Produto> saboresDoItem = produtoRepository.findAllById(itemDto.getIdsSabores());
            
            if (saboresDoItem.isEmpty()) {
                throw new RuntimeException("IDs de produto não encontrados: " + itemDto.getIdsSabores());
            }

            // 2. Lógica do Preço: Calcular a SOMA dos sabores
            BigDecimal somaDosPrecos = saboresDoItem.stream()
                .map(Produto::getPreco) // Pega o preço de cada sabor
                .reduce(BigDecimal.ZERO, BigDecimal::add); // Soma todos eles

            BigDecimal numeroDeSabores = new BigDecimal(saboresDoItem.size());

            // 3. Calcula a MÉDIA (e arredonda para 2 casas decimais)
            BigDecimal precoCalculadoDoItem = somaDosPrecos.divide(numeroDeSabores, 2, RoundingMode.HALF_UP);

            // 4. Criar o ItemPedido
            ItemPedido itemPedido = new ItemPedido();
            itemPedido.setPedido(pedido);
            itemPedido.setQuantidade(itemDto.getQuantidade());
            itemPedido.setSabores(saboresDoItem); // Seta a LISTA de sabores
            itemPedido.setPrecoCalculado(precoCalculadoDoItem); // Seta o preço da MÉDIA
            
            itensDoPedido.add(itemPedido);
            
            // 5. Adiciona ao total do pedido (Média * Quantidade)
            totalPedido = totalPedido.add(
                precoCalculadoDoItem.multiply(BigDecimal.valueOf(itemDto.getQuantidade()))
            );
        }
        
        pedido.setItens(itensDoPedido);
        BigDecimal taxa = (pedidoDto.getTaxaEntrega() != null) ? pedidoDto.getTaxaEntrega() : BigDecimal.ZERO;
        pedido.setTaxaEntrega(taxa);
        totalPedido = totalPedido.add(taxa);
        pedido.setTotal(totalPedido);

        Pedido pedidoSalvo = pedidoRepository.save(pedido);
        return new PedidoResponseDto(pedidoSalvo);
    }

    @Transactional
    public PedidoResponseDto atualizarStatus(Integer pedidoId, String novoStatus) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado com ID: " + pedidoId));
        StatusPedido statusEnum = StatusPedido.valueOf(novoStatus.toUpperCase());
        pedido.setStatus(statusEnum);
        Pedido pedidoSalvo = pedidoRepository.save(pedido);
        return new PedidoResponseDto(pedidoSalvo);
    }

    public Optional<PedidoResponseDto> buscarPorId(Integer id) {
        return pedidoRepository.findById(id).map(PedidoResponseDto::new);
    }

    public List<PedidoResponseDto> listarTodos() {
        // Obter o timestamp de início do expediente atual
        br.com.sampaiollo.pzsmp.entity.SequenciadorPedido seq = sequenciadorRepository.findById(1L).orElse(null);
        LocalDateTime inicioExpediente = seq != null ? seq.getDataInicioExpediente() : LocalDateTime.now();

        return pedidoRepository.findAll().stream()
                .filter(p -> {
                    // Nunca mostrar pedidos ENTREGUE
                    if (p.getStatus() == StatusPedido.ENTREGUE) {
                        return false;
                    }
                    // Mostrar pedidos CANCELADO apenas se forem do expediente atual
                    if (p.getStatus() == StatusPedido.CANCELADO) {
                        return p.getData().isAfter(inicioExpediente);
                    }
                    // Mostrar todos os outros status (PREPARANDO, PRONTO, PAGO)
                    return true;
                })
                .map(PedidoResponseDto::new)
                .collect(Collectors.toList());
    }

    public List<PedidoResponseDto> buscarPorMesa(Integer numeroMesa) {
        List<StatusPedido> statusesExcluidos = List.of(StatusPedido.ENTREGUE, StatusPedido.CANCELADO, StatusPedido.PAGO);
        List<Pedido> pedidosAtivos = pedidoRepository.findByMesaNumeroAndStatusNotIn(numeroMesa, statusesExcluidos);
        return pedidosAtivos.stream()
                .map(PedidoResponseDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public PedidoResponseDto adicionarItens(Integer pedidoId, AdicionarItensRequest request) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado com ID: " + pedidoId));

        for (var itemDto : request.itens()) {
            
            if (itemDto.getIdsSabores() == null || itemDto.getIdsSabores().isEmpty()) {
                throw new RuntimeException("Item sem sabores.");
            }

            List<Produto> saboresDoItem = produtoRepository.findAllById(itemDto.getIdsSabores());
            
            if (saboresDoItem.isEmpty()) {
                throw new RuntimeException("IDs de produto não encontrados: " + itemDto.getIdsSabores());
            }

            BigDecimal somaDosPrecos = saboresDoItem.stream()
                .map(Produto::getPreco)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal numeroDeSabores = new BigDecimal(saboresDoItem.size());
            BigDecimal precoCalculadoDoItem = somaDosPrecos.divide(numeroDeSabores, 2, RoundingMode.HALF_UP);

            ItemPedido novoItem = new ItemPedido();
            novoItem.setPedido(pedido);
            novoItem.setQuantidade(itemDto.getQuantidade());
            novoItem.setSabores(saboresDoItem);
            novoItem.setPrecoCalculado(precoCalculadoDoItem);
            
            pedido.getItens().add(novoItem);
            
            BigDecimal valorAdicional = precoCalculadoDoItem.multiply(BigDecimal.valueOf(itemDto.getQuantidade()));
            pedido.setTotal(pedido.getTotal().add(valorAdicional));
        }

        Pedido pedidoSalvo = pedidoRepository.save(pedido);
        return new PedidoResponseDto(pedidoSalvo);
    }

    @Transactional
    public PedidoResponseDto fecharPedidoMesa(Integer pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado com ID: " + pedidoId));
        pedido.setStatus(StatusPedido.ENTREGUE);
        Mesa mesa = pedido.getMesa();

        if (mesa != null) {
            List<StatusPedido> statusesFinalizados = List.of(StatusPedido.PAGO, StatusPedido.ENTREGUE, StatusPedido.CANCELADO);
            long pedidosPendentes = pedidoRepository.countByMesaAndStatusNotIn(mesa, statusesFinalizados);
            if (pedidosPendentes == 0) {
                mesa.setStatus(StatusMesa.LIVRE);
                mesaRepository.save(mesa);
            }
        }

        Pedido pedidoSalvo = pedidoRepository.save(pedido);
        return new PedidoResponseDto(pedidoSalvo);
    }

    /**
     * MÉTODO PRINCIPAL PARA O FECHAMENTO DE CAIXA.
     * Agora ele calcula o relatório corretamente, subtraindo as sangrias,
     * e depois limpa os dados do dia.
     */
    @Transactional
    public void fecharCaixa() {
        // Mantém todos os pedidos registrados (para o relatório detalhado)
        // Marca pedidos em aberto (PREPARANDO/PRONTO) como CANCELADO para não aparecerem como ativos
        List<Pedido> todos = pedidoRepository.findAll();
        List<Pedido> alterados = new ArrayList<>();
        for (Pedido p : todos) {
            if (p.getStatus() == StatusPedido.PREPARANDO || p.getStatus() == StatusPedido.PRONTO) {
                p.setStatus(StatusPedido.CANCELADO);
                alterados.add(p);
            } else if (p.getStatus() == StatusPedido.PAGO) {
                p.setStatus(StatusPedido.ENTREGUE);
                alterados.add(p);
            }
        }
        if (!alterados.isEmpty()) {
            pedidoRepository.saveAll(alterados);
        }

        // Reseta o sequenciador de número de pedidos para iniciar do 1 no próximo expediente
        // E atualiza o timestamp de início do expediente para agora
        var seq = sequenciadorRepository.findById(1L).orElse(null);
        if (seq == null) {
            seq = new br.com.sampaiollo.pzsmp.entity.SequenciadorPedido(1L, 1, LocalDateTime.now());
        } else {
            seq.setProximoNumero(1);
            seq.setDataInicioExpediente(LocalDateTime.now());
        }
        sequenciadorRepository.save(seq);

        // Libera todas as mesas para o próximo atendimento
        List<Mesa> todasAsMesas = mesaRepository.findAll();
        todasAsMesas.forEach(mesa -> mesa.setStatus(StatusMesa.LIVRE));
        mesaRepository.saveAll(todasAsMesas);
    }

    public List<RelatorioDiario> listarRelatorios() {
        // Este método não pertence mais aqui, deveria estar em RelatorioService.
        // Mas mantendo por enquanto para não quebrar seu controller.
            return relatorioDiarioRepository.findAll(Sort.by(Sort.Direction.DESC, "data"));
    }
    
    public List<PedidoResponseDto> buscarPedidosPorData(LocalDate data) {
        LocalDateTime inicioDoDia = data.atStartOfDay();
        LocalDateTime fimDoDia = data.atTime(23, 59, 59);

        return pedidoRepository.findByDataBetween(inicioDoDia, fimDoDia)
                .stream()
                .map(PedidoResponseDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public PedidoResponseDto cancelarPedido(Integer pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado com ID: " + pedidoId));

        // Verificar se o pedido pode ser cancelado
        if (pedido.getStatus() == StatusPedido.PAGO || pedido.getStatus() == StatusPedido.ENTREGUE) {
            throw new RuntimeException("Você não pode cancelar este pedido. O status atual é: " + pedido.getStatus());
        }

        if (pedido.getStatus() == StatusPedido.CANCELADO) {
            throw new RuntimeException("Este pedido já foi cancelado.");
        }

        // Cancelar o pedido
        pedido.setStatus(StatusPedido.CANCELADO);

        // Liberar a mesa se existir
        Mesa mesa = pedido.getMesa();
        if (mesa != null) {
            List<StatusPedido> statusesFinalizados = List.of(StatusPedido.PAGO, StatusPedido.ENTREGUE, StatusPedido.CANCELADO);
            long pedidosPendentes = pedidoRepository.countByMesaAndStatusNotIn(mesa, statusesFinalizados);
            if (pedidosPendentes == 1) { // Será 1 porque ainda não salvamos este pedido
                mesa.setStatus(StatusMesa.LIVRE);
                mesaRepository.save(mesa);
            }
        }

        Pedido pedidoSalvo = pedidoRepository.save(pedido);
        return new PedidoResponseDto(pedidoSalvo);
    }
}
