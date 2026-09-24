package com.restaurante.api.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    public static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API REST Restaurante - Sistema POS & Gestión Gastronómica")
                        .version("1.0.0")
                        .description("### Documentación Interactiva de la API REST para la Gestión Integral de Restaurante\n\n" +
                                "Esta API permite administrar las operaciones clave del establecimiento:\n" +
                                "* **Autenticación & Autorización**: JWT Bearer Tokens con control de acceso basado en roles (`ADMINISTRADOR` y `CAJERO`).\n" +
                                "* **Gestión Operativa de Ventas**: Registro de Pedidos, Detalle de Comandas, Mesas, Clientes y Descuentos por Promociones.\n" +
                                "* **Módulo de Pagos & Facturación**: Cobros parciales y mixtos (Efectivo, Tarjeta, Transferencia/Nequi/Daviplata) con cálculo automático de devuelta/cambio.\n" +
                                "* **Gestión de Inventario & Recetas**: Descuento automático de stock de insumos al completar pedidos y registro de auditoría en Movimientos de Inventario.\n" +
                                "* **Módulo Analítico & Arqueo de Caja**: Reportes de cierre de caja por usuario/cajero, volumen de ventas, ranking de productos más vendidos y alertas de stock bajo o crítico.")
                        .contact(new Contact()
                                .name("Soporte Técnico API Restaurante")
                                .email("soporte@restaurante-api.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Ingrese el Token JWT obtenido del endpoint POST /api/v1/auth/login en el formato: Bearer <token>")));
    }
}
