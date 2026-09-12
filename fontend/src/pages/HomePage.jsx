import AddTicket from '@/components/AddTicket';
import Footer from '@/components/Footer';
import StartAndFilter from '@/components/StartAndFilter';
import Header from '@/components/Header';
import TicketList from '@/components/TicketList';
import TicketListPagination from '@/components/TicketListPagination';
import DateTimeFilter from '@/components/DateTimeFilter';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

const HomePage = () => {
  const [ticketBuffer, setTicketBuffer] =  useState([]);
  const [activeTicketCount, setActiveTicketCount] = useState(0);
  const [completeTicketCount, setCompleteTicketCount] = useState(0);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchTicket();
  }, []);

  //Logic
  const fetchTicket = async () =>{
    try {
      const res = await axios.get("http://localhost:5001/api/ticket");
      setTicketBuffer(res.data.tickets);
      setActiveTicketCount(res.data.activeCount)
      setCompleteTicketCount(res.data.completeCount)
      
    } catch (error) {
      console.error("Error when access tickets",error);
      toast.error("Error when access tickets", { id: "fetch-error" });
    }
  };



  const handleTicketChange =() =>{
    fetchTicket();
  }
  //Biến 
  const filterTickets =  ticketBuffer.filter((ticket) => {
    switch(filter){
      case 'active':
        return ["To Do", "In Progress", "Testing", "Re-Open"].includes(ticket.status);
      case 'completed':
        return ticket.status ==='Done';
      default:
        return true;
        }
  });


  return (
    // Thêm flex flex-col và min-h-screen
    <div className="container flex flex-col min-h-screen pt-8 mx-auto relative">
        {/* Thêm flex-1 để đẩy Footer xuống */}
        <div className="flex-1 w-full max-w-2xl mx-auto space-y-6">
          {/*đầu trang*/}
          <Header/>

          {/*Tạo ticket*/}
          <AddTicket
            handleNewTicket={handleTicketChange}
          />

          {/*Thống kê và bộ lọc*/}
          <StartAndFilter
            filter={filter}
            setFilter={setFilter}
            activeTicketsCount={activeTicketCount}
            completedTicketsCount={completeTicketCount}

          />
          
          {/*Danh sách ticket*/}
          <TicketList filterTicket={filterTickets} filter={filter}
          />

          {/*Phân trang lọc theo ngày*/}
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
            <TicketListPagination/>
            <DateTimeFilter/>
          </div>
        </div>

        {/*Chân trang (đã đưa ra ngoài khối nội dung để nằm độc lập sát đáy)*/}
        <Footer/>
    </div>
  );
};

export default HomePage;