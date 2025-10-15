import React, { useState, useMemo, useRef, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/id";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Indonesian } from "flatpickr/dist/l10n/id.js";

dayjs.locale("id");

// ======= Flatpickr Input =======
interface FlatpickrInputProps {
  value: string;
  onChange: (dateStr: string) => void;
  placeholder?: string;
  className?: string;
}

const FlatpickrInput: React.FC<FlatpickrInputProps> = ({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  className = "",
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      const fp = flatpickr(inputRef.current, {
        dateFormat: "Y-m-d",
        defaultDate: value,
        locale: Indonesian,
        onChange: (_, dateStr) => onChange(dateStr),
        allowInput: true,
        clickOpens: true,
      });
      return () => fp.destroy();
    }
  }, [value, onChange]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        readOnly
        placeholder={placeholder}
        className={`px-4 py-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 ${className}`}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
};

// ======= Main Component =======
const Booking = () => {
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().add(6, 'day').format("YYYY-MM-DD"));
  const [bookings, setBookings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Convert API response to our format
  const convertApiResponse = (apiData: any) => {
    const converted: Record<string, string> = {};
    
    if (apiData.booked_slots) {
      Object.values(apiData.booked_slots).forEach((slot: any) => {

        const startHour = String(slot.hour).padStart(2, '0');
        const endHour = String(slot.hour + 1).padStart(2, '0');
        const timeRange = `${startHour}:00 - ${endHour}:00`;
        
        const key = `${slot.date}_${timeRange}`;
        converted[key] = slot.booked;
      });
    }
    
    return converted;
  };

  // Fetch data from API
  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('http://pilihotel-booking.test/api/padel');
      const convertedData = convertApiResponse(response.data);
      setBookings(convertedData);
    } catch (err) {
      setError('Gagal memuat data booking');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchBookings();
  }, []);

  const dates = useMemo(() => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const totalDays = end.diff(start, 'day') + 1; 
    

    return Array.from({ length: totalDays }, (_, index) => {
      return start.add(index, 'day');
    });
  }, [startDate, endDate]);

  const times = [
    "05:00 - 06:00",
    "06:00 - 07:00",
    "07:00 - 08:00",
    "08:00 - 09:00",
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "14:00 - 15:00",
    "15:00 - 16:00",
    "16:00 - 17:00",
    "17:00 - 18:00",
    "18:00 - 19:00",
    "19:00 - 20:00",
    "20:00 - 21:00",
    "21:00 - 22:00",
    "22:00 - 23:00",
    "23:00 - 00:00",
    "00:00 - 01:00",
    "01:00 - 02:00",
    "02:00 - 03:00",
    "03:00 - 04:00",
    "04:00 - 05:00",
    
  ];

  const getBookingKey = (date: any, time: string) => {
    return `${date.format("YYYY-MM-DD")}_${time}`;
  };

  const getBookingStatus = (date: any, time: string) => {
    return bookings[getBookingKey(date, time)];
  };

  // Function to refresh data from API
  const refreshData = () => {
    fetchBookings();
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen transition-all duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                📅 Jadwal Booking Padel
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Kelola jadwal lapangan padel dengan mudah
              </p>
              
     
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Kosong</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Reserved</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                
                </span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  📅 Tanggal Mulai
                </label>
                <FlatpickrInput 
                  value={startDate} 
                  onChange={setStartDate}
                  className="w-48"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  📅 Tanggal Selesai
                </label>
                <FlatpickrInput 
                  value={endDate} 
                  onChange={setEndDate}
                  className="w-48"
                />
              </div>
              <button 
                onClick={refreshData}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                {loading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                )}
                {loading ? 'Loading...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </div>


        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800 dark:text-red-200">{error}</span>
            </div>
          </div>
        )}


        <div className="shadow-xl rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600">
                    <th className="bg-orange-500 dark:bg-orange-600 text-white py-4 px-4 font-semibold text-left sticky left-0 z-20 min-w-[140px] border-r border-orange-400">
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        Jam
                      </div>
                    </th>
                    {dates.map((date) => (
                      <th
                        key={date.format("YYYY-MM-DD")}
                        className="bg-blue-500 dark:bg-blue-600 text-white py-4 px-3 font-semibold text-center border-r border-blue-400 dark:border-blue-500 min-w-[160px]"
                      >
                        <div className="space-y-1">
                          <div className="font-bold text-sm">
                            {date.format("dddd")}
                          </div>
                          <div className="text-xs opacity-90">
                            {date.format("DD MMM YYYY")}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {times.map((time, index) => (
                    <tr key={time} className={index % 2 === 0 ? "bg-gray-50 dark:bg-gray-800" : "bg-white dark:bg-gray-750"}>
                      <td className="bg-orange-100 dark:bg-orange-900 border-r border-orange-200 dark:border-orange-700 font-semibold text-gray-800 dark:text-gray-200 sticky left-0 z-10 py-3 px-4 text-center">
                        <div className="text-sm font-mono">
                          {time}
                        </div>
                      </td>
                      {dates.map((date) => {
                        const bookingStatus = getBookingStatus(date, time);
                        const isBooked = !!bookingStatus;
                   
                        return (
                          <td
                            key={date.format("YYYY-MM-DD") + time}
                            className="border-r border-b border-gray-200 dark:border-gray-600 p-2"
                          >
                            <div 
                              className={`h-12 flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 ${
                                isBooked 
                                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-md' 
                                  : 'bg-green-500 hover:bg-green-600 text-white shadow-md'
                              }`}
                            >
                              {isBooked ? (
                                <div className="text-center px-2">
                                  <div className="font-semibold text-xs">RESERVED</div>
                            
                                </div>
                              ) : (
                                <div className="text-center">
                                  <div className="font-semibold">KOSONG</div>
                                  <div className="text-xs opacity-75">Tersedia</div>
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
