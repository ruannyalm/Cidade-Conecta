package com.example.conecta.Model;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Instant;

import org.junit.jupiter.api.Test;

class ModelTest {

    @Test
    void enumsExposeSupportedValues() {
        assertArrayEquals(new Role[] {Role.CIDADAO, Role.PREFEITURA}, Role.values());
        assertArrayEquals(new CategoriaOcorrencia[] {
                CategoriaOcorrencia.BURACO_VIA,
                CategoriaOcorrencia.POSTE_CAIDO,
                CategoriaOcorrencia.ILUMINACAO_INSUFICIENTE,
                CategoriaOcorrencia.QUEIMADA,
                CategoriaOcorrencia.LIXO_IRREGULAR,
                CategoriaOcorrencia.OUTRO
        }, CategoriaOcorrencia.values());
        assertArrayEquals(new NivelUrgencia[] {
                NivelUrgencia.BAIXA,
                NivelUrgencia.MEDIA,
                NivelUrgencia.ALTA,
                NivelUrgencia.CRITICA
        }, NivelUrgencia.values());
        assertArrayEquals(new StatusOcorrencia[] {
                StatusOcorrencia.EM_ANALISE,
                StatusOcorrencia.AGENDADO,
                StatusOcorrencia.EM_PROCESSO,
                StatusOcorrencia.RESOLVIDO
        }, StatusOcorrencia.values());
    }

    @Test
    void usuarioStoresProfileFields() {
        UsuarioModel usuario = new UsuarioModel();
        usuario.setNome("Ana Silva");
        usuario.setEmail("ana@example.com");
        usuario.setSenha("senha-hash");
        usuario.setRegiao("Centro");
        usuario.setRole(Role.CIDADAO);

        assertEquals("Ana Silva", usuario.getNome());
        assertEquals("ana@example.com", usuario.getEmail());
        assertEquals("senha-hash", usuario.getSenha());
        assertEquals("Centro", usuario.getRegiao());
        assertEquals(Role.CIDADAO, usuario.getRole());
    }

    @Test
    void acompanhamentoConstructorStoresOccurrenceAndUser() {
        OcorrenciaModel ocorrencia = new OcorrenciaModel();
        UsuarioModel usuario = new UsuarioModel();

        AcompanhamentoOcorrenciaModel acompanhamento = new AcompanhamentoOcorrenciaModel(ocorrencia, usuario);

        assertEquals(ocorrencia, acompanhamento.getOcorrencia());
        assertEquals(usuario, acompanhamento.getUsuario());
    }

    @Test
    void mediaConstructorStoresOccurrenceAndMetadata() {
        OcorrenciaModel ocorrencia = new OcorrenciaModel();

        MidiaOcorrenciaModel midia = new MidiaOcorrenciaModel(
                ocorrencia, "foto-1.jpg", "foto.jpg", "image/jpeg", 2048L);

        assertEquals(ocorrencia, midia.getOcorrencia());
        assertEquals("foto-1.jpg", midia.getNomeArmazenado());
        assertEquals("foto.jpg", midia.getNomeOriginal());
        assertEquals("image/jpeg", midia.getTipoConteudo());
        assertEquals(2048L, midia.getTamanho());
    }

    @Test
    void notificationStartsUnreadAndSetsCreationTime() {
        UsuarioModel usuario = new UsuarioModel();
        OcorrenciaModel ocorrencia = new OcorrenciaModel();
        NotificacaoModel notificacao = new NotificacaoModel(usuario, ocorrencia, "Nova resposta");

        assertEquals(usuario, notificacao.getUsuario());
        assertEquals(ocorrencia, notificacao.getOcorrencia());
        assertEquals("Nova resposta", notificacao.getMensagem());
        assertFalse(notificacao.isLida());

        notificacao.aoCriar();
        assertNotNull(notificacao.getCriadaEm());

        notificacao.setLida(true);
        assertTrue(notificacao.isLida());
    }

