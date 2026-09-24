// ==============================================================================
// IStart Camp 2026 - Avatar & Image Upload Helper
// ==============================================================================

export interface UploadImageResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadImageFile(
  file: File,
  options?: { folder?: string; filename?: string }
): Promise<UploadImageResult> {
  // Client-side validation
  if (!file) {
    return { success: false, error: 'Chưa chọn tệp ảnh.' };
  }

  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return {
      success: false,
      error: 'Vui lòng chọn ảnh định dạng PNG, JPG, WebP hoặc SVG.',
    };
  }

  if (file.size > 5 * 1024 * 1024) {
    return {
      success: false,
      error: 'Dung lượng ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.',
    };
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.folder) formData.append('folder', options.folder);
    if (options?.filename) formData.append('filename', options.filename);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Máy chủ không thể lưu ảnh.');
    }

    return { success: true, url: data.url };
  } catch (err: unknown) {
    console.warn('API upload failed, falling back to client-side Data URL:', err);

    // Reliable client-side fallback using FileReader (Base64)
    return new Promise<UploadImageResult>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({ success: true, url: reader.result as string });
      };
      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Không thể xử lý tệp ảnh trên trình duyệt.',
        });
      };
      reader.readAsDataURL(file);
    });
  }
}
