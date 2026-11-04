'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Wand2 } from 'lucide-react';
import { getResourceSuggestion } from '@/app/actions';

const formSchema = z.object({
  userPreferences: z.string().min(10, {
    message: 'Por favor, cuéntanos un poco más sobre lo que quieres aprender.',
  }),
});

export function AiResourceSuggester() {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userPreferences: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setSuggestion(null);

    const result = await getResourceSuggestion(values);

    if (result.error) {
      setError(result.error);
    } else if (result.suggestedResources) {
      setSuggestion(result.suggestedResources);
    }
    
    setIsLoading(false);
  }

  return (
    <Card className="w-full text-left">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="userPreferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">¿Sobre qué tienes curiosidad?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="p. ej., 'Quiero construir un sitio de comercio electrónico rápido con Next.js e integrar una pasarela de pago...'"
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Sugerir Recursos
                </>
              )}
            </Button>
          </form>
        </Form>

        {suggestion && (
          <Card className="mt-6 border-accent bg-accent/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-accent" />
                Aquí tienes algunas sugerencias:
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-foreground">
                <p>{suggestion}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {error && (
            <div className="mt-4 text-center text-destructive">
              <p>{error}</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
