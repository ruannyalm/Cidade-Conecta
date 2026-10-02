package com.example.conecta.Controller;

import com.example.conecta.Dto.CriarOcorrenciaRequest;
import com.example.conecta.Dto.OcorrenciaResponse;
import com.example.conecta.Service.OcorrenciaService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/ocorrencias")
public class OcorrenciaController {

    private final OcorrenciaService ocorrenciaService;

    public OcorrenciaController(OcorrenciaService ocorrenciaService) {
        this.ocorrenciaService = ocorrenciaService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<OcorrenciaResponse> criar(Authentication authentication,
            @RequestPart("dados") CriarOcorrenciaRequest request,
            @RequestPart(value = "midias", required = false) List<MultipartFile> midias) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ocorrenciaService.criar(authentication.getName(), request, midias));
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

    @GetMapping("/minhas")
    public List<OcorrenciaResponse> minhas(Authentication authentication) {
        return ocorrenciaService.minhas(authentication.getName());
    }

    @GetMapping("/seguidas")
    public List<OcorrenciaResponse> acompanhadas(Authentication authentication) {
        return ocorrenciaService.acompanhadas(authentication.getName());
    }

    @GetMapping("/{id}")
    public OcorrenciaResponse obter(Authentication authentication, @PathVariable Long id) {
        return ocorrenciaService.obter(authentication.getName(), id);
    }

    @PostMapping("/{id}/apoio")
    public ResponseEntity<Void> apoiar(Authentication authentication, @PathVariable Long id) {
        ocorrenciaService.apoiar(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/apoio")
    public ResponseEntity<Void> removerApoio(Authentication authentication, @PathVariable Long id) {
        ocorrenciaService.removerApoio(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/acompanhamento")
    public ResponseEntity<Void> acompanhar(Authentication authentication, @PathVariable Long id) {
        ocorrenciaService.acompanhar(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/acompanhamento")
    public ResponseEntity<Void> deixarDeAcompanhar(Authentication authentication, @PathVariable Long id) {
        ocorrenciaService.deixarDeAcompanhar(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/midias/{midiaId}")
    public ResponseEntity<Resource> obterMidia(@PathVariable Long id, @PathVariable Long midiaId,
            HttpServletRequest request) {
        OcorrenciaService.MidiaArquivo midia = ocorrenciaService.obterMidia(id, midiaId);
        MediaType tipo = MediaType.parseMediaType(midia.tipoConteudo());
        String disposition = ContentDisposition.inline().filename(midia.nomeOriginal()).build().toString();
        return ResponseEntity.ok()
                .contentType(tipo)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                .body(midia.resource());
    }
}