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
  const columns = ["To Do", "In Progress", "Testing", "Done"];

  const sortedTickets = [...(filterTicket || [])].sort((a, b) => {
    if (a.status === "Done" && b.status !== "Done") return 1;
    if (a.status !== "Done" && b.status === "Done") return -1;
    return new Date(a.due_date) - new Date(b.due_date);
  });

  if (!sortedTickets || sortedTickets.length === 0) {
    return <TicktetEmptyState filter={filter} />
  }

return (
    <div className='grid grid-cols-4 gap-4 pb-4 items-start w-full'>
      {columns.map((statusTitle) => (
        // TODO: Đổi min-h thành h-full hoặc max-h, thêm flex flex-col để chia layout cho cột
        <div key={statusTitle} className="w-full bg-muted/30 rounded-xl p-4 flex flex-col h-[700px]">
          
          {/* Header cột (Giữ cố định không cuộn) */}
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h3 className="font-semibold text-sm">{statusTitle}</h3>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
              {sortedTickets.filter(t => t.status === statusTitle).length}
            </span>
          </div>

          {/* List card trong cột - TODO: Thêm overflow-y-auto để cuộn, flex-1 để chiếm phần không gian còn lại */}
          <div className='space-y-3 flex flex-col flex-1 overflow-y-auto pr-2 pb-2 
            scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent'>
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