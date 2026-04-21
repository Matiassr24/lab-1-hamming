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
        String filename = archivo.getOriginalFilename() != null ? archivo.getOriginalFilename().toUpperCase() : "";

        // Determinar tamaño de bloque en base a la extensión si es una acción sobre un archivo ya modificado
        int mPowerForFile = 3; // Por defecto HA1 (8 bits)
        if (filename.endsWith(".HA2") || filename.endsWith(".HE2") || filename.endsWith(".DE2") || filename.endsWith(".DC2")) {
            mPowerForFile = 10;
        } else if (filename.endsWith(".HA3") || filename.endsWith(".HE3") || filename.endsWith(".DE3") || filename.endsWith(".DC3")) {
            mPowerForFile = 14;
        }

        switch (accion) {
            case "PROTEGER_8":
                return hammingEngine.proteger(contenido, 3);
            case "PROTEGER_1024":
                return hammingEngine.proteger(contenido, 10);
            case "PROTEGER_16384":
                return hammingEngine.proteger(contenido, 14);

            case "INTRODUCIR_ERROR":
                return hammingEngine.introducirError(contenido, mPowerForFile);

            case "DESPROTEGER_SIN_CORREGIR":
                // Leemos el archivo, verificamos su extensión para saber mPower y NO corregimos
                return hammingEngine.desproteger(contenido, mPowerForFile, false);

            case "DESPROTEGER_CORRIGIENDO":
                // Desprotege y corrige
                return hammingEngine.desproteger(contenido, mPowerForFile, true);
                
            // Mantenemos esta por compatibilidad con el front antiguo temporalmente
            case "DESPROTEGER_8":
                return hammingEngine.desproteger(contenido, 3, true);

            case "ENCRIPTAR":
                // TODO: Encriptar con Día y Hora
                System.out.println("Encriptar aún no implementado");
                return contenido;

            default:
                System.out.println("Acción no reconocida: " + accion);
                return contenido;
        }
    }
}