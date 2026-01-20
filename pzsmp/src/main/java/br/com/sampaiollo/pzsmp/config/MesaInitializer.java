package br.com.sampaiollo.pzsmp.config;

import br.com.sampaiollo.pzsmp.entity.Mesa;
import br.com.sampaiollo.pzsmp.entity.StatusMesa;
import br.com.sampaiollo.pzsmp.repository.MesaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class MesaInitializer implements CommandLineRunner {

    @Autowired
    private MesaRepository mesaRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Verifica se já existem mesas cadastradas
        long quantidadeMesas = mesaRepository.count();

        if (quantidadeMesas == 0) {
            System.out.println(">>> Nenhuma mesa encontrada. Iniciando cadastro automático de 35 mesas...");
            
            List<Mesa> novasMesas = new ArrayList<>();

            for (int i = 1; i <= 35; i++) {
                Mesa mesa = new Mesa();
                mesa.setNumero(i); // Mesa 1, Mesa 2, etc.
                mesa.setCapacidade(4); // Capacidade padrão de 4 pessoas (você pode alterar se quiser)
                mesa.setStatus(StatusMesa.LIVRE);
                
                novasMesas.add(mesa);
            }

            mesaRepository.saveAll(novasMesas);
            System.out.println(">>> 35 Mesas cadastradas com sucesso!");
        } else {
            System.out.println(">>> Mesas já cadastradas. Pulando inicialização.");
        }
    }
}