    @Test
    void responseConstructorStoresAuthorAndSetsCreationTime() {
        UsuarioModel autor = new UsuarioModel();
        RespostaOcorrenciaModel resposta = new RespostaOcorrenciaModel(
                new OcorrenciaModel(), autor, "A equipe foi informada");

        assertEquals(autor, resposta.getAutor());
        assertEquals("A equipe foi informada", resposta.getMensagem());

        resposta.aoCriar();
        assertNotNull(resposta.getCriadaEm());
    }

    @Test
    void revokedTokenStoresIdAndExpiration() {
        Instant expiracao = Instant.parse("2026-10-01T12:00:00Z");

        TokenRevogadoModel token = new TokenRevogadoModel("token-id", expiracao);

        assertEquals("token-id", token.getId());
        assertEquals(expiracao, token.getExpiraEm());
    }

    @Test
    void occurrenceStoresReportDetails() {
        UsuarioModel autor = new UsuarioModel();
        OcorrenciaModel ocorrencia = new OcorrenciaModel();
        ocorrencia.setTitulo("Buraco na rua");
        ocorrencia.setDescricao("Buraco grande próximo à praça");
        ocorrencia.setCategoria(CategoriaOcorrencia.BURACO_VIA);
        ocorrencia.setEndereco("Rua das Flores, 10");
        ocorrencia.setBairro("Centro");
        ocorrencia.setLatitude(-23.55);
        ocorrencia.setLongitude(-46.63);
        ocorrencia.setAnonima(true);
        ocorrencia.setEnviadaPorAudio(false);
        ocorrencia.setStatus(StatusOcorrencia.EM_PROCESSO);
        ocorrencia.setUrgencia(NivelUrgencia.ALTA);
        ocorrencia.setAutor(autor);

        assertEquals("Buraco na rua", ocorrencia.getTitulo());
        assertEquals("Buraco grande próximo à praça", ocorrencia.getDescricao());
        assertEquals(CategoriaOcorrencia.BURACO_VIA, ocorrencia.getCategoria());
        assertEquals("Rua das Flores, 10", ocorrencia.getEndereco());
        assertEquals("Centro", ocorrencia.getBairro());
        assertEquals(-23.55, ocorrencia.getLatitude());
        assertEquals(-46.63, ocorrencia.getLongitude());
        assertTrue(ocorrencia.isAnonima());
        assertFalse(ocorrencia.isEnviadaPorAudio());
        assertEquals(StatusOcorrencia.EM_PROCESSO, ocorrencia.getStatus());
        assertEquals(NivelUrgencia.ALTA, ocorrencia.getUrgencia());
        assertEquals(autor, ocorrencia.getAutor());
    }

    @Test
    void occurrenceLifecycleInitializesDefaultsAndUpdatesTimestamp() {
        OcorrenciaModel ocorrencia = new OcorrenciaModel();

        ocorrencia.aoCriar();

        assertEquals(StatusOcorrencia.EM_ANALISE, ocorrencia.getStatus());
        assertNotNull(ocorrencia.getCriadaEm());
        assertNotNull(ocorrencia.getAtualizadaEm());
        assertEquals(ocorrencia.getCriadaEm(), ocorrencia.getAtualizadaEm());

        Instant criadaEm = ocorrencia.getCriadaEm();
        Instant atualizadaEm = ocorrencia.getAtualizadaEm();
        ocorrencia.aoAtualizar();

        assertEquals(criadaEm, ocorrencia.getCriadaEm());
        assertFalse(ocorrencia.getAtualizadaEm().isBefore(atualizadaEm));
    }

    @Test
    void occurrenceCreationPreservesExplicitStatus() {
        OcorrenciaModel ocorrencia = new OcorrenciaModel();
        ocorrencia.setStatus(StatusOcorrencia.RESOLVIDO);

        ocorrencia.aoCriar();

        assertEquals(StatusOcorrencia.RESOLVIDO, ocorrencia.getStatus());
    }
}