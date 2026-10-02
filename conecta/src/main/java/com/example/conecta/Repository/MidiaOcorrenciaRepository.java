package com.example.conecta.Repository;

import com.example.conecta.Model.MidiaOcorrenciaModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MidiaOcorrenciaRepository extends JpaRepository<MidiaOcorrenciaModel, Long> {

    List<MidiaOcorrenciaModel> findByOcorrenciaIdOrderByIdAsc(Long ocorrenciaId);

    Optional<MidiaOcorrenciaModel> findByIdAndOcorrenciaId(Long id, Long ocorrenciaId);
}