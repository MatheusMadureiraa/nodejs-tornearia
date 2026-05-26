// Image handling utilities
export class ImageManager {
    constructor() {
        this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
    }

    validateImageFile(file) {
        if (!file) {
            return { valid: false, error: 'Nenhum arquivo selecionado' };
        }

        if (!this.allowedTypes.includes(file.type)) {
            return { 
                valid: false, 
                error: 'Formato de arquivo não suportado. Use JPG, PNG, GIF ou WEBP.' 
            };
        }

        if (file.size > this.maxFileSize) {
            return { 
                valid: false, 
                error: 'Arquivo muito grande. Tamanho máximo: 5MB.' 
            };
        }

        return { valid: true };
    }

    async convertToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    createImagePreview(file, container) {
        const validation = this.validateImageFile(file);
        if (!validation.valid) {
            container.innerHTML = `<p style="color: red;">${validation.error}</p>`;
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            container.innerHTML = `
                <div style="text-align: center; margin-top: 10px;">
                    <img src="${e.target.result}" 
                         style="max-width: 200px; max-height: 150px; border: 1px solid #ccc; border-radius: 4px;">
                    <p style="font-size: 12px; color: #666; margin-top: 5px;">
                        ${file.name} (${(file.size / 1024).toFixed(1)} KB)
                    </p>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    }

    setupImageInput(inputElement, previewContainer = null) {
        // Set accept attribute
        inputElement.setAttribute('accept', this.allowedTypes.join(','));

        inputElement.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file && previewContainer) {
                this.createImagePreview(file, previewContainer);
            }
        });
    }

    displayStoredImage(imagePath, container) {
        if (!imagePath) {
            container.innerHTML = '<p style="color: #666; font-style: italic;">Imagem não cadastrada</p>';
            return;
        }

        // For base64 stored images (legacy support)
        if (imagePath.startsWith('data:image/')) {
            container.innerHTML = `
                <div style="text-align: center;">
                    <img src="${imagePath}" 
                         style="max-width: 200px; max-height: 150px; border: 1px solid #ccc; border-radius: 4px;">
                </div>
            `;
        } else {
            // For file system stored images
            const imageUrl = `http://localhost:3500/servicos/images/${imagePath}`;
            container.innerHTML = `
                <div style="text-align: center;">
                    <img src="${imageUrl}" 
                         style="max-width: 200px; max-height: 150px; border: 1px solid #ccc; border-radius: 4px;"
                         onerror="this.parentElement.innerHTML='<p style=\\"color: #666; font-style: italic;\\">Imagem não disponível</p>'">
                    <br>
                    <a href="${imageUrl}" target="_blank" style="font-size: 12px; color: #018c18; text-decoration: none;">
                        📷 Abrir imagem em nova janela
                    </a>
                </div>
            `;
        }
    }

    // Create a clickable link to open image in external application
    createImageLink(imagePath, container) {
        if (!imagePath) {
            container.innerHTML = '<p style="color: #666; font-style: italic;">Imagem não cadastrada</p>';
            return;
        }

        const imageUrl = `http://localhost:3500/servicos/images/${imagePath}`;
        container.innerHTML = `
            <div style="text-align: center; padding: 10px;">
                <div style="border: 2px dashed #ccc; padding: 20px; border-radius: 8px;">
                    <img src="../public/assets/icons/image-icon.svg" 
                         style="width: 48px; height: 48px; opacity: 0.6;" 
                         onerror="this.style.display='none'">
                    <p style="margin: 10px 0 5px 0; font-weight: bold;">📷 Imagem do Serviço</p>
                    <a href="${imageUrl}" target="_blank" 
                       style="display: inline-block; padding: 8px 16px; background-color: #018c18; color: white; text-decoration: none; border-radius: 4px; font-size: 14px;">
                        Abrir Imagem
                    </a>
                    <p style="font-size: 11px; color: #666; margin-top: 5px;">
                        Clique para abrir a imagem em seu visualizador padrão
                    </p>
                </div>
            </div>
        `;
    }
}

export const imageManager = new ImageManager();