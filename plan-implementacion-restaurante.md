# Plan de implementación del sistema de restaurante

## 1. Objetivo

Implementar un sistema de atención presencial para restaurante en el que:

- El administrador configura manualmente los productos del menú disponible cada día.
- La fecha del menú diario se determina automáticamente usando la zona horaria de Perú.
- El mozo trabaja desde el módulo Comandas, donde visualiza las mesas enumeradas y registra lo solicitado por el cliente mediante un Drawer.
- El sistema crea y actualiza automáticamente la cuenta de la mesa.
- Cocina recibe únicamente las comidas que debe preparar.
- Caja visualiza en tiempo real todo el consumo y es el único módulo autorizado para registrar pagos.
- El cajero confirma manualmente si la cuenta fue pagada.
- Después del pago completo, el sistema cierra la atención y libera automáticamente la mesa.

Los pedidos online quedan fuera del alcance.

## Decisiones funcionales definitivas

- El módulo **Mesas** se utilizará para administrar las mesas: crear, editar número, editar capacidad, activar y poner fuera de servicio.
- El módulo **Comandas** será el punto de trabajo principal del mozo.
- En Comandas se mostrarán todas las mesas enumeradas con su estado y consumo actual.
- Al seleccionar una mesa disponible se abrirá un Drawer para indicar la cantidad de clientes y tomar el primer pedido.
- Al confirmar el primer pedido, el sistema abrirá automáticamente la mesa y creará la sesión, cuenta y comanda.
- Al seleccionar una mesa ocupada se abrirá el mismo Drawer con su consumo actual, total, comandas y opción para agregar nuevos productos.
- Cocina recibirá automáticamente solo los productos de la categoría Comidas.
- La cuenta será creada y actualizada automáticamente; el módulo Cuentas será únicamente de consulta.
- El pago se registrará exclusivamente desde Caja.
- El cajero confirmará manualmente el pago; después de esa confirmación el sistema cerrará automáticamente la cuenta, sesión y comandas, y liberará la mesa.

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
- Utilizar una composición estructurada o un código estable para cada modalidad; no depender del texto visible de su nombre.
- Utilizar realmente la configuración de `menu_modality_items` para validar la composición.
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
- La capacidad inicial de entradas y la capacidad inicial de postres se calcularán una sola vez a partir de la suma inicial de segundos.
- Después de calcular la capacidad inicial, segundos, entradas y postres conservarán saldos independientes.

### Actividades

- Reservar o descontar disponibilidad al confirmar el pedido, no al pagar.
- Validar la cantidad dentro de una transacción.
- Bloquear temporalmente los registros durante la validación para evitar ventas simultáneas de la última porción.
- Restaurar la disponibilidad cuando una cancelación válida lo requiera.
- Ocultar o bloquear productos agotados para nuevos pedidos.
- Mantener disponible la modalidad Solo segundo cuando ya no existan entradas o postres, siempre que queden segundos.
- Evitar volver a igualar las cantidades de todas las entradas y postres después de cada venta.
- Aplicar exactamente estos consumos:
  - Menú completo: resta un segundo, una entrada y un postre.
  - Solo segundo: resta únicamente un segundo.
  - Entrada más postre: resta una entrada y un postre, sin modificar segundos.

### Resultado esperado

Dos mesas no podrán consumir la misma última porción y la disponibilidad será consistente con los pedidos confirmados.

## 7. Fase 5: implementar mesas y sesiones de atención

### Objetivo

Preparar las mesas y sesiones que serán utilizadas desde el módulo Comandas.

### Actividades

- Mantener las mesas enumeradas y su capacidad.
- Mostrar los estados disponible, ocupada y fuera de servicio.
- Incorporar sesiones de mesa para registrar cada atención por separado.
- Permitir que Comandas consulte las mesas y sus sesiones activas.
- Al confirmar el primer pedido de una mesa disponible, crear automáticamente y dentro de una sola transacción:
  - La sesión de atención.
  - La cuenta pendiente.
  - La relación con el mozo.
  - El estado ocupado de la mesa.
  - La primera comanda y sus productos.
- Impedir que una mesa tenga más de una sesión abierta simultáneamente.
- Retirar la apertura manual de cuentas desde el módulo Cuentas.

### Resultado esperado

Una sola confirmación del mozo desde Comandas abrirá la mesa, registrará el primer pedido y mostrará inmediatamente la cuenta en Caja.

## 8. Fase 6: implementar Comandas con mesas y Drawer

### Objetivo

