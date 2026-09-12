import React, { useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Plus } from 'lucide-react'
import { Input } from './ui/input'
import { toast } from 'sonner'
import api from '@/lib/axios'

const AddTicket = ({handleNewTicket}) => {
  const [newTicketTitle, setNewTicketTitle] = useState("");
  const addTicket = async () => {
    if(newTicketTitle.trim() ){
      try {
        await api.post("/ticket" , {title : newTicketTitle});
        toast.success(`Ticket ${newTicketTitle} added`);
        handleNewTicket();
      } catch (error) {
        console.error("Error occur when add new ticket", error);
        toast.error('Error occur when add new ticket');
      }

      setNewTicketTitle("");

    }else{
      toast.error('Input title for add new ticket');
    }

  };

  const handleKeyPress  = (even) =>{
    if (even.key === "Enter"){
      addTicket();
    }
  };

  return (
    <Card className="p-6 bolder-0 bg-gradient-card shadow-custom-lg">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="text"
          placeholder="Enter for add ticket..."
          className="h-12 text-base bg-slate-50 sm:flex-1 border-border/50 focus:border-primary/50 focus:ring-primary/20"
          value={newTicketTitle}
          onChange={(even) => setNewTicketTitle(even.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button
          variant="gradient"
          size="xl"
          className="px-6"
          onClick={addTicket}
          disable={!newTicketTitle.trim()}
        >
          Add Ticket
          <Plus className="size-5" />
        </Button>
      </div>
    </Card>
  )
}

export default AddTicket
