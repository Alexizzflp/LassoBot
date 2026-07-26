import { supabase } from '@/lib/supabase'
import { Materia, CategoriaEvaluacion, Nota } from '@/types/grades'

// --- CREAR ---
export async function crearMateria(nombre: string, esFundamental: boolean = false) {
    const { data, error } = await supabase
        .from('materias')
        .insert([{ nombre, es_fundamental: esFundamental }])
        .select()

    if (error) throw new Error(error.message)
    return data[0] as Materia
}

export async function crearCategoria(materiaId: string, nombre: string, pesoPorcentaje: number) {
    const { data, error } = await supabase
        .from('categorias_evaluacion')
        .insert([{ materia_id: materiaId, nombre, peso_porcentaje: pesoPorcentaje }])
        .select()

    if (error) throw new Error(error.message)
    return data[0] as CategoriaEvaluacion
}

export async function registrarNota(categoriaId: string, titulo: string, puntosObtenidos: number) {
    const { data, error } = await supabase
        .from('notas')
        .insert([{ categoria_id: categoriaId, titulo, puntos_obtenidos: puntosObtenidos }])
        .select()

    if (error) throw new Error(error.message)
    return data[0] as Nota
}

// --- LEER ---
export async function obtenerMaterias() {
    const { data, error } = await supabase.from('materias').select('*').order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return data as Materia[]
}

export async function obtenerDatosMateria(materiaId: string) {
    const { data: categorias, error: errCat } = await supabase
        .from('categorias_evaluacion')
        .select('*')
        .eq('materia_id', materiaId)

    if (errCat) throw new Error(errCat.message)

    const idsCategorias = categorias.map((c) => c.id)

    const { data: notas, error: errNotas } = await supabase
        .from('notas')
        .select('*')
        .in('categoria_id', idsCategorias.length > 0 ? idsCategorias : ['00000000-0000-0000-0000-000000000000'])

    if (errNotas) throw new Error(errNotas.message)

    return {
        categorias: categorias as CategoriaEvaluacion[],
        notas: notas as Nota[]
    }
}

// --- ELIMINAR Y ACTUALIZAR ---
export async function eliminarNota(notaId: string) {
    const { error } = await supabase.from('notas').delete().eq('id', notaId)
    if (error) throw new Error(error.message)
}

export async function actualizarNota(notaId: string, nuevosPuntos: number) {
    const { error } = await supabase.from('notas').update({ puntos_obtenidos: nuevosPuntos }).eq('id', notaId)
    if (error) throw new Error(error.message)
}

export async function eliminarMateria(materiaId: string) {
    const { error } = await supabase.from('materias').delete().eq('id', materiaId)
    if (error) throw new Error(error.message)
}

export async function eliminarCategoria(categoriaId: string) {
    // Primero elimina las notas de esta categoría
    const { error: errNotas } = await supabase.from('notas').delete().eq('categoria_id', categoriaId)
    if (errNotas) throw new Error(errNotas.message)
    // Luego elimina la categoría
    const { error } = await supabase.from('categorias_evaluacion').delete().eq('id', categoriaId)
    if (error) throw new Error(error.message)
}

export async function actualizarCategoria(categoriaId: string, nombre: string, pesoPorcentaje: number) {
    const { error } = await supabase
        .from('categorias_evaluacion')
        .update({ nombre, peso_porcentaje: pesoPorcentaje })
        .eq('id', categoriaId)
    if (error) throw new Error(error.message)
}
