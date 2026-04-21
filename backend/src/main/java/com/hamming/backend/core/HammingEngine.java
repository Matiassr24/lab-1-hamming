package com.hamming.backend.core;

import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
public class HammingEngine {

    public byte[] proteger(byte[] data, int mPower) {
        int n = 1 << mPower; // Tamaño del bloque total (ej: 8, 1024, 16384)
        int q = mPower; // Bits de paridad de Hamming
        int k = n - q - 1; // Bits de datos puros

        List<Integer> bitsOriginales = bytesToBits(data);
        List<Integer> bitsProtegidos = new ArrayList<>();

        for (int i = 0; i < bitsOriginales.size(); i += k) {
            int[] block = new int[n + 1]; // Índices del 1 al n
            
            // Asignar los bits de datos en posiciones que NO son potencias de 2
            int dataIndex = 0;
            for (int j = 1; j < n; j++) {
                if (!isPowerOfTwo(j)) {
                    if (i + dataIndex < bitsOriginales.size()) {
                        block[j] = bitsOriginales.get(i + dataIndex);
                    } else {
                        block[j] = 0; // Padding con ceros si faltan datos
                    }
                    dataIndex++;
                }
            }
            
            // Calcular paridades de Hamming
            for (int p = 0; p < q; p++) {
                int posParidad = 1 << p;
                int paridad = 0;
                for (int j = 1; j < n; j++) {
                    if ((j & posParidad) != 0 && j != posParidad) {
                        paridad ^= block[j];
                    }
                }
                block[posParidad] = paridad;
            }
            
            // Calcular bit de paridad global al final
            int pGlobal = 0;
            for (int j = 1; j < n; j++) {
                pGlobal ^= block[j];
            }
            block[n] = pGlobal;
            
            // Añadir al array final
            for (int j = 1; j <= n; j++) {
                bitsProtegidos.add(block[j]);
            }
        }
        return bitsToBytes(bitsProtegidos);
    }

    public byte[] desproteger(byte[] datosProtegidos, int mPower, boolean corregir) {
        int n = 1 << mPower;
        int q = mPower;

        List<Integer> bitsRecibidos = bytesToBits(datosProtegidos);
        List<Integer> bitsRecuperados = new ArrayList<>();

        for (int i = 0; i < bitsRecibidos.size(); i += n) {
            if (i + n > bitsRecibidos.size()) break; // Ignorar bloque incompleto al final si lo hubiera
            
            int[] block = new int[n + 1];
            for (int j = 1; j <= n; j++) {
                block[j] = bitsRecibidos.get(i + j - 1);
            }
            
            // Calcular síndrome
            int syndrome = 0;
            for (int p = 0; p < q; p++) {
                int posParidad = 1 << p;
                int paridad = 0;
                for (int j = 1; j < n; j++) {
                    if ((j & posParidad) != 0) {
                        paridad ^= block[j];
                    }
                }
                if (paridad != 0) {
                    syndrome += posParidad;
                }
            }
            
            // Si el síndrome es distinto de 0 y pedimos corregir
            if (syndrome != 0) {
                System.out.println("¡Error detectado en posición " + syndrome + " en modo corregir=" + corregir + "!");
                if (corregir && syndrome < n) {
                    block[syndrome] ^= 1; // Invertimos bit para corregir
                }
            }
            
            // Extraer bits de datos
            for (int j = 1; j < n; j++) {
                if (!isPowerOfTwo(j)) {
                    bitsRecuperados.add(block[j]);
                }
            }
        }
        
        // Removemos los bytes nulos al final (padding extra)
        byte[] rawBytes = bitsToBytes(bitsRecuperados);
        int validLength = rawBytes.length;
        while (validLength > 0 && rawBytes[validLength - 1] == 0) {
            validLength--;
        }
        byte[] trimmedBytes = new byte[validLength];
        System.arraycopy(rawBytes, 0, trimmedBytes, 0, validLength);
        
        return trimmedBytes;
    }

    public byte[] introducirError(byte[] datosProtegidos, int mPower) {
        if (datosProtegidos.length == 0) return datosProtegidos;

        int n = 1 << mPower;
        List<Integer> bits = bytesToBits(datosProtegidos);
        int erroresContados = 0;
        double probabilidadPorModulo = 0.3; // 30% de probabilidad de que un módulo falle

        // Iterar por bloques/módulos
        for (int i = 0; i < bits.size(); i += n) {
            if (i + n > bits.size()) break;
            
            if (Math.random() < probabilidadPorModulo) {
                // Generar error en una posición aleatoria (1 a n)
                int posError = (int) (Math.random() * n);
                int listIndex = i + posError;
                
                // Invertir bit
                bits.set(listIndex, bits.get(listIndex) ^ 1);
                erroresContados++;
            }
        }
        
        System.out.println("DEBUG: Se introdujeron " + erroresContados + " errores en módulos de " + n + " bits.");
        return bitsToBytes(bits);
    }

    private boolean isPowerOfTwo(int n) {
        return (n > 0) && ((n & (n - 1)) == 0);
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
        int size = (bits.size() + 7) / 8;
        byte[] bytes = new byte[size];
        for (int i = 0; i < bits.size(); i++) {
            if (bits.get(i) == 1) {
                bytes[i / 8] |= (1 << (7 - (i % 8)));
            }
        }
        return bytes;
    }
}