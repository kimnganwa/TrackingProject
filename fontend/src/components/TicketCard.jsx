import React from 'react';
import { CheckCircle2, Circle, Calendar, Pencil } from 'lucide-react'; 
import { Button } from './ui/button';
import { Card } from './ui/card';
import { cn } from '@/lib/utils';

const TicketCard = ({ ticket, index }) => {
    let isEditing = false;
    // Status hoàn thành của BE là "Done"
    const isCompleted = ticket.status === "Done";
    // 86400000 ms = 24 giờ
    const timeRemaining = new Date(ticket.due_date) - new Date();
    const isOverdue = timeRemaining < 0;
    const isUrgent = timeRemaining >= 0 && timeRemaining < 86400000; // Dưới 24h

    return (
        <Card className={cn(
            "p-4 border-0 bg-gradient-card shadow-custom-md hover:shadow-custom-lg transition-all duration-200 animate-fade-in group",
            isCompleted && "opacity-75"
            )}
            style={{ animationDelay: `${index * 0.1}s` }}
        >
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "flex-shrink-0 size-8 rounded-full transition-all duration-200",
                        isCompleted 
                        ? "text-success hover:text-success/80" 
                        : "text-muted-foreground hover:text-primary"
                    )}
                >
                    {isCompleted ? (
                        <CheckCircle2 className="size-5" /> 
                    ):( 
                        <Circle className="size-5" />
                    )}
                </Button>
                
                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <input
                            placeholder="Enter title"
                            className="flex-1 h-12 text-base border-border/50 focus:ring-primary/20"
                            type="text"
                        />
                    ) : (
                        <p className={cn(
                            "text-base transition-all duration-200",
                            isCompleted 
                            ? "line-through text-muted-foreground" 
                            : "text-foreground"
                        )}>
                            {ticket.title}
                        </p>
                    )}

                    <div className="flex items-center gap-2 mt-1">
                        <Calendar className="size-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                            Created: {new Date(ticket.created_at).toLocaleDateString()}
                        </span>

                        <span className={cn(
                            "text-xs font-medium", 
                            isOverdue ? "text-destructive" : isUrgent ? "text-amber-500" : "text-blue-500"
                            )}>
                            Due: {new Date(ticket.due_date).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                <div className="hidden gap-2 group-hover:inline-flex animate-slide-up">
                    <Button
                     variant="ghost"
                     size="icon"
                     className="flex-shrink-0 size-8 rounded-full transition-all duration-200"
                    >
                     <Pencil className="size-4" />
                    </Button>
                </div>
            </div>  
        </Card>
    )
}

export default TicketCard;