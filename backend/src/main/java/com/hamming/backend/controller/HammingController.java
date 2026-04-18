package com.hamming.backend.controller;

import com.hamming.backend.service.HammingService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/hamming")
@CrossOrigin(origins = "http://localhost:5173") // El puerto de tu React
public class HammingController {

    private final HammingService hammingService;

    public HammingController(HammingService hammingService) {
        this.hammingService = hammingService;
    }

    @PostMapping("/procesar")
    public ResponseEntity<byte[]> procesarArchivo(
            @RequestParam("file") MultipartFile archivo,
            @RequestParam("accion") String accion) {

        try {
            // Llamamos al service que ahora devuelve un array de bytes
            byte[] resultado = hammingService.ejecutarAccionABytes(archivo, accion);

            // Configuramos la respuesta para que el navegador entienda que es un archivo
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"resultado.HA1\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resultado);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}