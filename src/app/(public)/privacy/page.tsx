
import { Heading } from "@/components/ui/heading";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl py-12 sm:py-16 md:py-20">
      <Heading
        title="Política de Privacidad"
        description="Última actualización: 18 de septiembre de 2025"
      />
      <div className="prose dark:prose-invert mt-8 max-w-none">
        <p>
          Su privacidad es importante para nosotros. Es política de E-Lean
          respetar su privacidad con respecto a cualquier información que podamos
          recopilar de usted a través de nuestro sitio web.
        </p>

        <h2>1. Información que recopilamos</h2>
        <p>
          Recopilamos información personal como su nombre y dirección de correo
          electrónico cuando se registra en una cuenta, se inscribe en un curso
          o se comunica con nosotros. También recopilamos datos sobre su uso de
          nuestra plataforma, como los cursos que ve y su progreso.
        </p>

        <h2>2. Cómo usamos su información</h2>
        <p>
          Utilizamos la información que recopilamos para operar y mantener
          nuestro Servicio, para procesar sus transacciones, para enviarle
          comunicaciones y para personalizar su experiencia de aprendizaje.
        </p>

        <h2>3. Seguridad de los datos</h2>
        <p>
          Nos esforzamos por utilizar medios comercialmente aceptables para
          proteger su información personal, pero recuerde que ningún método de
          transmisión por Internet o método de almacenamiento electrónico es
          100% seguro.
        </p>

        <h2>4. Cookies</h2>
        <p>
          Utilizamos cookies para recopilar información sobre usted y su
          actividad en nuestro sitio. Una cookie es un pequeño dato que nuestro
          sitio web almacena en su computadora y al que accede cada vez que lo
          visita, para que podamos entender cómo usa nuestro sitio.
        </p>
      </div>
    </div>
  );
}
