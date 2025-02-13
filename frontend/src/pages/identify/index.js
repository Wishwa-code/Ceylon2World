import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MenuOutlined, AreaChartOutlined, GlobalOutlined, DollarCircleOutlined, UserOutlined, BookOutlined, LogoutOutlined, RocketOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Settings } from "lucide-react";
import Sidebar, { SidebarItem } from "../../components/Sidebar"
import { QuestionMarkCircleIcon } from '@heroicons/react/24/solid';
import { Line } from 'react-chartjs-2';
import { jwtDecode } from 'jwt-decode'; 
import { BACKEND_ADDRESS } from '../../config';



// Register components required for Line chart
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const StockData = () => {
  const [country, setCountry] = useState('');
  const [productID, setProductID] = useState('');
  const [chartData, setChartData] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [forecasts, setForecasts] = useState([]);
  const [userId1, setUserId] = useState(null);
  const userId = 1;


  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    if (country && productID) {
      const fetchData = async () => {
        try {
          const response = await axios.get(`${BACKEND_ADDRESS}/fetch_chart_data`, {
            params: { country: country, product_id: productID }
          });
          const transformedData = transformChartData(response.data);
          setChartData(transformedData);
          

          const response2 = await axios.get(`${BACKEND_ADDRESS}/fetch_analyzed_data`, {
            params: { product_id: productID }
          });

          const sortedForecasts = response2.data.sort((a, b) => {
            const growthRateA = parseFloat(a.growth_rate.replace('%', ''));
            const growthRateB = parseFloat(b.growth_rate.replace('%', ''));
            return growthRateB - growthRateA; // Sort in descending order
          });

          setForecasts(sortedForecasts);

          console.log(response2.data)
          console.log(forecasts)
        } catch (error) {
          console.error('Error fetching chart data:', error);
        }
      };
      fetchData();
    }
  }, [country, productID]);

  function transformChartData(data) {
    const labels = data.map(item => item.month);
    const salesData = data.map(item => item.sales);
    const predictionsData = data.map(item => item.prediction);
    const nextMonths = getNextMonths(labels[labels.length - 1], 5); // Get labels for the next 5 months

    // Concatenate the existing labels with the labels for the next months
    const allLabels = [...labels, ...nextMonths];

    // Fill in the sales and prediction data for the next months with null values
    const allSalesData = [...salesData, ...Array(5).fill(null)];
    const allPredictionsData = [...Array(labels.length).fill(null), ...predictionsData];

    return {
      labels: allLabels,
      datasets: [
        {
          label: `Sales for ${data[0]?.product_name || 'Unknown Product'}`,
          backgroundColor: 'rgba(40,70,75,0.6)',
          borderColor: 'rgba(40,70,75,1)',
          borderWidth: 1,
          hoverBackgroundColor: 'rgba(75,192,192,0.6)',
          hoverBorderColor: 'rgba(75,192,192,1)',
          data: allSalesData
        },
        {
          label: 'Predictions',
          backgroundColor: 'rgba(255,219,88, 0.6)',  // Red color
          borderColor: 'rgba(255,219,88, 1)',
          borderWidth: 1,
          hoverBackgroundColor: 'rgba(255, 99, 132, 0.4)',
          hoverBorderColor: 'rgba(255, 99, 132, 1)',
          data: allPredictionsData
        }
      ]
    };
  }


  function transformForecastData(results) {
    return results && Array.isArray(results) ? results.map(result => ({
      country: result.country,
      // Convert numerical forecasts to formatted strings
      forecast: result.forecast ? result.forecast.map(num => num.toFixed(2)).join(', ') : "No Forecast Available", // Format forecasts
      // Convert growth rate to percentage string
      growthRate: result.growth_rate ? (result.growth_rate * 100).toFixed(2) + "%" : "N/A" // Handle missing/0 growth rate
      
    })) : [];
  }

  useEffect(() => {
    // Fetch user info from localStorage
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      const userInfo = JSON.parse(storedUserInfo);
      setUserName(userInfo.name || 'Guest');
    }

    // Fetch user ID from access token (if available)
    const fetchUserIdFromToken = () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        const decodedToken = jwtDecode(token);
        setUserId(decodedToken.user_id);
      }
    };

    fetchUserIdFromToken();
  }, []); 

  const handleLogout = () => {
    localStorage.removeItem('userInfo'); 
    window.location.href = '/login'; 
  };

  // Function to transform chart data
  
  // Function to get labels for the next n months based on the last month in the data
  function getNextMonths(lastMonth, n) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const lastMonthIndex = months.indexOf(lastMonth);
    const nextMonths = [];
    for (let i = 1; i <= n; i++) {
      const nextMonthIndex = (lastMonthIndex + i) % 12;
      nextMonths.push(months[nextMonthIndex]);
    }
    return nextMonths;
  }

  const handleCountryChange = (e) => setCountry(e.target.value);
  const handleProductChange = (e) => setProductID(e.target.value);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Month'
        }
      }
    }
  };



