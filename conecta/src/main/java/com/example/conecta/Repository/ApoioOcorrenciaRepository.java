package com.example.conecta.Repository;

import com.example.conecta.Model.ApoioOcorrenciaModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApoioOcorrenciaRepository extends JpaRepository<ApoioOcorrenciaModel, Long> {

    boolean existsByOcorrenciaIdAndUsuarioId(Long ocorrenciaId, Long usuarioId);

    long countByOcorrenciaId(Long ocorrenciaId);

    void deleteByOcorrenciaIdAndUsuarioId(Long ocorrenciaId, Long usuarioId);
}