package com.example.conecta.Service;

import com.example.conecta.Dto.AlterarSenhaRequest;
import com.example.conecta.Dto.AtualizarPerfilRequest;
import com.example.conecta.Dto.LoginResponse;
import com.example.conecta.Dto.PerfilResponse;
import com.example.conecta.Model.UsuarioModel;
import com.example.conecta.Repository.UsuarioRepository;
import com.example.conecta.Security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PerfilService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public PerfilService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public PerfilResponse obterPerfil(String email) {
        UsuarioModel usuario = buscarUsuario(email);
        return new PerfilResponse(usuario.getNome(), usuario.getEmail(), usuario.getRegiao(), usuario.getRole());
    }

    public LoginResponse atualizarPerfil(String emailAtual, AtualizarPerfilRequest request) {
        if (request == null || isBlank(request.getNome()) || isBlank(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome e e-mail são obrigatórios.");
        }

        UsuarioModel usuario = buscarUsuario(emailAtual);
        String novoEmail = request.getEmail().trim();
        if (!novoEmail.equals(usuario.getEmail()) && usuarioRepository.existsByEmail(novoEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este e-mail já está cadastrado.");
        }

        usuario.setNome(request.getNome().trim());
        usuario.setEmail(novoEmail);
        usuario.setRegiao(isBlank(request.getRegiao()) ? null : request.getRegiao().trim());
        usuarioRepository.save(usuario);
        String novoToken = jwtService.gerarToken(usuario.getEmail(), usuario.getRole());
        return new LoginResponse(novoToken, usuario.getNome(), usuario.getEmail(), usuario.getRole());
    }

    public void alterarSenha(String email, AlterarSenhaRequest request) {
        if (request == null || isBlank(request.getSenhaAtual()) || isBlank(request.getNovaSenha())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Senha atual e nova senha são obrigatórias.");
        }

        UsuarioModel usuario = buscarUsuario(email);
        if (!passwordEncoder.matches(request.getSenhaAtual(), usuario.getSenha())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Senha atual inválida.");
        }

        usuario.setSenha(passwordEncoder.encode(request.getNovaSenha()));
        usuarioRepository.save(usuario);
    }

    private UsuarioModel buscarUsuario(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}