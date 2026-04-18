package service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service // Esta etiqueta le avisa a Spring Boot que esta clase es nuestro Jefe de Cocina
public class HammingService {

    public String ejecutarAccion(MultipartFile archivo, String accion) {

        // 1. Podríamos validar si el archivo pesa 0 bytes, etc.
        if (archivo.isEmpty()) {
            return "Error: El archivo está vacío.";
        }

        // 2. Organizamos el tráfico según el botón que tocaste en React
        switch (accion) {
            case "PROTEGER_8":
                // Más adelante, acá llamaremos a las fórmulas del paquete 'core'
                return "¡El servicio recibió " + archivo.getOriginalFilename() + " y está listo para proteger en bloques de 8 bits!";

            case "PROTEGER_1024":
                return "Preparando protección de 1024 bits...";

            case "INTRODUCIR_ERROR":
                return "Simulando ruido en la transmisión...";

            default:
                return "Acción no reconocida.";
        }
    }
}