# Plan de implementación del sistema de restaurante

## 1. Objetivo

Implementar un sistema de atención presencial para restaurante en el que:

- El administrador configura manualmente los productos del menú disponible cada día.
- La fecha del menú diario se determina automáticamente usando la zona horaria de Perú.
- El mozo abre una mesa numerada y registra lo solicitado por el cliente.
- El sistema crea y actualiza automáticamente la cuenta de la mesa.
- Cocina recibe únicamente las comidas que debe preparar.
- Caja visualiza en tiempo real todo el consumo y es el único módulo autorizado para registrar pagos.
- El cajero confirma manualmente si la cuenta fue pagada.
- Después del pago completo, el sistema cierra la atención y libera automáticamente la mesa.

Los pedidos online quedan fuera del alcance.

## 2. Orden general de implementación

1. Corregir catálogo y clasificación de productos.
2. Unificar el Menú Diario.
3. Completar modalidades y disponibilidad.
4. Implementar mesas y sesiones de atención.
5. Implementar pedidos y componentes.
6. Implementar el flujo de Cocina.
7. Automatizar la cuenta.
8. Crear el módulo de Caja.
9. Automatizar el cierre después del pago.
10. Implementar cancelaciones y autorizaciones.
11. Integrar inventario.
12. Aplicar roles y permisos.
13. Reorganizar navegación y pantallas.
14. Migrar los datos existentes.
15. Ejecutar pruebas completas del proceso.

## 3. Fase 1: corregir el catálogo de productos

### Objetivo

Asegurar que todos los productos tengan una clasificación válida y que esta información se conserve desde su creación.

### Actividades

- Mantener las categorías principales `Comidas` y `Bebidas`.
- Mantener dentro de Comidas las subcategorías `Menú Económico` y `Platos Especiales`.
- Mantener dentro de Menú Económico los tipos `Segundo`, `Entrada` y `Postre`.
- Agregar al formulario de productos la selección del tipo del Menú Económico.
- Guardar correctamente `menu_subcategory_type_id` desde el controlador.
- Validar estas combinaciones:
  - Bebida: categoría Bebidas, sin subcategoría y sin tipo.
  - Plato especial: categoría Comidas, subcategoría Platos Especiales y sin tipo.
  - Producto de Menú Económico: categoría Comidas, subcategoría Menú Económico y tipo obligatorio.
- Impedir que un tipo perteneciente a otra subcategoría sea asignado al producto.
- Corregir los productos existentes que tengan el tipo vacío o una clasificación incompatible.
- Agregar pruebas para cada combinación válida e inválida.

### Resultado esperado

Cada producto podrá ser identificado inequívocamente como bebida, plato especial, segundo, entrada o postre.

## 4. Fase 2: unificar el Menú Diario

### Objetivo

Tener un único módulo para configurar el menú correspondiente al día actual.

### Actividades

- Eliminar la selección manual de la fecha.
- Usar `America/Lima` para determinar la fecha actual.
- Al ingresar al módulo, buscar el menú de hoy.
- Si no existe, crearlo automáticamente como inactivo o borrador.
- Si ya existe, abrir el mismo registro.
- Mantener una restricción única por fecha para evitar duplicados.
- Permitir que el administrador configure manualmente:
  - Productos disponibles.
  - Precio del día.
  - Cantidad disponible cuando corresponda.
  - Orden de presentación.
  - Información u observaciones.
  - Estado activo o inactivo de cada producto.
  - Estado activo o inactivo del menú completo.
- Evitar que el mismo producto se agregue dos veces al menú de una fecha.
- Activar el menú solamente cuando el administrador termine de configurarlo.
- Mantener los menús anteriores como historial sin permitir cambios operativos.
- Ajustar los seeders para que no creen menús futuros que contradigan este flujo.

### Resultado esperado

La fecha se gestiona automáticamente, pero el administrador conserva el control manual sobre todo lo que se vende ese día.

## 5. Fase 3: completar las modalidades del Menú Económico

### Objetivo

Permitir vender correctamente las modalidades acordadas.

### Modalidades

- Menú completo: un segundo, una entrada y un postre.
- Solo segundo: un segundo.
- Entrada más postre: una entrada y un postre.

### Actividades

- Asociar cada modalidad únicamente al menú diario correspondiente.
- Permitir configurar manualmente precio, descripción, orden y estado.
- Definir los tipos de componentes requeridos por cada modalidad.
- Mostrar solamente productos activos y publicados en el menú actual.
- Permitir múltiples opciones de segundo, entrada y postre.
- Validar que cada modalidad tenga la composición correcta antes de activarse.

### Resultado esperado

