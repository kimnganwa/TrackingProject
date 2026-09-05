import AddTicket from '@/components/AddTicket';
import Footer from '@/components/Footer';
import StartAndFilter from '@/components/StartAndFilter';
import Header from '@/components/Header';
import TicketList from '@/components/TicketList';
import TicketListPagination from '@/components/TicketListPagination';
import DateTimeFilter from '@/components/DateTimeFilter';


const HomePage = () => {
  return (
    <div className="container pt-8 mx-auto">
        <div className="w-full max-w-2xl -6 mx-auto space-y-6">
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

          {/*Chân trang*/}
          <Footer/>
        </div>
    </div>
  );
};

export default HomePage;

