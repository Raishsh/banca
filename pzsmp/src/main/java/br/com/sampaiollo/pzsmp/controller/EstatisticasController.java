package br.com.sampaiollo.pzsmp.controller;

import br.com.sampaiollo.pzsmp.dto.EstatisticaProdutoDto;
import br.com.sampaiollo.pzsmp.repository.ItemPedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/estatisticas")
@CrossOrigin(origins = "*")
public class EstatisticasController {

    @Autowired
    private ItemPedidoRepository itemPedidoRepository;

    @GetMapping("/mais-vendidos")
    public ResponseEntity<List<EstatisticaProdutoDto>> getMaisVendidos(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        // Se não informar data fim, usa o momento atual
        LocalDateTime dataFim = (fim != null) ? fim.atTime(LocalTime.MAX) : LocalDateTime.now();
        
        // CORREÇÃO AQUI: Usamos LocalDate.now() para poder chamar atStartOfDay()
        LocalDateTime dataInicio = (inicio != null) ? inicio.atStartOfDay() : LocalDate.now().minusDays(7).atStartOfDay();

        List<EstatisticaProdutoDto> resultado = itemPedidoRepository.findMaisVendidos(dataInicio, dataFim);
        return ResponseEntity.ok(resultado);
    }
}