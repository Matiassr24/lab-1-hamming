package com.hamming.backend.controller;

import com.hamming.backend.service.HammingService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/hamming")
@CrossOrigin(origins = "http://localhost:5173")
public class HammingController {

    // Así es como vinculamos el Mozo con el Jefe de Cocina
    private final HammingService hammingService;

    public HammingController(HammingService hammingService) {
        this.hammingService = hammingService;
    }

    @PostMapping("/procesar")
    public ResponseEntity<String> procesarArchivo(
            @RequestParam("file") MultipartFile archivo,
            @RequestParam("accion") String accion) {

        try {
            // El mozo le delega todo el trabajo de decisión al servicio
            String respuestaDelServicio = hammingService.ejecutarAccion(archivo, accion);

            // Le mandamos a React exactamente lo que respondió el servicio
            return ResponseEntity.ok(respuestaDelServicio);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno al procesar el archivo");
        }
    }
}