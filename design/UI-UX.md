# KUUMI · Rediseño UI/UX · 14 noviembre 2026

## Auditoría previa

Alcance revisado: Pedidos, Por cobrar, Parámetros, Archivo, formularios de pedido y abono, filtros, importación/exportación, historial y PWA. Base: commit 22f73b2.

| Hallazgo | Resolución |
|---|---|
| Colores literales y textos secundarios pálidos; solo modo claro | Tokens semánticos, contraste reforzado, claro/oscuro/sistema |
| Navegar borra búsqueda, filtros y acordeón | Memoria por sección durante la sesión y borrador de parámetros conservado |
| Tarjetas y ventanas aparecen/cortan de golpe | Entrada, expansión/cierre y reordenación coherentes; reducción de movimiento |
| Selectores rápidos nativos pequeños y sin contexto | Mantener 4 iconos; Fase/Estado en hoja contextual con opción actual y guardado inmediato |
| Menú flotante no atrapa/restaura foco | Hoja modal accesible para opciones, foco restaurado y Escape |
| Material solo en select | Opciones comparables con precios reales por kg, conservando parámetros del pedido |
| Feedback de error lleva el mismo check del éxito | Avisos diferenciados de éxito/error y estado real de importación/guardado |
| Fecha iOS invadía teléfono (corregido previamente) | Conservar filas completas y mínimo ancho cero; probar 320–1440 px |

La producción existente abre correctamente antes del cambio y permite consultar los pedidos y saldos guardados. No se modifica ninguno durante la auditoría. No se incluyen datos reales en el prototipo.

## Dirección visual

BRANLY UI v1.0 consultada directamente en Figma: https://www.figma.com/design/17dOlUWIzPPytRxhRkc7vQ . Fundamentos 2:37; Button 3:3; Card 3:12; Bottom Sheet 3:26; Guidelines 3:30. Reutilización de patrones en React/CSS: espaciados 4/8/12/16/24/32, radios 8/12/16/20, botones 48px, tipografía de sistema con Inter como primera opción. Extensión KUUMI: violeta de marca, fondos por estado y mascota original. No se edita la biblioteca compartida.

Jerarquía: encabezado discreto → título de sección → resumen compacto → filtros → tarjetas. Tarjetas con identidad, fase/estado legibles, importes tabulares y cuatro accesos rápidos. Claro con superficies lavanda muy suaves; oscuro con superficies ciruela y contraste semántico adaptado.

## Arquitectura y flujos

- Pedidos ↔ Por cobrar ↔ Parámetros ↔ Archivo, con indicador activo y estado por pestaña.
- + → Nuevo pedido → validar → guardar → volver a lista con confirmación.
- Tarjeta → Editar → detalles/producción/venta/historial → guardar → cerrar ficha y acordeón.
- Tarjeta → Fase o Estado → hoja de selección → guardar elección → volver a tarjeta actualizada; error conserva selección disponible para reintentar.
- Por cobrar → Abono → importe parcial o saldo completo → guardar → saldo actualizado/archivo automático según reglas existentes.
- Tarjeta → deslizar o archivar → Archivo → Deshacer/restaurar según elegibilidad existente.
- Más opciones → apariencia, importar/exportar y respaldo. Datos de negocio sin migración.

## Componentes y estados

Modal reutilizable con control de foco, cierre animado, gesto desde tirador y protección de borradores. Hoja de selección contextual; tarjetas de material; avisos éxito/error; skeleton durante lectura; indicador de importación indeterminado real. Estados controles: reposo, foco, presión, deshabilitado, guardando y confirmado. Los formularios conservan errores/datos y evitan doble envío.

## Movimiento y accesibilidad

Presión 140ms/0.97; contenido 220ms; tarjeta 240ms; hoja 280ms. Transform/opacity para entrada y reordenación. Altura mediante grid para acordeón. Respetar prefers-reduced-motion, foco visible, contraste AA, nombres accesibles e interacción por teclado. Controles ≥44px, safe areas, campos 16px para evitar zoom automático móvil. Ningún porcentaje técnico simulado.

## Alcance conservado y ampliación de presentación

No cambian model.ts, store.ts, sheet.ts, fórmulas, claves de pedidos ni formato de respaldo. Apariencia es una nueva preferencia de presentación independiente; el esquema de negocio sigue versión 1. Se conserva identidad PWA, start_url, scope y ruta de producción. Filamentos proceden exclusivamente del pedido/parámetros: sin colores, propiedades técnicas, inventario ni disponibilidad inventados. No existen visor 3D, imágenes de productos ni carga de modelos; no se añaden módulos ficticios.

## Entregables y verificación

La aplicación implementada es el prototipo navegable completo. Se entrega también copia interactiva en Figma con datos ficticios y esta especificación. [Abrir prototipo interactivo en Figma](https://www.figma.com/design/NrpmwFoEQ264fl0aBdjHfP?node-id=1-3&autoplay-code-preview=1-3).

Verificado antes de publicar:
- 18 pruebas de cálculos, cobros, archivo, importación y concurrencia correctas.
- Compilación TypeScript/Vite correcta; sin cambios en modelo, almacenamiento ni manifiesto PWA.
- Fase guardada desde la hoja contextual y persistida al recargar.
- Material seleccionado y guardado; importes recalculados por la lógica existente.
- Abono parcial y saldo completo: actualización de deuda y archivo automático correctos.
- Filtros conservados entre secciones; borrador de parámetros conservado al volver.
- Confirmación integrada: Volver conserva el borrador; crear pedido guarda y cierra la ficha.
- Fecha y teléfono sin superposición a 320 px; diálogo de 303 px sin desbordamiento.
- Revisión visual claro/oscuro, móvil y escritorio; dos columnas a 1440 px sin desbordamiento horizontal.
- Foco restaurado al cerrar opciones; controles de fase y estado accesibles por nombre.
- Prototipo importado en Figma y vista previa cargada con datos ficticios. La importación desde la hoja real está deshabilitada únicamente en esa copia de demostración.

Las comprobaciones visuales se realizaron con navegador de escritorio y tamaños móviles; no equivalen a una certificación completa WCAG ni a una prueba física en todos los modelos de iPhone. La caché se regenera durante la compilación para conservar la instalación y las rutas existentes.
