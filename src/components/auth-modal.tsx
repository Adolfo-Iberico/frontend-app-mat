
'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoginForm } from "@/app/(auth)/login/login-form"
import { SignupForm } from "@/app/(auth)/signup/signup-form"
import { X } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Profile } from "@/lib/types"

interface AuthModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
    const router = useRouter()

    const handleSuccess = (role?: Profile['role']) => {
        onOpenChange(false);
        if (role === 'admin' || role === 'docente') router.push('/admin');
        router.refresh();
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0">
                 <DialogTitle className="sr-only">Autenticación</DialogTitle>
                 <DialogDescription className="sr-only">Inicia sesión o regístrate para acceder a tu cuenta.</DialogDescription>
                 <DialogClose className="absolute right-[-1rem] top-[-1rem] rounded-full p-1 bg-background border opacity-100 ring-offset-background transition-opacity hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                    <X className="h-5 w-5" />
                    <span className="sr-only">Cerrar</span>
                </DialogClose>
                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 rounded-t-lg rounded-b-none">
                        <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                        <TabsTrigger value="signup">Registrarse</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                        <DialogHeader className="px-6 pt-6 text-center">
                            <DialogTitle className="text-2xl font-bold text-center">Bienvenido de Nuevo</DialogTitle>
                        </DialogHeader>
                        <div className="p-6">
                           <LoginForm onSuccess={handleSuccess} />
                        </div>
                    </TabsContent>
                    <TabsContent value="signup">
                         <DialogHeader className="px-6 pt-6 text-center">
                            <DialogTitle className="text-2xl font-bold text-center">Crea una Cuenta</DialogTitle>
                        </DialogHeader>
                        <div className="p-6">
                           <SignupForm onSuccess={handleSuccess} />
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
