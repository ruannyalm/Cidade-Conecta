package com.example.conecta.Config;

import com.example.conecta.Model.CategoriaOcorrencia;
import com.example.conecta.Model.NivelUrgencia;
import com.example.conecta.Model.OcorrenciaModel;
import com.example.conecta.Model.Role;
import com.example.conecta.Model.StatusOcorrencia;
import com.example.conecta.Model.UsuarioModel;
import com.example.conecta.Repository.OcorrenciaRepository;
import com.example.conecta.Repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.UUID;

@Configuration
@Profile("dev")
@ConditionalOnProperty(name = "cidade-conecta.demo-data.enabled", havingValue = "true")
public class DadosDemonstracaoDevConfig {

    private static final String EMAIL_AUTOR_DEMO = "demo-acopiara@cidade-conecta.local";

    private static final List<OcorrenciaDemonstracao> OCORRENCIAS = List.of(
            new OcorrenciaDemonstracao("Av. Cazuzinha Marques", "Buraco próximo à praça",
                    "Um buraco grande está dificultando a passagem de carros e motocicletas.",
                    CategoriaOcorrencia.BURACO_VIA, StatusOcorrencia.EM_ANALISE, NivelUrgencia.ALTA),
            new OcorrenciaDemonstracao("R. Manuel José", "Poste apagado durante a noite",
                    "O poste em frente às casas está sem iluminação há alguns dias.",
                    CategoriaOcorrencia.ILUMINACAO_INSUFICIENTE, StatusOcorrencia.AGENDADO, NivelUrgencia.MEDIA),
            new OcorrenciaDemonstracao("R. Emídio Alves de Almeida", "Descarte irregular de lixo",
                    "Há sacos de lixo acumulados na calçada, atraindo animais e bloqueando a passagem.",
                    CategoriaOcorrencia.LIXO_IRREGULAR, StatusOcorrencia.EM_PROCESSO, NivelUrgencia.MEDIA),
            new OcorrenciaDemonstracao("R. Maria Nilce Rodrigues Marquês", "Trecho da via com buracos",
                    "Depois das chuvas, surgiram buracos que oferecem risco a quem passa de bicicleta.",
                    CategoriaOcorrencia.BURACO_VIA, StatusOcorrencia.EM_ANALISE, NivelUrgencia.ALTA),
            new OcorrenciaDemonstracao("R. Dr. Tribúrcio Soares", "Árvore caída na calçada",
                    "Galhos caídos ocupam parte da calçada e precisam ser removidos.",
                    CategoriaOcorrencia.OUTRO, StatusOcorrencia.AGENDADO, NivelUrgencia.BAIXA),
            new OcorrenciaDemonstracao("R. Paulino Felix", "Lâmpadas queimadas",
                    "Dois pontos de iluminação estão apagados, deixando a rua escura à noite.",
                    CategoriaOcorrencia.ILUMINACAO_INSUFICIENTE, StatusOcorrencia.RESOLVIDO, NivelUrgencia.BAIXA),
            new OcorrenciaDemonstracao("Ponto de referência: Igreja da Matriz", "Calçada danificada perto da matriz",
                    "O piso está irregular próximo à entrada da igreja e dificulta a passagem de pedestres.",
                    CategoriaOcorrencia.OUTRO, StatusOcorrencia.EM_ANALISE, NivelUrgencia.MEDIA));

    @Bean
    CommandLineRunner carregarOcorrenciasDeDemonstracao(
            OcorrenciaRepository ocorrenciaRepository,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            UsuarioModel autor = usuarioRepository.findByEmail(EMAIL_AUTOR_DEMO).orElseGet(() -> {
                UsuarioModel usuario = new UsuarioModel();
                usuario.setNome("Morador de demonstração");
                usuario.setEmail(EMAIL_AUTOR_DEMO);
                usuario.setSenha(passwordEncoder.encode(UUID.randomUUID().toString()));
                usuario.setRole(Role.CIDADAO);
                usuario.setRegiao("Acopiara · CE");
                return usuarioRepository.save(usuario);
            });

            for (OcorrenciaDemonstracao exemplo : OCORRENCIAS) {
                String titulo = "[EXEMPLO] " + exemplo.titulo();
                if (ocorrenciaRepository.existsByTituloAndEndereco(titulo, exemplo.endereco())) {
                    continue;
                }
                OcorrenciaModel ocorrencia = new OcorrenciaModel();
                ocorrencia.setTitulo(titulo);
                ocorrencia.setDescricao(exemplo.descricao());
                ocorrencia.setCategoria(exemplo.categoria());
                ocorrencia.setEndereco(exemplo.endereco());
                ocorrencia.setBairro("Centro");
                ocorrencia.setAnonima(false);
                ocorrencia.setEnviadaPorAudio(false);
                ocorrencia.setStatus(exemplo.status());
                ocorrencia.setUrgencia(exemplo.urgencia());
                ocorrencia.setAutor(autor);
                ocorrenciaRepository.save(ocorrencia);
            }
        };
    }

    private record OcorrenciaDemonstracao(
            String endereco,
            String titulo,
            String descricao,
            CategoriaOcorrencia categoria,
            StatusOcorrencia status,
            NivelUrgencia urgencia) {
    }
}
