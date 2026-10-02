package com.example.conecta.Service;

import com.example.conecta.Dto.AtualizarAndamentoRequest;
import com.example.conecta.Dto.AnaliseUrgenciaResponse;
import com.example.conecta.Dto.CriarOcorrenciaRequest;
import com.example.conecta.Dto.MidiaResponse;
import com.example.conecta.Dto.OcorrenciaResponse;
import com.example.conecta.Dto.RespostaOcorrenciaResponse;
import com.example.conecta.Model.AcompanhamentoOcorrenciaModel;
import com.example.conecta.Model.ApoioOcorrenciaModel;
import com.example.conecta.Model.CategoriaOcorrencia;
import com.example.conecta.Model.MidiaOcorrenciaModel;
import com.example.conecta.Model.NivelUrgencia;
import com.example.conecta.Model.OcorrenciaModel;
import com.example.conecta.Model.RespostaOcorrenciaModel;
import com.example.conecta.Model.Role;
import com.example.conecta.Model.UsuarioModel;
import com.example.conecta.Repository.AcompanhamentoOcorrenciaRepository;
import com.example.conecta.Repository.ApoioOcorrenciaRepository;
import com.example.conecta.Repository.MidiaOcorrenciaRepository;
import com.example.conecta.Repository.OcorrenciaRepository;
import com.example.conecta.Repository.RespostaOcorrenciaRepository;
import com.example.conecta.Repository.UsuarioRepository;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
public class OcorrenciaService {

    private static final int MAX_MIDIAS = 5;

    private final OcorrenciaRepository ocorrenciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final MidiaOcorrenciaRepository midiaRepository;
    private final ApoioOcorrenciaRepository apoioRepository;
    private final AcompanhamentoOcorrenciaRepository acompanhamentoRepository;
    private final RespostaOcorrenciaRepository respostaRepository;
    private final NotificacaoService notificacaoService;
    private final ArmazenamentoMidiaService armazenamentoMidiaService;
    private final PrioridadeOcorrenciaService prioridadeService;

    public OcorrenciaService(OcorrenciaRepository ocorrenciaRepository, UsuarioRepository usuarioRepository,
            MidiaOcorrenciaRepository midiaRepository, ApoioOcorrenciaRepository apoioRepository,
            AcompanhamentoOcorrenciaRepository acompanhamentoRepository,
            RespostaOcorrenciaRepository respostaRepository, NotificacaoService notificacaoService,
            ArmazenamentoMidiaService armazenamentoMidiaService, PrioridadeOcorrenciaService prioridadeService) {
        this.ocorrenciaRepository = ocorrenciaRepository;
        this.usuarioRepository = usuarioRepository;
        this.midiaRepository = midiaRepository;
        this.apoioRepository = apoioRepository;
        this.acompanhamentoRepository = acompanhamentoRepository;
        this.respostaRepository = respostaRepository;
        this.notificacaoService = notificacaoService;
        this.armazenamentoMidiaService = armazenamentoMidiaService;
        this.prioridadeService = prioridadeService;
    }

