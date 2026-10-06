package com.example.conecta.Service;

import com.example.conecta.Model.CategoriaOcorrencia;
import com.example.conecta.Model.NivelUrgencia;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class PrioridadeOcorrenciaService {

    public NivelUrgencia calcular(CategoriaOcorrencia categoria, long apoios) {
        return analisar(categoria, apoios, null, null, List.of()).urgencia();
    }

    public Resultado analisar(CategoriaOcorrencia categoria, long apoios, String titulo, String descricao) {
        return analisar(categoria, apoios, titulo, descricao, List.of());
    }

    public Resultado analisar(CategoriaOcorrencia categoria, long apoios, String titulo, String descricao, List<String> comentarios) {
        CategoriaOcorrencia categoriaSegura = categoria == null ? CategoriaOcorrencia.OUTRO : categoria;
        int pontuacao = switch (categoriaSegura) {
            case POSTE_CAIDO, QUEIMADA -> 80;
            case BURACO_VIA -> 55;
            case ILUMINACAO_INSUFICIENTE -> 35;
            case LIXO_IRREGULAR -> 20;
            case OUTRO -> 10;
        };
        List<String> fatores = new ArrayList<>();
        fatores.add("Categoria: " + rotulo(categoriaSegura) + ".");

        List<String> listaComentarios = comentarios == null ? List.of() : comentarios;
        String textoComentarios = String.join(" ", listaComentarios);
        String textoPrincipal = (titulo == null ? "" : titulo) + " " + (descricao == null ? "" : descricao);
        String textoCompleto = normalizar(textoPrincipal + " " + textoComentarios);

        if (contemAlgum(textoCompleto, "risco de morte", "pessoa ferida", "choque eletrico", "fio energizado",
                "incendio", "chamas", "desabamento", "estrutura prestes a cair", "crianca em risco",
                "sangramento", "atropelamento", "quase cai de moto", "quase cai de carro")) {
            pontuacao = Math.max(pontuacao, 85);
            fatores.add("O relato ou comentários indicam risco imediato à vida, incêndio ou grave acidente de trânsito.");
        } else if (contemAlgum(textoCompleto, "via bloqueada", "alagamento", "enchente", "vazamento de gas",
                "semaforo apagado", "fio solto", "poste caiu", "risco de acidente", "bueiro aberto")) {
            pontuacao = Math.max(pontuacao, 65);
            fatores.add("O relato ou comentários indicam risco direto à circulação ou segurança dos cidadãos.");
        } else if (contemAlgum(textoCompleto, "sem iluminacao", "calcada bloqueada", "lixo acumulado",
                "buraco grande", "queda de energia", "quase cai")) {
            pontuacao = Math.max(pontuacao, 35);
            fatores.add("O relato ou comentários apontam impacto relevante na mobilidade ou uso do espaço público.");
        }

        if (!listaComentarios.isEmpty()) {
            fatores.add("Foram analisados " + listaComentarios.size() + " comentário(s) de cidadãos e prefeitura no histórico.");
        }

        int bonusApoios = (int) Math.min(15, Math.max(0, apoios / 10) * 3);
        if (bonusApoios > 0) {
            pontuacao += bonusApoios;
            fatores.add("Apoio da comunidade: " + apoios + " pessoa(s).");
        }

        pontuacao = Math.min(100, pontuacao);
        NivelUrgencia urgencia = pontuacao >= 80 ? NivelUrgencia.CRITICA
                : pontuacao >= 60 ? NivelUrgencia.ALTA
                : pontuacao >= 35 ? NivelUrgencia.MEDIA
                : NivelUrgencia.BAIXA;

        String comoResolver = gerarPlanoComoResolver(categoriaSegura, urgencia, textoCompleto);

        return new Resultado(urgencia, pontuacao, List.copyOf(fatores), recomendacao(urgencia), comoResolver);
    }

    private String gerarPlanoComoResolver(CategoriaOcorrencia categoria, NivelUrgencia urgencia, String textoCompleto) {
        StringBuilder plano = new StringBuilder();

        if (urgencia == NivelUrgencia.CRITICA || urgencia == NivelUrgencia.ALTA) {
            plano.append("1. [Ação Imediata] Enviar equipe de fiscalização/triagem com urgência para sinalizar e isolar a área em até 2 horas. ");
        } else {
            plano.append("1. [Triagem] Agendar vistoria técnica da equipe responsável no local para mapear a extensão do problema. ");
        }

        plano.append("2. [Intervenção Técnica] ");
        switch (categoria) {
            case BURACO_VIA -> plano.append("Realizar nivelamento de sub-base, aplicação de emulsão asfáltica e recapeamento com CBUQ (asfalto a quente). ");
            case POSTE_CAIDO -> plano.append("Isolar a rede elétrica com suporte da concessionária, reerguer/trocar o poste e esticar os cabos com segurança. ");
            case ILUMINACAO_INSUFICIENTE -> plano.append("Verificar o circuito elétrico da rua, substituir reatores e instalar novas luminárias LED de alta eficiência. ");
            case LIXO_IRREGULAR -> plano.append("Despachar caçamba e retroescavadeira para recolhimento dos detritos, higienizar o local e afixar sinalização informativa. ");
            case QUEIMADA -> plano.append("Mobilizar Defesa Civil / Bombeiros para contenção do fogo, resfriamento do solo e monitoramento de novos focos. ");
            case OUTRO -> plano.append("Executar reparo estrutural adequado conforme diagnóstico da vistoria técnica. ");
        }

        if (textoCompleto.contains("moto") || textoCompleto.contains("bicicleta")) {
            plano.append("3. [Requisito dos Moradores] Colocar sinalização solo preventiva focada em ciclistas e motociclistas citados nos comentários. ");
        } else if (textoCompleto.contains("idoso") || textoCompleto.contains("acessibilidade") || textoCompleto.contains("calcada") || textoCompleto.contains("pedestres")) {
            plano.append("3. [Requisito dos Moradores] Nivelar o piso e garantir passagem segura para pedestres e idosos indicados nos comentários. ");
        } else if (textoCompleto.contains("noite") || textoCompleto.contains("escuro")) {
            plano.append("3. [Requisito dos Moradores] Realizar testes de validação no período noturno para confirmar a visibilidade e segurança. ");
        } else {
            plano.append("3. [Validação] Verificar a satisfação dos cidadãos locais após a execução do serviço. ");
        }

        plano.append("4. [Conclusão e Retorno] Registrar fotos da melhoria efetuada, alterar o status da ocorrência para RESOLVIDO e notificar a população interessada.");

        return plano.toString();
    }

    private boolean contemAlgum(String texto, String... termos) {
        for (String termo : termos) {
            if (texto.contains(termo)) {
                return true;
            }
        }
        return false;
    }

    private String normalizar(String texto) {
        return Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT);
    }

    private String rotulo(CategoriaOcorrencia categoria) {
        return switch (categoria) {
            case BURACO_VIA -> "buraco na via";
            case POSTE_CAIDO -> "poste caído";
            case ILUMINACAO_INSUFICIENTE -> "iluminação insuficiente";
            case QUEIMADA -> "queimada";
            case LIXO_IRREGULAR -> "lixo irregular";
            case OUTRO -> "outro problema";
        };
    }

    private String recomendacao(NivelUrgencia urgencia) {
        return switch (urgencia) {
            case CRITICA -> "Acionar a equipe responsável imediatamente e confirmar o risco no local.";
            case ALTA -> "Priorizar a triagem e programar atendimento com urgência.";
            case MEDIA -> "Encaminhar para avaliação e acompanhamento pela equipe responsável.";
            case BAIXA -> "Manter na fila regular de atendimento.";
        };
    }

    public record Resultado(NivelUrgencia urgencia, int pontuacao, List<String> fatores, String recomendacao, String comoResolver) {
    }
}