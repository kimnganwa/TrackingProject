import AddTicket from '@/components/AddTicket';
import Footer from '@/components/Footer';
import StartAndFilter from '@/components/StartAndFilter';
import Header from '@/components/Header';
import TicketList from '@/components/TicketList';
import TicketListPagination from '@/components/TicketListPagination';
import DateTimeFilter from '@/components/DateTimeFilter';
import ProjectSidebar from '@/components/ProjectSidebar'; // Nhớ import thêm cái này
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { jwtDecode } from "jwt-decode";

const HomePage = () => {
  const [ticketBuffer, setTicketBuffer] = useState([]);
  const [activeTicketCount, setActiveTicketCount] = useState(0);
  const [completeTicketCount, setCompleteTicketCount] = useState(0);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchTicket();
  }, []);

  //Logic
  const fetchTicket = async () => {
    try {
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);

      const res = await api.get("/tickets", {
        params: {
          user_id: decoded.id,
        },
      });

      setTicketBuffer(res.data.tickets);
      setActiveTicketCount(res.data.activeCount);
      setCompleteTicketCount(res.data.completeCount);

    } catch (error) {
      console.error("Error when access tickets", error);
      toast.error("Error when access tickets", { id: "fetch-error" });
    }
  };

  const handleTicketChange = () => {
    fetchTicket();
  }
  
  //Biến 
  const filterTickets = ticketBuffer.filter((ticket) => {
    switch(filter){
      case 'active':
        return ["To Do", "In Progress", "Testing", "Re-Open"].includes(ticket.status);
      case 'completed':
        return ticket.status === 'Done';
      default:
        return true;
    }
  });

  return (
    <div className="flex min-h-screen">
      {/* Cột trái: Sidebar Project */}
      <ProjectSidebar />

      {/* Cột phải: Main Board */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <div className="flex-1 w-full mx-auto space-y-6 p-8 overflow-x-auto">
          {/* Đầu trang */}
          <Header />

          {/* Tạo ticket */}
          <AddTicket handleNewTicket={handleTicketChange} />

          {/* Thống kê và bộ lọc */}
          <StartAndFilter
            filter={filter}
            setFilter={setFilter}
            activeTicketsCount={activeTicketCount}
            completedTicketsCount={completeTicketCount}
          />
          
          {/* Danh sách ticket (Đã chuyển thành dạng Board ngang) */}
          <TicketList filterTicket={filterTickets} filter={filter} />

          {/* Phân trang lọc theo ngày */}
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row mt-8">
            <TicketListPagination />
            <DateTimeFilter />
          </div>
        </div>

        {/* Chân trang */}
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;