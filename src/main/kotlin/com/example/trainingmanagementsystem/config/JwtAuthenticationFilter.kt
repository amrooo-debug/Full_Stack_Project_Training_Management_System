package com.example.trainingmanagementsystem.config

import com.example.trainingmanagementsystem.repository.UserRepository
import com.example.trainingmanagementsystem.service.JwtService
import io.jsonwebtoken.JwtException
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpHeaders
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthenticationFilter(
    private val jwtService: JwtService,
    private val userRepository: UserRepository
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val authorizationHeader = request.getHeader(HttpHeaders.AUTHORIZATION)

        if (authorizationHeader.isNullOrBlank() || !authorizationHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response)
            return
        }

        val token = authorizationHeader.substringAfter("Bearer ").trim()

        try {
            val email = jwtService.extractEmail(token)

            if (SecurityContextHolder.getContext().authentication == null) {
                val userEntity = userRepository.findByEmail(email)

                if (userEntity != null && jwtService.isTokenValid(token, userEntity.email)) {
                    val authorities = listOf(
                        SimpleGrantedAuthority("ROLE_${userEntity.role.name}")
                    )

                    val authenticationToken = UsernamePasswordAuthenticationToken(
                        userEntity.email,
                        null,
                        authorities
                    )

                    authenticationToken.details = WebAuthenticationDetailsSource().buildDetails(request)
                    SecurityContextHolder.getContext().authentication = authenticationToken
                }
            }
        } catch (jwtException: JwtException) {
            SecurityContextHolder.clearContext()
        } catch (illegalArgumentException: IllegalArgumentException) {
            SecurityContextHolder.clearContext()
        }

        filterChain.doFilter(request, response)
    }
}