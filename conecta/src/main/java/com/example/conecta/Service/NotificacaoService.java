package com.example.conecta.Service;

import com.example.conecta.Dto.NotificacaoResponse;
import com.example.conecta.Model.NotificacaoModel;
import com.example.conecta.Model.OcorrenciaModel;
import com.example.conecta.Model.UsuarioModel;
import com.example.conecta.Repository.AcompanhamentoOcorrenciaRepository;
import com.example.conecta.Repository.NotificacaoRepository;
import com.example.conecta.Repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class NotificacaoService {

    private final NotificacaoRepository notificacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AcompanhamentoOcorrenciaRepository acompanhamentoRepository;

    public NotificacaoService(NotificacaoRepository notificacaoRepository, UsuarioRepository usuarioRepository,
            AcompanhamentoOcorrenciaRepository acompanhamentoRepository) {
        this.notificacaoRepository = notificacaoRepository;
        this.usuarioRepository = usuarioRepository;
        this.acompanhamentoRepository = acompanhamentoRepository;
    }

    @Transactional
    public void notificarInteressados(OcorrenciaModel ocorrencia, String mensagem) {
        Map<Long, UsuarioModel> destinatarios = new LinkedHashMap<>();
        destinatarios.put(ocorrencia.getAutor().getId(), ocorrencia.getAutor());
        acompanhamentoRepository.findByOcorrenciaId(ocorrencia.getId()).forEach(acompanhamento -> {
            UsuarioModel usuario = acompanhamento.getUsuario();
            destinatarios.put(usuario.getId(), usuario);
        });

        List<NotificacaoModel> notificacoes = new ArrayList<>();
        destinatarios.values().forEach(usuario -> notificacoes.add(new NotificacaoModel(usuario, ocorrencia, mensagem)));
        notificacaoRepository.saveAll(notificacoes);
    }

    @Transactional(readOnly = true)
    public List<NotificacaoResponse> listar(String email) {
        UsuarioModel usuario = usuarioPorEmail(email);
        return notificacaoRepository.findByUsuarioIdOrderByCriadaEmDesc(usuario.getId()).stream()
                .map(notificacao -> new NotificacaoResponse(notificacao.getId(),
                        notificacao.getOcorrencia().getId(), notificacao.getMensagem(), notificacao.isLida(),
                        notificacao.getCriadaEm()))
                .toList();
    }

    @Transactional
    public void marcarComoLida(String email, Long notificacaoId) {
        UsuarioModel usuario = usuarioPorEmail(email);
        NotificacaoModel notificacao = notificacaoRepository.findByIdAndUsuarioId(notificacaoId, usuario.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notificação não encontrada."));
        notificacao.setLida(true);
    }

    private UsuarioModel usuarioPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
    }
}