import React, { useState, useEffect, useRef } from 'react';
import { Table, Container, FormControl, DropdownButton, Dropdown } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './Customer_List.css';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import { FaUserCircle } from 'react-icons/fa';
import { IoFilterSharp } from 'react-icons/io5';
import { LiaSortAlphaDownSolid } from 'react-icons/lia';
import { GrView } from 'react-icons/gr';
import { useSidebar } from '../../Customer/Navbar/SidebarContext';

function Applied_Customer_List() {
  const location = useLocation();
  const navigate = useNavigate();
  const [dsaData, setDsaData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState({});
  const [profilePictures, setProfilePictures] = useState({});
  const [filterOption, setFilterOption] = useState('District');
  const [filterValue, setFilterValue] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [sortingOrder, setSortingOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const filterDropdownRef = useRef(null);
  const [error, setError] = useState(null);
  const { dsaId } = location.state || {};
  const { isSidebarExpanded } = useSidebar();

  const fetchDSADetails = async (dsaId) => {
    try {
      const response = await axios.get(`https://uksinfotechsolution.in:8000/api/dsa?dsaId=${dsaId}`);
      setDsaData(response.data);
    } catch (error) {
      console.error('Error fetching DSA details:', error);
    }
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(`https://uksinfotechsolution.in:8000/dsa/customer/applied/loan/${dsaId}`);
        const customersData = response.data;
        setCustomers(customersData);
        console.log('Fetched customers:', customersData);

        const initialAddresses = {};
        const initialProfilePictures = {};

        for (const customer of customersData) {
          try {
            const addressResponse = await axios.get('https://uksinfotechsolution.in:8000/view-address', {
              params: { customerId: customer.customerId },
            });
            initialAddresses[customer._id] = addressResponse.data;
          } catch (error) {
            console.error(`Error fetching address for customer ${customer._id}:`, error);
          }

          try {
            const response = await axios.get(`https://uksinfotechsolution.in:8000/api/profile/view-profile-picture?customerId=${customer.customerId}`, {
              responseType: 'arraybuffer',
            });
            const contentType = response.headers['content-type'];
            if (contentType && contentType.startsWith('image')) {
              const base64Image = `data:${contentType};base64,${btoa(
                String.fromCharCode(...new Uint8Array(response.data))
              )}`;
              initialProfilePictures[customer._id] = base64Image;
            } else {
              console.error('Response is not an image');
            }
          } catch (err) {
            console.error('Error retrieving profile picture:', err);
          }
        }

        setAddresses(initialAddresses);
        setProfilePictures(initialProfilePictures);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError(err);
        setLoading(false);
      }
    };

    if (dsaId) {
      fetchCustomers();
    }
  }, [dsaId]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleSort = () => {
    const newSortingOrder = sortingOrder === 'asc' ? 'desc' : 'asc';
    setSortingOrder(newSortingOrder);
    setCustomers([...customers].sort((a, b) => {
      if (a.customerName < b.customerName) return newSortingOrder === 'asc' ? -1 : 1;
      if (a.customerName > b.customerName) return newSortingOrder === 'asc' ? 1 : -1;
      return 0;
    }));
  };

  const filteredCustomers = customers.filter((customer) => {
    if (filterOption === 'District') {
      const customerAddress = addresses[customer._id];
      return customerAddress && customerAddress.aadharDistrict.toLowerCase().includes(filterValue.toLowerCase());
    }
    if (filterOption === 'Area') {
      const customerAddress = addresses[customer._id];
      return customerAddress && customerAddress.aadharCity.toLowerCase().includes(filterValue.toLowerCase());
    }
    return true;
  });

  const indexOfLastCustomer = currentPage * rowsPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - rowsPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);

  const handleEditClick = async (id) => {
    const selectedCustomer = customers.find((customer) => customer._id === id);
    if (!selectedCustomer) {
      console.error('Selected customer not found');
      return;
    }

    try {
      const currentDate = new Date().toISOString();
      const payload = {
        customerId: selectedCustomer.customerId,
        dsaId,
        loanId: selectedCustomer._id,
        applicationNumber: selectedCustomer.applicationNumber,
        date: currentDate,
      };

      await axios.post('https://uksinfotechsolution.in:8000/dsa/customer/apply/view/count', payload);
      navigate('/applied/customer/view', { state: { loanId: selectedCustomer._id, applicationNumber: selectedCustomer.applicationNumber, dsaId } });
    } catch (error) {
      console.error('Error storing data:', error.response ? error.response.data : error.message);
    }
  };

  const handleRowsPerPageChange = (selectedRowsPerPage) => {
    setRowsPerPage(selectedRowsPerPage);
    setCurrentPage(1);
  };

  const handleFilterOptionChange = (option) => {
    setFilterOption(option);
    setShowFilterDropdown(true);
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Container fluid className={`Customer-basic-view-container ${isSidebarExpanded ? 'sidebar-expanded' : ''}`}>
        <Container className='Customer-table-container-second'>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className='Customer-table-container-second-head'>Applied Customers List</span>
            <span style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <IoFilterSharp
                size={30}
                style={{ paddingRight: "10px", cursor: 'pointer' }}
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              />
              <LiaSortAlphaDownSolid
                size={30}
                style={{ paddingRight: "10px", cursor: 'pointer' }}
                onClick={handleSort}
              />
              {showFilterDropdown && (
                <div ref={filterDropdownRef} className="filter-dropdown" style={{ width: "400px", display: 'flex', alignItems: 'center', right: 0, top: '100%', zIndex: 1, marginRight: "0px" }}>
                  <FormControl
                    type="text"
                    placeholder="Filter value"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    style={{ marginLeft: "15px", marginRight: "20px" }}
                  />
                  <DropdownButton
                    id="dropdown-basic-button"
                    title={filterOption}
                    onSelect={(eventKey) => handleFilterOptionChange(eventKey)}
                    style={{ marginRight: "15px", width: "120px" }}
                  >
                    <Dropdown.Item eventKey="District">District</Dropdown.Item>
                    <Dropdown.Item eventKey="Area">Area</Dropdown.Item>
                  </DropdownButton>
                </div>
              )}
            </span>
          </div>
          <Table responsive hover className='Customer-table-second'>
            <thead className='Customer-table-header-second'>
              <tr className='Customer-table-header-row-second'>
                <th className='header-cell'>Name</th>
                <th className='header-cell'>District</th>
                <th className='header-cell'>Area</th>
                <th className='header-cell'>Application Number</th>
                <th className='header-cell'>Profile Picture</th>
                <th className='header-cell'>View</th>
              </tr>
            </thead>
            <tbody>
              {currentCustomers.length > 0 ? (
                currentCustomers.map((customer) => {
                  const customerAddress = addresses[customer._id] || {};
                  const profilePicture = profilePictures[customer._id] || <FaUserCircle size={40} />;
                  console.log(`Rendering customer: ${customer.customerName}`);
                  return (
                    <tr key={customer._id} className='Customer-table-row-second'>
                      <td className='data-cell'>{customer.customerName}</td>
                      <td className='data-cell'>{customerAddress.aadharDistrict || 'N/A'}</td>
                      <td className='data-cell'>{customerAddress.aadharCity || 'N/A'}</td>
                      <td className='data-cell'>{customer.applicationNumber}</td>
                      <td className='data-cell'>{typeof profilePicture === 'string' ? <img src={profilePicture} alt="Profile" style={{ width: '40px', height: '40px' }} /> : profilePicture}</td>
                      <td className='data-cell'>
                        <button onClick={() => handleEditClick(customer._id)}>
                          <GrView />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className='data-cell'>No customers found.</td>
                </tr>
              )}
            </tbody>
          </Table>
          <div className='pagination'>
            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
              <MdKeyboardArrowLeft size={25} />
            </button>
            <span>{currentPage}</span>
            <button onClick={() => paginate(currentPage + 1)} disabled={indexOfLastCustomer >= filteredCustomers.length}>
              <MdKeyboardArrowRight size={25} />
            </button>
            <select value={rowsPerPage} onChange={(e) => handleRowsPerPageChange(parseInt(e.target.value, 10))}>
              <option value={5}>5 rows</option>
              <option value={10}>10 rows</option>
              <option value={20}>20 rows</option>
            </select>
          </div>
        </Container>
      </Container>
    </>
  );
}

export default Applied_Customer_List;