Permitir que el mozo abra la atención y registre uno o varios pedidos desde una vista de mesas enumeradas.

### Actividades

- Mostrar dentro de Comandas todas las mesas enumeradas.
- Mostrar en cada mesa:
  - Número.
  - Capacidad.
  - Estado.
  - Mozo responsable cuando esté ocupada.
  - Total consumido cuando esté ocupada.
- Diferenciar visualmente mesas disponibles, ocupadas y fuera de servicio.
- Al seleccionar una mesa disponible, abrir un Drawer con:
  - Número de mesa.
  - Cantidad de clientes.
  - Menú activo del día.
  - Modalidades del Menú Económico.
  - Platos Especiales.
  - Bebidas con stock.
  - Cantidades y observaciones.
- El botón principal del primer pedido será **Abrir mesa y confirmar pedido**.
- Al seleccionar una mesa ocupada, abrir el Drawer con:
  - Consumo actual.
  - Total acumulado.
  - Historial de comandas.
  - Estado de los productos enviados a Cocina.
  - Formulario para agregar consumo.
- El botón principal para una mesa ocupada será **Agregar consumo**.
- Mostrar solamente el menú activo de la fecha actual.
- Mostrar únicamente productos y modalidades activos y disponibles.
- Para comidas individuales, utilizar exclusivamente productos publicados en el menú de hoy.
- Para bebidas, utilizar productos activos con stock disponible.
- Utilizar el precio de `daily_menu_products` para los productos publicados ese día, no el precio general del catálogo.
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

El mozo podrá atender completamente desde Comandas sin seleccionar manualmente una cuenta; el cliente podrá seguir consumiendo y Caja verá siempre el total actualizado.

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
- Determinar el destino por la categoría del producto o por un campo explícito de preparación, no únicamente por `type`.
- Excluir de Cocina todos los ítems cancelados.
- Mostrar en Cocina:
  - Mesa.
  - Número de comanda.
  - Productos y componentes.
  - Cantidades.
  - Observaciones.
  - Hora del pedido.
  - Tiempo transcurrido.
- Permitir que Cocina cambie manualmente el estado a pendiente, en preparación y listo.
- Impedir saltos y retrocesos no autorizados entre estados.
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
- Eliminar también las rutas y controladores antiguos que permitan abrir, pagar o cerrar cuentas fuera del flujo autorizado.
- Retirar el pago antiguo desde el detalle de Cuentas para impedir que se omita la apertura de Caja.
- Guardar al completar el pago un detalle definitivo e inmutable de la venta con descripción, componentes, cantidad, precio y subtotal.
- Diferenciar claramente los estados pendiente, pagada y anulada.
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
- Generar un identificador interno único para cada pago, incluyendo pagos parciales de la misma cuenta.
- Guardar el monto recibido y el vuelto cuando el pago sea en efectivo.
- Calcular automáticamente total, pagado, saldo y vuelto.
- Mantener la cuenta pendiente si el cajero todavía no confirma el pago completo.
- Impedir pagos sin una caja abierta.
- Impedir que otros roles registren pagos.
- Implementar cierre manual de caja con efectivo contado y comparación contra el efectivo esperado.
- Incorporar movimientos manuales de Caja para ingresos, egresos, retiros y gastos menores.

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
- Retirar los endpoints y botones de eliminación física de comandas e ítems operativos.
- Guardar usuario, fecha, motivo y estado anterior.
- Si el producto todavía no fue preparado:
  - Cancelarlo.
  - Recalcular la cuenta.
  - Restaurar disponibilidad.
  - Informar a Cocina.
- Si ya está en preparación o fue entregado, exigir autorización del cajero o administrador.
- Registrar solicitudes de autorización y su resultado.
- Excluir inmediatamente los ítems cancelados de Cocina y del total de la cuenta.
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
- Unificar `product_stock_movements` y `stock_movements` en una sola fuente de historial.
- Descontar automáticamente las bebidas vendidas.
- Registrar el consumo de productos del menú.
- Registrar también los movimientos de porciones del Menú Económico y Platos Especiales.
- Restaurar cantidades por cancelaciones autorizadas.
- Evitar cantidades negativas.
- Guardar cantidad anterior, cantidad posterior, usuario, fecha y descripción de cada movimiento.
- Diferenciar claramente:
  - Producto inactivo en el catálogo.
  - Producto agotado en el menú del día.
  - Producto sin stock.
- No desactivar globalmente un producto solamente porque la disponibilidad de un día llegó a cero.
- Retirar la lógica que cambia automáticamente el estado general del producto cuando su stock llega a cero.

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
3. Comandas.
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

