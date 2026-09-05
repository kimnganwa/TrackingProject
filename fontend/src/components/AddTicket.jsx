import React from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Plus } from 'lucide-react'
import { Input } from './ui/input'

const AddTicket = () => {
  return (
    <Card className="p-6 bolder-0 bg-gradient-card shadow-custom-lg">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="text"
          placeholder="Enter for search ticket..."
          className="h-12 text-base bg-slate-50 sm:flex-1 border-border/50 focus:border-primary/50 focus:ring-primary/20"
        />
        <Button
          variant="gradient"
          size="xl"
          className="px-6"
        >
          Add Ticket
          <Plus className="size-5" />
        </Button>
      </div>
    </Card>
  )
}

export default AddTicket
