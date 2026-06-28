package org.example.backend.service;

import org.example.backend.dto.AuthResponse;
import org.example.backend.dto.UserDto;
import org.example.backend.exception.BusinessRuleException;
import org.example.backend.model.User;
import org.example.backend.model.UserPrincipal;
import org.example.backend.repository.UserRepository;
import org.example.backend.security.JwtUtils;
import org.example.backend.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

class AuthServiceImplTest {

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private JwtUtils jwtUtils;
    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        passwordEncoder = Mockito.mock(PasswordEncoder.class);
        jwtUtils = Mockito.mock(JwtUtils.class);
        authService = new AuthServiceImpl(userRepository, passwordEncoder, jwtUtils);
    }

    @Test
    void registerWithValidDataSuccess() {
        String username = "testuser";
        String email = "testuser@mail.com";
        String password = "safepassword";
        String fakeToken = "fake-jwt-token";

        // Create fake object
        UserDto userDto = new UserDto(null, username, email, password);

        when(userRepository.existsByUsername(username)).thenReturn(false);
        when(passwordEncoder.encode(password)).thenReturn("hashedPassword");

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setUsername(username);
        savedUser.setEmail(email);
        savedUser.setPassword("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtUtils.generateToken(eq(new UserPrincipal(1L, "testuser")))).thenReturn(fakeToken);

        AuthResponse response = authService.register(userDto);
        Mockito.verify(passwordEncoder).encode(password);  
        Mockito.verify(userRepository).save(argThat(u -> "hashedPassword".equals(u.getPassword())));

        assertThat(response.getUsername()).isEqualTo(username);
        assertThat(response.getEmail()).isEqualTo(email);
        assertThat(response.getToken()).isEqualTo("fake-jwt-token");
    }

    @Test
    void registerWithExistingUsernameThrowsException() {
        String username = "testuser";
        String email = "testuser@mail.com";
        String password = "safepassword";
        
        UserDto userDto = new UserDto(null, username, email, password);
        
        when(userRepository.existsByUsername(username)).thenReturn(true);
        
        assertThatThrownBy(() -> authService.register(userDto))
            .isInstanceOf(BusinessRuleException.class)
            .hasMessage("Username already exists");
    }

    @Test
    void registerWithInvalidEmailThrowsException() {
        String username = "testuser";
        String email = "not_a_mail";
        String password = "safepassword";

        UserDto userDto = new UserDto(null, username, email, password);
        
        when(userRepository.existsByUsername(username)).thenReturn(false);
        
        assertThatThrownBy(() -> authService.register(userDto))
            .isInstanceOf(BusinessRuleException.class)
            .hasMessage("Invalid email address");
    }

    @Test
    void registerWithNullEmailThrowsException() {
        String username = "testuser";
        String email = null;
        String password = "safepassword";

        UserDto userDto = new UserDto(null, username, email, password);
        
        when(userRepository.existsByUsername(username)).thenReturn(false);
        
        assertThatThrownBy(() -> authService.register(userDto))
            .isInstanceOf(BusinessRuleException.class)
            .hasMessage("Invalid email address");
    }

    @Test
    void loginWithCorrectCredentialsReturnsToken() {
        String username = "testuser";
        String password = "safepassword";
        String hashedPassword = "hashedPassword";
        String email = "testuser@mail.com";
        String fakeToken = "fake-jwt-token";

        User user = new User();
        user.setId(1L);
        user.setUsername(username);
        user.setPassword(hashedPassword);
        user.setEmail(email);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(password, hashedPassword)).thenReturn(true);
        when(jwtUtils.generateToken(eq(new UserPrincipal(1L, username)))).thenReturn(fakeToken);

        Optional<AuthResponse> response = authService.login(username, password);

        assertThat(response)
        .isPresent().get()
        .satisfies(r -> {
            assertThat(r.getToken()).isEqualTo(fakeToken);
            assertThat(r.getUsername()).isEqualTo(username);
        });
    }

    @Test
    void loginWithWrongPasswordReturnsEmpty() {
        String username = "testuser";
        String wrongPassword = "wrongpassword";
        String hashedPassword = "hashedPassword";

        User user = new User();
        user.setId(1L);
        user.setUsername(username);
        user.setPassword(hashedPassword);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(wrongPassword, hashedPassword)).thenReturn(false);

        Optional<AuthResponse> response = authService.login(username, wrongPassword);

        assertThat(response).isEmpty();
    }

    @Test
    void loginWithNonExistentUsernameReturnsEmpty() {
        String username = "nobody";
        String password = "Password1";

        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());

        Optional<AuthResponse> response = authService.login(username, password);

        assertThat(response).isEmpty();
    }
}