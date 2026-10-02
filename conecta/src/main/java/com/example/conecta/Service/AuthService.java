package com.example.conecta.Service;

import com.example.conecta.Dto.CadastroRequest;
import com.example.conecta.Dto.LoginRequest;
import com.example.conecta.Dto.LoginResponse;
import com.example.conecta.Model.Role;
import com.example.conecta.Model.UsuarioModel;
import com.example.conecta.Repository.UsuarioRepository;
import com.example.conecta.Security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private static final String CREDENCIAIS_INVALIDAS = "E-mail ou senha inválidos.";

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public void cadastrar(CadastroRequest request) {
        if (request == null || isBlank(request.getNome()) || isBlank(request.getEmail()) || isBlank(request.getSenha())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome, e-mail e senha são obrigatórios.");
        }
        String email = request.getEmail().trim();
        if (usuarioRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este e-mail já está cadastrado.");
        }

        UsuarioModel usuario = new UsuarioModel();
        usuario.setNome(request.getNome().trim());
        usuario.setEmail(email);
        usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        usuario.setRole(Role.CIDADAO);
        usuarioRepository.save(usuario);
    }

    public LoginResponse login(LoginRequest request) {
        if (request == null || isBlank(request.getEmail()) || request.getSenha() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, CREDENCIAIS_INVALIDAS);
        }

        UsuarioModel usuario = usuarioRepository.findByEmail(request.getEmail().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, CREDENCIAIS_INVALIDAS));
        if (!passwordEncoder.matches(request.getSenha(), usuario.getSenha())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, CREDENCIAIS_INVALIDAS);
        }

        return new LoginResponse(jwtService.gerarToken(usuario.getEmail(), usuario.getRole()), usuario.getNome(), usuario.getEmail(), usuario.getRole());
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}