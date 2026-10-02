package com.example.conecta.Repository;

import com.example.conecta.Model.AcompanhamentoOcorrenciaModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AcompanhamentoOcorrenciaRepository extends JpaRepository<AcompanhamentoOcorrenciaModel, Long> {

    boolean existsByOcorrenciaIdAndUsuarioId(Long ocorrenciaId, Long usuarioId);

    List<AcompanhamentoOcorrenciaModel> findByUsuarioId(Long usuarioId);

    List<AcompanhamentoOcorrenciaModel> findByOcorrenciaId(Long ocorrenciaId);

    void deleteByOcorrenciaIdAndUsuarioId(Long ocorrenciaId, Long usuarioId);
}