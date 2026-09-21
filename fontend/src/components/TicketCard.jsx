import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { cn } from '@/lib/utils';
import EditTicket from './EditTicket';
import { Pencil, SquareChevronDown, SquareEqual, SquareChevronUp, Book, Bug } from 'lucide-react';
import { SquareChevronsUp } from './CustomIcons'; 

const TicketCard = ({ ticket, index, users }) => {
    const [showEditModal, setShowEditModal] = React.useState(false);

    const isCompleted = ticket.status === "Done";
    const timeRemaining = new Date(ticket.due_date) - new Date();
    const isOverdue = timeRemaining < 0;
    const isUrgent = timeRemaining >= 0 && timeRemaining < 86400000;

    const renderPriorityIcon = (priority) => {
        switch (priority?.toLowerCase()) {
            
            case 'critical':
                return <SquareChevronsUp className="size-4 text-destructive" />;
            case 'high':
                return <SquareChevronUp className="size-4 text-orange-500" />;
            case 'medium':
                return <SquareEqual className="size-4 text-blue-500" />;
            case 'low':
                return <SquareChevronDown className="size-4 text-green-500" />; // Low cho màu xanh lá
            default:
                return <SquareEqual className="size-4 text-muted-foreground" />; 
        }
        
    };
    const renderTypeIcon = (type) => {
        
        if (type?.toLowerCase() === 'bug') {
            return <Bug className="size-3.5 text-red-500" />;
        }
        return <Book className="size-3.5 text-blue-500" />; 
    };

    return (
        <>
            <Card
                className={cn(
                    // TODO: Đã bỏ aspect-square và justify-between, dùng gap-3 để các khối nằm sát nhau cách đều
                    "relative p-4 border-0 bg-gradient-card shadow-custom-md hover:shadow-custom-lg transition-all duration-200 group flex flex-col gap-3",
                    isCompleted && "opacity-75"
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
            >
                {/* Phần 1: Ticket Code - Priority - Edit */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                    <div title={`Type: ${ticket.type || "Task"}`}>
                        {renderTypeIcon(ticket.type)}
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">
                        {ticket.ticket_code || `#${ticket._id?.substring(0, 6).toUpperCase()}`}
                    </span>
                </div>

                    <div className="flex items-center gap-1.5">
                        <div title={`Priority: ${ticket.priority || "Normal"}`} className="cursor-help">
                            {renderPriorityIcon(ticket.priority)}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-30 group-hover:opacity-100 size-6 rounded-full transition-all duration-200 m-0"
                            onClick={() => setShowEditModal(true)}
                        >
                            <Pencil className="size-3" />
                        </Button>
                    </div>
                </div>

                {/* Phần 2: Title */}
                <div>
                    <p 
                        className={cn(
                            "text-sm font-medium transition-all duration-200 text-muted-foreground line-clamp-3 cursor-pointer",
                            isCompleted && "line-through opacity-70"
                        )}
                        title={ticket.title}
                    >
                        {ticket.title}
                    </p>
                </div>

                {/* Phần 3: Assignee & Due Date */}
                {/* TODO: pt-3 và border-t để tạo đường gạch ngang mờ ngăn cách, gap-1.5 để 2 dòng text sát nhau */}
                <div className="flex flex-col gap-1.5 pt-3 border-t border-border/50">
                    <span 
                        className="text-[11px] text-muted-foreground truncate" 
                        title={users.find((user) => user._id === ticket.assignee_id)?.full_name || "Unassigned"}
                    >
                        Assignee: {users.find((user) => user._id === ticket.assignee_id)?.full_name || "Unassigned"}
                    </span>

                    <span className={cn(
                            "text-[11px] font-medium",
                            isOverdue ? "text-destructive" : isUrgent ? "text-amber-500" : "text-blue-500"
                        )}
                    >
                        Due: {ticket.due_date ? new Date(ticket.due_date).toLocaleDateString() : "No due date"}
                    </span>
                </div>
            </Card>

            {/* Edit Modal */}
            {showEditModal && (
                <EditTicket
                    ticket={ticket}
                    users={users}
                    setShowModal={setShowEditModal}
                />
            )}
        </>
    );
};

export default TicketCard;