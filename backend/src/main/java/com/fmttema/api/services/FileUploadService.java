package com.fmttema.api.services;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileUploadService {

    private static final String UPLOAD_DIR = "uploads/patrocinadores";
    private static final List<String> EXTENSOES_PERMITIDAS = Arrays.asList(".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif");

    public String salvarLogomarca(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo de imagem vazio ou não fornecido");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new IllegalArgumentException("Nome de arquivo inválido");
        }

        String extensao = "";
        int i = originalFilename.lastIndexOf('.');
        if (i > 0) {
            extensao = originalFilename.substring(i).toLowerCase();
        }

        if (!EXTENSOES_PERMITIDAS.contains(extensao)) {
            throw new IllegalArgumentException("Formato de imagem não suportado. Formatos aceitos: PNG, JPG, JPEG, WEBP, SVG, GIF.");
        }

        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String nomeSanitizado = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        String nomeFinal = UUID.randomUUID() + "_" + nomeSanitizado;
        Path destino = uploadPath.resolve(nomeFinal);

        Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/patrocinadores/" + nomeFinal;
    }

    public void excluirArquivoSeExistir(String fileUrl) {
        if (fileUrl != null && fileUrl.startsWith("/uploads/")) {
            try {
                Path path = Paths.get(fileUrl.substring(1));
                Files.deleteIfExists(path);
            } catch (IOException ignored) {
            }
        }
    }
}
