import AddTicket from '@/components/AddTicket';
import Footer from '@/components/Footer';
import StartAndFilter from '@/components/StartAndFilter';
import Header from '@/components/Header';
import TicketList from '@/components/TicketList';
import TicketListPagination from '@/components/TicketListPagination';
import DateTimeFilter from '@/components/DateTimeFilter';

const HomePage = () => {
  return (
    // Thêm flex flex-col và min-h-screen
    <div className="container flex flex-col min-h-screen pt-8 mx-auto">
        
        {/* Thêm flex-1 để đẩy Footer xuống */}
        <div className="flex-1 w-full max-w-2xl mx-auto space-y-6">
          {/*đầu trang*/}
          <Header/>

          {/*Tạo ticket*/}
          <AddTicket/>

          {/*Thống kê và bộ lọc*/}
          <StartAndFilter/>
          
          {/*Danh sách ticket*/}
          <TicketList/>

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