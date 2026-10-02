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
        return analisar(categoria, apoios, null, null).urgencia();
    }

    public Resultado analisar(CategoriaOcorrencia categoria, long apoios, String titulo, String descricao) {
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

        String texto = normalizar((titulo == null ? "" : titulo) + " " + (descricao == null ? "" : descricao));
        if (contemAlgum(texto, "risco de morte", "pessoa ferida", "choque eletrico", "fio energizado",
                "incendio", "chamas", "desabamento", "estrutura prestes a cair", "crianca em risco",
                "sangramento", "atropelamento")) {
            pontuacao = Math.max(pontuacao, 85);
            fatores.add("O texto indica possível risco imediato à vida, incêndio ou rede elétrica.");
        } else if (contemAlgum(texto, "via bloqueada", "alagamento", "enchente", "vazamento de gas",
                "semaforo apagado", "fio solto", "poste caiu", "risco de acidente", "bueiro aberto")) {
            pontuacao = Math.max(pontuacao, 65);
            fatores.add("O texto indica risco à circulação ou à segurança no local.");
        } else if (contemAlgum(texto, "sem iluminacao", "calcada bloqueada", "lixo acumulado",
                "buraco grande", "queda de energia")) {
            pontuacao = Math.max(pontuacao, 35);
            fatores.add("O texto indica impacto relevante no uso do espaço público.");
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
        return new Resultado(urgencia, pontuacao, List.copyOf(fatores), recomendacao(urgencia));
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

    public record Resultado(NivelUrgencia urgencia, int pontuacao, List<String> fatores, String recomendacao) {
    }
}