;
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);

    try {
      {/*const response = await fetch(`/api/users?location=USA&timeframe=lastWeek&query=${searchTerm}`); 
      const data = await response.json();
    setSearchResults(data);*/}
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Handle error (e.g., display an error message to the user)
    } finally {
      setIsLoading(false);
    }
  };





  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // ... your other state variables and functions ...

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  }



  return (
    <div className="bg-indigo-50 h-screen flex-col">
          <header className="z-10 bg-teal-950 sticky top-0">
            <div className="flex justify-between  px-4 py-2 border-b ">
              <div class="justify-center pt-1">
                <img src="/logo.png" alt="Your Company Logo" className="w-18 h-6  mt-1" />
              </div>
              <div className="flex flex-row justify-center">
                <div className="py-2 px-2 rounded-lg bg-white text-base border-gray-300 shadow-sm mr-2">
                                  <select id="country" value={country} onChange={handleCountryChange}
                                    className="focus:outline-none">
                                    <option value="">Select Country</option>
                                    <option value="France">France</option>
                                    <option value="Germany">Germany</option>
                                    <option value="Belgium">Belgium</option>
                                    <option value="United Kingdom">United Kingdom</option>
                                    <option value="Spain">Spain</option>
                                    <option value="Hungary">Hungary</option>
                                    <option value="Switzerland">Switzerland</option>
                                    {/* More countries */}
                                  </select>
                </div>
                <div className="py-2 px-2 rounded-lg bg-white text-base border-gray-300 shadow-sm ml-2">
                  <select id="product" value={productID} onChange={handleProductChange}
                                    className="focus:outline-none">
                                    <option value="">Select Product</option>
                                    <option value="08011100">Desiccated coconuts</option>
                                    <option value="080112">Cinamonan</option>
                                    {/* Add other product options here */}
                                  </select>
                                </div>  
              </div>                                                

              <div className="flex items-center">
              <button
                
                className="text-white focus:outline-none rounded-lg p-2 hover:text-amber-500 flex items-center" // Tailwind classes
              >
                <QuestionMarkCircleIcon className="h-6 w-6 mr-2" /> {/* Icon (optional) */}
              </button>
                
                <button 
                  id="dropdownInformationButton" 
                  data-dropdown-toggle="dropdownInformation" 
                  class="text-white font-medium text-center inline-flex " 
                  type="button"
                  aria-expanded="false" 
                  aria-haspopup="true"
                  onClick={toggleDropdown}
                >
              
                  <img src="/userprofile.png" alt="Your Company Logo" className="mt-1 size-8" />
                </button>
                <div id="dropdownInformation" className={`absolute right-0 mt-72 mr-4 ${isDropdownOpen ? '' : 'hidden'} bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600`}>
                    <div class="px-4 py-3 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white rounded-lg">
                      <a href="#" class="block px-4 py-2 ">
                        <div>{userName}</div>
                        <div class="font-medium truncate">wishwajayanath@gmail.com</div>
                    </a>
                      
                    </div>
                    <ul class="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownInformationButton">
                      <li>
                        <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Recommendations</a>
                      </li>
                      <li>
                        <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Messages</a>
                      </li>
                      <li>
                        <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Settings</a>
                      </li>
                    </ul>
                    <div class="py-2">
                      <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white text-white">
                        <button onClick={handleLogout} className="">
                          <LogoutOutlined className="mr-2" /> Sign out
                        </button>
                      </a>
                    </div>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1">
            <div className="flex flex-col h-[calc(100lvh-56px)] ">  
                        <div className="flex flex-row ">
                          <div className="top-14 left-0 right-0 text-left indent-2">
                              <Sidebar>
                                <SidebarItem icon={<AreaChartOutlined />} text="Predictions" alert to="/identify"/>
                                <SidebarItem icon={<GlobalOutlined />} text="News"  to="/worldwide-news" />
                                <SidebarItem icon={<UserOutlined />} text="Buyers" alert to="/find-buyers"/>
                                <SidebarItem icon={<BookOutlined />} text="Lessons" to="/lessions"/>
                                <SidebarItem icon={<DollarCircleOutlined />} text="Escrow" to="/escrow"/>
                                <SidebarItem icon={<RocketOutlined />} text="Premium" to="/home"/>
                                <hr className="my-3"/>
                                <SidebarItem icon={<Settings size={20} />} text="Settings"/>
                              </Sidebar>
                            </div>
                          
                          <div className="flex flex-col w-full h-[calc(100lvh-120px)] pt-5 bg-indigo-50">
                            <div className="">
                              {chartData && Object.keys(chartData).length > 0 ? (
                                <div className=" rounded-lg bg-white shadow w-[50rem] h-full mx-auto my-auto py-4 px-4 justify-center">
                                  <Line data={chartData} options={options} />
                                </div>
                              ) : (
                                
                                <div class="justify-center pt-1">
                                  <img src="/findcountry.gif" alt="Your Company Logo" className="rounded-lg w-[36rem] h-5/5 mx-auto my-auto" />
                                </div>
                              )}
                            </div>
                              <div className="bg-indigo-50">
                              <div class="relative  shadow-md  w-4/5 mx-auto  rounded-lg my-5 bg-gray-700 pt-2 pb-2 ">
                                {forecasts.length > 0 ? ( // Conditionally render the table
                                  <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 ">
                                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            <th scope="col" class="px-6 py-3">
                                                Country
                                            </th>
                                            <th scope="col" class="px-6 py-3">
                                               month 1
                                            </th>
                                            <th scope="col" class="px-6 py-3">
                                              month 2
                                            </th>
                                            <th scope="col" class="px-6 py-3">
                                              month 3
                                            </th>
                                            <th scope="col" class="px-6 py-3">
                                              month 4
                                            </th>
                                            <th scope="col" class="px-6 py-3">
                                              month 5
                                            </th>
                                            <th scope="col" class="px-6 py-3">
                                                Growth rate index
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {forecasts.map((countryData, index) => (
                                      <tr key={index} class=" dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600">
                                  
                                        <td class="px-6 py-4">{countryData.country}</td>
                                        {countryData.forecast.map((value, forecastIndex) => (
                                          <td key={forecastIndex} className="px-6 py-4">{value.toFixed(2)}</td>
                                        ))}
                                        <td class="px-6 py-4">{countryData.growth_rate}</td> 
                                      </tr>
                                    ))}
                                    </tbody>
                                  </table>
                                ) : (
                                  <p>Loading forecasts...</p> // Display loading message if data isn't available yet
                                )}
                            </div>  
                              </div>
                            <footer class="text-sm text-gray-500 bg-indigo-50 -mb-12">
                                 © 2024 C2W™
                                 | <a href="/home" class="hover:underline text-amber-500">C2W home</a>
                                 | <a href="/home" class="hover:underline text-amber-500">Terms of Service</a>
                                 | <a href="/home" class="hover:underline text-amber-500">Privacy Policy</a>
                                 | <a href="/home" class="hover:underline">Send feedback</a>
                            </footer>
                          </div>
                          
                        </div>
                      </div>          
                        
          </main>
            
                    

                    
                      
                    
                
                
      </div>
  );
};

export default StockData;
