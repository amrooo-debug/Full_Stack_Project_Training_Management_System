package com.example.trainingmanagementsystem.service

import com.example.trainingmanagementsystem.entity.UserEntity
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.nio.charset.StandardCharsets
import java.util.Date
import javax.crypto.SecretKey

@Service
class JwtService(
    @Value("\${app.jwt.secret}")
    private val jwtSecret: String,

    @Value("\${app.jwt.expiration-ms}")
    private val jwtExpirationMs: Long
) {

    fun generateToken(userEntity: UserEntity): String {
        val now = Date()
        val expiryDate = Date(now.time + jwtExpirationMs)

        return Jwts.builder()
            .subject(userEntity.email)
            .claim("userId", userEntity.id)
            .claim("role", userEntity.role.name)
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(getSigningKey())
            .compact()
    }

    fun extractEmail(token: String): String =
        Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .payload
            .subject

    fun isTokenValid(token: String, email: String): Boolean =
        extractEmail(token) == email

    private fun getSigningKey(): SecretKey =
        Keys.hmacShaKeyFor(jwtSecret.toByteArray(StandardCharsets.UTF_8))
}