package com.noorain.login_system.ats.extraction;

import org.springframework.web.multipart.MultipartFile;

public interface DocumentTextExtractor {
    String extractText(MultipartFile file);
}
