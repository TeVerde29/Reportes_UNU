# observaciones - Reportes_UNU

Acuerdos y observaciones (de más urgente a menos urgente).

## IMPORTANTE

### 1. Botón eliminar en reportes aceptados (personal)
Si el admin/supervisor acepta un reporte por error, no hay forma de corregirlo: en `pendientes-form` el aceptado solo muestra `Marcar como solucionado`. Agregar botón `Eliminar reporte` (con confirmación) para `Aceptado`. El back ya lo soporta (`DELETE /api/reporte/:id`, roles 1 y 2, borra fila + foto).
