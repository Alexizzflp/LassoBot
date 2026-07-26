import { CategoriaEvaluacion, Nota, Pronostico } from '@/types/grades'

export function calcularPronostico(
    categorias: CategoriaEvaluacion[],
    notas: Nota[],
    esFundamental: boolean = false
): Pronostico {
    let puntosActuales = 0
    let porcentajeEvaluado = 0

    // 1. Calcular lo que llevas evaluado
    categorias.forEach((cat) => {
        const notasDeCategoria = notas.filter((n) => n.categoria_id === cat.id)

        if (notasDeCategoria.length > 0) {
            const sumaPuntos = notasDeCategoria.reduce((acc, n) => acc + Number(n.puntos_obtenidos), 0)
            const promedioCategoria = sumaPuntos / notasDeCategoria.length

            puntosActuales += (promedioCategoria * cat.peso_porcentaje) / 100
            porcentajeEvaluado += cat.peso_porcentaje
        }
    })

    const porcentajeRestante = 100 - porcentajeEvaluado

    // 2. Calculador de nota requerida
    const calcularNotaRequerida = (metaFinal: number) => {
        if (porcentajeRestante <= 0) return 'Semestre finalizado'

        const puntosFaltantes = metaFinal - puntosActuales
        if (puntosFaltantes <= 0) return '¡Ya asegurada!'

        const notaPromedioNecesaria = (puntosFaltantes / porcentajeRestante) * 100

        if (notaPromedioNecesaria > 100) return 'Imposible alcanzarla'
        return Math.ceil(notaPromedioNecesaria)
    }

    // REGLA UTP: Fundamental = Mínimo C (71 pts) | No Fundamental = Mínimo D (61 pts)
    const metaAprobar = esFundamental ? 71 : 61

    return {
        porcentaje_acumulado: porcentajeEvaluado,
        puntos_actuales: Number(puntosActuales.toFixed(2)),
        porcentaje_restante: porcentajeRestante,
        nota_minima_aprobar: metaAprobar,
        para_pasar_materia: calcularNotaRequerida(metaAprobar),
        para_A: calcularNotaRequerida(91),
        para_B: calcularNotaRequerida(81),
        para_C: calcularNotaRequerida(71),
        para_D: esFundamental ? 'Materia fundamental (Requiere C)' : calcularNotaRequerida(61),
    }
}