'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'

export default function Home() {

  const router = useRouter()

  const [dni, setDni] = useState('')
  const [alumno, setAlumno] = useState<any>(null)
  const [comision, setComision] = useState<any>(null)
  const [docente, setDocente] = useState<any>(null)
  const [nota, setNota] = useState<any>(null)
  const [habilitado, setHabilitado] = useState(false)

  const continuar = async () => {

    if(dni.trim() === ''){
      alert('Ingrese su DNI')
      return
    }

    setAlumno(null)
    setComision(null)
    setDocente(null)
    setNota(null)
    setHabilitado(false)

    // Buscar alumno
    const { data: alumnoData, error } = await supabase
      .from('alumnos')
      .select('*')
      .eq('dni', dni)
      .single()

    if(error || !alumnoData){
      alert('No existe un alumno con ese DNI')
      return
    }


// Verificar si ya rindió el examen final

const { data: examenExistente, error: errorExamen } = await supabase
  .from('examenes_finales')
  .select('id, nota')
  .eq('alumno_id', alumnoData.id)
  .maybeSingle()


if(errorExamen){

  console.log(errorExamen)

  alert('No se pudo verificar el estado del examen.')
  return

}


if(examenExistente){

  alert(
    'Usted ya rindió el examen final.\n\nNo puede volver a ingresar.'
  )

  setAlumno(null)
  setComision(null)
  setDocente(null)
  setNota(null)
  setHabilitado(false)

  return

}

setAlumno(alumnoData)

    // Buscar comisión
    const { data: comisionData } = await supabase
      .from('comisiones')
      .select('*')
      .eq('id', alumnoData.comision_id)
      .single()

    if(comisionData){

      setComision(comisionData)

      // Buscar docente
      const { data: docenteData } = await supabase
        .from('docentes')
        .select('*')
        .eq('id', comisionData.docente_id)
        .single()

      if(docenteData){
        setDocente(docenteData)
      }

    }

    // Buscar notas
    const { data: notaData } = await supabase
      .from('notas')
      .select('*')
      .eq('alumno_id', alumnoData.id)
      .single()

    if(notaData){

      setNota(notaData)

      const p1 = Number(notaData.parcial1)
      const p2 = Number(notaData.parcial2)

      if(!isNaN(p1) && !isNaN(p2)){

        const suma = p1 + p2

        if(suma >= 8 && suma <= 12){
          setHabilitado(true)
        }

      }

    }

  }

  const comenzarExamen = () => {

    router.push(`/examen?id=${alumno.id}`)

  }

  return(
    <div style={container}>

      <div style={cardPrincipal}>

        <h1 style={titulo}>
          Examen Final de Análisis Matemático I
        </h1>

        <h2 style={subtitulo}>
          <strong>Cátedra: Vázquez Magnani</strong>
        </h2>

        <p style={label}>
          Ingrese su DNI
        </p>

        <input
          type="text"
          placeholder="DNI"
          value={dni}
          onChange={(e)=>setDni(e.target.value)}
          style={input}
        />

        <button
          onClick={continuar}
          style={boton}
        >
          Continuar
        </button>

        {alumno && (

          <div style={card}>

            <p>
              <b>Apellido:</b> {alumno.apellido}
            </p>

            <p>
              <b>Nombre:</b> {alumno.nombre}
            </p>

            <p>
              <b>Comisión:</b> {comision?.nombre}
            </p>

            <p>
              <b>Docente:</b>{' '}
              {docente
                ? `${docente.apellido}, ${docente.nombre}`
                : '-'}
            </p>

            <hr style={{margin:'20px 0'}} />

            <p>
              <b>Primer Parcial:</b>{' '}
              {nota?.parcial1 ?? '-'}
            </p>

            <p>
              <b>Segundo Parcial:</b>{' '}
              {nota?.parcial2 ?? '-'}
            </p>

            <p>
              <b>Suma:</b>{' '}

              {

                nota &&
                !isNaN(Number(nota.parcial1)) &&
                !isNaN(Number(nota.parcial2))

                ?

                Number(nota.parcial1) +
                Number(nota.parcial2)

                :

                '-'

              }

            </p>

            {

              habilitado

              ?

              <button
                onClick={comenzarExamen}
                style={{
                  ...boton,
                  marginTop:'25px',
                  background:'#16a34a'
                }}
              >
                Comenzar examen
              </button>

              :

              <div
                style={{
                  marginTop:'25px',
                  padding:'15px',
                  background:'#fee2e2',
                  border:'1px solid #ef4444',
                  borderRadius:'8px',
                  color:'#991b1b',
                  fontWeight:'bold'
                }}
              >
                Usted no reúne las condiciones para rendir el examen final.
              </div>

            }

          </div>

        )}

      </div>

    </div>

  )

}
const container = {
  display:'flex',
  justifyContent:'center',
  alignItems:'center',
  minHeight:'100vh',
  padding:'20px',
  background:'linear-gradient(135deg,#2563eb,#0f172a)',
  boxSizing:'border-box' as const
}

const cardPrincipal = {
  width:'100%',
  maxWidth:'700px',
  background:'white',
  padding:'40px',
  borderRadius:'15px',
  boxShadow:'0 10px 35px rgba(0,0,0,0.25)',
  boxSizing:'border-box' as const
}

const titulo = {
  fontSize:'34px',
  textAlign:'center' as const,
  marginBottom:'10px',
  color:'#0f172a'
}

const subtitulo = {
  textAlign:'center' as const,
  marginBottom:'35px',
  fontSize:'24px',
  color:'#1e293b'
}

const label = {
  fontWeight:'bold' as const,
  marginBottom:'8px',
  fontSize:'17px',
  color:'#334155'
}

const input = {
  width:'100%',
  padding:'14px',
  fontSize:'18px',
  border:'1px solid #cbd5e1',
  borderRadius:'8px',
  marginBottom:'20px',
  boxSizing:'border-box' as const,
  outline:'none'
}

const boton = {
  width:'100%',
  padding:'14px',
  background:'#2563eb',
  color:'white',
  border:'none',
  borderRadius:'8px',
  fontSize:'18px',
  fontWeight:'bold' as const,
  cursor:'pointer'
}

const card = {
  marginTop:'30px',
  padding:'25px',
  background:'#f8fafc',
  borderRadius:'10px',
  border:'1px solid #cbd5e1',
  lineHeight:'2',
  fontSize:'17px'
}