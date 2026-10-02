package com.example.conecta.Repository;

import com.example.conecta.Model.NotificacaoModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificacaoRepository extends JpaRepository<NotificacaoModel, Long> {

    List<NotificacaoModel> findByUsuarioIdOrderByCriadaEmDesc(Long usuarioId);

    Optional<NotificacaoModel> findByIdAndUsuarioId(Long id, Long usuarioId);
}