package com.raeesmart.backend.Service.Impl;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.raeesmart.backend.Service.QRService;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.UUID;

@Service

public class QRServiceImpl implements QRService {
    private static final int TAMANO_QR = 300;

    @Override
    public byte[] generarQR(String contenido) {
        try {
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix matrix = writer.encode(contenido, BarcodeFormat.QR_CODE, TAMANO_QR, TAMANO_QR);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", out);
            return out.toByteArray();
        } catch (WriterException | IOException e) {
            throw new RuntimeException("No se pudo generar el código QR", e);
        }
    }

    @Override
    public String generarCodigoHash() {
        return UUID.randomUUID().toString();
    }
}
