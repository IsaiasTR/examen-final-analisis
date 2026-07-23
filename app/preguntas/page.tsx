'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function PreguntasPage() {

  const router = useRouter()
  const searchParams = useSearchParams()

  const alumnoId = searchParams.get('id')
  const tema = Number(searchParams.get('tema'))

  const [preguntas, setPreguntas] = useState<any[]>([])
  const [respuestas, setRespuestas] = useState<Record<number,string>>({})
  const [cargando, setCargando] = useState(true)

  useEffect(() => {

    cargarPreguntas()

  }, [])

  async function cargarPreguntas(){

    const { data, error } = await supabase

      .from('preguntas_examen')

      .select('*')

      .eq('tema', tema)

      .order('numero')

    if(error){

      console.log(error)

      alert('No fue posible cargar las preguntas.')

      return

    }

    setPreguntas(data || [])

    setCargando(false)

  }

  function responder(

    preguntaId:number,

    opcion:string

  ){

    setRespuestas(prev=>({

      ...prev,

      [preguntaId]: opcion

    }))

  }

  const respondidas = Object.keys(respuestas).length
  async function finalizarExamen(){

    if(!confirm('¿Está seguro de finalizar el examen?')){
      return
    }

    let correctas = 0
    let incorrectas = 0
    let sinResponder = 0

    const respuestasAlumno:any[] = []

    for(const pregunta of preguntas){

      const respuestaAlumno = respuestas[pregunta.id]

      if(!respuestaAlumno){

        sinResponder++

        respuestasAlumno.push({
          pregunta_id: pregunta.id,
          respuesta_alumno: null,
          correcta: false
        })

        continue

      }

      const esCorrecta =
        respuestaAlumno === pregunta.respuesta_correcta

      if(esCorrecta){
        correctas++
      }else{
        incorrectas++
      }

      respuestasAlumno.push({

        pregunta_id: pregunta.id,

        respuesta_alumno: respuestaAlumno,

        correcta: esCorrecta

      })

    }

// Cálculo de la nota

let nota = 2

// Solo aprueba si tiene al menos 8 correctas
// y además las correctas son mayores que las incorrectas

if (correctas >= 8 && correctas > incorrectas) {

  if (correctas === 20) {

    nota = 10

  } else if (correctas >= 18) {

    nota = 9

  } else if (correctas >= 16) {

    nota = 8

  } else if (correctas >= 14) {

    nota = 7

  } else if (correctas >= 12) {

    nota = 6

  } else if (correctas >= 10) {

    nota = 5

  } else {

    nota = 4

  }

}

const aprobado = nota >= 4
    // Guardar examen

    const { data: examenGuardado, error: errorExamen } = await supabase

      .from('examenes_finales')

      .insert({

        alumno_id: alumnoId,

        tema: tema,

        correctas: correctas,

        incorrectas: incorrectas,

        sin_responder: sinResponder,

        nota: nota,

        aprobado: aprobado,

        fecha: new Date().toISOString()

      })

      .select()

      .single()

    if(errorExamen){

      console.log("ERROR:", errorExamen)
      console.log("MENSAJE:", errorExamen.message)
      console.log("DETALLE:", errorExamen.details)

      alert(
      "Mensaje:\n" + errorExamen.message +
      "\n\nDetalle:\n" + errorExamen.details
     )


      return

    }

    const examenId = examenGuardado.id

    // Asociar cada respuesta con el examen

    const respuestasParaGuardar = respuestasAlumno.map((r)=>({

      examen_id: examenId,

      pregunta_id: r.pregunta_id,

      respuesta_alumno: r.respuesta_alumno,

      correcta: r.correcta

    }))

    const { error: errorRespuestas } = await supabase

      .from('respuestas_examen')

      .insert(respuestasParaGuardar)

    if(errorRespuestas){

      console.log(errorRespuestas)

      alert('No fue posible guardar las respuestas.')

      return

    }

    router.push(`/resultado?id=${alumnoId}`)

  }

  if(cargando){

    return(

      <div style={container}>

        <h2>Cargando preguntas...</h2>

      </div>

    )

  }
  return(

    <div style={container}>

      <div style={cardPrincipal}>

        <h1 style={titulo}>
          Examen Final de Análisis Matemático I
        </h1>

        <h2 style={subtitulo}>
          Tema {tema}
        </h2>

        <div style={contador}>

          Respondidas: {respondidas} / {preguntas.length}

        </div>

        {

          preguntas.map((pregunta:any)=>(

            <div
              key={pregunta.id}
              style={cardPregunta}
            >

              <h3>

                Pregunta {pregunta.numero}

              </h3>

              <p style={textoPregunta}>

                {pregunta.pregunta}

              </p>

              {

                [

                  {letra:'A',texto:pregunta.opcion_a},

                  {letra:'B',texto:pregunta.opcion_b},

                  {letra:'C',texto:pregunta.opcion_c},

                  {letra:'D',texto:pregunta.opcion_d}

                ].map((opcion)=>(

                  <label

                    key={opcion.letra}

                    style={opcionStyle}

                  >

                    <input

                      type="radio"

                      name={`pregunta-${pregunta.id}`}

                      checked={

                        respuestas[pregunta.id]===opcion.letra

                      }

                      onChange={()=>responder(

                        pregunta.id,

                        opcion.letra

                      )}

                    />

                    <span style={{marginLeft:'10px'}}>

                      <b>{opcion.letra})</b>{' '}

                      {opcion.texto}

                    </span>

                  </label>

                ))

              }

            </div>

          ))

        }

        <button

          onClick={finalizarExamen}

          style={botonFinalizar}

        >

          Finalizar examen

        </button>

      </div>

    </div>

  )

}
const container = {
  display:'flex',
  justifyContent:'center',
  alignItems:'flex-start',
  minHeight:'100vh',
  padding:'30px',
  background:'linear-gradient(135deg,#2563eb,#0f172a)'
}

const cardPrincipal = {
  width:'100%',
  maxWidth:'950px',
  background:'white',
  borderRadius:'15px',
  padding:'35px',
  boxShadow:'0 12px 30px rgba(0,0,0,0.25)'
}

const titulo = {
  textAlign:'center' as const,
  fontSize:'34px',
  marginBottom:'10px'
}

const subtitulo = {
  textAlign:'center' as const,
  fontSize:'24px',
  color:'#475569',
  marginBottom:'25px'
}

const contador = {
  position:'sticky' as const,
  top:'10px',
  background:'#2563eb',
  color:'white',
  padding:'12px',
  borderRadius:'8px',
  textAlign:'center' as const,
  fontWeight:'bold' as const,
  marginBottom:'25px',
  zIndex:100
}

const cardPregunta = {
  background:'#f8fafc',
  border:'1px solid #cbd5e1',
  borderRadius:'10px',
  padding:'20px',
  marginBottom:'20px'
}

const textoPregunta = {
  fontSize:'17px',
  lineHeight:'1.6',
  marginTop:'10px',
  marginBottom:'18px'
}

const opcionStyle = {
  display:'block',
  padding:'10px',
  marginBottom:'8px',
  borderRadius:'6px',
  cursor:'pointer'
}

const botonFinalizar = {
  width:'100%',
  padding:'16px',
  marginTop:'30px',
  background:'#16a34a',
  color:'white',
  border:'none',
  borderRadius:'8px',
  fontSize:'20px',
  fontWeight:'bold' as const,
  cursor:'pointer'
}
