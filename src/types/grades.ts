export interface Materia {
    id?: string
    created_at?: string
    nombre: string
    es_fundamental: boolean // true = Requiere C (71), false = Requiere D (61)
}

export interface CategoriaEvaluacion {
    id?: string
    created_at?: string
    materia_id: string
    nombre: string
    peso_porcentaje: number
}

export interface Nota {
    id?: string
    created_at?: string
    categoria_id: string
    titulo: string
    puntos_obtenidos: number
}

export interface Pronostico {
    porcentaje_acumulado: number
    puntos_actuales: number
    porcentaje_restante: number
    nota_minima_aprobar: number  // 71 o 61 puntos según el tipo de materia
    para_pasar_materia: number | string // Lo que necesitas mínimo para APROBAR la clase
    para_A: number | string
    para_B: number | string
    para_C: number | string
    para_D: number | string
    estado: 'aprobada' | 'reprobada' | 'en_curso'
}