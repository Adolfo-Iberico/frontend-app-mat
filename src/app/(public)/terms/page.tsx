
import { Heading } from "@/components/ui/heading";

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl py-12 sm:py-16 md:py-20">
      <Heading
        title="Términos y Condiciones"
        description="Última actualización: 18 de septiembre de 2025"
      />
      <div className="prose dark:prose-invert mt-8 max-w-none">
        <h2>1. Aceptación de los Términos</h2>
        <p>
          Al acceder y utilizar nuestra plataforma de e-learning ("el Servicio"),
          usted acepta estar sujeto a estos Términos y Condiciones. Si no está
          de acuerdo con alguna parte de los términos, no podrá utilizar el
          Servicio.
        </p>

        <h2>2. Cuentas</h2>
        <p>
          Cuando crea una cuenta con nosotros, debe proporcionarnos información
          precisa, completa y actual en todo momento. El incumplimiento de esta
          cláusula constituye una violación de los Términos, que puede resultar
          en la terminación inmediata de su cuenta en nuestro Servicio.
        </p>

        <h2>3. Propiedad Intelectual</h2>
        <p>
          El Servicio y su contenido original, características y funcionalidad
          son y seguirán siendo propiedad exclusiva de E-Lean y sus
          licenciantes. El Servicio está protegido por derechos de autor,
          marcas registradas y otras leyes tanto de nuestro país como de países
          extranjeros.
        </p>

        <h2>4. Enlaces a Otros Sitios Web</h2>
        <p>
          Nuestro Servicio puede contener enlaces a sitios web o servicios de
          terceros que no son propiedad ni están controlados por E-Lean. No
          tenemos control ni asumimos ninguna responsabilidad por el contenido,
          las políticas de privacidad o las prácticas de los sitios web o
          servicios de terceros.
        </p>

        <h2>5. Terminación</h2>
        <p>
            Podemos rescindir o suspender su cuenta inmediatamente, sin previo aviso ni responsabilidad, por cualquier motivo, incluido, entre otros, si incumple los Términos.
        </p>
      </div>
    </div>
  );
}
