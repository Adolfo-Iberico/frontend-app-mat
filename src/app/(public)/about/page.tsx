
import { Heading } from "@/components/ui/heading";
import { BookOpenCheck, Lightbulb, Sparkles, Target, Users } from "lucide-react";

const pillars = [
  {
    title: 'Misión',
    description: 'Acompañar a estudiantes y familias en un aprendizaje matemático claro, cercano y progresivo, con herramientas que construyen confianza desde lo básico hasta lo avanzado.',
    icon: Target,
  },
  {
    title: 'Visión',
    description: 'Ser una referencia educativa en matemáticas, ayudando a cada persona a desarrollar pensamiento lógico, seguridad y autonomía en su proceso de aprendizaje.',
    icon: Lightbulb,
  },
  {
    title: 'Enfoque',
    description: 'Combinamos explicación sencilla, práctica constante y acompañamiento docente para que cada tema se entienda y se pueda aplicar con confianza.',
    icon: BookOpenCheck,
  },
  {
    title: 'Comunidad',
    description: 'Creemos en un aprendizaje con apoyo real: estudiantes, docentes y familias trabajando juntos para avanzar paso a paso.',
    icon: Users,
  },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-5xl py-12 sm:py-16 md:py-20">
      <Heading
        title="Sobre E-Lean"
        description="Una propuesta educativa pensada para aprender matemáticas con claridad, acompañamiento y progreso real."
      />

      <div className="mt-8 rounded-2xl border bg-card/60 p-6 md:p-8">
        <p className="text-base leading-7 text-muted-foreground md:text-lg">
          En E-Lean creemos que aprender matemáticas no debe ser frustrante ni abstracto. Nuestra idea es acompañar a cada estudiante desde los conocimientos básicos, ayudándolo a fortalecer su razonamiento y a avanzar con seguridad hacia niveles más desafiantes.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {pillars.map(({ title, description, icon: Icon }) => (
          <div key={title} className="rounded-2xl border bg-card/50 p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground">{title}</h3>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>

      <section className="mt-14 rounded-3xl bg-gradient-to-r from-primary/90 to-primary/70 p-8 text-primary-foreground shadow-lg md:p-12">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6" />
          <h2 className="text-2xl font-bold md:text-3xl">Nuestra forma de aprender</h2>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-3xl font-black">01</p>
            <p className="mt-2 text-sm text-primary-foreground/90">Comenzamos con conceptos básicos para fortalecer la base.</p>
          </div>
          <div>
            <p className="text-3xl font-black">02</p>
            <p className="mt-2 text-sm text-primary-foreground/90">Desarrollamos práctica guiada con ejemplos claros y progresivos.</p>
          </div>
          <div>
            <p className="text-3xl font-black">03</p>
            <p className="mt-2 text-sm text-primary-foreground/90">Llegamos a niveles avanzados con seguridad, lógica y autonomía.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
