package com.example.conecta.Repository;

import com.example.conecta.Model.TokenRevogadoModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;

public interface TokenRevogadoRepository extends JpaRepository<TokenRevogadoModel, String> {

    long deleteByExpiraEmBefore(Instant instante);
}