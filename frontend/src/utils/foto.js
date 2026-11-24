const tipeFoto = ["image/jpeg", "image/png"];
const maksFotoMb = 5;

// Mengembalikan pesan error, atau string kosong bila foto valid.
export const cekFoto = (file) => {
  if (!tipeFoto.includes(file.type)) return "Foto harus berformat JPG atau PNG";
  if (file.size > maksFotoMb * 1024 * 1024) {
    return `Ukuran foto maksimal ${maksFotoMb} MB`;
  }
  return "";
};
