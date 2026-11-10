
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { Heading } from "@/components/ui/heading";

export default function SettingsPage() {
  return (
    <>
      <Heading title="Ajustes" description="Gestiona la apariencia y configuración de tu dashboard." />
      <div className="mt-8 grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Apariencia</CardTitle>
                <CardDescription>Personaliza la apariencia de la aplicación. Cambia entre el modo claro y oscuro.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-2">
                    <Label htmlFor="theme-toggle" className="flex-1">Tema</Label>
                    <ThemeToggle />
                </div>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
