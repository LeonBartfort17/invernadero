package com.usco.invernadero.models.enums;

public enum Rol {
    ADMIN,      // Acceso total: crear, editar, eliminar, ver usuarios
    OPERADOR,   // Puede crear y eliminar zonas e invernaderos
    VIEWER      // Solo lectura: puede ver zonas e invernaderos
}
