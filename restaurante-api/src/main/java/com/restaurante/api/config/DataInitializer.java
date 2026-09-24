package com.restaurante.api.config;

import java.math.BigDecimal;
import java.util.Optional;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.restaurante.api.entity.Categoria;
import com.restaurante.api.entity.Empleados;
import com.restaurante.api.entity.EstadoDelPedido;
import com.restaurante.api.entity.EstadoDelProducto;
import com.restaurante.api.entity.Roles;
import com.restaurante.api.entity.TipoDeMovimiento;
import com.restaurante.api.entity.TipoDePago;
import com.restaurante.api.entity.TipoDePedidos;
import com.restaurante.api.entity.UnidadDeMedida;
import com.restaurante.api.entity.Usuarios;
import com.restaurante.api.repository.CategoriaRepository;
import com.restaurante.api.repository.EmpleadosRepository;
import com.restaurante.api.repository.EstadoDelPedidoRepository;
import com.restaurante.api.repository.EstadoDelProductoRepository;
import com.restaurante.api.repository.RolesRepository;
import com.restaurante.api.repository.TipoDeMovimientoRepository;
import com.restaurante.api.repository.TipoDePagoRepository;
import com.restaurante.api.repository.TipoDePedidosRepository;
import com.restaurante.api.repository.UnidadDeMedidaRepository;
import com.restaurante.api.repository.UsuariosRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private final EstadoDelProductoRepository estadoDelProductoRepository;
    private final EstadoDelPedidoRepository estadoDelPedidoRepository;
    private final UnidadDeMedidaRepository unidadDeMedidaRepository;
    private final TipoDePagoRepository tipoDePagoRepository;
    private final TipoDePedidosRepository tipoDePedidosRepository;
    private final TipoDeMovimientoRepository tipoDeMovimientoRepository;
    private final RolesRepository rolesRepository;
    private final CategoriaRepository categoriaRepository;
    private final EmpleadosRepository empleadosRepository;
    private final UsuariosRepository usuariosRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    public DataInitializer(
            EstadoDelProductoRepository estadoDelProductoRepository,
            EstadoDelPedidoRepository estadoDelPedidoRepository,
            UnidadDeMedidaRepository unidadDeMedidaRepository,
            TipoDePagoRepository tipoDePagoRepository,
            TipoDePedidosRepository tipoDePedidosRepository,
            TipoDeMovimientoRepository tipoDeMovimientoRepository,
            RolesRepository rolesRepository,
            CategoriaRepository categoriaRepository,
            EmpleadosRepository empleadosRepository,
            UsuariosRepository usuariosRepository,
            PasswordEncoder passwordEncoder,
            JdbcTemplate jdbcTemplate) {
        this.estadoDelProductoRepository = estadoDelProductoRepository;
        this.estadoDelPedidoRepository = estadoDelPedidoRepository;
        this.unidadDeMedidaRepository = unidadDeMedidaRepository;
        this.tipoDePagoRepository = tipoDePagoRepository;
        this.tipoDePedidosRepository = tipoDePedidosRepository;
        this.tipoDeMovimientoRepository = tipoDeMovimientoRepository;
        this.rolesRepository = rolesRepository;
        this.categoriaRepository = categoriaRepository;
        this.empleadosRepository = empleadosRepository;
        this.usuariosRepository = usuariosRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        // Migraciones de esquema seguras
        try {
            jdbcTemplate.execute("ALTER TABLE productos DROP CONSTRAINT IF EXISTS ukmlgw7js72hh2xtd4mvpdqfsbe");
            jdbcTemplate.execute("ALTER TABLE productos DROP CONSTRAINT IF EXISTS productos_nombre_key");
            jdbcTemplate.execute("ALTER TABLE empleados ADD COLUMN IF NOT EXISTS cargo VARCHAR(100)");
        } catch (Exception ignored) {
        }

        // Estados de Producto
        if (estadoDelProductoRepository.count() == 0) {
            estadoDelProductoRepository.save(new EstadoDelProducto(null, "Disponible", "Producto disponible para la venta"));
            estadoDelProductoRepository.save(new EstadoDelProducto(null, "Agotado", "Producto agotado temporalmente"));
            estadoDelProductoRepository.save(new EstadoDelProducto(null, "Inactivo", "Producto deshabilitado del menú"));
        }

        // Estados de Pedido
        if (estadoDelPedidoRepository.count() == 0) {
            estadoDelPedidoRepository.save(new EstadoDelPedido(null, "Pendiente", "Pedido recibido en cocina"));
            estadoDelPedidoRepository.save(new EstadoDelPedido(null, "En Preparación", "El pedido se está preparando"));
            estadoDelPedidoRepository.save(new EstadoDelPedido(null, "Listo", "Pedido listo para servir o entregar"));
            estadoDelPedidoRepository.save(new EstadoDelPedido(null, "Completado", "Pedido entregado y pagado"));
            estadoDelPedidoRepository.save(new EstadoDelPedido(null, "Cancelado", "Pedido cancelado"));
        }

        // Unidades de Medida Separadas por Categoría de Conversión (PESO, LIQUIDO, UNIDAD)
        if (unidadDeMedidaRepository.count() == 0) {
            unidadDeMedidaRepository.save(new UnidadDeMedida(null, "Gramo", "g", BigDecimal.ONE, "PESO"));
            unidadDeMedidaRepository.save(new UnidadDeMedida(null, "Kilogramo", "kg", new BigDecimal("1000"), "PESO"));
            unidadDeMedidaRepository.save(new UnidadDeMedida(null, "Mililitro", "ml", BigDecimal.ONE, "LIQUIDO"));
            unidadDeMedidaRepository.save(new UnidadDeMedida(null, "Litro", "l", new BigDecimal("1000"), "LIQUIDO"));
            unidadDeMedidaRepository.save(new UnidadDeMedida(null, "Unidad", "und", BigDecimal.ONE, "UNIDAD"));
        }

        // Tipos de Pago
        if (tipoDePagoRepository.count() == 0) {
            tipoDePagoRepository.save(new TipoDePago(null, "Efectivo", "Pago en efectivo"));
            tipoDePagoRepository.save(new TipoDePago(null, "Tarjeta", "Pago con tarjeta de crédito o débito"));
            tipoDePagoRepository.save(new TipoDePago(null, "Transferencia", "Pago por Nequi, Daviplata o bancario"));
        }

        // Tipos de Pedidos
        if (tipoDePedidosRepository.count() == 0) {
            tipoDePedidosRepository.save(new TipoDePedidos(null, "Mesa", "Consumo en el restaurante"));
            tipoDePedidosRepository.save(new TipoDePedidos(null, "Para Llevar", "Pedido empacado para llevar"));
            tipoDePedidosRepository.save(new TipoDePedidos(null, "Domicilio", "Pedido para entrega a domicilio"));
        }

        // Tipos de Movimiento
        if (tipoDeMovimientoRepository.count() == 0) {
            tipoDeMovimientoRepository.save(new TipoDeMovimiento(null, "Entrada", "Entrada de insumos al inventario"));
            tipoDeMovimientoRepository.save(new TipoDeMovimiento(null, "Salida", "Salida por consumo o venta"));
            tipoDeMovimientoRepository.save(new TipoDeMovimiento(null, "Ajuste", "Ajuste por merma o desperdicio"));
        }

        // Roles Completos del Restaurante
        ensureRole("ADMINISTRADOR", "Acceso total al sistema (Administración, Inventario y Ventas/Caja)");
        ensureRole("CAJERO", "Gestión de pedidos, facturación, cobros, mesas y clientes");
        ensureRole("MESERO", "Gestión de mesas y toma de pedidos");
        ensureRole("COCINERO", "Visualización y preparación de comandas en cocina");
        ensureRole("DOMICILIARIO", "Reparto y entrega de pedidos a domicilio");

        Roles adminRole = rolesRepository.findAll().stream()
                .filter(r -> "ADMINISTRADOR".equalsIgnoreCase(r.getNombre()))
                .findFirst()
                .orElse(null);

        // Categorías iniciales con Combos & Promociones
        if (categoriaRepository.count() == 0) {
            categoriaRepository.save(new Categoria(null, "Entradas", "Platos de entrada y aperitivos", true));
            categoriaRepository.save(new Categoria(null, "Platos Fuertes", "Platos principales del menú", true));
            categoriaRepository.save(new Categoria(null, "Combos & Promociones", "Combos familiares, combos especiales y promociones", true));
            categoriaRepository.save(new Categoria(null, "Bebidas", "Bebidas frías y calientes", true));
            categoriaRepository.save(new Categoria(null, "Postres", "Postres y dulces", true));
        }

        // Empleados y Usuarios Iniciales
        if (adminRole != null) {
            Optional<Usuarios> existingAdmin = usuariosRepository.findByCodigoEmpleado("Ander-1043");
            if (existingAdmin.isEmpty()) {
                Empleados empAdmin = new Empleados(null, "Anderson", "Giraldo", "anderson@samaesfood.com", "3000000000", "1043000001", "ADMINISTRADOR", true);
                empAdmin = empleadosRepository.save(empAdmin);

                Usuarios userAdmin = new Usuarios(null, passwordEncoder.encode("Ander-1043"), "Ander-1043", empAdmin, adminRole);
                usuariosRepository.save(userAdmin);
            } else {
                Usuarios admin = existingAdmin.get();
                admin.setPassword(passwordEncoder.encode("Ander-1043"));
                if (admin.getRoles() == null) {
                    admin.setRoles(adminRole);
                }
                usuariosRepository.save(admin);
            }
        }
    }

    private void ensureRole(String nombre, String descripcion) {
        boolean exists = rolesRepository.findAll().stream()
                .anyMatch(r -> nombre.equalsIgnoreCase(r.getNombre()));
        if (!exists) {
            rolesRepository.save(new Roles(null, nombre, descripcion));
        }
    }
}
