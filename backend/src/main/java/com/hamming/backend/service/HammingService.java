package com.hamming.backend.service;

import com.hamming.backend.core.HammingEngine;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@Service
public class HammingService {

    private final HammingEngine hammingEngine;

    public HammingService(HammingEngine hammingEngine) {
        this.hammingEngine = hammingEngine;
    }

    public byte[] ejecutarAccionABytes(MultipartFile archivo, String accion) throws IOException {
        byte[] contenido = archivo.getBytes();

        switch (accion) {
            case "PROTEGER_8":
                return hammingEngine.proteger8(contenido);

            case "INTRODUCIR_ERROR":
                // Esta es la función que agregaste recién para romper un bit al azar
                return hammingEngine.introducirError(contenido);

            case "DESPROTEGER_8":
                // Aquí usamos la lógica del Síndrome para limpiar y corregir
                return hammingEngine.desproteger8(contenido);

            case "PROTEGER_1024":
                // Esto lo dejás preparado para cuando hagamos la lógica de bloques grandes
                return contenido;

            default:
                // Si llega algo que no conocemos, devolvemos el archivo tal cual
                System.out.println("Acción no reconocida: " + accion);
                return contenido;
        }
    }
}