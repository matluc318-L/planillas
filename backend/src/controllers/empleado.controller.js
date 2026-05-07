import { prisma } from "../prisma/client.js";

function parseDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function listEmpleados(req, res) {
  try {
    const q = req.query.q ? String(req.query.q).trim() : "";

    const where = q
      ? {
          OR: [
            { nombre: { contains: q } },
            { apellido: { contains: q } },
            { dni: { contains: q } },
            { correo: { contains: q } },
            { cargo: { contains: q } },
          ],
        }
      : {};

    const empleados = await prisma.empleado.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return res.json(empleados);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error al listar empleados" });
  }
}

export async function createEmpleado(req, res) {
  try {
    const {
      nombre,
      apellido,
      dni,
      correo,
      telefono,
      cargo,
      salario,
      fechaIngreso,
      activo = true,
    } = req.body;

    if (!nombre || !apellido || !dni || !correo || !telefono || !cargo) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const sal = Number(salario);
    if (Number.isNaN(sal) || sal < 0) {
      return res.status(400).json({ error: "Salario inválido" });
    }

    const fecha = parseDate(fechaIngreso);
    if (!fecha) {
      return res.status(400).json({ error: "Fecha de ingreso inválida" });
    }

    const empleado = await prisma.empleado.create({
      data: {
        nombre: String(nombre).trim(),
        apellido: String(apellido).trim(),
        dni: String(dni).trim(),
        correo: String(correo).trim(),
        telefono: String(telefono).trim(),
        cargo: String(cargo).trim(),
        salario: sal,
        fechaIngreso: fecha,
        activo: Boolean(activo),
      },
    });

    return res.status(201).json(empleado);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "DNI o correo ya registrado" });
    }
    console.error(err);
    return res.status(500).json({ error: "Error al crear empleado" });
  }
}

export async function updateEmpleado(req, res) {
  try {
    const { id } = req.params;
    const {
      nombre,
      apellido,
      dni,
      correo,
      telefono,
      cargo,
      salario,
      fechaIngreso,
      activo,
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: "ID requerido" });
    }

    const data = {};
    if (nombre !== undefined) data.nombre = String(nombre).trim();
    if (apellido !== undefined) data.apellido = String(apellido).trim();
    if (dni !== undefined) data.dni = String(dni).trim();
    if (correo !== undefined) data.correo = String(correo).trim();
    if (telefono !== undefined) data.telefono = String(telefono).trim();
    if (cargo !== undefined) data.cargo = String(cargo).trim();
    if (salario !== undefined) {
      const sal = Number(salario);
      if (Number.isNaN(sal) || sal < 0) {
        return res.status(400).json({ error: "Salario inválido" });
      }
      data.salario = sal;
    }
    if (fechaIngreso !== undefined) {
      const fecha = parseDate(fechaIngreso);
      if (!fecha) {
        return res.status(400).json({ error: "Fecha de ingreso inválida" });
      }
      data.fechaIngreso = fecha;
    }
    if (activo !== undefined) data.activo = Boolean(activo);

    const empleado = await prisma.empleado.update({
      where: { id },
      data,
    });

    return res.json(empleado);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }
    if (err.code === "P2002") {
      return res.status(409).json({ error: "DNI duplicado" });
    }
    console.error(err);
    return res.status(500).json({ error: "Error al actualizar empleado" });
  }
}

export async function deleteEmpleado(req, res) {
  try {
    const { id } = req.params;
    await prisma.empleado.delete({ where: { id } });
    return res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }
    console.error(err);
    return res.status(500).json({ error: "Error al eliminar empleado" });
  }
}