### Responsabilidad de Mesas

- Administración de número y capacidad.
- Activación o puesta fuera de servicio.
- Consulta administrativa del estado.
- No será el módulo principal para tomar pedidos.

### Responsabilidad de Comandas

- Mostrar las mesas enumeradas.
- Abrir el Drawer de atención.
- Abrir automáticamente una mesa al confirmar el primer pedido.
- Registrar consumos adicionales en mesas ocupadas.
- Consultar el seguimiento de las comandas de cada mesa.

## 18. Fase 16: migrar y corregir los datos existentes

### Objetivo

Conservar la información válida del repositorio durante la implementación.

### Actividades

- Crear nuevas migraciones para modificar estructuras ya utilizadas.
- No editar migraciones que ya hayan sido ejecutadas en entornos compartidos o producción.
- Completar el tipo de los productos del Menú Económico existentes.
- Unificar menús duplicados o inconsistentes.
- Retirar el módulo antiguo que permite crear fechas manualmente y conservar únicamente el Menú Diario con fecha automática.
- Corregir modalidades vinculadas a fechas incorrectas.
- Convertir las cuentas actuales al nuevo flujo.
- Conservar pagos e historial existentes.
- Corregir estados contradictorios entre mesa, cuenta, pedido y pago.
- Agregar restricciones para asegurar una sola cuenta por sesión y una sola sesión abierta por mesa.
- Evitar eliminar mesas que tengan historial; deberán desactivarse.
- Hacer que las restricciones esenciales funcionen tanto en MySQL como en PostgreSQL.
- Incorporar historial de estados y solicitudes de reapertura o autorización.
- Revisar y actualizar seeders y factories.

## 19. Fase 17: pruebas del proceso completo

### Objetivo

Verificar el flujo real del restaurante y no solamente cada tabla aislada.

### Escenarios mínimos

1. El sistema obtiene correctamente la fecha actual de Perú.
2. El menú de hoy se crea automáticamente como borrador al entrar al módulo.
3. El administrador configura manualmente sus productos, cantidades, precios y estado.
4. Un producto del Menú Económico requiere Segundo, Entrada o Postre.
5. Comandas muestra todas las mesas enumeradas.
6. El mozo selecciona una mesa disponible y se abre el Drawer.
7. El mozo confirma el primer pedido y el sistema abre automáticamente la mesa, sesión y cuenta.
8. El pedido utiliza el menú activo y el precio configurado para hoy.
9. La cuenta se actualiza automáticamente.
10. Cocina recibe solamente las comidas no canceladas.
11. Las bebidas permanecen en la cuenta y descuentan stock.
12. Menú completo descuenta segundo, entrada y postre.
13. Solo segundo no descuenta entrada ni postre.
14. Entrada más postre no descuenta segundos.
15. Se pueden agregar consumos adicionales desde el Drawer de la misma mesa.
16. Una cancelación válida restaura disponibilidad una sola vez.
17. Solo Caja puede registrar el pago.
18. Una cuenta no confirmada permanece pendiente.
19. Varios pagos parciales de una cuenta generan identificadores únicos.
20. Un pago parcial no libera la mesa.
21. El pago completo cierra pedidos, sesión y cuenta.
22. La mesa se libera después del pago completo.
23. Una venta pagada no puede modificarse.
24. Un nuevo consumo después del pago genera una cuenta nueva.
25. Los permisos impiden que cada rol ejecute acciones ajenas.
26. Dos solicitudes simultáneas no pueden consumir la misma última porción.
27. Dos solicitudes simultáneas no pueden cobrar dos veces la misma cuenta.

## 20. Criterio de finalización

La implementación estará completa cuando pueda ejecutarse sin intervención manual innecesaria este proceso:

1. El administrador ingresa al menú de la fecha actual y configura manualmente los productos disponibles.
2. El mozo entra a Comandas, visualiza las mesas enumeradas y selecciona una mesa.
3. El Drawer permite tomar el primer pedido o agregar consumo a una mesa ocupada.
4. Al confirmar el primer pedido, el sistema abre automáticamente la mesa y crea sesión, cuenta y comanda.
5. Cocina recibe únicamente las comidas y actualiza su preparación.
6. El cliente puede seguir consumiendo mientras la cuenta permanezca pendiente.
7. Caja visualiza la cuenta actualizada y el cajero confirma manualmente el pago.
8. El sistema registra la venta, cierra la atención y libera automáticamente la mesa.
