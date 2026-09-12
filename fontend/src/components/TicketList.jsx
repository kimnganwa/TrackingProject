import React from 'react'
import TicketCard from './TicketCard';
import TicktetEmptyState from './TicktetEmptyState';

const TicketList = ({ filterTicket, filter }) => { 
  
  
  // Sắp xếp ticket: due_date gần nhất lên đầu. Các ticket không có due_date sẽ nằm cuối.
const sortedTickets = [...(filterTicket || [])].sort((a, b) => 
  {
    // Ticket chưa Done lên trước
    if (a.status === "Done" && b.status !== "Done") return 1;
    if (a.status !== "Done" && b.status === "Done") return -1;
  
    return new Date(a.due_date) - new Date(b.due_date);
  });

  if (!sortedTickets || sortedTickets.length === 0) {
    return <TicktetEmptyState filter={filter} />
  }

  return (
    <div className='space-y-3'>
      {sortedTickets.map((ticket, index) => (
        <TicketCard
          key={ticket._id ?? index}
          ticket={ticket}
          index={index}
        />
      ))}
    </div>
  );
};

export default TicketList;