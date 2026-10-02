package com.example.conecta.Controller;

import com.example.conecta.Dto.AtualizarAndamentoRequest;
import com.example.conecta.Dto.AnaliseUrgenciaResponse;
import com.example.conecta.Dto.OcorrenciaResponse;
import com.example.conecta.Service.OcorrenciaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/prefeitura/ocorrencias")
@PreAuthorize("hasRole('PREFEITURA')")
public class PrefeituraOcorrenciaController {

    private final OcorrenciaService ocorrenciaService;

    public PrefeituraOcorrenciaController(OcorrenciaService ocorrenciaService) {
        this.ocorrenciaService = ocorrenciaService;
    }

    @GetMapping
    public List<OcorrenciaResponse> listar(Authentication authentication,
            @RequestParam(required = false) Double latitudeMin,
            @RequestParam(required = false) Double latitudeMax,
            @RequestParam(required = false) Double longitudeMin,
            @RequestParam(required = false) Double longitudeMax,
            @RequestParam(required = false) String bairro) {
        return ocorrenciaService.listar(authentication.getName(), latitudeMin, latitudeMax,
                longitudeMin, longitudeMax, bairro);
    }

    @PatchMapping("/{id}/andamento")
    public ResponseEntity<Void> atualizarAndamento(Authentication authentication, @PathVariable Long id,
            @RequestBody AtualizarAndamentoRequest request) {
        ocorrenciaService.atualizarAndamento(authentication.getName(), id, request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/analisar-urgencia")
    public AnaliseUrgenciaResponse analisarUrgencia(Authentication authentication, @PathVariable Long id) {
        return ocorrenciaService.analisarUrgencia(authentication.getName(), id);
    }
}