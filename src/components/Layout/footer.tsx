
'use client';

import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/logo";
import { useAuth } from "@/hooks/use-auth";

export function Footer() {
  const { user } = useAuth();

  return (
    // Fondo propio y aislado (no hereda opacidades de padres)
    <div className="relative isolate w-full overflow-hidden bg-blue-800 text-white">
      {/* Gradiente azul profundo */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-sky-700 via-blue-700 to-indigo-800" />
      {/* Glows sutiles (decorativos) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-30 bg-sky-400/40" />
        <div className="absolute -bottom-20 -right-16 h-80 w-80 rounded-full blur-3xl opacity-25 bg-indigo-500/40" />
      </div>
      {/* Hairline superior */}
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-white/20" />

      <footer className="mx-auto max-w-7xl px-6 sm:px-8 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Marca */}
          <div className="md:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
              <Logo className="h-7 w-7" />
              <span className="tracking-tight">Aulamate</span>
            </Link>
            <p className="mt-4 max-w-md text-sm text-white/90">
              Plataforma de aprendizaje de matemáticas por grado escolar.
              Lecciones, evaluaciones en línea y seguimiento de tu progreso.
            </p>
          </div>

          {/* Explorar */}
          <nav>
            <h3 className="text-sm font-semibold uppercase tracking-wide">Explorar</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link className="hover:text-white/90 text-white" href="/courses">Lecciones</Link></li>
              <li><Link className="hover:text-white/90 text-white" href="/paths">Unidades Temáticas</Link></li>
              <li><Link className="hover:text-white/90 text-white" href="/news">Novedades</Link></li>
              {user && (
                <>
                  <li><Link className="hover:text-white/90 text-white" href="/my-courses">Mis Lecciones</Link></li>
                  <li><Link className="hover:text-white/90 text-white" href="/profile">Mi Perfil</Link></li>
                </>
              )}
            </ul>
          </nav>

          {/* Nosotros */}
          <nav>
            <h3 className="text-sm font-semibold uppercase tracking-wide">Nosotros</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link className="hover:text-white/90 text-white" href="/about">Sobre Aulamate</Link></li>
            </ul>
          </nav>

          {/* Contacto */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide">Contacto</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={16} />
                <a className="hover:underline" href="mailto:informes@e-leanstudio.com">
                  informes@e-leanstudio.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} />
                <a className="hover:underline" href="tel:957955643">
                  957 955 643
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} />
                <span>Perú</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-16 h-px w-full bg-white/20" />

        {/* Legal */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 text-xs text-white/90 md:flex-row">
          <p>© {new Date().getFullYear()} Aulamate. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:underline">Términos</Link>
            <span className="text-white/40">•</span>
            <Link href="/privacy" className="hover:underline">Privacidad</Link>
            <span className="text-white/40">•</span>
            <Link href="/cookies" className="hover:underline">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
