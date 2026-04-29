package com.hamming.backend.core;

import java.nio.ByteBuffer;

/**
 * Encabezado compacto de 32 bits (4 bytes)
 * [Byte 0]: mPower (tamaño de bloque)
 * [Bytes 1-3]: Tamaño original del archivo (permite archivos de hasta 16MB)
 */
public class FileHeader {
    public static final int HEADER_SIZE = 4;

    private int mPower;
    private int originalSize;

    public FileHeader(int mPower, int originalSize) {
        this.mPower = mPower;
        this.originalSize = originalSize;
    }

    public FileHeader(byte[] headerBytes) {
        if (headerBytes.length < HEADER_SIZE) {
            throw new IllegalArgumentException("Header demasiado corto");
        }
        // Byte 0: mPower
        this.mPower = headerBytes[0] & 0xFF;
        
        // Bytes 1-3: Original Size (Big Endian manual)
        this.originalSize = ((headerBytes[1] & 0xFF) << 16) | 
                            ((headerBytes[2] & 0xFF) << 8) | 
                            (headerBytes[3] & 0xFF);
    }

    public byte[] toBytes() {
        byte[] bytes = new byte[HEADER_SIZE];
        bytes[0] = (byte) mPower;
        bytes[1] = (byte) ((originalSize >> 16) & 0xFF);
        bytes[2] = (byte) ((originalSize >> 8) & 0xFF);
        bytes[3] = (byte) (originalSize & 0xFF);
        return bytes;
    }

    public int getMPower() { return mPower; }
    public int getOriginalSize() { return originalSize; }

    /**
     * Verifica si el primer byte parece un mPower válido (3, 10, 14)
     * Esto ayuda a detectar si hay un header o no.
     */
    public static boolean hasValidHeader(byte[] data) {
        if (data.length < HEADER_SIZE) return false;
        int m = data[0] & 0xFF;
        return (m == 3 || m == 10 || m == 14);
    }
}
