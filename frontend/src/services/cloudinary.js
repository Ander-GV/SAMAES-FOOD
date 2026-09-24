// Servicio de subida directa a Cloudinary (CDN de imágenes)
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'rsoygtda';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ra6ivstv';

/**
 * Sube un archivo de imagen (File o Blob) a Cloudinary y retorna la URL optimizada
 * @param {File|Blob} file 
 * @returns {Promise<string>} URL pública https optimizada de Cloudinary
 */
export const uploadImageToCloudinary = async (file) => {
  if (!file) throw new Error('No se seleccionó ningún archivo de imagen');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  // Intentamos con la configuración principal
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      // Si falla, probamos intercambiando cloudName y preset por si fueron provistos en orden inverso
      const altCloudName = UPLOAD_PRESET;
      const altPreset = CLOUD_NAME;
      const altFormData = new FormData();
      altFormData.append('file', file);
      altFormData.append('upload_preset', altPreset);

      const altResponse = await fetch(`https://api.cloudinary.com/v1_1/${altCloudName}/image/upload`, {
        method: 'POST',
        body: altFormData,
      });

      if (!altResponse.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || 'Error al subir la imagen a Cloudinary');
      }

      const altData = await altResponse.json();
      return altData.secure_url || altData.url;
    }

    const data = await response.json();
    return data.secure_url || data.url;
  } catch (error) {
    console.error('Error en Cloudinary:', error);
    throw error;
  }
};
