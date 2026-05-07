import { prisma } from "../prisma/client.js";

function calcularSueldoNeto(salarioBase, descuento, bono) {
  const base = Number(salarioBase);
  const desc = Number(descuento) || 0;
  const bon = Number(bono) || 0;
  if (Number.isNaN(base) || base < 0) return null;
  if (Number.isNaN(desc) || desc < 0) return null;
  if (Number.isNaN(bon) || bon < 0) return null;
  const neto = base - desc + bon;
  return Math.round(neto * 100) / 100;
}

export async function listPlanillas(req, res) {
  try {
    const planillas = await prisma.planilla.findMany({
      include: {
        empleado: {
          select: { id: true, nombre: true, apellido: true, dni: true, cargo: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(planillas);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error al listar planillas" });
  }
}

export async function createPlanilla(req, res) {
  try {
    const { empleadoId, salarioBase, descuento = 0, bono = 0 } = req.body;

    if (!empleadoId) {
      return res.status(400).json({ error: "empleadoId es obligatorio" });
    }

    const sueldoFinal = calcularSueldoNeto(salarioBase, descuento, bono);
    if (sueldoFinal === null) {
      return res.status(400).json({ error: "Valores numéricos inválidos" });
    }

    const empleado = await prisma.empleado.findUnique({ where: { id: empleadoId } });
    if (!empleado) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }

    const planilla = await prisma.planilla.create({
      data: {
        empleadoId,
        salarioBase: Number(salarioBase),
        descuento: Number(descuento) || 0,
        bono: Number(bono) || 0,
        sueldoFinal,
      },
      include: {
        empleado: {
          select: { id: true, nombre: true, apellido: true, dni: true, cargo: true },
        },
      },
    });

    return res.status(201).json(planilla);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error al crear planilla" });
  }
}
