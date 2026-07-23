'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function ExamenPage() {

  const searchParams = useSearchParams()
  const router = useRouter()

  const id = searchParams.get('id')

  const [alumno, setAlumno] = useState<any>(null)
  const [comision, setComision] = useState<any>(null)

  const [tema, setTema] = useState<number | null>(null)

  useEffect(() => {

    cargarAlumno()

  }, [])

  async function cargarAlumno(){

    if(!id) return

    const { data: alumnoData } = await supabase
      .from('alumnos')
      .select('*')
      .eq('id', id)
      .single()


    if(!alumnoData){

     alert('Alumno no encontrado')

     router.push('/')

     return

    }


   // Verificar si el alumno ya rindió

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
      'Usted ya rindió el examen final.'
     )

     router.push('/')

     return

  }


  setAlumno(alumnoData)


   const { data: comisionData } = await supabase
     .from('comisiones')
     .select('*')
     .eq('id', alumnoData.comision_id)
     .single()


   if(comisionData){

     setComision(comisionData)

  }

}

  function comenzar(){

    if(!tema){
      alert('Seleccione un tema')
      return
    }

    router.push(
      `/preguntas?id=${alumno.id}&tema=${tema}`
    )

  }
  return (

    <div style={container}>

      <div style={cardPrincipal}>

        <h1 style={titulo}>
          Examen Final de Análisis Matemático I
        </h1>

        <h2 style={subtitulo}>
          Cátedra: <strong>Vázquez Magnani</strong>
        </h2>

        <div style={cardAlumno}>

          <p>
            <b>DNI:</b> {alumno?.dni}
          </p>

          <p>
            <b>Apellido:</b> {alumno?.apellido}
          </p>

          <p>
            <b>Nombre:</b> {alumno?.nombre}
          </p>

          <p>
            <b>Comisión:</b> {comision?.nombre}
          </p>

        </div>

        <h2
          style={{
            marginTop:'35px',
            textAlign:'center'
          }}
        >
          Seleccione el tema
        </h2>

        <div style={contenedorTemas}>

          <div

            onClick={()=>setTema(1)}

            style={{

              ...temaCard,

              border:
                tema===1
                ? '4px solid #2563eb'
                : '2px solid #cbd5e1'

            }}

          >

            <h2>Tema 1</h2>

          </div>

          <div

            onClick={()=>setTema(2)}

            style={{

              ...temaCard,

              border:
                tema===2
                ? '4px solid #16a34a'
                : '2px solid #cbd5e1'

            }}

          >

            <h2>Tema 2</h2>

          </div>

        </div>

        <button

          onClick={comenzar}

          style={boton}

        >

          Comenzar examen

        </button>

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
  background:'linear-gradient(135deg,#1d4ed8,#0f172a)',
  boxSizing:'border-box' as const
}

const cardPrincipal = {
  width:'100%',
  maxWidth:'750px',
  background:'white',
  borderRadius:'16px',
  padding:'40px',
  boxShadow:'0 15px 40px rgba(0,0,0,0.25)',
  boxSizing:'border-box' as const
}

const titulo = {
  textAlign:'center' as const,
  fontSize:'34px',
  marginBottom:'10px',
  color:'#0f172a'
}

const subtitulo = {
  textAlign:'center' as const,
  fontSize:'23px',
  marginBottom:'35px',
  color:'#334155'
}

const cardAlumno = {
  background:'#f8fafc',
  border:'1px solid #cbd5e1',
  borderRadius:'10px',
  padding:'25px',
  lineHeight:'2'
}

const contenedorTemas = {
  display:'flex',
  justifyContent:'space-between',
  gap:'20px',
  marginTop:'30px',
  marginBottom:'35px',
  flexWrap:'wrap' as const
}

const temaCard = {
  flex:'1',
  minWidth:'220px',
  textAlign:'center' as const,
  padding:'35px',
  borderRadius:'12px',
  background:'#ffffff',
  cursor:'pointer',
  transition:'0.3s',
  boxShadow:'0 4px 10px rgba(0,0,0,0.08)'
}

const boton = {
  width:'100%',
  padding:'16px',
  background:'#2563eb',
  color:'white',
  border:'none',
  borderRadius:'10px',
  fontSize:'20px',
  fontWeight:'bold' as const,
  cursor:'pointer'
}