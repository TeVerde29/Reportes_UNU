// ============================================================
// FOTO URL (front)
// Guía: el back devuelve dos formas según dónde viva la foto:
//  - Disco local  -> ruta relativa `/uploads/reportes/xxx.jpg`
//    (hay que pegarle el baseUrl del back)
//  - Cloudinary   -> URL absoluta `https://res.cloudinary.com/...`
//    (se usa tal cual; si le pegas el baseUrl se rompe)
// ============================================================
import { environment } from '../environment/environment';

export function resolverFotoUrl(fotoUrl?: string | null): string | null {
  if (!fotoUrl) return null;
  if (/^https?:\/\//i.test(fotoUrl)) return fotoUrl;
  return `${environment.baseUrl}${fotoUrl}`;
}
