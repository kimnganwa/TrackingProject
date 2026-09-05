import React from 'react';
// 1. Thêm import Calendar và Pencil
import { CheckCircle2, Circle, Calendar, Pencil } from 'lucide-react'; 
import { Button } from './ui/button';
import { Card } from './ui/card';
import { cn } from '@/lib/utils';

const TicketCard = ({ ticket, index }) => {
    let isEditing = false;

    return (
        <Card className={cn(
            "p-4 border-0 bg-gradient-card shadow-custom-md hover:shadow-custom-lg transition-all duration-200 animate-fade-in group",
            ticket.status === "completed" && "opacity-75"
            )}
            style={{ animationDelay: `${index * 0.1}s` }}
        >
            <div className="flex items-center gap-4">
                
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "flex-shrink-0 size-8 rounded-full transition-all duration-200",
                        ticket.status === "completed" 
                        ? "text-success hover:text-success/80" 
                        : "text-muted-foreground hover:text-primary"
                    )}
                >
                    {ticket.status === "completed" ? (
                        <CheckCircle2 className="size-5" /> 
                    ):( 
                        <Circle className="size-5" />
                    )}
                </Button>
                
                {/* 2. SỬA LAYOUT: Đưa phần Date vào chung thẻ div bọc ngoài của Title */}
                <div className="flex-1 min-w-0">
                    {/* Hiển thị tiêu đề */}
                    {isEditing ? (
                        <input
                            placeholder="Enter title"
                            className="flex-1 h-12 text-base border-border/50 focus:ring-primary/20"
                            type="text"
                        />
                    ) : (
                        <p className={cn(
                            "text-base transition-all duration-200",
                            ticket.status === "completed" 
                            ? "line-through text-muted-foreground" 
                            : "text-foreground"
                        )}>
                            {ticket.title}
                        </p>
                    )}

                    {/* Hiển thị ngày tạo (đã được dời vào trong div này) */}
                    <div className="flex items-center gap-2 mt-1">
                        <Calendar className="size-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                        {ticket.completedAt && (
                            <>
                                <span className="text-xs text-muted-foreground"> - </span>
                                <Calendar className="size-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                    {new Date(ticket.completedAt).toLocaleDateString()}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Hiển thị nút chỉnh sửa */}
                <div className="hidden gap-2 group-hover:inline-flex animate-slide-up">
                    <Button
                     variant="ghost"
                     size="icon"
                     className="flex-shrink-0 size-8 rounded-full transition-all duration-200"
                    >
                     {/* 3. Thêm icon cho nút */}
                     <Pencil className="size-4" />
                    </Button>
                </div>
            </div>  
        </Card>
    )
}

export default TicketCard;