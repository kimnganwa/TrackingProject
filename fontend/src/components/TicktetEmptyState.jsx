import React from 'react'
import { Card } from './ui/card'
import { Circle } from 'lucide-react'

const TicktetEmptyState = ({ filter }) => {
  return (
    <Card 
     className="p-8 text-center border-0 bg-gradient-card shadow-custom-md"
    >
        <div className="space-y-3">
            <Circle className="size-12 mx-auto text-muted-foreground" />
            <div>
                <h3 className='font-medium text-foreground'>
                    {
                        filter === 'active' ? 'No active tickets found.' :
                        filter === 'completed' ? 'No completed tickets found.' :
                        'No tickets found.'
                    }
                </h3>
            </div>

        </div>

    </Card>
  )
}

export default TicktetEmptyState
