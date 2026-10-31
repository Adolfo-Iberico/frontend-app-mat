
import { FileText, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { Course } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CertificateCardProps {
  certificate: {
    id: string;
    course: Course;
    issuedAt: string;
    validationId: string;
  };
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const router = useRouter();

  const handleView = () => {
    router.push(`/learn/${certificate.course.id}/certificate`);
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <FileText className="h-10 w-10 text-primary" />
          <span className="text-sm text-muted-foreground">{certificate.issuedAt}</span>
        </div>
        <h3 className="text-lg font-semibold mt-2">{certificate.course.title}</h3>
      </CardHeader>
      <CardContent className="pb-3 flex-grow">
        <p className="text-sm text-muted-foreground">
          ID: <span className="font-mono text-xs">{certificate.validationId}</span>
        </p>
      </CardContent>
      <CardFooter className="flex gap-2 bg-muted/50 p-3">
        <Button variant="outline" size="sm" onClick={handleView} className="flex-1">
          <Eye className="h-4 w-4 mr-2" />
          Ver Certificado
        </Button>
      </CardFooter>
    </Card>
  );
}
