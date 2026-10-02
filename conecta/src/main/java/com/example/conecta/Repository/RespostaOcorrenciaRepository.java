package com.example.conecta.Repository;

import com.example.conecta.Model.RespostaOcorrenciaModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RespostaOcorrenciaRepository extends JpaRepository<RespostaOcorrenciaModel, Long> {

    List<RespostaOcorrenciaModel> findByOcorrenciaIdOrderByCriadaEmAsc(Long ocorrenciaId);
}