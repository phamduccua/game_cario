package com.example.game_tien_tri.filters;

import com.example.game_tien_tri.entity.UserEntity;
import com.example.game_tien_tri.utils.JwtTokenUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.util.Pair;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtTokenFilter extends OncePerRequestFilter {
    private final UserDetailsService userDetailsService;
    private final JwtTokenUtils jwtTokenUtils;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        try {
            String path = request.getServletPath();
            String method = request.getMethod();
            System.out.println("Incoming request: " + method + " " + path);
            System.out.println("Current Authentication: " + SecurityContextHolder.getContext().getAuthentication());

            if (isPassToken(request)) {
                System.out.println("Bypass token for path: " + path);
                filterChain.doFilter(request, response);
                return;
            }

            // Lấy token từ cookie
            Cookie[] cookies = request.getCookies();
            if (cookies == null) {
                System.out.println("No cookies found!");
            } else {
                Arrays.stream(cookies).forEach(c -> System.out.println("Cookie: " + c.getName() + "=" + c.getValue()));
            }

            String token = null;
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if (cookie.getName().equals("token")) {
                        token = cookie.getValue();
                        break;
                    }
                }
            }

            if (token == null) {
                System.out.println("Token is missing!");
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token is missing");
                return;
            }

            System.out.println("Extracted token: " + token);

            final String username = jwtTokenUtils.extractUsername(token);
            System.out.println("Username from token: " + username);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserEntity userEntity = (UserEntity) userDetailsService.loadUserByUsername(username);
                System.out.println("Loaded user: " + userEntity.getUsername() + ", roles: " + userEntity.getRole());

                if (jwtTokenUtils.validateToken(token, userEntity)) {
                    System.out.println("Token valid for user: " + userEntity.getUsername());
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userEntity, null, userEntity.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    System.out.println("Invalid token!");
                    response.sendError(HttpServletResponse.SC_FORBIDDEN, "Invalid token");
                    return;
                }
            }

            Authentication authAfter = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("Authentication after filter: " + authAfter);

            filterChain.doFilter(request, response);
        } catch (Exception e) {
            System.out.println("Exception in JwtTokenFilter:");
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_FORBIDDEN, e.getMessage());
        }
    }

    private boolean isPassToken(@NonNull HttpServletRequest request) {
        final List<Pair<String, String>> byPassToken = Arrays.asList(
                Pair.of("/login", "POST"),
                Pair.of("/register", "POST")
        );
        String path = request.getServletPath();
        String method = request.getMethod();

        return byPassToken.stream()
                .anyMatch(bypass ->
                        path.equals(bypass.getFirst())
                                && method.equalsIgnoreCase(bypass.getSecond()));
    }
}
