'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import { jsPDF } from 'jspdf'


function ResultadoContenido(){


  const searchParams = useSearchParams()


  const alumnoId = searchParams.get('id')


  const [alumno,setAlumno] = useState<any>(null)

  const [resultado,setResultado] = useState<any>(null)

  const [errores,setErrores] = useState<any[]>([])

  const [cargando,setCargando] = useState(true)



  useEffect(()=>{

    cargarDatos()

  },[])



  async function cargarDatos(){


    const {data: alumnoData} = await supabase

      .from('alumnos')

      .select('*')

      .eq('id',alumnoId)

      .single()



    setAlumno(alumnoData)



    const {data: examenData,error} = await supabase

      .from('examenes_finales')

      .select('*')

      .eq('alumno_id',alumnoId)

      .order('fecha',{ascending:false})

      .limit(1)

      .single()



    if(error){

      console.log(error)

      alert('No fue posible cargar el resultado')

      return

    }



    setResultado(examenData)



    const {data: respuestasData,error:errorRespuestas}=await supabase

      .from('respuestas_examen')

      .select(`

        pregunta_id,

        respuesta_alumno,

        correcta,

        preguntas_examen(

          numero,

          enunciado,

          opcion_a,

          opcion_b,

          opcion_c,

          opcion_d,

          respuesta_correcta

        )

      `)

      .eq('examen_id',examenData.id)

      .eq('correcta',false)



    if(errorRespuestas){

      console.log(errorRespuestas)

    }


    setErrores(respuestasData || [])


    setCargando(false)


  }



  function descargarPDF(){


    const doc = new jsPDF()


    let y = 20


    doc.setTextColor(0,51,153)

    doc.setFontSize(18)

    doc.text(
      'CICLO BÁSICO COMÚN - UNIVERSIDAD DE BUENOS AIRES',
      20,
      y
    )


    y += 10


    doc.setFontSize(15)

    doc.text(
      'Análisis Matemático I - Cátedra : Vázquez Magnani',
      20,
      y
    )


    y += 10


    doc.setFontSize(16)

    doc.text(
      'RESULTADOS DEL EXAMEN FINAL',
      20,
      y
    )


    y += 15


    doc.setTextColor(0,0,0)

    doc.setFontSize(12)


    doc.text(
      `Alumno: ${alumno?.apellido}, ${alumno?.nombre}`,
      20,
      y
    )

    y += 8


    doc.text(
      `DNI: ${alumno?.dni}`,
      20,
      y
    )

    y += 8


    doc.text(
      `Tema: ${resultado?.tema}`,
      20,
      y
    )

    y += 8


    doc.text(
      `Nota obtenida: ${resultado?.nota}`,
      20,
      y
    )

    y += 8


    doc.text(
      `Correctas: ${resultado?.correctas}`,
      20,
      y
    )

    y += 8


    doc.text(
      `Incorrectas: ${resultado?.incorrectas}`,
      20,
      y
    )

    y += 8


    doc.text(
      `Sin responder: ${resultado?.sin_responder}`,
      20,
      y
    )


    y += 15

    errores.forEach((error:any)=>{


      const p = error.preguntas_examen


      let textoAlumno = ''


      switch(error.respuesta_alumno){

        case 'A':
          textoAlumno = p.opcion_a
          break

        case 'B':
          textoAlumno = p.opcion_b
          break

        case 'C':
          textoAlumno = p.opcion_c
          break

        case 'D':
          textoAlumno = p.opcion_d
          break

      }



      let textoCorrecto = ''


      switch(p.respuesta_correcta){

        case 'A':
          textoCorrecto = p.opcion_a
          break

        case 'B':
          textoCorrecto = p.opcion_b
          break

        case 'C':
          textoCorrecto = p.opcion_c
          break

        case 'D':
          textoCorrecto = p.opcion_d
          break

      }



      const lineasPregunta =
        doc.splitTextToSize(
          p.enunciado,
          165
        )


      const lineasAlumno =
        doc.splitTextToSize(
          textoAlumno,
          155
        )


      const lineasCorrecta =
        doc.splitTextToSize(
          textoCorrecto,
          155
        )



      const alto =
        35 +
        lineasPregunta.length * 6 +
        lineasAlumno.length * 6 +
        lineasCorrecta.length * 6



      if(y + alto > 280){

        doc.addPage()

        y = 20

      }



      doc.setDrawColor(180)


      doc.roundedRect(
        15,
        y - 5,
        180,
        alto,
        3,
        3
      )



      doc.setFontSize(13)

      doc.setTextColor(0,51,153)


      doc.text(
        `Pregunta ${p.numero}`,
        20,
        y + 5
      )



      y += 13



      doc.setFontSize(11)

      doc.setTextColor(0,0,0)



      doc.text(
        lineasPregunta,
        20,
        y
      )



      y += lineasPregunta.length * 6 + 4



      doc.setTextColor(220,38,38)



      doc.text(
        '✗ Respuesta del alumno',
        20,
        y
      )



      y += 6



      doc.text(
        lineasAlumno,
        28,
        y
      )



      y += lineasAlumno.length * 6 + 5



      doc.setTextColor(22,163,74)



      doc.text(
        '✓ Respuesta correcta',
        20,
        y
      )



      y += 6



      doc.text(
        lineasCorrecta,
        28,
        y
      )



      y += lineasCorrecta.length * 6 + 15


    })



    doc.save(

      `Revision_examen_${alumno?.dni}.pdf`

    )


  }



  if(cargando){


    return(

      <div style={container}>

        <h2>
          Cargando resultado...
        </h2>

      </div>

    )

  }



  return(

    <>

      <div style={container}>


        <div style={card}>


          <h1 style={titulo}>

            Resultado del Examen Final

          </h1>


          <hr style={{marginBottom:'25px'}}/>


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
            <b>Tema:</b> {resultado?.tema}
          </p>


          <hr style={{margin:'25px 0'}}/>

          <p>
            <b>Correctas:</b> {resultado?.correctas}
          </p>


          <p>
            <b>Incorrectas:</b> {resultado?.incorrectas}
          </p>


          <p>
            <b>Sin responder:</b> {resultado?.sin_responder}
          </p>



          <hr style={{margin:'25px 0'}}/>



          <p

            style={{

              fontSize:'28px',

              fontWeight:'bold',

              textAlign:'center'

            }}

          >

            Nota: {resultado?.nota}

          </p>



          <div

            style={{

              marginTop:'25px',

              padding:'18px',

              borderRadius:'10px',

              textAlign:'center',

              fontWeight:'bold',

              fontSize:'22px',

              color:'white',

              background:

              resultado?.aprobado

              ? '#16a34a'

              : '#dc2626'

            }}

          >

            {

              resultado?.aprobado

              ? 'APROBADO'

              : 'DESAPROBADO'

            }


          </div>



          {

            resultado?.nota === 2 && (


              <button

                onClick={descargarPDF}

                style={botonPdf}

              >

                📄 Descargar revisión del examen (PDF)


              </button>


            )

          }



        </div>


      </div>


    </>

  )


}



