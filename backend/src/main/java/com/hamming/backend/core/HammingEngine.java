package com.hamming.backend.core;

import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
public class HammingEngine {

    public byte[] proteger8(byte[] data) {
        List<Integer> bitsOriginales = bytesToBits(data);
        List<Integer> bitsProtegidos = new ArrayList<>();

        // Procesamos de a 4 bits de informacion (m=4)
        for (int i = 0; i < bitsOriginales.size(); i += 4) {
            int d1 = bitsOriginales.get(i);
            int d2 = (i + 1 < bitsOriginales.size()) ? bitsOriginales.get(i + 1) : 0;
            int d3 = (i + 2 < bitsOriginales.size()) ? bitsOriginales.get(i + 2) : 0;
            int d4 = (i + 3 < bitsOriginales.size()) ? bitsOriginales.get(i + 3) : 0;

            // Bits de control de Hamming (r=3)
            int p1 = d1 ^ d2 ^ d4;
            int p2 = d1 ^ d3 ^ d4;
            int p4 = d2 ^ d3 ^ d4;

            // Bit de paridad global (para completar el byte de 8 bits)
            int pGlobal = p1 ^ p2 ^ d1 ^ p4 ^ d2 ^ d3 ^ d4;

            // Armamos el byte en el orden: p1, p2, d1, p4, d2, d3, d4, pGlobal
            bitsProtegidos.add(p1);
            bitsProtegidos.add(p2);
            bitsProtegidos.add(d1);
            bitsProtegidos.add(p4);
            bitsProtegidos.add(d2);
            bitsProtegidos.add(d3);
            bitsProtegidos.add(d4);
            bitsProtegidos.add(pGlobal);
        }

        return bitsToBytes(bitsProtegidos);
    }

    public byte[] desproteger8(byte[] datosProtegidos) {
        List<Integer> bitsRecibidos = bytesToBits(datosProtegidos);
        List<Integer> bitsRecuperados = new ArrayList<>();

        // Procesamos de a 8 bits (que es lo que mide cada bloque protegido)
        for (int i = 0; i < bitsRecibidos.size(); i += 8) {
            // Extraemos los bits del bloque (posiciones 1 a 8)
            int p1 = bitsRecibidos.get(i);
            int p2 = bitsRecibidos.get(i + 1);
            int d1 = bitsRecibidos.get(i + 2);
            int p4 = bitsRecibidos.get(i + 3);
            int d2 = bitsRecibidos.get(i + 4);
            int d3 = bitsRecibidos.get(i + 5);
            int d4 = bitsRecibidos.get(i + 6);
            int pG = bitsRecibidos.get(i + 7);

            // 1. Calculamos el Síndrome (s1, s2, s3)
            // El síndrome nos indica la posición del error en binario
            int s1 = p1 ^ d1 ^ d2 ^ d4;
            int s2 = p2 ^ d1 ^ d3 ^ d4;
            int s3 = p4 ^ d2 ^ d3 ^ d4;

            int posicionError = s1 + (s2 * 2) + (s3 * 4);

            // 2. Corregimos si es necesario (Solo si posicionError != 0)
            // Nota: En un bloque de 8 bits, posicionError nos da un número del 1 al 7
            if (posicionError != 0) {
                System.out.println("¡Error detectado en posición: " + posicionError + "!");
                // Invertimos el bit fallado en la lista temporal para este bloque
                // (Esto es un mapeo simple, en un caso real corregirías el bit específico)
                if (posicionError == 1) p1 ^= 1;
                if (posicionError == 2) p2 ^= 1;
                if (posicionError == 3) d1 ^= 1;
                if (posicionError == 4) p4 ^= 1;
                if (posicionError == 5) d2 ^= 1;
                if (posicionError == 6) d3 ^= 1;
                if (posicionError == 7) d4 ^= 1;
            }

            // 3. Extraemos solo los bits de datos (d1, d2, d3, d4)
            bitsRecuperados.add(d1);
            bitsRecuperados.add(d2);
            bitsRecuperados.add(d3);
            bitsRecuperados.add(d4);
        }

        return bitsToBytes(bitsRecuperados);
    }

    public byte[] introducirError(byte[] datos) {
        if (datos.length == 0) return datos;

        byte[] datosConError = datos.clone();

        // Definimos qué tan probable es que un bloque falle (0.1 = 10% de los bloques)
        // Podés subirlo a 1.0 si querés que TODOS los bytes tengan un error.
        double probabilidadDeError = 0.1;
        int erroresContados = 0;

        for (int i = 0; i < datosConError.length; i++) {
            // Tiramos el dado: si sale menor a la probabilidad, infectamos este byte
            if (Math.random() < probabilidadDeError) {

                // Elegimos un bit al azar (0 a 7) dentro de ESTE byte
                int indiceBit = (int) (Math.random() * 8);

                // Invertimos el bit usando XOR
                datosConError[i] ^= (1 << indiceBit);

                erroresContados++;
            }
        }

        System.out.println("DEBUG: Proceso de ruido terminado.");
        System.out.println("DEBUG: Se infectaron " + erroresContados + " bloques de un total de " + datosConError.length);

        return datosConError;
    }


    private List<Integer> bytesToBits(byte[] bytes) {
        List<Integer> bits = new ArrayList<>();
        for (byte b : bytes) {
            for (int i = 7; i >= 0; i--) {
                bits.add((b >> i) & 1);
            }
        }
        return bits;
    }

    private byte[] bitsToBytes(List<Integer> bits) {
        byte[] bytes = new byte[bits.size() / 8];
        for (int i = 0; i < bits.size(); i++) {
            if (bits.get(i) == 1) {
                bytes[i / 8] |= (1 << (7 - (i % 8)));
            }
        }
        return bytes;
    }
}