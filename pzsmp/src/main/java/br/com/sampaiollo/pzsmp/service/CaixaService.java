package br.com.sampaiollo.pzsmp.service;

import br.com.sampaiollo.pzsmp.dto.SangriaRequest;
import br.com.sampaiollo.pzsmp.dto.SangriaResponseDTO;
import br.com.sampaiollo.pzsmp.dto.AporteRequest;
import br.com.sampaiollo.pzsmp.dto.AporteResponseDTO;
import br.com.sampaiollo.pzsmp.entity.Funcionario;
import br.com.sampaiollo.pzsmp.entity.RelatorioDiario;
import br.com.sampaiollo.pzsmp.entity.Sangria;
import br.com.sampaiollo.pzsmp.entity.Aporte;
import br.com.sampaiollo.pzsmp.entity.Usuario;
import br.com.sampaiollo.pzsmp.repository.FuncionarioRepository;
import br.com.sampaiollo.pzsmp.repository.RelatorioDiarioRepository;
import br.com.sampaiollo.pzsmp.repository.SangriaRepository;
import br.com.sampaiollo.pzsmp.repository.AporteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List; // <<< Verifique a importação
import java.util.stream.Collectors; // <<< Verifique a importação

@Service
public class CaixaService {

    @Autowired
    private SangriaRepository sangriaRepository;
    @Autowired
    private AporteRepository aporteRepository;
    @Autowired
    private FuncionarioRepository funcionarioRepository;
    @Autowired
    private RelatorioDiarioRepository relatorioDiarioRepository;

    @Transactional
    public Sangria realizarSangria(SangriaRequest request) {
        Usuario usuarioLogado = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Funcionario funcionario = funcionarioRepository.findByUsuarioLogin(usuarioLogado.getLogin())
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado para o usuário logado."));

        Sangria novaSangria = new Sangria();
        novaSangria.setFuncionario(funcionario);
        novaSangria.setValor(request.valor());
        novaSangria.setObservacao(request.observacao());
        novaSangria.setData(LocalDateTime.now());

        Sangria sangriaSalva = sangriaRepository.save(novaSangria);

        // Atualiza o relatório diário em tempo real (subtrai)
        atualizarRelatorioDiario(request.valor(), false);

        return sangriaSalva;
    }
    
    /**
     * <<< ESTE É O MÉTODO QUE FALTAVA >>>
     * Busca todos os registros de sangria e os converte para o DTO de resposta.
     * @return Uma lista com os dados formatados de todas as sangrias.
     */
    @Transactional(readOnly = true)
    public List<SangriaResponseDTO> listarTodasSangrias() {
        return sangriaRepository.findAll()
                .stream()
                .map(SangriaResponseDTO::new)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public Aporte realizarAporte(AporteRequest request) {
        Usuario usuarioLogado = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Funcionario funcionario = funcionarioRepository.findByUsuarioLogin(usuarioLogado.getLogin())
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado para o usuário logado."));

        Aporte novoAporte = new Aporte();
        novoAporte.setFuncionario(funcionario);
        novoAporte.setValor(request.valor());
        novoAporte.setDescricao(request.descricao());
        novoAporte.setData(LocalDateTime.now());

        Aporte aporteSalvo = aporteRepository.save(novoAporte);

        // Atualiza o relatório diário em tempo real (soma)
        atualizarRelatorioDiario(request.valor(), true);

        return aporteSalvo;
    }

    @Transactional(readOnly = true)
    public List<AporteResponseDTO> listarTodosAportes() {
        return aporteRepository.findAll()
                .stream()
                .map(AporteResponseDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Lógica central para encontrar/criar o relatório do dia e atualizar seu valor.
     */
    private void atualizarRelatorioDiario(BigDecimal valor, boolean isSoma) {
        LocalDate hoje = LocalDate.now();

        RelatorioDiario relatorio = relatorioDiarioRepository.findByData(hoje)
                                        .orElse(new RelatorioDiario(hoje, BigDecimal.ZERO));

        if (isSoma) {
            relatorio.setValorTotal(relatorio.getValorTotal().add(valor));
        } else {
            relatorio.setValorTotal(relatorio.getValorTotal().subtract(valor));
        }

        relatorioDiarioRepository.save(relatorio);
    }
}
