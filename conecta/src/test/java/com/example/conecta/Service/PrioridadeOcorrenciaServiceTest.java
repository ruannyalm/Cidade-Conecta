package com.example.conecta.Service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.example.conecta.Model.CategoriaOcorrencia;
import com.example.conecta.Model.NivelUrgencia;
import org.junit.jupiter.api.Test;

class PrioridadeOcorrenciaServiceTest {

    private final PrioridadeOcorrenciaService service = new PrioridadeOcorrenciaService();

    @Test
    void criticalLanguageRaisesOtherCategoryToCritical() {
        PrioridadeOcorrenciaService.Resultado resultado = service.analisar(
                CategoriaOcorrencia.OUTRO, 0, "Fio energizado", "Há risco de choque elétrico na calçada.");

        assertEquals(NivelUrgencia.CRITICA, resultado.urgencia());
        assertTrue(resultado.pontuacao() >= 80);
        assertTrue(resultado.fatores().stream().anyMatch(fator -> fator.contains("risco imediato")));
    }

    @Test
    void normalizesAccentsWhenMatchingRiskTerms() {
        PrioridadeOcorrenciaService.Resultado resultado = service.analisar(
                CategoriaOcorrencia.OUTRO, 0, "Semáforo apagado", "O cruzamento está sem iluminação.");

        assertEquals(NivelUrgencia.ALTA, resultado.urgencia());
    }

    @Test
    void communitySupportIncreasesRiskScore() {
        PrioridadeOcorrenciaService.Resultado withoutSupport = service.analisar(
                CategoriaOcorrencia.BURACO_VIA, 0, "Buraco", "Buraco na rua.");
        PrioridadeOcorrenciaService.Resultado withSupport = service.analisar(
                CategoriaOcorrencia.BURACO_VIA, 50, "Buraco", "Buraco na rua.");

        assertTrue(withSupport.pontuacao() > withoutSupport.pontuacao());
        assertEquals(NivelUrgencia.ALTA, withSupport.urgencia());
    }

    @Test
    void ordinaryReportsRemainLowAndHaveRecommendation() {
        PrioridadeOcorrenciaService.Resultado resultado = service.analisar(
                CategoriaOcorrencia.LIXO_IRREGULAR, 0, "Coleta atrasada", "O lixo não foi recolhido na rua.");

        assertEquals(NivelUrgencia.BAIXA, resultado.urgencia());
        assertEquals("Manter na fila regular de atendimento.", resultado.recomendacao());
    }
}