El mozo podrá seleccionar una modalidad y luego elegir exactamente los componentes solicitados por el cliente.

## 6. Fase 4: implementar la disponibilidad del menú

### Objetivo

Evitar ventas por encima de las cantidades disponibles.

### Reglas

- Cada segundo tendrá su propia cantidad disponible.
- Cada Plato Especial tendrá su propia cantidad disponible.
- Las bebidas utilizarán el stock correspondiente.
- La capacidad total de entradas será igual a la suma de los segundos activos del día.
- La capacidad total de postres será igual a la suma de los segundos activos del día.
- Entradas y postres no tendrán una cantidad independiente asignada a cada producto.

### Actividades

- Reservar o descontar disponibilidad al confirmar el pedido, no al pagar.
- Validar la cantidad dentro de una transacción.
- Bloquear temporalmente los registros durante la validación para evitar ventas simultáneas de la última porción.
- Restaurar la disponibilidad cuando una cancelación válida lo requiera.
- Ocultar o bloquear productos agotados para nuevos pedidos.
- Mantener disponible la modalidad Solo segundo cuando ya no existan entradas o postres, siempre que queden segundos.

### Resultado esperado

Dos mesas no podrán consumir la misma última porción y la disponibilidad será consistente con los pedidos confirmados.

## 7. Fase 5: implementar mesas y sesiones de atención

### Objetivo

Hacer que todo el proceso de atención comience desde una mesa numerada.

### Actividades

- Mantener las mesas enumeradas y su capacidad.
- Mostrar los estados disponible, ocupada y fuera de servicio.
- Incorporar sesiones de mesa para registrar cada atención por separado.
- Permitir al mozo seleccionar una mesa disponible e indicar la cantidad de clientes.
- Al abrir una mesa, crear automáticamente y dentro de una sola transacción:
  - La sesión de atención.
  - La cuenta pendiente.
  - La relación con el mozo.
  - El estado ocupado de la mesa.
- Impedir que una mesa tenga más de una sesión abierta simultáneamente.
- Retirar la apertura manual de cuentas desde el módulo Cuentas.

### Resultado esperado

Una sola acción del mozo dejará preparada la mesa para recibir pedidos y mostrará inmediatamente su cuenta pendiente en Caja.

## 8. Fase 6: implementar pedidos progresivos

### Objetivo

Permitir que el cliente realice uno o varios pedidos durante la misma atención.

### Actividades

- Permitir al mozo ingresar a una mesa abierta.
- Mostrar solamente el menú activo de la fecha actual.
- Mostrar únicamente productos y modalidades activos y disponibles.
- Cada confirmación del mozo creará un nuevo grupo de pedido o comanda.
- Todos los grupos de pedido pertenecerán a la misma cuenta de la mesa.
- Guardar por cada ítem:
  - Producto o modalidad.
  - Componentes seleccionados.
  - Cantidad.
  - Precio del día.
  - Subtotal.
  - Observaciones.
  - Mozo responsable.
  - Fecha y hora.
- Recalcular automáticamente el total de la cuenta después de cada cambio permitido.
- Permitir consumos adicionales mientras la cuenta no esté pagada ni cerrada.

### Resultado esperado

El cliente podrá seguir consumiendo sin crear cuentas nuevas y Caja verá siempre el total actualizado.

## 9. Fase 7: completar los componentes del pedido

### Objetivo

Guardar exactamente qué productos eligió el cliente dentro de cada modalidad.

### Actividades

- Completar el modelo, controlador y relaciones de los componentes del pedido.
- Solicitar los componentes según la modalidad seleccionada.
- Guardar cada segundo, entrada y postre elegido.
- Validar que los componentes:
  - Pertenezcan al menú actual.
  - Estén activos.
  - Tengan disponibilidad.
  - Correspondan al tipo requerido.
- Impedir elegir una entrada como segundo, un postre como entrada o cualquier combinación incompatible.
- Mostrar la composición completa en Pedido, Cocina, Cuenta y Caja.

### Resultado esperado

Una venta de Menú completo conservará el segundo, entrada y postre exactos que consumió el cliente.

## 10. Fase 8: automatizar el envío a Cocina

### Objetivo

Enviar a Cocina únicamente aquello que requiere preparación.

### Actividades

- Identificar automáticamente si el ítem pertenece a Comidas o Bebidas.
- Enviar a Cocina el Menú Económico y los Platos Especiales.
- Mantener las bebidas en la cuenta sin enviarlas a Cocina.
- Mostrar en Cocina:
  - Mesa.
  - Número de comanda.
  - Productos y componentes.
  - Cantidades.
  - Observaciones.
  - Hora del pedido.
  - Tiempo transcurrido.
