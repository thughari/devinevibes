package com.devinevibes.auth.service;

import com.devinevibes.common.exception.ApiException;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GoogleTokenVerifierService {

    @Value("${app.google.client-id}")
    private String googleClientId;

    public GoogleProfile verify(String idToken) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId)).build();
            GoogleIdToken token = verifier.verify(idToken);
            if (token == null) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid Google ID token");
            }
            var payload = token.getPayload();
            return new GoogleProfile(payload.getSubject(), payload.getEmail(), (String) payload.get("name"),
                    (String) payload.get("picture"));
        } catch (GeneralSecurityException | IOException ex) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Google token verification failed");
        }
    }

    public record GoogleProfile(String googleId, String email, String name, String pictureUrl) {}
}
