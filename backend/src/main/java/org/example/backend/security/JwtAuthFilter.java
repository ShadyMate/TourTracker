package org.example.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.backend.model.UserPrincipal;
import org.example.backend.service.TokenBlacklistService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private static final Logger LOG = LoggerFactory.getLogger(JwtAuthFilter.class);
    private final JwtUtils jwtUtils;
    private final TokenBlacklistService tokenBlacklistService;

    public JwtAuthFilter(JwtUtils jwtUtils, TokenBlacklistService tokenBlacklistService) {
        this.jwtUtils = jwtUtils;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String token = extractBearerToken(request);

        if (StringUtils.hasText(token) && jwtUtils.validateToken(token)) {
            String jti = jwtUtils.getJtiFromToken(token);
            if (tokenBlacklistService.isBlacklisted(jti)) {
                LOG.warn("Rejected blacklisted token: jti={}", jti);
                chain.doFilter(request, response);
                return;
            }
            UserPrincipal principal = jwtUtils.getPrincipalFromToken(token);
            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    principal, null, Collections.emptyList());
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);
            LOG.debug("Authenticated request for user: {}", principal.username());
        }

        chain.doFilter(request, response);
    }

    private String extractBearerToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