- Permitir que Cocina cambie manualmente el estado a pendiente, en preparación y listo.
- Permitir que el mozo marque el producto como entregado.
- Generar una nueva comanda para consumos adicionales sin reenviar las anteriores.

### Resultado esperado

Cocina recibirá automáticamente solo las comidas nuevas y el mozo podrá seguir el estado de preparación.

## 11. Fase 9: automatizar la cuenta

### Objetivo

Eliminar la creación y modificación manual de cuentas.

### Actividades

- Crear la cuenta automáticamente al abrir la mesa.
- Iniciarla pendiente y con total cero.
- Actualizar automáticamente descripción, cantidad, precio, subtotal y total con cada pedido.
- Calcular los importes exclusivamente desde los ítems válidos del pedido.
- Impedir la modificación manual del total.
- Convertir el módulo Cuentas en una sección solamente de consulta.
- Retirar de Cuentas las acciones para:
  - Abrir una cuenta.
  - Registrar pagos.
  - Cerrar una cuenta.
  - Liberar una mesa.
  - Modificar consumos.
- Permitir consultar cuentas pendientes, pagadas y anuladas con todo su detalle.

### Resultado esperado

La cuenta aparecerá automáticamente para el mozo y Caja, y siempre reflejará el consumo real de la mesa.

## 12. Fase 10: crear el módulo de Caja

### Objetivo

Hacer de Caja el único módulo autorizado para registrar pagos.

### Actividades

- Implementar apertura manual de caja con fondo inicial.
- Mostrar en Caja todas las cuentas pendientes en tiempo real.
- Permitir al cajero seleccionar una cuenta y registrar manualmente:
  - Método de pago.
  - Importe.
  - Código de operación cuando corresponda.
  - Tipo de comprobante.
  - Datos del cliente cuando sean necesarios.
  - Confirmación del pago.
- Soportar efectivo, tarjeta, Yape, Plin y pago mixto.
- Decidir e implementar si se permitirán pagos parciales.
- Calcular automáticamente total, pagado, saldo y vuelto.
- Mantener la cuenta pendiente si el cajero todavía no confirma el pago completo.
- Impedir pagos sin una caja abierta.
- Impedir que otros roles registren pagos.
- Implementar cierre manual de caja con efectivo contado y comparación contra el efectivo esperado.

### Resultado esperado

El cajero será quien confirme manualmente el pago, mientras el sistema realizará todas las validaciones y cálculos.

## 13. Fase 11: automatizar el cierre después del pago

### Objetivo

Finalizar toda la atención a partir de una única confirmación del cajero.

### Actividades

Cuando el cajero confirme el pago completo, ejecutar automáticamente y dentro de una transacción:

- Registrar el pago y su método.
- Guardar el detalle definitivo del consumo.
- Generar el comprobante.
- Marcar la cuenta como pagada.
- Cerrar los pedidos pendientes de cierre operativo.
- Cerrar la sesión de la mesa.
- Liberar la mesa.
- Actualizar Caja y reportes.
- Bloquear modificaciones posteriores.
- Guardar quién cobró y en qué momento.

La mesa no se liberará mientras exista saldo pendiente.

### Resultado esperado

El cajero solo confirmará el pago; el sistema se encargará automáticamente de cerrar todo el proceso.

## 14. Fase 12: cancelaciones y autorizaciones

### Objetivo

Conservar el historial y controlar situaciones excepcionales.

### Actividades

- Reemplazar la eliminación física de pedidos e ítems por cancelaciones.
- Guardar usuario, fecha, motivo y estado anterior.
- Si el producto todavía no fue preparado:
  - Cancelarlo.
  - Recalcular la cuenta.
  - Restaurar disponibilidad.
  - Informar a Cocina.
- Si ya está en preparación o fue entregado, exigir autorización del cajero o administrador.
- Registrar solicitudes de autorización y su resultado.
- Impedir la modificación de una venta pagada.
- Si el cliente consume después de pagar, crear una nueva sesión, pedido y cuenta.
- Permitir reabrir el mismo pedido solamente si fue cerrado por error y no existe un pago confirmado.

### Resultado esperado

No se perderá información y todas las correcciones quedarán justificadas y auditadas.

## 15. Fase 13: integrar inventario

### Objetivo

Conectar automáticamente las ventas con el stock y la disponibilidad.

### Actividades

- Mantener entradas, salidas y ajustes de stock.
- Descontar automáticamente las bebidas vendidas.
- Registrar el consumo de productos del menú.
- Restaurar cantidades por cancelaciones autorizadas.
- Evitar cantidades negativas.
- Guardar cantidad anterior, cantidad posterior, usuario, fecha y descripción de cada movimiento.
- Diferenciar claramente:
  - Producto inactivo en el catálogo.
  - Producto agotado en el menú del día.
  - Producto sin stock.
