package com.hamming.backend.core;

import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
public class HammingEngine {

    public byte[] proteger(byte[] data, int mPower) {
        FileHeader header = new FileHeader(mPower, data.length);
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
        byte[] protectedData = bitsToBytes(bitsProtegidos);
        
        // Unir Header + Datos Protegidos
        byte[] headerBytes = header.toBytes();
        byte[] result = new byte[headerBytes.length + protectedData.length];
        System.arraycopy(headerBytes, 0, result, 0, headerBytes.length);
        System.arraycopy(protectedData, 0, result, headerBytes.length, protectedData.length);
        
        return result;
    }

    public byte[] desproteger(byte[] dataConHeader, int mPowerDefault, boolean corregir) {
        int mPower = mPowerDefault;
        byte[] rawData;
        int originalSize = -1;

        // Intentar leer el header de 4 bytes
        if (FileHeader.hasValidHeader(dataConHeader)) {
            FileHeader header = new FileHeader(dataConHeader);
            mPower = header.getMPower();
            originalSize = header.getOriginalSize();
            
            // Extraer solo los datos (saltar los 4 bytes del header)
            rawData = new byte[dataConHeader.length - FileHeader.HEADER_SIZE];
            System.arraycopy(dataConHeader, FileHeader.HEADER_SIZE, rawData, 0, rawData.length);
            System.out.println("DEBUG: Header 32 bits detectado. mPower=" + mPower + ", OriginalSize=" + originalSize);
        } else {
            // No hay header o está mal formado, usamos modo compatible (legacy)
            rawData = dataConHeader;
            System.out.println("DEBUG: No se detectó header válido. Usando mPower por defecto: " + mPowerDefault);
        }

        int n = 1 << mPower;
        int q = mPower;

        List<Integer> bitsRecibidos = bytesToBits(rawData);
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
        
        // Si tenemos el tamaño original del header, truncamos exactamente
        if (originalSize >= 0 && originalSize <= rawBytes.length) {
            byte[] trimmedBytes = new byte[originalSize];
            System.arraycopy(rawBytes, 0, trimmedBytes, 0, originalSize);
            return trimmedBytes;
        }

        // Si no hay header, usamos el método heurístico de remover ceros al final
        int validLength = rawBytes.length;
        while (validLength > 0 && rawBytes[validLength - 1] == 0) {
            validLength--;
        }
        byte[] trimmedBytes = new byte[validLength];
        System.arraycopy(rawBytes, 0, trimmedBytes, 0, validLength);
        
        return trimmedBytes;
    }

    public byte[] introducirError(byte[] dataConHeader, int mPowerDefault) {
        if (dataConHeader.length == 0) return dataConHeader;

        int mPower = mPowerDefault;
        int headerOffset = 0;

        // Si hay header, lo saltamos para no corromper la metadata
        if (FileHeader.hasValidHeader(dataConHeader)) {
            headerOffset = FileHeader.HEADER_SIZE;
        }

        int n = 1 << mPower;
        
        // Solo introducimos errores en la parte de DATOS
        byte[] dataOnly = new byte[dataConHeader.length - headerOffset];
        System.arraycopy(dataConHeader, headerOffset, dataOnly, 0, dataOnly.length);

        List<Integer> bits = bytesToBits(dataOnly);
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
        byte[] corruptedData = bitsToBytes(bits);
        
        // Reconstruir con el header original (sin tocar el header)
        byte[] result = new byte[dataConHeader.length];
        if (headerOffset > 0) {
            System.arraycopy(dataConHeader, 0, result, 0, headerOffset);
        }
        System.arraycopy(corruptedData, 0, result, headerOffset, corruptedData.length);
        
        return result;
    }

    public byte[] encriptar(byte[] data) {
        // Encriptación simple sin header (según pedido de simplificación)
        byte[] result = new byte[data.length];
        byte key = 0x55; 
        for (int i = 0; i < data.length; i++) {
            result[i] = (byte) (data[i] ^ key);
        }
        return result;
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