    @Transactional
    public OcorrenciaResponse criar(String email, CriarOcorrenciaRequest request, List<MultipartFile> arquivos) {
        UsuarioModel usuario = usuarioPorEmail(email);
        exigirCidadao(usuario);
        validarCriacao(request);
        List<MultipartFile> arquivosRecebidos = arquivos == null ? List.of() : arquivos;
        if (arquivosRecebidos.size() > MAX_MIDIAS) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "É permitido anexar até cinco arquivos.");
        }

        OcorrenciaModel ocorrencia = new OcorrenciaModel();
        ocorrencia.setTitulo(request.titulo().trim());
        ocorrencia.setDescricao(request.descricao().trim());
        ocorrencia.setCategoria(request.categoria());
        ocorrencia.setEndereco(trimToNull(request.endereco()));
        ocorrencia.setBairro(trimToNull(request.bairro()));
        ocorrencia.setLatitude(request.latitude());
        ocorrencia.setLongitude(request.longitude());
        ocorrencia.setAnonima(request.anonima());
        ocorrencia.setEnviadaPorAudio(request.enviadaPorAudio());
        ocorrencia.setStatus(com.example.conecta.Model.StatusOcorrencia.EM_ANALISE);
        ocorrencia.setUrgencia(prioridadeService.analisar(request.categoria(), 0,
            request.titulo(), request.descricao()).urgencia());
        ocorrencia.setAutor(usuario);
        ocorrencia = ocorrenciaRepository.save(ocorrencia);

        List<String> arquivosSalvos = new ArrayList<>();
        try {
            for (MultipartFile arquivo : arquivosRecebidos) {
                ArmazenamentoMidiaService.ArquivoArmazenado armazenado = armazenamentoMidiaService.armazenar(arquivo);
                arquivosSalvos.add(armazenado.nome());
                midiaRepository.save(new MidiaOcorrenciaModel(ocorrencia, armazenado.nome(),
                        armazenado.nomeOriginal(), armazenado.tipo(), armazenado.tamanho()));
            }
        } catch (RuntimeException exception) {
            arquivosSalvos.forEach(armazenamentoMidiaService::excluir);
            throw exception;
        }

        return converter(ocorrencia, usuario);
    }

    @Transactional(readOnly = true)
    public List<OcorrenciaResponse> listar(String email, Double latitudeMin, Double latitudeMax,
            Double longitudeMin, Double longitudeMax, String bairro) {
        UsuarioModel usuario = usuarioPorEmail(email);
        boolean filtroCoordenadas = latitudeMin != null || latitudeMax != null
                || longitudeMin != null || longitudeMax != null;
        List<OcorrenciaModel> ocorrencias;
        if (filtroCoordenadas) {
            if (latitudeMin == null || latitudeMax == null || longitudeMin == null || longitudeMax == null
                    || latitudeMin > latitudeMax || longitudeMin > longitudeMax) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Informe latitudeMin, latitudeMax, longitudeMin e longitudeMax válidos.");
            }
            ocorrencias = ocorrenciaRepository.findByLatitudeBetweenAndLongitudeBetweenOrderByCriadaEmDesc(
                    latitudeMin, latitudeMax, longitudeMin, longitudeMax);
        } else if (!isBlank(bairro)) {
            ocorrencias = ocorrenciaRepository.findByBairroContainingIgnoreCaseOrderByCriadaEmDesc(bairro.trim());
        } else {
            ocorrencias = ocorrenciaRepository.findAllByOrderByCriadaEmDesc();
        }
        return ocorrencias.stream().map(ocorrencia -> converter(ocorrencia, usuario)).toList();
    }

    @Transactional(readOnly = true)
    public OcorrenciaResponse obter(String email, Long id) {
        UsuarioModel usuario = usuarioPorEmail(email);
        return converter(ocorrenciaPorId(id), usuario);
    }

    @Transactional(readOnly = true)
    public List<OcorrenciaResponse> minhas(String email) {
        UsuarioModel usuario = usuarioPorEmail(email);
        return ocorrenciaRepository.findByAutorIdOrderByCriadaEmDesc(usuario.getId()).stream()
                .map(ocorrencia -> converter(ocorrencia, usuario)).toList();
    }

    @Transactional(readOnly = true)
    public List<OcorrenciaResponse> acompanhadas(String email) {
        UsuarioModel usuario = usuarioPorEmail(email);
        return acompanhamentoRepository.findByUsuarioId(usuario.getId()).stream()
                .map(AcompanhamentoOcorrenciaModel::getOcorrencia)
                .map(ocorrencia -> converter(ocorrencia, usuario)).toList();
    }

    @Transactional
    public void apoiar(String email, Long ocorrenciaId) {
        UsuarioModel usuario = usuarioPorEmail(email);
        OcorrenciaModel ocorrencia = ocorrenciaPorId(ocorrenciaId);
        if (apoioRepository.existsByOcorrenciaIdAndUsuarioId(ocorrenciaId, usuario.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Você já apoia esta ocorrência.");
        }
        apoioRepository.save(new ApoioOcorrenciaModel(ocorrencia, usuario));
        atualizarUrgencia(ocorrencia);
    }

    @Transactional
    public void removerApoio(String email, Long ocorrenciaId) {
        UsuarioModel usuario = usuarioPorEmail(email);
        OcorrenciaModel ocorrencia = ocorrenciaPorId(ocorrenciaId);
        if (!apoioRepository.existsByOcorrenciaIdAndUsuarioId(ocorrenciaId, usuario.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Apoio não encontrado.");
        }
        apoioRepository.deleteByOcorrenciaIdAndUsuarioId(ocorrenciaId, usuario.getId());
        atualizarUrgencia(ocorrencia);
    }

    @Transactional
    public void acompanhar(String email, Long ocorrenciaId) {
        UsuarioModel usuario = usuarioPorEmail(email);
        exigirCidadao(usuario);
        OcorrenciaModel ocorrencia = ocorrenciaPorId(ocorrenciaId);
        if (ocorrencia.getAutor().getId().equals(usuario.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Você já acompanha sua própria ocorrência.");
        }
        if (acompanhamentoRepository.existsByOcorrenciaIdAndUsuarioId(ocorrenciaId, usuario.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Você já acompanha esta ocorrência.");
        }
        acompanhamentoRepository.save(new AcompanhamentoOcorrenciaModel(ocorrencia, usuario));
    }

    @Transactional
    public void deixarDeAcompanhar(String email, Long ocorrenciaId) {
        UsuarioModel usuario = usuarioPorEmail(email);
        acompanhamentoRepository.deleteByOcorrenciaIdAndUsuarioId(ocorrenciaId, usuario.getId());
    }

    @Transactional
    public void atualizarAndamento(String email, Long ocorrenciaId, AtualizarAndamentoRequest request) {
        UsuarioModel prefeitura = usuarioPorEmail(email);
        exigirPrefeitura(prefeitura);
        if (request == null || request.status() == null || (request.resposta() != null && request.resposta().length() > 10000)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe um status válido e uma resposta de até 10.000 caracteres.");
        }

        OcorrenciaModel ocorrencia = ocorrenciaPorId(ocorrenciaId);
        ocorrencia.setStatus(request.status());
        if (!isBlank(request.resposta())) {
            respostaRepository.save(new RespostaOcorrenciaModel(ocorrencia, prefeitura, request.resposta().trim()));
        }
        String mensagem = "A ocorrência #" + ocorrenciaId + " foi atualizada para " + request.status() + ".";
        ocorrenciaRepository.save(ocorrencia);
        notificacaoService.notificarInteressados(ocorrencia, mensagem);
    }

    @Transactional
    public AnaliseUrgenciaResponse analisarUrgencia(String email, Long ocorrenciaId) {
        UsuarioModel prefeitura = usuarioPorEmail(email);
        exigirPrefeitura(prefeitura);
        OcorrenciaModel ocorrencia = ocorrenciaPorId(ocorrenciaId);
        long apoios = apoioRepository.countByOcorrenciaId(ocorrenciaId);
        PrioridadeOcorrenciaService.Resultado resultado = prioridadeService.analisar(
                ocorrencia.getCategoria(), apoios, ocorrencia.getTitulo(), ocorrencia.getDescricao());
        ocorrencia.setUrgencia(resultado.urgencia());
        ocorrenciaRepository.save(ocorrencia);
        return new AnaliseUrgenciaResponse(ocorrenciaId, resultado.urgencia(), resultado.pontuacao(),
                resultado.fatores(), resultado.recomendacao(), "triagem-explicavel-v1");
    }

    @Transactional(readOnly = true)
    public MidiaArquivo obterMidia(Long ocorrenciaId, Long midiaId) {
        MidiaOcorrenciaModel midia = midiaRepository.findByIdAndOcorrenciaId(midiaId, ocorrenciaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mídia não encontrada."));
        Resource resource = armazenamentoMidiaService.carregar(midia.getNomeArmazenado());
        return new MidiaArquivo(resource, midia.getTipoConteudo(), midia.getNomeOriginal());
    }

    private OcorrenciaResponse converter(OcorrenciaModel ocorrencia, UsuarioModel visualizador) {
        boolean ePrefeitura = visualizador.getRole() == Role.PREFEITURA;
        boolean eAutor = ocorrencia.getAutor().getId().equals(visualizador.getId());
        String nomeAutor = !ocorrencia.isAnonima() || ePrefeitura || eAutor
                ? ocorrencia.getAutor().getNome()
                : null;
        List<MidiaResponse> midias = midiaRepository.findByOcorrenciaIdOrderByIdAsc(ocorrencia.getId()).stream()
                .map(midia -> new MidiaResponse(midia.getId(), midia.getTipoConteudo(), midia.getTamanho(),
                        "/api/ocorrencias/" + ocorrencia.getId() + "/midias/" + midia.getId()))
                .toList();
        List<RespostaOcorrenciaResponse> respostas = respostaRepository
                .findByOcorrenciaIdOrderByCriadaEmAsc(ocorrencia.getId()).stream()
                .map(resposta -> new RespostaOcorrenciaResponse(resposta.getId(), resposta.getAutor().getNome(),
                        resposta.getMensagem(), resposta.getCriadaEm()))
                .toList();
        long apoios = apoioRepository.countByOcorrenciaId(ocorrencia.getId());
        boolean acompanhada = acompanhamentoRepository
                .existsByOcorrenciaIdAndUsuarioId(ocorrencia.getId(), visualizador.getId());
        NivelUrgencia urgencia = ePrefeitura ? ocorrencia.getUrgencia() : null;

        return new OcorrenciaResponse(ocorrencia.getId(), ocorrencia.getTitulo(), ocorrencia.getDescricao(),
                ocorrencia.getCategoria(), ocorrencia.getEndereco(), ocorrencia.getBairro(), ocorrencia.getLatitude(),
                ocorrencia.getLongitude(), ocorrencia.isAnonima(), nomeAutor, ocorrencia.getStatus(), urgencia,
                apoios, acompanhada, ocorrencia.isEnviadaPorAudio(), ocorrencia.getCriadaEm(), midias, respostas);
    }

    private void atualizarUrgencia(OcorrenciaModel ocorrencia) {
        ocorrencia.setUrgencia(prioridadeService.analisar(ocorrencia.getCategoria(),
            apoioRepository.countByOcorrenciaId(ocorrencia.getId()),
            ocorrencia.getTitulo(), ocorrencia.getDescricao()).urgencia());
        ocorrenciaRepository.save(ocorrencia);
    }

    private void validarCriacao(CriarOcorrenciaRequest request) {
        if (request == null || isBlank(request.titulo()) || request.titulo().trim().length() > 160
                || isBlank(request.descricao()) || request.descricao().trim().length() > 10000
                || request.categoria() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Título, descrição e categoria são obrigatórios; título até 160 e descrição até 10.000 caracteres.");
        }
        if ((request.latitude() == null) != (request.longitude() == null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Latitude e longitude devem ser informadas juntas.");
        }
        if (request.latitude() == null && isBlank(request.endereco()) && isBlank(request.bairro())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Informe coordenadas GPS ou endereço/bairro para localizar a ocorrência.");
        }
        if (request.latitude() != null && (request.latitude() < -90 || request.latitude() > 90
                || request.longitude() < -180 || request.longitude() > 180)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coordenadas fora do intervalo permitido.");
        }
    }

    private UsuarioModel usuarioPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
    }

    private OcorrenciaModel ocorrenciaPorId(Long id) {
        return ocorrenciaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ocorrência não encontrada."));
    }

    private void exigirCidadao(UsuarioModel usuario) {
        if (usuario.getRole() != Role.CIDADAO) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Somente cidadãos podem realizar esta ação.");
        }
    }

    private void exigirPrefeitura(UsuarioModel usuario) {
        if (usuario.getRole() != Role.PREFEITURA) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Ação permitida somente à prefeitura.");
        }
    }

    private String trimToNull(String value) {
        return isBlank(value) ? null : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    public record MidiaArquivo(Resource resource, String tipoConteudo, String nomeOriginal) {
    }
}