- No desactivar globalmente un producto solamente porque la disponibilidad de un día llegó a cero.

### Resultado esperado

El inventario reflejará automáticamente las ventas sin alterar incorrectamente el catálogo general.

## 16. Fase 14: roles y permisos

### Objetivo

Permitir que cada usuario realice únicamente las acciones propias de su función.

### Administrador o dueño

- Gestionar productos y categorías.
- Configurar el menú diario.
- Gestionar mesas.
- Controlar inventario.
- Aprobar excepciones.
- Consultar reportes.

### Mozo

- Abrir mesas.
- Registrar pedidos.
- Agregar consumos.
- Entregar productos.
- Solicitar cancelaciones o correcciones.

### Cocina

- Consultar comidas pendientes.
- Actualizar estados de preparación.

### Cajero

- Abrir y cerrar Caja.
- Consultar cuentas pendientes.
- Registrar y confirmar pagos.
- Aprobar operaciones permitidas.

### Actividades adicionales

- Aplicar permisos en la interfaz y en Laravel.
- No depender únicamente de ocultar botones.
- Probar que un usuario no autorizado tampoco pueda ejecutar la acción mediante una petición directa.

## 17. Fase 15: reorganizar navegación y pantallas

### Objetivo

Hacer que la interfaz represente el proceso real del restaurante.

### Navegación propuesta

1. Dashboard.
2. Mesas.
3. Pedidos.
4. Cocina.
5. Caja.
6. Cuentas.
7. Menú Diario.
8. Productos.
9. Categorías.
10. Inventario.
11. Usuarios.
12. Reportes.

Cada rol verá únicamente los módulos que le correspondan.

## 18. Fase 16: migrar y corregir los datos existentes

### Objetivo

Conservar la información válida del repositorio durante la implementación.

### Actividades

- Crear nuevas migraciones para modificar estructuras ya utilizadas.
- No editar migraciones que ya hayan sido ejecutadas en entornos compartidos o producción.
- Completar el tipo de los productos del Menú Económico existentes.
- Unificar menús duplicados o inconsistentes.
- Corregir modalidades vinculadas a fechas incorrectas.
- Convertir las cuentas actuales al nuevo flujo.
- Conservar pagos e historial existentes.
- Corregir estados contradictorios entre mesa, cuenta, pedido y pago.
- Revisar y actualizar seeders y factories.

## 19. Fase 17: pruebas del proceso completo

### Objetivo

Verificar el flujo real del restaurante y no solamente cada tabla aislada.

### Escenarios mínimos

1. El sistema obtiene correctamente la fecha actual de Perú.
2. El menú de hoy se crea automáticamente como borrador al entrar al módulo.
3. El administrador configura manualmente sus productos, cantidades, precios y estado.
4. Un producto del Menú Económico requiere Segundo, Entrada o Postre.
5. El mozo abre una mesa disponible.
6. El sistema crea automáticamente sesión y cuenta.
7. El mozo confirma un pedido usando el menú activo de hoy.
8. La cuenta se actualiza automáticamente.
9. Cocina recibe solamente las comidas.
10. Las bebidas permanecen en la cuenta y descuentan stock.
11. Las modalidades descuentan correctamente sus componentes.
12. Se pueden agregar consumos adicionales a la misma cuenta.
13. Una cancelación válida restaura disponibilidad.
14. Solo Caja puede registrar el pago.
15. Una cuenta no confirmada permanece pendiente.
16. Un pago parcial no libera la mesa.
17. El pago completo cierra pedidos, sesión y cuenta.
18. La mesa se libera después del pago completo.
19. Una venta pagada no puede modificarse.
20. Un nuevo consumo después del pago genera una cuenta nueva.
21. Dos solicitudes simultáneas no pueden consumir la misma última porción.
22. Dos solicitudes simultáneas no pueden cobrar dos veces la misma cuenta.

## 20. Criterio de finalización

La implementación estará completa cuando pueda ejecutarse sin intervención manual innecesaria este proceso:

1. El administrador ingresa al menú de la fecha actual y configura manualmente los productos disponibles.
2. El mozo abre una mesa y registra lo solicitado por el cliente.
3. El sistema crea y actualiza automáticamente sesión, pedidos, disponibilidad y cuenta.
4. Cocina recibe únicamente las comidas y actualiza su preparación.
5. El cliente puede seguir consumiendo mientras la cuenta permanezca pendiente.
6. Caja visualiza la cuenta actualizada y el cajero confirma manualmente el pago.
7. El sistema registra la venta, cierra la atención y libera automáticamente la mesa.

