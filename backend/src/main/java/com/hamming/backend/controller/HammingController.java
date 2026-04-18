package com.hamming.backend.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/hamming")
@CrossOrigin(origins = "http://localhost:5173") // ¡EL PATOVICA! Deja pasar a tu React
public class HammingController {

    // Este es el endpoint que va a recibir tu archivo y la opción del menú
    @PostMapping("/procesar")
    public ResponseEntity<String> procesarArchivo(
            @RequestParam("file") MultipartFile archivo,
            @RequestParam("accion") String accion) {

        try {
            // 1. Leemos el nombre del archivo y la acción para ver si llegó bien
            System.out.println("Llegó el archivo: " + archivo.getOriginalFilename());
            System.out.println("Acción solicitada: " + accion);

            // Acá más adelante llamaremos al Service para hacer la matemática...

            // 2. Le devolvemos un mensaje de éxito a React (por ahora en texto simple)
            return ResponseEntity.ok("¡El backend recibió tu archivo perfectamente!");

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al procesar");
        }
    }
}