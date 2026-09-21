import React, { useEffect, useState } from 'react'
import TicketCard from './TicketCard';
import TicktetEmptyState from './TicktetEmptyState';
import api from "@/lib/axios";

const TicketList = ({ filterTicket, filter }) => { 
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/users");
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchUsers();
  }, []);
  
  // Các status BE đang có + bổ sung cho đủ 6 cột UI
  // TODO: Nếu BE sau này đổi tên status thì nhớ vào đây sửa lại cho khớp map nhé
  const columns = ["To Do", "In Progress", "Testing", "Pending", "Done", "Re-Open"];

  const sortedTickets = [...(filterTicket || [])].sort((a, b) => {
    if (a.status === "Done" && b.status !== "Done") return 1;
    if (a.status !== "Done" && b.status === "Done") return -1;
    return new Date(a.due_date) - new Date(b.due_date);
  });

  if (!sortedTickets || sortedTickets.length === 0) {
    return <TicktetEmptyState filter={filter} />
  }

  return (
    // Cuộn ngang khi board quá rộng
    <div className='flex gap-4 overflow-x-auto pb-4 items-start'>
      {columns.map((statusTitle) => (
        <div key={statusTitle} className="flex-shrink-0 w-72 bg-muted/30 rounded-xl p-4 min-h-[500px]">
          {/* Header cột */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-sm">{statusTitle}</h3>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
              {sortedTickets.filter(t => t.status === statusTitle).length}
            </span>
          </div>

          {/* List card trong cột */}
          <div className='space-y-3 flex flex-col'>
            {sortedTickets
              .filter(ticket => ticket.status === statusTitle)
              .map((ticket, index) => (
                <TicketCard
                  key={ticket._id ?? index}
                  ticket={ticket}
                  index={index}
                  users={users}
                />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TicketList;