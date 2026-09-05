import React from 'react'
import TicketCard from './TicketCard';
import TicktetEmptyState from './TicktetEmptyState';
// Nhớ import thêm TickteEmptyState nếu bạn có dùng nhé

const TicketList = () => {
  let filter = "all"
  const fiteredTickets = [
    {
      _id: "1",
      title: "Ticket 1",
      status: "open",
      completedAt: null,
      createdAt: new Date(),
    },
    {
      _id: "2",
      title: "Ticket 2",
      status: "completed",
      completedAt: new Date(),
      createdAt: new Date(),
    }
  ];

  if (!fiteredTickets || fiteredTickets.length === 0) {
    return <TicktetEmptyState filter={filter} />
  }

  return (
    <div className='space-y-3'>
      {fiteredTickets.map((ticket, index) => (
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