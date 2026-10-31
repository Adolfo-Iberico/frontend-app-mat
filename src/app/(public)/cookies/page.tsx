
import { Heading } from "@/components/ui/heading";

export default function CookiesPage() {
  return (
    <div className="container mx-auto max-w-3xl py-12 sm:py-16 md:py-20">
      <Heading
        title="Política de Cookies"
        description="Última actualización: 18 de septiembre de 2025"
      />
      <div className="prose dark:prose-invert mt-8 max-w-none">
        <p>
          Esta Política de Cookies explica qué son las cookies y cómo las
          utilizamos en nuestra plataforma E-Lean.
        </p>

        <h2>¿Qué son las cookies?</h2>
        <p>
          Las cookies son pequeños archivos de texto que se colocan en su
          dispositivo para almacenar datos que un servidor web en el dominio que
          colocó la cookie puede recuperar. Utilizamos cookies y tecnologías
          similares para almacenar y respetar sus preferencias y configuraciones,
          permitirle iniciar sesión, combatir el fraude y analizar el
          rendimiento de nuestros servicios.
        </p>

        <h2>Cómo utilizamos las cookies</h2>
        <p>
          Utilizamos cookies para diversos fines, que incluyen:
        </p>
        <ul>
          <li>
            <strong>Autenticación:</strong> Utilizamos cookies para verificar su
            cuenta y determinar cuándo ha iniciado sesión, para que podamos
            facilitar su acceso a los Servicios.
          </li>
          <li>
            <strong>Seguridad:</strong> Utilizamos cookies para ayudarnos a
            mantener su cuenta y sus datos seguros.
          </li>
          <li>
            <strong>Análisis y rendimiento:</strong> Utilizamos cookies para
            comprender cómo se utilizan nuestros Servicios y para mejorarlos.
          </li>
        </ul>

        <h2>Cómo controlar las cookies</h2>
        <p>
          Puede controlar y/o eliminar las cookies como desee. Puede eliminar
          todas las cookies que ya están en su computadora y puede configurar la
          mayoría de los navegadores para evitar que se coloquen. Sin embargo, si
          hace esto, es posible que deba ajustar manualmente algunas preferencias
          cada vez que visite un sitio y que algunos servicios y funcionalidades
          no funcionen.
        </p>
      </div>
    </div>
  );
}
