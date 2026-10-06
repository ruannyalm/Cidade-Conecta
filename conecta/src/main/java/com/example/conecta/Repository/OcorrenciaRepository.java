package com.example.conecta.Repository;

import com.example.conecta.Model.OcorrenciaModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OcorrenciaRepository extends JpaRepository<OcorrenciaModel, Long> {

    List<OcorrenciaModel> findAllByOrderByCriadaEmDesc();

    List<OcorrenciaModel> findByLatitudeBetweenAndLongitudeBetweenOrderByCriadaEmDesc(
            double latitudeMin, double latitudeMax, double longitudeMin, double longitudeMax);

    List<OcorrenciaModel> findByBairroContainingIgnoreCaseOrderByCriadaEmDesc(String bairro);

    List<OcorrenciaModel> findByAutorIdOrderByCriadaEmDesc(Long autorId);

    boolean existsByTituloAndEndereco(String titulo, String endereco);
}