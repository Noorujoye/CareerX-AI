package com.noorain.login_system.ats.extraction;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.extractor.WordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.InputStream;
import java.util.Locale;

@Component
public class SimpleDocumentTextExtractor implements DocumentTextExtractor {

    @Override
    public String extractText(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resume file is required");
        }

        String originalName = file.getOriginalFilename();
        String filename = originalName == null ? "" : originalName.toLowerCase(Locale.ROOT);

        try {
            if (filename.endsWith(".pdf")) {
                return extractPdf(file);
            }
            if (filename.endsWith(".docx")) {
                return extractDocx(file);
            }
            if (filename.endsWith(".doc")) {
                return extractDoc(file);
            }
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "Unsupported file type. Please upload PDF, DOC, or DOCX.");
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not read resume file");
        }
    }

    private static String extractPdf(MultipartFile file) throws Exception {
        byte[] bytes = file.getInputStream().readAllBytes();
        try (PDDocument document = Loader.loadPDF(bytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    private static String extractDocx(MultipartFile file) throws Exception {
        try (InputStream in = file.getInputStream(); XWPFDocument doc = new XWPFDocument(in)) {
            StringBuilder sb = new StringBuilder();
            for (XWPFParagraph p : doc.getParagraphs()) {
                String text = p.getText();
                if (text != null && !text.isBlank()) {
                    sb.append(text).append('\n');
                }
            }
            return sb.toString();
        }
    }

    private static String extractDoc(MultipartFile file) throws Exception {
        try (InputStream in = file.getInputStream();
                HWPFDocument doc = new HWPFDocument(in);
                WordExtractor extractor = new WordExtractor(doc)) {
            String text = extractor.getText();
            return text == null ? "" : text;
        }
    }
}
