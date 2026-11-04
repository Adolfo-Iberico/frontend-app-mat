

'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { X } from "lucide-react"
import { ForgotPasswordForm } from "./forgot-password-form"

interface ForgotPasswordModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordModal({ open, onOpenChange }: ForgotPasswordModalProps) {
    
    const handleSuccess = () => {
        onOpenChange(false);
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0">
                 <DialogTitle className="sr-only">Restablecer Contraseña</DialogTitle>
                 <DialogDescription className="sr-only">Ingresa tu correo para recibir un enlace de restablecimiento.</DialogDescription>
                 <DialogClose className="absolute right-[-1rem] top-[-1rem] rounded-full p-1 bg-background border opacity-100 ring-offset-background transition-opacity hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                    <X className="h-5 w-5" />
                    <span className="sr-only">Cerrar</span>
                </DialogClose>
                <DialogHeader className="px-6 pt-6 text-center">
                    <DialogTitle className="text-2xl font-bold">Restablecer Contraseña</DialogTitle>
                     <DialogDescription>
                        Ingresa tu correo electrónico y te enviaremos un enlace para que puedas volver a acceder a tu cuenta.
                    </DialogDescription>
                </DialogHeader>
                <div className="p-6">
                    <ForgotPasswordForm onSuccess={handleSuccess} />
                </div>
            </DialogContent>
        </Dialog>
    )
}