export default function ResultadoPage(){


  return(


    <Suspense

      fallback={

        <div style={container}>

          <h2>

            Cargando resultado...

          </h2>

        </div>

      }

    >

      <ResultadoContenido />


    </Suspense>


  )


}

const container = {

  display:'flex',

  justifyContent:'center',

  alignItems:'center',

  minHeight:'100vh',

  padding:'20px',

  background:'linear-gradient(135deg,#2563eb,#0f172a)'

}



const card = {

  width:'100%',

  maxWidth:'700px',

  background:'white',

  padding:'40px',

  borderRadius:'15px',

  boxShadow:'0 10px 30px rgba(0,0,0,0.25)'

}



const titulo = {

  textAlign:'center' as const,

  fontSize:'34px',

  marginBottom:'20px'

}



const botonPdf = {

  width:'100%',

  marginTop:'30px',

  padding:'16px',

  background:'#2563eb',

  color:'white',

  border:'none',

  borderRadius:'8px',

  fontSize:'18px',

  fontWeight:'bold' as const,

  cursor:'pointer'

}



// =============================
// ESTILOS DEL PDF
// =============================


const pdfTitulo = {

  textAlign:'center' as const,

  fontSize:'24px',

  marginBottom:'10px',

  fontWeight:'bold'

}



const pdfSubtitulo = {

  textAlign:'center' as const,

  fontSize:'18px',

  margin:'5px'

}



const preguntaPDF = {

  marginTop:'20px',

  padding:'20px',

  border:'2px solid #dc2626',

  borderRadius:'10px',

  background:'#fef2f2',

  pageBreakInside:'avoid' as const

}