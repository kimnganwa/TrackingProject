import React from 'react'
import { Badge } from './ui/badge'
import { FilterType } from '@/lib/data'
import { Button } from './ui/button'

const StartAndFilter = ( {
  completedTicketsCount = 0, 
  activeTicketsCount = 0 , 
  myTicketsOnly = false,
  setMyTicketsOnly = () => {},
  filter = "all",
  setFilter
  } ) => {
  return (
    <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
      {/* Thống kê số lượng ticket */}
      <div className="flex gap-3">
        <Badge
        variant="secondary"
        className="bg-white-500 text-accent-foreground border-info/20"
        >
        {activeTicketsCount} {FilterType.active}
        </Badge>
        <Badge
        variant="secondary"
        className="bg-white-500 text-accent-foreground border-info/20"
        >
        {completedTicketsCount} {FilterType.completed}
        </Badge>
      </div>
      {/* Phần filter */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
         className="rounded-l"
          variant={myTicketsOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMyTicketsOnly(!myTicketsOnly)}
        >
          My Tickets
        </Button>
      </div>

    </div>

  )
}

export default StartAndFilter
