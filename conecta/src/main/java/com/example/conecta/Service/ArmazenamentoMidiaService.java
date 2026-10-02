package com.example.conecta.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class ArmazenamentoMidiaService {

    private static final long MAX_IMAGEM_BYTES = 25L * 1024 * 1024;
    private static final long MAX_VIDEO_BYTES = 80L * 1024 * 1024;
    private static final Map<String, String> EXTENSOES = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp",
            "image/gif", ".gif",
            "video/mp4", ".mp4",
            "video/webm", ".webm",
            "video/quicktime", ".mov");

    private final Path diretorio;

    public ArmazenamentoMidiaService(@Value("${cidade-conecta.arquivos.diretorio:uploads}") String diretorio) {
        this.diretorio = Path.of(diretorio).toAbsolutePath().normalize();
    }

    public ArquivoArmazenado armazenar(MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O arquivo está vazio.");
        }

        String tipo = arquivo.getContentType() == null ? "" : arquivo.getContentType().toLowerCase(Locale.ROOT);
        String extensao = EXTENSOES.get(tipo);
        if (extensao == null) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "Envie uma imagem JPEG, PNG, WebP ou GIF, ou um vídeo MP4, WebM ou MOV.");
        }
        long limite = tipo.startsWith("image/") ? MAX_IMAGEM_BYTES : MAX_VIDEO_BYTES;
        if (arquivo.getSize() > limite) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "O arquivo excede o limite permitido.");
        }

        String nomeArmazenado = UUID.randomUUID() + extensao;
        Path destino = diretorio.resolve(nomeArmazenado).normalize();
        if (!destino.startsWith(diretorio)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome de arquivo inválido.");
        }

        try {
            Files.createDirectories(diretorio);
            Files.copy(arquivo.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Não foi possível armazenar a mídia.");
        }

        String nomeOriginal = arquivo.getOriginalFilename();
        if (nomeOriginal != null) {
            nomeOriginal = Path.of(nomeOriginal.replace('\\', '/')).getFileName().toString();
        }
        return new ArquivoArmazenado(nomeArmazenado, nomeOriginal == null ? "arquivo" : nomeOriginal,
                tipo, arquivo.getSize());
    }

    public Resource carregar(String nomeArmazenado) {
        Path caminho = diretorio.resolve(nomeArmazenado).normalize();
        if (!caminho.startsWith(diretorio)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Mídia não encontrada.");
        }
        try {
            Resource resource = new UrlResource(caminho.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Mídia não encontrada.");
            }
            return resource;
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Mídia não encontrada.");
        }
    }

    public void excluir(String nomeArmazenado) {
        try {
            Files.deleteIfExists(diretorio.resolve(nomeArmazenado).normalize());
        } catch (IOException ignored) {
        }
    }

    public record ArquivoArmazenado(String nome, String nomeOriginal, String tipo, long tamanho) {
    }
}