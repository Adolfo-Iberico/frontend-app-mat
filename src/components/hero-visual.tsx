"use client";

import React from "react";
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { Card, CardContent } from "@/components/ui/card";
import { Boxes, Building2, PenTool } from "lucide-react";

const tools = [
  { name: "Revit", icon: Building2 },
  { name: "AutoCAD", icon: PenTool },
  { name: "BIM", icon: Boxes },
];

export default function HeroVisual() {
  return (
    <div className="relative flex flex-col items-center justify-center gap-4 lg:flex-row lg:gap-0">
      <style>{`
        @keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        .float-1 { animation: floaty 6s ease-in-out infinite 0s; }
        .float-2 { animation: floaty 6s ease-in-out infinite 2s; }
        .float-3 { animation: floaty 6s ease-in-out infinite 4s; }
      `}</style>
      
      {/* Mobile Layout: Stack cards vertically */}
      <div className="flex w-full max-w-xs flex-col items-center gap-4 lg:hidden">
        {tools.map((tool, index) => (
            <Card key={tool.name} className="w-full backdrop-blur-sm bg-white/30 dark:bg-black/30">
                <CardContent className="p-3 flex items-center justify-center gap-3">
                {React.createElement(tool.icon, { className: "h-8 w-8 text-primary" })}
                <span className="font-semibold text-base">{tool.name}</span>
                </CardContent>
            </Card>
        ))}
      </div>

      {/* Desktop Layout: Cards around the image */}
      <div className="relative hidden w-full max-w-lg mx-auto lg:block">
        <ImagePlaceholder
          alt="Digital learning environment"
          width={800}
          height={600}
          className="rounded-2xl object-cover shadow-2xl"
        />
         <div className="absolute inset-0 flex items-center justify-center">
            <Card className="absolute -top-4 -left-10 w-36 backdrop-blur-sm bg-white/30 dark:bg-black/30 float-1">
                <CardContent className="p-3 flex items-center justify-center gap-2">
                {React.createElement(tools[0].icon, { className: "h-8 w-8 text-primary" })}
                <span className="font-semibold text-base">{tools[0].name}</span>
                </CardContent>
            </Card>
            <Card className="absolute -bottom-4 -right-10 w-36 backdrop-blur-sm bg-white/30 dark:bg-black/30 float-2">
                <CardContent className="p-3 flex items-center justify-center gap-2">
                {React.createElement(tools[1].icon, { className: "h-8 w-8 text-primary" })}
                <span className="font-semibold text-base">{tools[1].name}</span>
                </CardContent>
            </Card>
             <Card className="absolute top-10 -right-8 w-36 backdrop-blur-sm bg-white/30 dark:bg-black/30 float-3">
                <CardContent className="p-3 flex items-center justify-center gap-2">
                {React.createElement(tools[2].icon, { className: "h-7 w-8 text-primary" })}
                <span className="font-semibold text-base">{tools[2].name}</span>
                </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
}
