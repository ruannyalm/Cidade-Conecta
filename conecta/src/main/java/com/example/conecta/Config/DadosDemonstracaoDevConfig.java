package com.example.conecta.Config;

import com.example.conecta.Model.CategoriaOcorrencia;
import com.example.conecta.Model.NivelUrgencia;
import com.example.conecta.Model.OcorrenciaModel;
import com.example.conecta.Model.RespostaOcorrenciaModel;
import com.example.conecta.Model.Role;
import com.example.conecta.Model.StatusOcorrencia;
import com.example.conecta.Model.UsuarioModel;
import com.example.conecta.Repository.OcorrenciaRepository;
import com.example.conecta.Repository.RespostaOcorrenciaRepository;
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
    private static final String EMAIL_PREFEITURA_DEMO = "prefeitura@acopiara.ce.gov.br";
    private static final String EMAIL_MARIA_CLARA = "maria.clara@cidade-conecta.local";

    private static final List<OcorrenciaDemonstracao> OCORRENCIAS = List.of(
            new OcorrenciaDemonstracao("Av. Cazuzinha Marques", "Buraco próximo à praça",
                    "Um buraco grande está dificultando a passagem de carros e motocicletas no trecho central.",
                    CategoriaOcorrencia.BURACO_VIA, StatusOcorrencia.EM_ANALISE, NivelUrgencia.ALTA,
                    List.of(
                            new ComentarioDemonstracao("Maria Clara", "Passei por lá ontem à noite e quase caí de moto! Precisa de reparo urgente."),
                            new ComentarioDemonstracao("Carlos Eduardo", "Apoiei! Tomara que a prefeitura resolva logo este buraco.")
                    )),
            new OcorrenciaDemonstracao("R. Manuel José", "Poste apagado e fiação caída",
                    "O poste em frente às casas está sem iluminação há alguns dias e há fiação solta na altura do número 240.",
                    CategoriaOcorrencia.ILUMINACAO_INSUFICIENTE, StatusOcorrencia.AGENDADO, NivelUrgencia.MEDIA,
                    List.of(
                            new ComentarioDemonstracao("Prefeitura de Acopiara", "Ocorrência encaminhada para a secretaria de obras e iluminação pública.")
                    )),
            new OcorrenciaDemonstracao("R. Emídio Alves de Almeida", "Descarte irregular de lixo e entulho",
                    "Sacolas de lixo e restos de construção estão bloqueando a calçada, atraindo insetos e mau cheiro.",
                    CategoriaOcorrencia.LIXO_IRREGULAR, StatusOcorrencia.EM_PROCESSO, NivelUrgencia.MEDIA,
                    List.of(
                            new ComentarioDemonstracao("Fernanda Lima", "O acúmulo de lixo está aumentando a cada dia perto das residências.")
                    )),
            new OcorrenciaDemonstracao("R. Maria Nilce Rodrigues Marquês", "Trecho da via com buracos e afundamento",
                    "Depois das chuvas, surgiram buracos graves que oferecem risco de queda a motociclistas e ciclistas.",
                    CategoriaOcorrencia.BURACO_VIA, StatusOcorrencia.EM_ANALISE, NivelUrgencia.ALTA,
                    List.of(
                            new ComentarioDemonstracao("Luciana Rocha", "Total apoio! É a rua principal de acesso ao bairro e o fundo dos carros pequenos está raspando.")
                    )),
            new OcorrenciaDemonstracao("R. Dr. Tribúrcio Soares", "Árvore caída e galhos sobre a calçada",
                    "Galhos caídos ocupam parte da calçada e cobrem a placa de sinalização de trânsito.",
                    CategoriaOcorrencia.OUTRO, StatusOcorrencia.AGENDADO, NivelUrgencia.BAIXA,
                    List.of(
                            new ComentarioDemonstracao("Prefeitura de Acopiara", "Poda e remoção agendadas com a equipe de meio ambiente.")
                    )),
            new OcorrenciaDemonstracao("R. Paulino Felix", "Lâmpadas queimadas substituídas",
                    "Dois pontos de iluminação estavam apagados, deixando a rua escura durante a noite.",
                    CategoriaOcorrencia.ILUMINACAO_INSUFICIENTE, StatusOcorrencia.RESOLVIDO, NivelUrgencia.BAIXA,
                    List.of(
                            new ComentarioDemonstracao("Marcos Vinícius", "Serviço concluído e iluminação restabelecida na rua.")
                    )),
            new OcorrenciaDemonstracao("Ponto de referência: Igreja da Matriz", "Calçada danificada e piso tátil solto",
                    "O piso está irregular próximo à entrada da igreja e dificulta a passagem de pedestres e idosos.",
                    CategoriaOcorrencia.OUTRO, StatusOcorrencia.EM_ANALISE, NivelUrgencia.MEDIA,
                    List.of(
                            new ComentarioDemonstracao("Padre Antônio", "Apoio este pedido! É essencial garantir acessibilidade a idosos e fiéis que frequentam a matriz.")
                    )));

    @Bean
    CommandLineRunner carregarOcorrenciasDeDemonstracao(
            OcorrenciaRepository ocorrenciaRepository,
            RespostaOcorrenciaRepository respostaRepository,
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

            UsuarioModel prefeitura = usuarioRepository.findByEmail(EMAIL_PREFEITURA_DEMO).orElseGet(() -> {
                UsuarioModel usuario = new UsuarioModel();
                usuario.setNome("Prefeitura de Acopiara");
                usuario.setEmail(EMAIL_PREFEITURA_DEMO);
                usuario.setSenha(passwordEncoder.encode(UUID.randomUUID().toString()));
                usuario.setRole(Role.PREFEITURA);
                usuario.setRegiao("Acopiara · CE");
                return usuarioRepository.save(usuario);
            });

            for (OcorrenciaDemonstracao exemplo : OCORRENCIAS) {
                String titulo = "[EXEMPLO] " + exemplo.titulo();
                OcorrenciaModel ocorrencia = ocorrenciaRepository.findByTituloAndEndereco(titulo, exemplo.endereco())
                        .orElseGet(() -> {
                            OcorrenciaModel nova = new OcorrenciaModel();
                            nova.setTitulo(titulo);
                            nova.setDescricao(exemplo.descricao());
                            nova.setCategoria(exemplo.categoria());
                            nova.setEndereco(exemplo.endereco());
                            nova.setBairro("Centro");
                            nova.setAnonima(false);
                            nova.setEnviadaPorAudio(false);
                            nova.setStatus(exemplo.status());
                            nova.setUrgencia(exemplo.urgencia());
                            nova.setAutor(autor);
                            return ocorrenciaRepository.save(nova);
                        });

                for (ComentarioDemonstracao c : exemplo.comentarios()) {
                    boolean jaExiste = respostaRepository.findByOcorrenciaIdOrderByCriadaEmAsc(ocorrencia.getId())
                            .stream()
                            .anyMatch(r -> r.getMensagem().equals(c.mensagem()));
                    if (!jaExiste) {
                        UsuarioModel autorComentario = c.autor().startsWith("Prefeitura") ? prefeitura : autor;
                        respostaRepository.save(new RespostaOcorrenciaModel(ocorrencia, autorComentario, c.mensagem()));
                    }
                }
            }
        };
    }

    private record OcorrenciaDemonstracao(
            String endereco,
            String titulo,
            String descricao,
            CategoriaOcorrencia categoria,
            StatusOcorrencia status,
            NivelUrgencia urgencia,
            List<ComentarioDemonstracao> comentarios) {
    }

    private record ComentarioDemonstracao(String autor, String mensagem) {
    }
}
