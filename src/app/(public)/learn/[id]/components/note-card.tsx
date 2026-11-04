
'use client';

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Note } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface NoteCardProps {
    note: Note;
    onDelete: (noteId: string) => void;
    isDeleting: boolean;
    index: number;
}

const noteColors = [
    { // Yellow
        bg: "bg-yellow-100 dark:bg-yellow-900/20",
        border: "border-yellow-300 dark:border-yellow-800",
        text: "text-yellow-900 dark:text-yellow-200",
        subtleText: "text-yellow-700 dark:text-yellow-500",
        hover: "hover:bg-yellow-200/50 dark:hover:bg-yellow-800/50",
    },
    { // Blue
        bg: "bg-blue-100 dark:bg-blue-900/20",
        border: "border-blue-300 dark:border-blue-800",
        text: "text-blue-900 dark:text-blue-200",
        subtleText: "text-blue-700 dark:text-blue-500",
        hover: "hover:bg-blue-200/50 dark:hover:bg-blue-800/50",
    },
    { // Green
        bg: "bg-green-100 dark:bg-green-900/20",
        border: "border-green-300 dark:border-green-800",
        text: "text-green-900 dark:text-green-200",
        subtleText: "text-green-700 dark:text-green-500",
        hover: "hover:bg-green-200/50 dark:hover:bg-green-800/50",
    },
    { // Pink
        bg: "bg-pink-100 dark:bg-pink-900/20",
        border: "border-pink-300 dark:border-pink-800",
        text: "text-pink-900 dark:text-pink-200",
        subtleText: "text-pink-700 dark:text-pink-500",
        hover: "hover:bg-pink-200/50 dark:hover:bg-pink-800/50",
    },
];


export function NoteCard({ note, onDelete, isDeleting, index }: NoteCardProps) {
    const timeAgo = formatDistanceToNow(new Date(note.created_at), { addSuffix: true, locale: es });
    const color = noteColors[index % noteColors.length];
    
    return (
        <Card className={cn("flex flex-col shadow-sm hover:shadow-md transition-shadow", color.bg, color.border)}>
            <CardContent className="p-4 flex-grow">
                <p className={cn("text-sm whitespace-pre-wrap", color.text)}>{note.content}</p>
            </CardContent>
            <CardFooter className={cn("p-2 border-t flex justify-between items-center", color.border, "dark:border-opacity-50")}>
                <p className={cn("text-xs", color.subtleText)}>{timeAgo}</p>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn("h-7 w-7", color.subtleText, color.hover)}
                    onClick={() => onDelete(note.id)}
                    disabled={isDeleting}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </CardFooter>
        </Card>
    );
}
