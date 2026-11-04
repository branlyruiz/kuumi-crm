# Kuumi · CRM 3D

Mini app de pedidos e impresión 3D para GitHub Pages, con icono de Kuumi y diseño para iPhone. Las cards muestran cliente, producto, cantidad, precio sugerido, costo total y utilidad. El acordeón ofrece Editar información y Registrar abono. La ficha permite editar producción, venta, abonos, contactos y observaciones; al guardar correctamente se cierran la ficha y el acordeón.

## Usar

Abre la web en Safari y usa Compartir → Agregar a Inicio. Activa Abrir como app web si aparece.

La primera pantalla permite cargar la hoja de referencia que el usuario compartió con acceso por enlace. La importación lee únicamente `Seguimiento 3D` y `Parámetros y Costos`. Omite registros ya importados; no sincroniza ni sobrescribe pedidos editados localmente. Si deja de estar disponible el acceso por enlace, se puede importar el respaldo JSON. No se modifica Google Sheets.

Los pedidos y parámetros se guardan por dispositivo. El menú permite respaldar ambos y exportar la vista a CSV. Los registros de clientes no forman parte del repositorio. El navegador solicita conservación del almacenamiento cuando está disponible; los respaldos permiten cambiar de dispositivo o recuperar datos borrados del navegador.

## Interfaz

- **Pedidos:** resumen financiero plegable, búsqueda por icono y selector de estado en una sola línea con ajustes. Prioridad de producción, orden, fase y material se encuentran en Más filtros y orden.
- **Tarjetas:** cliente, producto, cantidad, estado/fase, entrega, precio sugerido, costo y utilidad. Los fondos distinguen pendientes (ámbar), producción (lavanda), correcciones (rosa), listo para entregar (azul), entregados (verde), aplazados (gris) y cancelados (coral).
- **Edición:** el acordeón contiene acciones cortas para editar y registrar abonos en ventanas independientes. Un guardado correcto cierra ventana y acordeón; los errores conservan los cambios para corregirlos.
- **Archivo rápido:** icono visible en cada pedido no pagado, acción dentro del acordeón y gesto de deslizar. Incluye Deshacer y restauración desde Archivo.
- **Por cobrar:** filas con cliente, producto, saldo y botón + para abonar directamente. Ofrece Pagar saldo completo; un abono parcial actualiza la fila y el pago completo la retira.
- **Menú flotante:** Pedidos, Por cobrar, Parámetros y Archivo; solo la sección activa muestra su etiqueta. El + separado crea un pedido.

Un pedido archivado manualmente con deuda sigue visible en **Por cobrar** y en el resumen de saldo pendiente. Archivar no registra un pago ni cambia su fase o estado. Cancelados quedan excluidos de cobros. Los controles principales tienen objetivos táctiles de al menos 44 px.

 La pestaña Archivados reúne los pedidos archivados manualmente y aquellos cuyo precio de venta positivo está cubierto por el abono inicial y los pagos posteriores. Los pagos parciales y los pedidos sin precio permanecen activos. El pago completo archiva aunque el pedido siga en producción. Esta clasificación también se aplica a respaldos anteriores. Corregir un pago o precio y dejar saldo reabre el pedido, salvo que se hubiera archivado manualmente. El archivo conserva los datos y permite editarlos. Los pedidos pagados permanecen archivados automáticamente mientras mantengan saldo cero; los archivados manualmente con saldo se pueden restaurar con su botón.

## Cálculos

Peso y horas corresponden a una pieza. La cantidad multiplica material, energía y depreciación. Otros costos son un importe adicional del pedido.

- Material unitario = gramos × precio por kg / 1000.
- Energía unitaria = horas × tarifa kWh × consumo por hora.
- Depreciación unitaria = horas × valor de máquina / vida útil en horas.
- Costo total = redondeo a pesos de ((material + energía + depreciación) × cantidad + otros costos).
- Precio sugerido = costo total / (1 − margen), redondeado hacia arriba al múltiplo configurado.
- Venta = precio pactado, o sugerido si se deja vacío.
- Utilidad de venta = venta − costo total; puede ser negativa.
- Saldo = venta − abono inicial − abonos posteriores.

El margen es un porcentaje del precio final, no un recargo sobre costo. La referencia contiene 0.6, que corresponde al 60 %, aunque su formato lo muestra como moneda. La app incluye depreciación en la sugerencia y multiplica todas las unidades de forma consistente. Las sugerencias y las utilidades de pedidos con cantidad mayor a uno pueden diferir de las fórmulas inconsistentes de la hoja; el precio de venta pactado de cada fila se conserva.

Cada pedido conserva una copia de sus parámetros de costo. Cambiar los parámetros globales afecta a pedidos nuevos. `Actualizar costos del pedido` aplica explícitamente los parámetros actuales a uno existente, tras confirmación. Una venta entregada cuenta como entregada por su estado, independientemente de la fase antigua de la hoja.

## Desarrollo y publicación

Node.js >=22.13.0.

```
npm ci
npm run dev
npm test
npm run build
```

GitHub Pages publica `main` y `/docs`. Código y archivos compilados se guardan juntos. El servicio de caché y las claves de almacenamiento usan el prefijo `kuumi-crm`, distinto al del CRM BR. Rutas relativas permiten servir todo desde `/kuumi-crm/`. Los datos importados y respaldos de trabajo quedan fuera de Git.
