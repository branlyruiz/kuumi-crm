# Kuumi · CRM 3D

Mini app de pedidos e impresión 3D para GitHub Pages, con icono de Kuumi y diseño para iPhone. Las cards muestran cliente, producto, cantidad, precio sugerido, costo total y utilidad. El acordeón permite editar producción, venta, abonos, contactos y observaciones.

## Usar

Abre la web en Safari y usa Compartir → Agregar a Inicio. Activa Abrir como app web si aparece.

La primera pantalla permite cargar la hoja de referencia que el usuario compartió con acceso por enlace. La importación lee únicamente `Seguimiento 3D` y `Parámetros y Costos`. Omite registros ya importados; no sincroniza ni sobrescribe pedidos editados localmente. Si deja de estar disponible el acceso por enlace, se puede importar el respaldo JSON. No se modifica Google Sheets.

Los pedidos y parámetros se guardan por dispositivo. El menú permite respaldar ambos y exportar la vista a CSV. Los registros de clientes no forman parte del repositorio. El navegador solicita conservación del almacenamiento cuando está disponible; los respaldos permiten cambiar de dispositivo o recuperar datos borrados del navegador.

La prioridad y el icono de búsqueda comparten una línea; el estado se elige en un desplegable. La pestaña Archivados reúne los pedidos archivados manualmente y aquellos cuyo precio de venta positivo está cubierto por el abono inicial y los pagos posteriores. Los pagos parciales y los pedidos sin precio permanecen activos. Esta clasificación también se aplica a respaldos anteriores. Corregir un pago o precio y dejar saldo reabre el pedido, salvo que se hubiera archivado manualmente. El archivo conserva los datos y permite editarlos.

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
